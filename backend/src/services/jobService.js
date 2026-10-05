import Job from '../models/Job.js';
import Company from '../models/Company.js';
import SavedJob from '../models/SavedJob.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import JobReport from '../models/JobReport.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, getPagination, parseSort } from '../utils/pagination.js';
import { daysAgo, escapeRegex, idEquals, isObjectId, startOfToday, toBool } from '../utils/helpers.js';
import { EDUCATION_LEVELS, JOB_TYPES, WORKPLACE_TYPES } from '../constants/index.js';
import { assertActiveCategoryAndLocation, hiddenCompanyIds, resolveCategoryId, resolveLocationIds } from './lookupService.js';
import { computeMatchScore } from './matchService.js';
import { getSettings } from './settingsService.js';
import { notifyMatchingAlerts } from './alertService.js';
import { notify } from './notificationService.js';

export const JOB_POPULATE = [
  { path: 'company', select: 'name logo verificationStatus industry location size website', populate: { path: 'location', select: 'city country' } },
  { path: 'category', select: 'name slug' },
  { path: 'location', select: 'city district province country' },
];

const DATE_POSTED_DAYS = { today: 1, '3d': 3, '7d': 7, '30d': 30 };
const PUBLIC_STATUSES = ['PUBLISHED', 'CLOSED', 'EXPIRED']; // statuses a shared link may show

// "1-3" -> { lo: 1, hi: 3 }, "10+" -> { lo: 10, hi: Infinity }, "0" -> { lo: 0, hi: 0 }
function parseExperience(value) {
  if (value.endsWith('+')) return { lo: Number(value.slice(0, -1)), hi: Infinity };
  const [lo, hi] = value.split('-').map(Number);
  return { lo, hi: hi ?? lo };
}

const PUBLIC_SORTS = {
  newest: { publishedAt: -1, _id: -1 },
  oldest: { publishedAt: 1, _id: 1 },
  deadline: { deadline: 1, _id: 1 },
  salary_asc: { 'salary.min': 1, _id: 1 },
  salary_desc: { 'salary.max': -1, _id: -1 },
};

// Turns the URL query (?keyword=...&type=...) into a MongoDB filter. Every param is checked before use.
export async function buildPublicFilter(query) {
  const and = [];
  const hidden = await hiddenCompanyIds();
  if (hidden.length) and.push({ company: { $nin: hidden } });

  if (query.keyword) {
    const terms = String(query.keyword).trim().split(/\s+/).slice(0, 5);
    for (const term of terms) {
      const regex = new RegExp(escapeRegex(term), 'i');
      const companyIds = await Company.find({ name: regex }).distinct('_id');
      and.push({ $or: [{ title: regex }, { description: regex }, { skills: regex }, { company: { $in: companyIds } }] });
    }
  }
  if (query.location) {
    if (String(query.location).toLowerCase() === 'remote') and.push({ workplaceType: 'REMOTE' });
    else and.push({ location: { $in: await resolveLocationIds(String(query.location)) } });
  }
  if (query.category) and.push({ category: await resolveCategoryId(String(query.category)) });
  if (JOB_TYPES.includes(query.type)) and.push({ jobType: query.type });
  if (WORKPLACE_TYPES.includes(query.workplace)) and.push({ workplaceType: query.workplace });
  if (EDUCATION_LEVELS.includes(query.education)) and.push({ education: query.education });
  if (DATE_POSTED_DAYS[query.datePosted]) and.push({ publishedAt: { $gte: query.datePosted === 'today' ? startOfToday() : daysAgo(DATE_POSTED_DAYS[query.datePosted]) } });
  if (toBool(query.urgent)) and.push({ isUrgent: true });
  if (toBool(query.featured)) and.push({ isFeatured: true });
  if (toBool(query.verified)) and.push({ company: { $in: await Company.find({ verificationStatus: 'VERIFIED' }).distinct('_id') } });
  if (isObjectId(query.company)) and.push({ company: query.company });

  if (query.experience && /^\d+([-+]\d*)?$/.test(query.experience)) {
    const { lo, hi } = parseExperience(String(query.experience));
    // A job matches when its experience range overlaps the selected range.
    and.push({ 'experience.min': { $lte: hi } });
    and.push({ $or: [{ 'experience.max': null }, { 'experience.max': { $gte: lo } }] });
  }
  const minSalary = Number(query.minSalary);
  const maxSalary = Number(query.maxSalary);
  if (minSalary > 0) and.push({ $or: [{ 'salary.max': { $gte: minSalary } }, { 'salary.min': { $gte: minSalary } }] });
  if (maxSalary > 0) and.push({ $or: [{ 'salary.min': { $lte: maxSalary } }, { 'salary.min': null }] });

  return { status: 'PUBLISHED', deadline: { $gte: startOfToday() }, ...(and.length ? { $and: and } : {}) };
}

