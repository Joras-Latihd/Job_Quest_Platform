export const labelFor = (options, value) => options.find((option) => option.value === value)?.label || value || '';

export const getStatus = (options, value) => options.find((option) => option.value === value) || { value, label: value || 'Unknown', tone: 'gray' };

export function formatLocation(location) {
  if (!location) return 'Not specified';
  if (typeof location === 'string') return location;
  return [location.city, location.country].filter(Boolean).join(', ');
}

const numberFormat = new Intl.NumberFormat('en-US');
const PERIOD_LABELS = { MONTHLY: '/ month', YEARLY: '/ year', DAILY: '/ day', HOURLY: '/ hour' };

export function formatSalary(salary) {
  if (!salary || (!salary.min && !salary.max)) return salary?.negotiable ? 'Negotiable' : 'Not disclosed';
  const currency = salary.currency || 'NPR';
  const range = salary.min && salary.max
    ? `${numberFormat.format(salary.min)} - ${numberFormat.format(salary.max)}`
    : numberFormat.format(salary.min || salary.max);
  return `${currency} ${range} ${PERIOD_LABELS[salary.period] || ''}`.trim();
}

export function formatExperience(experience) {
  if (!experience || (!experience.min && !experience.max)) return 'Fresher';
  if (experience.max && experience.max !== experience.min) return `${experience.min || 0}-${experience.max} years`;
  return `${experience.min}+ years`;
}

export function formatDate(value, withTime = false) {
  if (!value) return '-';
  const options = withTime
    ? { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(value).toLocaleString('en-US', options);
}

export function timeAgo(value) {
  if (!value) return '';
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const steps = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of steps) {
    const amount = Math.floor(seconds / size);
    if (amount >= 1) return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

export function daysUntil(value) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}

export function deadlineLabel(value) {
  const days = daysUntil(value);
  if (days === null) return 'No deadline';
  if (days < 0) return 'Deadline passed';
  if (days === 0) return 'Closes today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export const formatFileSize = (bytes = 0) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

// Helpers for textareas that hold one item per line (responsibilities, requirements...)
export const linesToArray = (text = '') => text.split('\n').map((line) => line.trim()).filter(Boolean);
export const arrayToLines = (items = []) => (Array.isArray(items) ? items.join('\n') : items);
export const commaToArray = (text = '') => text.split(',').map((item) => item.trim()).filter(Boolean);

export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');
