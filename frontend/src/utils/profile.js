import { toDateInput } from './format';

// Profile completion = share of key sections that are filled in. It is only a guide for the user.
const COMPLETION_CHECKS = [
  { key: 'profileImage', label: 'Profile photo', done: (u) => Boolean(u.profileImage) },
  { key: 'headline', label: 'Professional headline', done: (u) => Boolean(u.headline) },
  { key: 'bio', label: 'Short bio', done: (u) => Boolean(u.bio) },
  { key: 'skills', label: 'Skills', done: (u) => u.skills?.length > 0 },
  { key: 'education', label: 'Education', done: (u) => u.education?.length > 0 },
  { key: 'experience', label: 'Experience', done: (u) => u.experience?.length > 0 },
  { key: 'resume', label: 'Resume', done: (u) => u.resumes?.length > 0 },
];

export function calcProfileCompletion(user) {
  if (!user) return { percent: 0, missing: [] };
  const missing = COMPLETION_CHECKS.filter((check) => !check.done(user)).map((check) => check.label);
  const percent = Math.round(((COMPLETION_CHECKS.length - missing.length) / COMPLETION_CHECKS.length) * 100);
  return { percent, missing };
}

const withDates = (items = []) => items.map((item) => ({ ...item, startDate: toDateInput(item.startDate), endDate: toDateInput(item.endDate), issueDate: toDateInput(item.issueDate) }));

export function profileToFormValues(user) {
  return {
    name: user.name || '', phone: user.phone || '', location: user.location || '', bio: user.bio || '',
    dateOfBirth: toDateInput(user.dateOfBirth), headline: user.headline || '', currentPosition: user.currentPosition || '',
    yearsOfExperience: user.yearsOfExperience ?? '', expectedSalary: user.expectedSalary ?? '',
    preferredLocation: user.preferredLocation || '', jobTypePreference: user.jobTypePreference || '',
    skills: user.skills || [], education: withDates(user.education), experience: withDates(user.experience),
    languages: user.languages || [], certifications: withDates(user.certifications), projects: user.projects || [],
    socialLinks: { linkedin: '', github: '', portfolio: '', other: '', ...(user.socialLinks || {}) },
  };
}
