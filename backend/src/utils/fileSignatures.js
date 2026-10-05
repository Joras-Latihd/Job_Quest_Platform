// Checks the first bytes of an upload so a renamed .exe cannot pass as a PDF or image.
const startsWith = (buffer, bytes, offset = 0) => bytes.every((byte, index) => buffer[offset + index] === byte);

const CHECKS = {
  pdf: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]),
  doc: (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0]),
  docx: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]),
  jpg: (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  jpeg: (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  png: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47]),
  webp: (b) => startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8),
};

export const matchesSignature = (buffer, extension) => Boolean(buffer?.length > 12 && CHECKS[extension]?.(buffer));
