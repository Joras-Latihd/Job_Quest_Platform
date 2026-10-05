import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudinary from '../config/cloudinary.js';
import { env, isCloudinaryConfigured } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { matchesSignature } from '../utils/fileSignatures.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = path.resolve(currentDir, '../uploads');

const uploadToCloudinary = (buffer, options) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(options, (error, result) => (error ? reject(error) : resolve(result)));
  stream.end(buffer);
});

/*
 * Stores an uploaded file and returns { url, publicId }.
 *  - Cloudinary when CLOUDINARY_* variables are set
 *  - local disk (src/uploads, served at /uploads) otherwise
 * kind: "image" or "resume" (resumes are stored as raw files).
 */
export async function saveFile(file, { folder, kind }) {
  if (!file) throw ApiError.badRequest('Please choose a file to upload.');
  const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (!matchesSignature(file.buffer, extension)) throw ApiError.badRequest('The file content does not match its type.');
  const fileId = crypto.randomBytes(12).toString('hex');

  if (isCloudinaryConfigured) {
    const isResume = kind === 'resume';
    const result = await uploadToCloudinary(file.buffer, {
      folder: `jobquest/${folder}`,
      resource_type: isResume ? 'raw' : 'image',
      public_id: isResume ? `${fileId}.${extension}` : fileId, // raw files keep their extension so downloads open correctly
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  const directory = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, `${fileId}.${extension}`), file.buffer);
  return { url: `${env.serverUrl}/uploads/${folder}/${fileId}.${extension}`, publicId: `local:${folder}/${fileId}.${extension}` };
}

// Best-effort delete. A failed delete is logged but never blocks the request.
export async function removeFile(publicId) {
  if (!publicId) return;
  try {
    if (publicId.startsWith('local:')) {
      const relative = publicId.slice(6);
      const target = path.resolve(UPLOAD_ROOT, relative);
      if (target.startsWith(UPLOAD_ROOT)) await fs.unlink(target); // never delete outside the uploads folder
    } else if (isCloudinaryConfigured) {
      const isRaw = /\.(pdf|docx?)$/i.test(publicId);
      await cloudinary.uploader.destroy(publicId, { resource_type: isRaw ? 'raw' : 'image' });
    }
  } catch (error) {
    console.error('Could not delete file:', error.message);
  }
}
