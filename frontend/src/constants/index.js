export const ROLES = { JOB_SEEKER: 'JOB_SEEKER', EMPLOYER: 'EMPLOYER', ADMIN: 'ADMIN' };

export const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'TEMPORARY', label: 'Temporary' },
];

export const WORKPLACE_TYPES = [
  { value: 'ON_SITE', label: 'On-site' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
];

// Used by the filter sidebar. The value is sent to the API as ?experience=
export const EXPERIENCE_FILTERS = [
  { value: '0', label: 'Fresher' },
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

export const EDUCATION_LEVELS = [
  { value: 'SEE', label: 'SEE' },
  { value: 'PLUS_TWO', label: '+2' },
  { value: 'BACHELOR', label: 'Bachelor' },
  { value: 'MASTER', label: 'Master' },
  { value: 'PHD', label: 'PhD' },
  { value: 'OTHER', label: 'Other' },
];

export const DATE_POSTED_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'salary_asc', label: 'Salary: low to high' },
  { value: 'salary_desc', label: 'Salary: high to low' },
];

export const SALARY_PERIODS = [
  { value: 'MONTHLY', label: 'Per month' },
  { value: 'YEARLY', label: 'Per year' },
  { value: 'DAILY', label: 'Per day' },
  { value: 'HOURLY', label: 'Per hour' },
];

export const APPLICATION_METHODS = [
  { value: 'PLATFORM', label: 'Apply through Job Quest' },
  { value: 'EMAIL', label: 'Apply by email' },
  { value: 'EXTERNAL', label: 'Apply on company website' },
];

// tone is mapped to colours in components/ui/Badge.jsx
export const APPLICATION_STATUSES = [
  { value: 'APPLIED', label: 'Applied', tone: 'blue' },
  { value: 'UNDER_REVIEW', label: 'Under Review', tone: 'gray' },
  { value: 'SHORTLISTED', label: 'Shortlisted', tone: 'purple' },
  { value: 'INTERVIEW', label: 'Interview', tone: 'amber' },
  { value: 'SELECTED', label: 'Selected', tone: 'green' },
  { value: 'REJECTED', label: 'Rejected', tone: 'red' },
  { value: 'WITHDRAWN', label: 'Withdrawn', tone: 'gray' },
];
export const APPLICATION_FLOW = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

export const JOB_STATUSES = [
  { value: 'DRAFT', label: 'Draft', tone: 'gray' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval', tone: 'amber' },
  { value: 'PUBLISHED', label: 'Published', tone: 'green' },
  { value: 'CLOSED', label: 'Closed', tone: 'gray' },
  { value: 'REJECTED', label: 'Rejected', tone: 'red' },
  { value: 'EXPIRED', label: 'Expired', tone: 'amber' },
];

export const VERIFICATION_STATUSES = [
  { value: 'VERIFIED', label: 'Verified', tone: 'green' },
  { value: 'PENDING', label: 'Pending', tone: 'amber' },
  { value: 'SUSPENDED', label: 'Suspended', tone: 'red' },
  { value: 'REJECTED', label: 'Rejected', tone: 'red' },
];

export const REPORT_REASONS = [
  { value: 'FAKE_JOB', label: 'Fake job' },
  { value: 'INCORRECT_INFO', label: 'Incorrect information' },
  { value: 'EXPIRED_JOB', label: 'Expired job' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'MISLEADING', label: 'Misleading information' },
  { value: 'OTHER', label: 'Other' },
];

export const REPORT_STATUSES = [
  { value: 'PENDING', label: 'Pending', tone: 'amber' },
  { value: 'REVIEWED', label: 'Reviewed', tone: 'blue' },
  { value: 'RESOLVED', label: 'Resolved', tone: 'green' },
  { value: 'DISMISSED', label: 'Dismissed', tone: 'gray' },
];

export const INTERVIEW_TYPES = [
  { value: 'PHYSICAL', label: 'Physical' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'PHONE', label: 'Phone' },
];

export const ALERT_FREQUENCIES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'INSTANT', label: 'As soon as posted' },
];

export const USER_ROLE_OPTIONS = [
  { value: 'JOB_SEEKER', label: 'Job Seeker' },
  { value: 'EMPLOYER', label: 'Employer' },
  { value: 'ADMIN', label: 'Admin' },
];

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map((v) => ({ value: v, label: `${v} employees` }));

export const INDUSTRIES = [
  'Information Technology', 'Banking & Finance', 'Education', 'Healthcare', 'Manufacturing', 'Hospitality & Tourism',
  'NGO/INGO', 'Media & Communication', 'Construction & Real Estate', 'Retail & Trade', 'Telecommunications', 'Other',
].map((v) => ({ value: v, label: v }));

export const LANGUAGE_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'].map((v) => ({ value: v, label: v }));

// Only used when the API has no configured popular searches yet.
export const FALLBACK_POPULAR_SEARCHES = [
  'Software Developer', 'Accountant', 'Marketing Officer', 'Graphic Designer', 'HR Officer', 'Internship',
];

export const FILE_RULES = {
  resume: { types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], extensions: ['pdf', 'doc', 'docx'], maxMB: 5, label: 'PDF, DOC or DOCX up to 5 MB' },
  image: { types: ['image/jpeg', 'image/png', 'image/webp'], extensions: ['jpg', 'jpeg', 'png', 'webp'], maxMB: 2, label: 'JPG, PNG or WEBP up to 2 MB' },
};

export const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#' }, { label: 'LinkedIn', href: '#' }, { label: 'X', href: '#' }, { label: 'Instagram', href: '#' },
];
