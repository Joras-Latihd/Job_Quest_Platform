import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Interview from '../models/Interview.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, getPagination, parseSort } from '../utils/pagination.js';
import { escapeRegex, idEquals } from '../utils/helpers.js';
import { CANDIDATE_PUBLIC_FIELDS } from '../constants/index.js';
import { notify } from './notificationService.js';

const APPLICATION_SORTS = ['appliedAt', 'status', 'createdAt'];

const JOB_BRIEF = {
  path: 'job',
  select: 'title company location status postedBy deadline',
  populate: [{ path: 'company', select: 'name logo' }, { path: 'location', select: 'city country' }],
};
const CANDIDATE_BRIEF = { path: 'candidate', select: CANDIDATE_PUBLIC_FIELDS };

// Approximate "education level" filters: candidates store free-text degrees, so we match common words.
const EDUCATION_PATTERNS = {
  SEE: /\bsee\b|secondary/i,
  PLUS_TWO: /\+2|plus two|higher secondary|intermediate|high school/i,
  BACHELOR: /bachelor|b\.?\s?sc|b\.?\s?tech|\bbba\b|\bbca\b|\bbbs\b|\bbe\b|\bba\b/i,
  MASTER: /master|m\.?\s?sc|m\.?\s?tech|\bmba\b|\bmca\b|\bme\b|\bma\b/i,
  PHD: /ph\.?\s?d|doctor/i,
};

// Which jobs does this employer own?
const employerJobFilter = (user) => ({ $or: [{ postedBy: user._id }, ...(user.company ? [{ company: user.company }] : [])] });

function canManageJob(user, job) {
  return user.role === 'ADMIN' || idEquals(job.postedBy, user._id) || (user.company && idEquals(job.company, user.company));
}

// Finds candidate ids matching the employer's applicant filters (name, skills, experience, education).
async function matchingCandidateIds(query) {
  const conditions = [{ role: 'JOB_SEEKER' }];
  if (query.search) conditions.push({ name: new RegExp(escapeRegex(query.search), 'i') });
  if (query.skills) conditions.push({ skills: new RegExp(escapeRegex(query.skills), 'i') });
  if (EDUCATION_PATTERNS[query.education]) conditions.push({ 'education.degree': EDUCATION_PATTERNS[query.education] });
  if (query.experience && /^\d+([-+]\d*)?$/.test(query.experience)) {
    const [lo, hi] = query.experience.endsWith('+') ? [Number(query.experience.slice(0, -1)), Infinity] : query.experience.split('-').map(Number);
    const upper = hi ?? lo;
    conditions.push(lo === 0 ? { $or: [{ yearsOfExperience: null }, { yearsOfExperience: { $lte: upper } }] } : { yearsOfExperience: { $gte: lo, ...(upper === Infinity ? {} : { $lte: upper }) } });
  }
  if (conditions.length === 1) return null; // no candidate filters used
  return User.find({ $and: conditions }).distinct('_id');
}

export async function applyToJob(user, { job: jobId, resume: resumeId, coverLetter, answers }) {
  const job = await Job.findById(jobId).populate('company', 'name verificationStatus');
  if (!job || job.status !== 'PUBLISHED' || ['SUSPENDED', 'REJECTED'].includes(job.company?.verificationStatus)) throw ApiError.notFound('This job is not open for applications.');
  if (job.deadline < new Date()) throw ApiError.badRequest('The application deadline has passed.');
  if (job.applicationMethod !== 'PLATFORM') throw ApiError.badRequest('This job accepts applications outside Job Quest.');

  const resume = user.resumes.id(resumeId);
  if (!resume) throw ApiError.badRequest('Choose one of your uploaded resumes.');

  const answerFor = new Map(answers.map((item) => [item.question, item.answer.trim()]));
  for (const item of job.screeningQuestions) {
    if (item.required && !answerFor.get(item.question)) throw ApiError.badRequest(`Please answer: ${item.question}`);
  }

  let application;
  try {
    application = await Application.create({
      job: job._id,
      candidate: user._id,
      resume: { name: resume.name, url: resume.url, mimeType: resume.mimeType },
      coverLetter,
      answers: job.screeningQuestions.map((item) => ({ question: item.question, answer: answerFor.get(item.question) || '' })),
      statusHistory: [{ status: 'APPLIED', changedBy: user._id }],
    });
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict('You have already applied for this job.');
    throw error;
  }
  await Job.updateOne({ _id: job._id }, { $inc: { applicationsCount: 1 } });

  await Promise.all([
    notify(user._id, { type: 'APPLICATION_SUBMITTED', title: 'Application submitted', message: `Your application for ${job.title} at ${job.company.name} was sent.`, link: `/dashboard/applications/${application._id}` }),
    notify(job.postedBy, { type: 'NEW_APPLICATION', title: 'New application', message: `${user.name} applied for ${job.title}.`, link: `/employer/applications/${application._id}` }),
  ]);
  return application;
}

