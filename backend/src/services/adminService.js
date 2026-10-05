import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import JobReport from '../models/JobReport.js';
import ContactMessage from '../models/ContactMessage.js';
import Notification from '../models/Notification.js';
import Broadcast from '../models/Broadcast.js';
import AuditLog from '../models/AuditLog.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, getPagination, parseSort } from '../utils/pagination.js';
import { daysAgo, escapeRegex, isObjectId, toBool } from '../utils/helpers.js';
import { attachActiveJobCounts } from './lookupService.js';
import { notify } from './notificationService.js';
import { getSettings } from './settingsService.js';
import { notifyMatchingAlerts } from './alertService.js';

// Runs a paginated find + count. Used by almost every admin list.
async function paginate(model, filter, query, { sorts, fallbackSort, populate = [], select, lean = true } = {}) {
  const { page, limit, skip } = getPagination(query);
  let finder = model.find(filter).sort(parseSort(query.sort, sorts, fallbackSort)).skip(skip).limit(limit);
  populate.forEach((item) => { finder = finder.populate(item); });
  if (select) finder = finder.select(select);
  if (lean) finder = finder.lean();
  const [rows, total] = await Promise.all([finder, model.countDocuments(filter)]);
  return { rows, pagination: buildPagination(page, limit, total) };
}

const regex = (text) => new RegExp(escapeRegex(text), 'i');

// ---------- dashboard ----------
function lastMonths(count = 6) {
  const first = new Date();
  first.setDate(1);
  first.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const start = new Date(first.getFullYear(), first.getMonth() - (count - 1 - index), 1);
    return { start, key: `${start.getFullYear()}-${start.getMonth() + 1}`, label: start.toLocaleString('en-US', { month: 'short', year: '2-digit' }) };
  });
}

async function monthlySeries(model, dateField, match = {}) {
  const months = lastMonths();
  const rows = await model.aggregate([
    { $match: { [dateField]: { $gte: months[0].start }, ...match } },
    { $group: { _id: { y: { $year: `$${dateField}` }, m: { $month: `$${dateField}` } }, count: { $sum: 1 } } },
  ]);
  const byKey = new Map(rows.map((row) => [`${row._id.y}-${row._id.m}`, row.count]));
  return months.map((month) => ({ label: month.label, value: byKey.get(month.key) || 0 }));
}

async function topJobGroups(field, lookupFrom, labelField) {
  const rows = await Job.aggregate([
    { $match: { status: 'PUBLISHED' } },
    { $group: { _id: `$${field}`, value: { $sum: 1 } } },
    { $sort: { value: -1 } },
    { $limit: 8 },
    { $lookup: { from: lookupFrom, localField: '_id', foreignField: '_id', as: 'ref' } },
    { $project: { value: 1, label: { $arrayElemAt: [`$ref.${labelField}`, 0] } } },
  ]);
  return rows.map((row) => ({ label: row.label || 'Unknown', value: row.value }));
}

export async function getDashboard() {
  const [totalUsers, jobSeekers, employers, companies, activeJobs, pendingJobs, applications, newUsers, jobsOverTime, applicationsOverTime, registrations, jobsByCategory, jobsByLocation] = await Promise.all([
    User.countDocuments(), User.countDocuments({ role: 'JOB_SEEKER' }), User.countDocuments({ role: 'EMPLOYER' }), Company.countDocuments(),
    Job.countDocuments({ status: 'PUBLISHED' }), Job.countDocuments({ status: 'PENDING_APPROVAL' }), Application.countDocuments(),
    User.countDocuments({ createdAt: { $gte: daysAgo(7) } }),
    monthlySeries(Job, 'createdAt'), monthlySeries(Application, 'appliedAt'), monthlySeries(User, 'createdAt'),
    topJobGroups('category', 'categories', 'name'), topJobGroups('location', 'locations', 'city'),
  ]);
  return { stats: { totalUsers, jobSeekers, employers, companies, activeJobs, pendingJobs, applications, newUsers }, jobsOverTime, applicationsOverTime, registrations, jobsByCategory, jobsByLocation };
}