// Adds isSaved / hasApplied for logged-in job seekers.
async function attachUserFlags(jobs, user) {
  if (!user || user.role !== 'JOB_SEEKER' || !jobs.length) return jobs;
  const ids = jobs.map((job) => job._id);
  const [saved, applied] = await Promise.all([
    SavedJob.find({ user: user._id, job: { $in: ids } }).distinct('job'),
    Application.find({ candidate: user._id, job: { $in: ids } }).distinct('job'),
  ]);
  const savedSet = new Set(saved.map(String));
  const appliedSet = new Set(applied.map(String));
  return jobs.map((job) => ({ ...job, isSaved: savedSet.has(String(job._id)), hasApplied: appliedSet.has(String(job._id)) }));
}

export async function categoryAffinity(userId) {
  const [savedJobIds, appliedJobIds] = await Promise.all([SavedJob.find({ user: userId }).distinct('job'), Application.find({ candidate: userId }).distinct('job')]);
  const categories = await Job.find({ _id: { $in: [...savedJobIds, ...appliedJobIds] } }).distinct('category');
  return new Set(categories.map(String));
}

export async function listPublicJobs(query, user) {
  const { page, limit, skip } = getPagination(query, { defaultLimit: 10 });
  const filter = await buildPublicFilter(query);
  const sort = PUBLIC_SORTS[query.sort] || PUBLIC_SORTS.newest;
  const [found, total] = await Promise.all([
    Job.find(filter).sort(sort).skip(skip).limit(limit).populate(JOB_POPULATE).lean(),
    Job.countDocuments(filter),
  ]);
  return { jobs: await attachUserFlags(found, user), pagination: buildPagination(page, limit, total) };
}

export async function getJobDetails(id, user) {
  const job = await Job.findById(id).populate(JOB_POPULATE);
  if (!job) throw ApiError.notFound('Job not found.');
  const canManage = user && (user.role === 'ADMIN' || idEquals(job.postedBy, user._id));
  const hiddenByCompany = ['SUSPENDED', 'REJECTED'].includes(job.company?.verificationStatus);
  if (!canManage && (!PUBLIC_STATUSES.includes(job.status) || hiddenByCompany)) throw ApiError.notFound('Job not found.');

  if (!canManage && job.status === 'PUBLISHED') {
    await Job.updateOne({ _id: job._id }, { $inc: { views: 1 } });
    job.views += 1;
  }
  const [withFlags] = await attachUserFlags([job.toObject()], user);
  if (user?.role === 'JOB_SEEKER') {
    const [profile, affinity] = await Promise.all([Promise.resolve(user), categoryAffinity(user._id)]);
    withFlags.matchScore = computeMatchScore(profile, job, affinity);
  }
  return withFlags;
}

export async function getRelatedJobs(id) {
  const job = await Job.findById(id).select('category');
  if (!job) throw ApiError.notFound('Job not found.');
  const hidden = await hiddenCompanyIds();
  return Job.find({ _id: { $ne: id }, category: job.category, status: 'PUBLISHED', deadline: { $gte: startOfToday() }, company: { $nin: hidden } })
    .sort({ publishedAt: -1 }).limit(4).populate(JOB_POPULATE).lean();
}

