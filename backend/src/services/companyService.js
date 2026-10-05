import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, getPagination, parseSort } from '../utils/pagination.js';
import { escapeRegex, idEquals } from '../utils/helpers.js';
import { attachActiveJobCounts, resolveLocationIds } from './lookupService.js';
import { removeFile, saveFile } from './uploadService.js';

const LOCATION_POPULATE = { path: 'location', select: 'city district province country' };
const COMPANY_SORTS = ['name', 'createdAt', 'industry'];

export async function listCompanies(query) {
  const { page, limit, skip } = getPagination(query, { defaultLimit: 12, maxLimit: 50 });
  const filter = { verificationStatus: { $nin: ['SUSPENDED', 'REJECTED'] } };
  if (query.search) filter.name = new RegExp(escapeRegex(query.search), 'i');
  if (query.industry) filter.industry = String(query.industry);
  if (query.size) filter.size = String(query.size);
  if (query.verified === 'true') filter.verificationStatus = 'VERIFIED';
  if (query.location) filter.location = { $in: await resolveLocationIds(String(query.location)) };
  const total = await Company.countDocuments(filter);

  // "Most active jobs first" needs the counts, so those companies are sorted in memory (fine for a class-sized dataset).
  if (query.sort === '-activeJobs') {
    const all = await attachActiveJobCounts(await Company.find(filter).populate(LOCATION_POPULATE).limit(200));
    all.sort((a, b) => b.activeJobs - a.activeJobs);
    return { companies: all.slice(skip, skip + limit), pagination: buildPagination(page, limit, total) };
  }
  const found = await Company.find(filter).sort(parseSort(query.sort, COMPANY_SORTS, { name: 1 })).skip(skip).limit(limit).populate(LOCATION_POPULATE);
  return { companies: await attachActiveJobCounts(found), pagination: buildPagination(page, limit, total) };
}

export async function getCompany(id, user) {
  const company = await Company.findById(id).populate(LOCATION_POPULATE);
  if (!company) throw ApiError.notFound('Company not found.');
  const canSee = user && (user.role === 'ADMIN' || idEquals(company.owner, user._id));
  if (!canSee && ['SUSPENDED', 'REJECTED'].includes(company.verificationStatus)) throw ApiError.notFound('Company not found.');
  const [withCount] = await attachActiveJobCounts([company]);
  return withCount;
}

export async function getMyCompany(user) {
  const company = await Company.findOne({ owner: user._id }).populate(LOCATION_POPULATE);
  if (!company) throw ApiError.notFound('You have not created a company profile yet.');
  return company;
}

async function applyImages(company, files = {}) {
  const logo = files.logo?.[0];
  const cover = files.coverImage?.[0];
  if (logo) {
    const stored = await saveFile(logo, { folder: 'logos', kind: 'image' });
    await removeFile(company.logoPublicId);
    Object.assign(company, { logo: stored.url, logoPublicId: stored.publicId });
  }
  if (cover) {
    const stored = await saveFile(cover, { folder: 'covers', kind: 'image' });
    await removeFile(company.coverImagePublicId);
    Object.assign(company, { coverImage: stored.url, coverImagePublicId: stored.publicId });
  }
}

export async function createCompany(user, body, files) {
  if (await Company.exists({ owner: user._id })) throw ApiError.conflict('You already have a company profile.');
  const company = new Company({ ...body, owner: user._id });
  await applyImages(company, files);
  await company.save();
  await User.updateOne({ _id: user._id }, { company: company._id });
  return company;
}

export async function updateCompany(user, id, body, files) {
  const company = await Company.findById(id);
  if (!company) throw ApiError.notFound('Company not found.');
  if (user.role !== 'ADMIN' && !idEquals(company.owner, user._id)) throw ApiError.forbidden('You can only edit your own company.');
  company.set(body);
  await applyImages(company, files);
  await company.save();
  return company;
}

export async function getEmployerDashboard(user) {
  const company = await Company.findOne({ owner: user._id }).populate(LOCATION_POPULATE);
  const empty = { company: null, stats: { activeJobs: 0, totalApplications: 0, shortlisted: 0, interviews: 0 }, recentApplicants: [], recentJobs: [], statusBreakdown: [] };
  if (!company) return empty;

  const jobIds = await Job.find({ postedBy: user._id }).distinct('_id');
  const [activeJobs, totalApplications, shortlisted, interviews, recentApplicants, recentJobs, breakdown] = await Promise.all([
    Job.countDocuments({ postedBy: user._id, status: 'PUBLISHED' }),
    Application.countDocuments({ job: { $in: jobIds } }),
    Application.countDocuments({ job: { $in: jobIds }, status: 'SHORTLISTED' }),
    Interview.countDocuments({ employer: user._id, status: 'SCHEDULED', scheduledAt: { $gte: new Date() } }),
    Application.find({ job: { $in: jobIds } }).sort({ appliedAt: -1 }).limit(5)
      .populate({ path: 'candidate', select: 'name profileImage headline' }).populate('job', 'title').lean(),
    Job.find({ postedBy: user._id }).sort({ createdAt: -1 }).limit(5).select('title status views applicationsCount').lean(),
    Application.aggregate([{ $match: { job: { $in: jobIds } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  return {
    company,
    stats: { activeJobs, totalApplications, shortlisted, interviews },
    recentApplicants,
    recentJobs,
    statusBreakdown: breakdown.map((item) => ({ status: item._id, count: item.count })),
  };
}