// ---------- users ----------
export async function listUsers(query) {
  const filter = {};
  if (['JOB_SEEKER', 'EMPLOYER', 'ADMIN'].includes(query.role)) filter.role = query.role;
  if (query.isActive === 'true' || query.isActive === 'false') filter.isActive = toBool(query.isActive);
  if (query.search) filter.$or = [{ name: regex(query.search) }, { email: regex(query.search) }];
  return paginate(User, filter, query, { sorts: ['name', 'createdAt', 'email'], fallbackSort: { createdAt: -1 }, select: '-resumes -passwordChangedAt' });
}

export async function updateUser(admin, id, changes) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found.');
  if (String(user._id) === String(admin._id)) throw ApiError.badRequest('You cannot change your own account here.');
  if (changes.isActive !== undefined) user.isActive = changes.isActive;
  if (changes.role) user.role = changes.role;
  await user.save();
  return user;
}

export async function getUserForDeletion(admin, id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found.');
  if (String(user._id) === String(admin._id)) throw ApiError.badRequest('You cannot delete your own account.');
  if (user.role === 'ADMIN' && (await User.countDocuments({ role: 'ADMIN' })) <= 1) throw ApiError.badRequest('You cannot delete the last administrator.');
  return user;
}

// ---------- employers & companies ----------
export async function listEmployers(query) {
  const filter = { role: 'EMPLOYER' };
  const companyFilter = {};
  if (query.status) companyFilter.verificationStatus = query.status;
  if (query.search) filter.$or = [{ name: regex(query.search) }, { email: regex(query.search) }, { company: { $in: await Company.find({ name: regex(query.search) }).distinct('_id') } }];
  if (query.status) {
    const ids = await Company.find(companyFilter).distinct('_id');
    // Employers who never created a company count as PENDING.
    const statusCondition = query.status === 'PENDING' ? { $or: [{ company: { $in: ids } }, { company: null }] } : { company: { $in: ids } };
    filter.$and = [statusCondition];
  }
  const { rows, pagination } = await paginate(User, filter, query, {
    sorts: ['name', 'createdAt'], fallbackSort: { createdAt: -1 }, select: 'name email createdAt isActive company',
    populate: [{ path: 'company', select: 'name industry website verificationStatus verificationNote' }],
  });
  const counts = await Job.aggregate([{ $match: { postedBy: { $in: rows.map((row) => row._id) } } }, { $group: { _id: '$postedBy', count: { $sum: 1 } } }]);
  const byEmployer = new Map(counts.map((item) => [String(item._id), item.count]));
  return { rows: rows.map((row) => ({ ...row, jobsCount: byEmployer.get(String(row._id)) || 0 })), pagination };
}

export async function setEmployerStatus(employerId, { status, reason }) {
  const employer = await User.findOne({ _id: employerId, role: 'EMPLOYER' });
  if (!employer) throw ApiError.notFound('Employer not found.');
  const company = await Company.findOne({ owner: employer._id });
  if (!company) throw ApiError.badRequest('This employer has not created a company profile yet.');
  company.verificationStatus = status;
  company.verificationNote = ['REJECTED', 'SUSPENDED'].includes(status) ? reason : undefined;
  await company.save();
  const messages = {
    VERIFIED: 'Your company has been verified. Your jobs can now go live.',
    REJECTED: `Your company verification was rejected. Reason: ${reason}`,
    SUSPENDED: `Your company has been suspended. Reason: ${reason}`,
    PENDING: 'Your company is back in the verification queue.',
  };
  await notify(employer._id, { type: 'COMPANY_STATUS', title: 'Company status updated', message: messages[status], link: '/employer/company' });
  return { employer, company };
}

export async function listCompanies(query) {
  const filter = {};
  if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
  if (query.industry) filter.industry = String(query.industry);
  if (query.search) filter.name = regex(query.search);
  const { rows, pagination } = await paginate(Company, filter, query, {
    sorts: ['name', 'createdAt'], fallbackSort: { createdAt: -1 }, populate: [{ path: 'location', select: 'city country' }], lean: false,
  });
  return { rows: await attachActiveJobCounts(rows), pagination };
}

// ---------- jobs ----------
export async function listJobs(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (isObjectId(query.category)) filter.category = query.category;
  if (isObjectId(query.employer)) filter.postedBy = query.employer;
  if (query.featured === 'true' || query.featured === 'false') filter.isFeatured = toBool(query.featured);
  if (query.featureRequested === 'true') filter.featureRequested = true;
  if (query.search) filter.$or = [{ title: regex(query.search) }, { company: { $in: await Company.find({ name: regex(query.search) }).distinct('_id') } }];
  return paginate(Job, filter, query, {
    sorts: ['title', 'createdAt', 'deadline', 'applicationsCount'], fallbackSort: { createdAt: -1 },
    populate: [{ path: 'company', select: 'name' }, { path: 'category', select: 'name' }],
  });
}