export async function getRecommendedJobs(user, limit = 6) {
  const [pool, affinity, applied, hidden] = await Promise.all([
    Job.find({ status: 'PUBLISHED', deadline: { $gte: startOfToday() } }).sort({ publishedAt: -1 }).limit(150).populate(JOB_POPULATE).lean(),
    categoryAffinity(user._id),
    Application.find({ candidate: user._id }).distinct('job'),
    hiddenCompanyIds(),
  ]);
  const skip = new Set([...applied, ...hidden].map(String));
  const scored = pool
    .filter((job) => !skip.has(String(job._id)) && !skip.has(String(job.company?._id)))
    .map((job) => ({ ...job, matchScore: computeMatchScore(user, job, affinity) }))
    .filter((job) => job.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
  return attachUserFlags(scored, user);
}

export async function getPlatformStats() {
  const [jobs, companies, candidates, applications] = await Promise.all([
    Job.countDocuments({ status: 'PUBLISHED', deadline: { $gte: startOfToday() } }),
    Company.countDocuments({ verificationStatus: { $nin: ['SUSPENDED', 'REJECTED'] } }),
    User.countDocuments({ role: 'JOB_SEEKER', isActive: true }),
    Application.countDocuments(),
  ]);
  return { jobs, companies, candidates, applications };
}

// ---------- employer / admin side ----------

const EMPLOYER_SORTS = ['title', 'createdAt', 'deadline', 'views', 'applicationsCount', 'status'];

export async function listEmployerJobs(user, query) {
  const { page, limit, skip } = getPagination(query);
  const filter = { postedBy: user._id };
  if (query.status) filter.status = query.status;
  if (query.search) filter.title = new RegExp(escapeRegex(query.search), 'i');
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort(parseSort(query.sort, EMPLOYER_SORTS)).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);
  return { jobs, pagination: buildPagination(page, limit, total) };
}

// Decide what happens when an employer submits a job: wait for approval, or go live straight away.
async function resolveSubmitStatus(company) {
  const settings = await getSettings();
  const needsApproval = settings.requireJobApproval || (settings.requireEmployerVerification && company.verificationStatus !== 'VERIFIED');
  return needsApproval ? 'PENDING_APPROVAL' : 'PUBLISHED';
}

function jobFields(body) {
  const { submitAction, ...fields } = body;
  return fields;
}

export async function createJob(user, body) {
  if (!user.company) throw ApiError.badRequest('Create your company profile before posting a job.');
  const company = await Company.findById(user.company);
  if (!company || ['SUSPENDED', 'REJECTED'].includes(company.verificationStatus)) throw ApiError.forbidden('Your company is not allowed to post jobs right now. Contact support.');
  await assertActiveCategoryAndLocation(body.category, body.location);
  if (body.deadline < startOfToday()) throw ApiError.validation('The deadline cannot be in the past.', [{ field: 'deadline', message: 'The deadline cannot be in the past.' }]);

  const status = body.submitAction === 'draft' ? 'DRAFT' : await resolveSubmitStatus(company);
  const job = await Job.create({
    ...jobFields(body), company: company._id, postedBy: user._id, status,
    publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
  });
  if (status === 'PUBLISHED') notifyMatchingAlerts(job._id);
  const messages = { DRAFT: 'Draft saved.', PENDING_APPROVAL: 'Job submitted. It will go live once an admin approves it.', PUBLISHED: 'Job published.' };
  return { job, message: messages[status] };
}