export async function listMyApplications(user, query) {
  const { page, limit, skip } = getPagination(query);
  const filter = { candidate: user._id };
  if (query.status) filter.status = query.status;
  const [applications, total] = await Promise.all([
    Application.find(filter).sort(parseSort(query.sort, APPLICATION_SORTS, { appliedAt: -1 })).skip(skip).limit(limit).populate(JOB_BRIEF).lean(),
    Application.countDocuments(filter),
  ]);
  return { applications, pagination: buildPagination(page, limit, total) };
}

async function listFor(baseFilter, query) {
  const { page, limit, skip } = getPagination(query);
  const filter = { ...baseFilter };
  if (query.status) filter.status = query.status;
  const candidateIds = await matchingCandidateIds(query);
  if (candidateIds) filter.candidate = { $in: candidateIds };
  const [applications, total] = await Promise.all([
    Application.find(filter).sort(parseSort(query.sort, APPLICATION_SORTS, { appliedAt: -1 })).skip(skip).limit(limit).populate(JOB_BRIEF).populate(CANDIDATE_BRIEF).lean(),
    Application.countDocuments(filter),
  ]);
  return { applications, pagination: buildPagination(page, limit, total) };
}

export async function listApplicationsForJob(user, jobId, query) {
  const job = await Job.findById(jobId).select('postedBy company');
  if (!job) throw ApiError.notFound('Job not found.');
  if (!canManageJob(user, job)) throw ApiError.forbidden('You can only view applicants for your own jobs.');
  return listFor({ job: job._id }, query);
}

export async function listApplicationsForEmployer(user, query) {
  const jobIds = await Job.find(employerJobFilter(user)).distinct('_id');
  return listFor({ job: { $in: jobIds } }, query);
}

export async function getApplication(user, id) {
  const application = await Application.findById(id)
    .populate(JOB_BRIEF).populate(CANDIDATE_BRIEF).populate('interview', 'scheduledAt type locationOrLink notes status');
  if (!application?.job) throw ApiError.notFound('Application not found.');
  const isOwner = idEquals(application.candidate, user._id);
  if (!isOwner && !canManageJob(user, application.job)) throw ApiError.notFound('Application not found.'); // 404, not 403, so ids cannot be probed
  return application;
}

export async function updateApplicationStatus(user, id, { status, note }) {
  const application = await Application.findById(id).populate('job', 'title postedBy company');
  if (!application) throw ApiError.notFound('Application not found.');
  if (!canManageJob(user, application.job)) throw ApiError.notFound('Application not found.');
  if (application.status === 'WITHDRAWN') throw ApiError.badRequest('The candidate withdrew this application.');

  const changed = application.status !== status;
  application.status = status;
  application.statusHistory.push({ status, note, changedBy: user._id });
  await application.save();

  if (changed) {
    const label = status.replace('_', ' ').toLowerCase();
    await notify(application.candidate, { type: 'APPLICATION_STATUS', title: 'Application status updated', message: `Your application for ${application.job.title} is now: ${label}.`, link: `/dashboard/applications/${application._id}` });
  }
  return application;
}

export async function withdrawApplication(user, id) {
  const application = await Application.findOne({ _id: id, candidate: user._id }).populate('job', 'title postedBy');
  if (!application) throw ApiError.notFound('Application not found.');
  if (['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) throw ApiError.badRequest('This application can no longer be withdrawn.');
  application.status = 'WITHDRAWN';
  application.statusHistory.push({ status: 'WITHDRAWN', changedBy: user._id });
  await application.save();
  await Job.updateOne({ _id: application.job._id }, { $inc: { applicationsCount: -1 } });
  if (application.interview) await Interview.findByIdAndUpdate(application.interview, { status: 'CANCELLED' });
  await notify(application.job.postedBy, { type: 'APPLICATION_WITHDRAWN', title: 'Application withdrawn', message: `${user.name} withdrew their application for ${application.job.title}.`, link: `/employer/applications/${application._id}` });
  return application;
}
