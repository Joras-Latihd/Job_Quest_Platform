import Category from '../models/Category.js';
import Location from '../models/Location.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import ApiError from '../utils/ApiError.js';
import { escapeRegex, isObjectId } from '../utils/helpers.js';

// Resolve a "category" query value (slug or id) to an id. Returns null when nothing matches.
export async function resolveCategoryId(value) {
  if (!value) return undefined;
  const category = await Category.findOne(isObjectId(value) ? { _id: value } : { slug: String(value) }).select('_id');
  return category?._id || null;
}

// A location filter can be a city name (from the URL) or an id (from admin pages).
export async function resolveLocationIds(value) {
  if (isObjectId(value)) return [value];
  return Location.find({ city: new RegExp(`^${escapeRegex(value)}$`, 'i') }).distinct('_id');
}

export async function assertActiveCategoryAndLocation(categoryId, locationId) {
  const [category, location] = await Promise.all([Category.findById(categoryId), Location.findById(locationId)]);
  if (!category || category.status !== 'active') throw ApiError.badRequest('Choose an active category.');
  if (!location || location.status !== 'active') throw ApiError.badRequest('Choose an active location.');
}

// Adds activeJobs (published, not past deadline) to a list of company documents/objects.
export async function attachActiveJobCounts(companies) {
  if (!companies.length) return companies;
  const counts = await Job.aggregate([
    { $match: { company: { $in: companies.map((company) => company._id) }, status: 'PUBLISHED', deadline: { $gte: new Date() } } },
    { $group: { _id: '$company', count: { $sum: 1 } } },
  ]);
  const byCompany = new Map(counts.map((item) => [String(item._id), item.count]));
  return companies.map((company) => {
    const plain = company.toObject ? company.toObject() : company;
    return { ...plain, activeJobs: byCompany.get(String(company._id)) || 0 };
  });
}

export const hiddenCompanyIds = () => Company.find({ verificationStatus: { $in: ['SUSPENDED', 'REJECTED'] } }).distinct('_id');
