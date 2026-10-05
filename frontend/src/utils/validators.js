// Client-side file checks. The backend repeats these checks - never rely on the browser alone.
export function validateFile(file, rules) {
  if (!file) return 'Please choose a file.';
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!rules.extensions.includes(extension) || (file.type && !rules.types.includes(file.type))) {
    return `Unsupported file type. Allowed: ${rules.label}.`;
  }
  if (file.size > rules.maxMB * 1024 * 1024) return `File is too large. Maximum size is ${rules.maxMB} MB.`;
  return null;
}