export async function approveJob(id) {
  const job = await Job.findById(id).populate('company', 'verificationStatus name');
  if (!job) throw ApiError.notFound('Job not found.');
  if (!['PENDING_APPROVAL', 'REJECTED'].includes(job.status)) throw ApiError.badRequest('Only pending or rejected jobs can be approved.');
  const settings = await getSettings();
  if (settings.requireEmployerVerification && job.company.verificationStatus !== 'VERIFIED') throw ApiError.badRequest('Verify the employer first. Jobs from unverified companies cannot be published.');
  if (job.deadline < new Date()) throw ApiError.badRequest('This job\'s deadline has passed. Ask the employer to extend it.');
  job.status = 'PUBLISHED';
  job.publishedAt = new Date();
  job.rejectionReason = undefined;
  await job.save();
  await notify(job.postedBy, { type: 'JOB_APPROVED', title: 'Job approved', message: `"${job.title}" is now live.`, link: '/employer/jobs' });
  notifyMatchingAlerts(job._id);
  return job;
}

export async function rejectJob(id, reason) {
  const job = await Job.findById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  if (job.status === 'REJECTED') throw ApiError.badRequest('This job is already rejected.');
  job.status = 'REJECTED';
  job.rejectionReason = reason;
  job.isFeatured = false;
  await job.save();
  await notify(job.postedBy, { type: 'JOB_REJECTED', title: 'Job rejected', message: `"${job.title}" was rejected. Reason: ${reason}`, link: `/employer/jobs/${job._id}/edit` });
  return job;
}

export async function listApplications(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    const [userIds, jobIds] = await Promise.all([User.find({ name: regex(query.search) }).distinct('_id'), Job.find({ title: regex(query.search) }).distinct('_id')]);
    filter.$or = [{ candidate: { $in: userIds } }, { job: { $in: jobIds } }];
  }
  return paginate(Application, filter, query, {
    sorts: ['appliedAt', 'status'], fallbackSort: { appliedAt: -1 },
    populate: [{ path: 'candidate', select: 'name email' }, { path: 'job', select: 'title company', populate: { path: 'company', select: 'name' } }],
  });
}

// ---------- reports, messages ----------
export async function listReports(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.reason) filter.reason = query.reason;
  if (query.search) filter.job = { $in: await Job.find({ title: regex(query.search) }).distinct('_id') };
  return paginate(JobReport, filter, query, {
    sorts: ['createdAt', 'status'], fallbackSort: { createdAt: -1 },
    populate: [{ path: 'job', select: 'title company', populate: { path: 'company', select: 'name' } }, { path: 'reporter', select: 'name' }],
  });
}

export async function listMessages(query) {
  const filter = {};
  if (query.isRead === 'true' || query.isRead === 'false') filter.isRead = toBool(query.isRead);
  if (query.search) filter.$or = [{ name: regex(query.search) }, { email: regex(query.search) }, { subject: regex(query.search) }];
  return paginate(ContactMessage, filter, query, { sorts: ['createdAt'], fallbackSort: { createdAt: -1 } });
}

// ---------- broadcasts, audit logs ----------
export async function sendBroadcast(admin, { title, message, audience }) {
  const filter = { isActive: true, role: audience === 'ALL' ? { $in: ['JOB_SEEKER', 'EMPLOYER'] } : audience };
  const userIds = await User.find(filter).distinct('_id');
  await Notification.insertMany(userIds.map((user) => ({ user, type: 'SYSTEM', title, message })));
  return Broadcast.create({ title, message, audience, recipients: userIds.length, createdBy: admin._id });
}

export const listBroadcasts = (query) => paginate(Broadcast, {}, query, { sorts: ['createdAt'], fallbackSort: { createdAt: -1 } });

export async function listAuditLogs(query) {
  const filter = query.search ? { $or: [{ action: regex(query.search) }, { targetLabel: regex(query.search) }, { details: regex(query.search) }] } : {};
  return paginate(AuditLog, filter, query, { sorts: ['createdAt'], fallbackSort: { createdAt: -1 }, populate: [{ path: 'actor', select: 'name' }] });
}

