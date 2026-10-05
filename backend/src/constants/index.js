export const ROLES = { JOB_SEEKER: 'JOB_SEEKER', EMPLOYER: 'EMPLOYER', ADMIN: 'ADMIN' };
export const ROLE_LIST = Object.values(ROLES);

export const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY'];
export const WORKPLACE_TYPES = ['ON_SITE', 'REMOTE', 'HYBRID'];
export const EDUCATION_LEVELS = ['SEE', 'PLUS_TWO', 'BACHELOR', 'MASTER', 'PHD', 'OTHER'];
export const SALARY_PERIODS = ['MONTHLY', 'YEARLY', 'DAILY', 'HOURLY'];
export const APPLICATION_METHODS = ['PLATFORM', 'EMAIL', 'EXTERNAL'];

export const JOB_STATUS = { DRAFT: 'DRAFT', PENDING: 'PENDING_APPROVAL', PUBLISHED: 'PUBLISHED', CLOSED: 'CLOSED', REJECTED: 'REJECTED', EXPIRED: 'EXPIRED' };
export const JOB_STATUS_LIST = Object.values(JOB_STATUS);

export const APPLICATION_STATUS_LIST = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'];
export const VERIFICATION_STATUS_LIST = ['VERIFIED', 'PENDING', 'SUSPENDED', 'REJECTED'];
export const REPORT_REASON_LIST = ['FAKE_JOB', 'INCORRECT_INFO', 'EXPIRED_JOB', 'SPAM', 'MISLEADING', 'OTHER'];
export const REPORT_STATUS_LIST = ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
export const INTERVIEW_TYPE_LIST = ['PHYSICAL', 'ONLINE', 'PHONE'];
export const ALERT_FREQUENCY_LIST = ['DAILY', 'WEEKLY', 'INSTANT'];
export const COMPANY_SIZE_LIST = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export const MAX_RESUMES_PER_USER = 5;

// What an employer may see of a candidate. Never include password or reset fields here.
export const CANDIDATE_PUBLIC_FIELDS = 'name email phone location profileImage headline bio currentPosition yearsOfExperience skills education experience projects languages certifications socialLinks';