export async function updateJob(user, id, body) {
  const job = await Job.findById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  const isAdmin = user.role === 'ADMIN';
  if (!isAdmin && !idEquals(job.postedBy, user._id)) throw ApiError.forbidden('You can only edit your own jobs.');
  await assertActiveCategoryAndLocation(body.category, body.location);

  job.set(jobFields(body));
  let message = 'Job updated.';
  if (!isAdmin) {
    const company = await Company.findById(job.company);
    if (body.submitAction === 'draft') {
      job.status = 'DRAFT';
      message = 'Draft saved.';
    } else {
      // Editing a live or rejected job sends it back through the same approval rules as a new job.
      const wasLive = job.status === 'PUBLISHED';
      const next = await resolveSubmitStatus(company);
      // Closed or expired jobs stay as they are; everything else follows the approval rules.
      if (!['CLOSED', 'EXPIRED'].includes(job.status) && !(wasLive && next === 'PUBLISHED')) job.status = next;
      if (job.status === 'PUBLISHED' && !job.publishedAt) job.publishedAt = new Date();
      if (job.status === 'PENDING_APPROVAL') message = 'Changes submitted. The job will be public again once an admin approves it.';
    }
    job.rejectionReason = undefined;
  }
  await job.save();
  if (job.status === 'PUBLISHED' && !isAdmin) notifyMatchingAlerts(job._id);
  return { job, message };
}

export async function changeJobStatus(user, id, { status }) {
  const job = await Job.findById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  const isAdmin = user.role === 'ADMIN';
  if (!isAdmin && !idEquals(job.postedBy, user._id)) throw ApiError.forbidden();
  const allowed = isAdmin ? ['PENDING_APPROVAL', 'CLOSED', 'EXPIRED', 'DRAFT'] : ['CLOSED'];
  if (!allowed.includes(status)) throw ApiError.forbidden(`You cannot set a job to ${status}.`);
  job.status = status;
  await job.save();
  if (isAdmin && !idEquals(job.postedBy, user._id)) {
    await notify(job.postedBy, { type: 'JOB_STATUS', title: 'Your job status changed', message: `"${job.title}" is now ${status.replace('_', ' ').toLowerCase()}.`, link: '/employer/jobs' });
  }
  return job;
}

export async function setFeatured(id, isFeatured) {
  const job = await Job.findById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  if (isFeatured && job.status !== 'PUBLISHED') throw ApiError.badRequest('Only published jobs can be featured.');
  job.isFeatured = isFeatured;
  if (isFeatured) job.featureRequested = false;
  await job.save();
  return job;
}

export async function duplicateJob(user, id) {
  const source = await Job.findById(id).lean();
  if (!source || !idEquals(source.postedBy, user._id)) throw ApiError.notFound('Job not found.');
  const { _id, slug, createdAt, updatedAt, publishedAt, views, applicationsCount, isFeatured, featureRequested, rejectionReason, expiryNoticeSent, ...copy } = source;
  return Job.create({ ...copy, title: `${source.title} (Copy)`, status: 'DRAFT', deadline: new Date(Date.now() + 30 * 86400000) });
}

export async function deleteJob(user, id) {
  const job = await Job.findById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  if (user.role !== 'ADMIN' && !idEquals(job.postedBy, user._id)) throw ApiError.forbidden('You can only delete your own jobs.');
  // Remove everything that points at this job so no orphaned records remain.
  await Promise.all([
    Application.deleteMany({ job: job._id }), SavedJob.deleteMany({ job: job._id }),
    Interview.deleteMany({ job: job._id }), JobReport.deleteMany({ job: job._id }),
  ]);
  await job.deleteOne();
}

// Marks old jobs as expired and warns employers about jobs closing within two days. Run on a timer.
export async function runJobMaintenance() {
  const now = new Date();
  await Job.updateMany({ status: 'PUBLISHED', deadline: { $lt: now } }, { $set: { status: 'EXPIRED' } });
  const soon = await Job.find({ status: 'PUBLISHED', expiryNoticeSent: false, deadline: { $gte: now, $lte: new Date(now.getTime() + 2 * 86400000) } });
  for (const job of soon) {
    await notify(job.postedBy, { type: 'JOB_EXPIRING', title: 'A job is about to expire', message: `"${job.title}" closes on ${job.deadline.toDateString()}.`, link: '/employer/jobs' });
    job.expiryNoticeSent = true;
    await job.save();
  }
}
