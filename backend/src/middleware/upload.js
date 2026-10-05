import path from 'node:path';
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// Files are kept in memory only long enough to validate them and hand them to uploadService.
const build = (types, extensions, maxMB, label) => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxMB * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!types.includes(file.mimetype) || !extensions.includes(extension)) return cb(ApiError.badRequest(`Unsupported file type. Allowed: ${label}.`));
    return cb(null, true);
  },
});

const imageUpload = build(IMAGE_TYPES, IMAGE_EXTENSIONS, 2, 'JPG, PNG or WEBP up to 2 MB');
const resumeUpload = build(RESUME_TYPES, RESUME_EXTENSIONS, 5, 'PDF, DOC or DOCX up to 5 MB');

export const uploadProfileImage = imageUpload.single('image');
export const uploadResumeFile = resumeUpload.single('resume');
export const uploadCompanyImages = imageUpload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]);
