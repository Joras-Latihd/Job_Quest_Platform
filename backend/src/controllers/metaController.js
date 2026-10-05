import Category from '../models/Category.js';
import Location from '../models/Location.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { buildPagination, getPagination, parseSort } from '../utils/pagination.js';
import { escapeRegex } from '../utils/helpers.js';
import { logAction } from '../services/auditService.js';

// Adds activeJobs (live right now) and jobsCount (any status) to categories/locations.
async function attachJobCounts(docs, field) {
  if (!docs.length) return [];
  const rows = await Job.aggregate([
    { $match: { [field]: { $in: docs.map((doc) => doc._id) } } },
    { $group: { _id: `$${field}`, total: { $sum: 1 }, active: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'PUBLISHED'] }, { $gte: ['$deadline', new Date()] }] }, 1, 0] } } } },
  ]);
  const byId = new Map(rows.map((row) => [String(row._id), row]));
  return docs.map((doc) => ({ ...doc.toObject(), activeJobs: byId.get(String(doc._id))?.active || 0, jobsCount: byId.get(String(doc._id))?.total || 0 }));
}

/*
 * Shared list logic for categories and locations.
 *  - Public / non-admin callers only ever see active items.
 *  - Without ?page the full list is returned (dropdowns, homepage); with ?page it is paginated (admin tables).
 */
function listHandler(Model, field, searchField, sorts, fallbackSort) {
  return asyncHandler(async (req, res) => {
    const filter = {};
    if (req.user?.role === 'ADMIN' && req.query.status) filter.status = req.query.status;
    else if (req.user?.role !== 'ADMIN') filter.status = 'active';
    if (req.query.search) filter[searchField] = new RegExp(escapeRegex(req.query.search), 'i');

    if (req.query.page === undefined) {
      const docs = await Model.find(filter).sort(fallbackSort);
      return sendSuccess(res, { data: await attachJobCounts(docs, field) });
    }
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10, maxLimit: 100 });
    const [docs, total] = await Promise.all([Model.find(filter).sort(parseSort(req.query.sort, sorts, fallbackSort)).skip(skip).limit(limit), Model.countDocuments(filter)]);
    return sendSuccess(res, { data: await attachJobCounts(docs, field), pagination: buildPagination(page, limit, total) });
  });
}

export const listCategories = listHandler(Category, 'category', 'name', ['name', 'createdAt'], { name: 1 });
export const listLocations = listHandler(Location, 'location', 'city', ['city', 'country', 'createdAt'], { city: 1 });

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  await logAction(req.user, 'CATEGORY_CREATED', { targetType: 'Category', targetId: category._id, targetLabel: category.name });
  sendSuccess(res, { status: 201, message: 'Category created.', data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found.');
  category.set(req.body);
  await category.save();
  await logAction(req.user, 'CATEGORY_UPDATED', { targetType: 'Category', targetId: category._id, targetLabel: category.name });
  sendSuccess(res, { message: 'Category updated.', data: category });
});

// Deleting a category that jobs still use would leave those jobs without one, so it is refused.
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found.');
  const used = await Job.countDocuments({ category: category._id });
  if (used) throw ApiError.conflict(`"${category.name}" is used by ${used} job${used === 1 ? '' : 's'}. Deactivate it instead of deleting.`);
  await category.deleteOne();
  await logAction(req.user, 'CATEGORY_DELETED', { targetType: 'Category', targetId: category._id, targetLabel: category.name });
  sendSuccess(res, { message: 'Category deleted.' });
});

export const createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  await logAction(req.user, 'LOCATION_CREATED', { targetType: 'Location', targetId: location._id, targetLabel: location.city });
  sendSuccess(res, { status: 201, message: 'Location created.', data: location });
});

export const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw ApiError.notFound('Location not found.');
  location.set(req.body);
  await location.save();
  await logAction(req.user, 'LOCATION_UPDATED', { targetType: 'Location', targetId: location._id, targetLabel: location.city });
  sendSuccess(res, { message: 'Location updated.', data: location });
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw ApiError.notFound('Location not found.');
  const [jobs, companies] = await Promise.all([Job.countDocuments({ location: location._id }), Company.countDocuments({ location: location._id })]);
  if (jobs || companies) throw ApiError.conflict(`"${location.city}" is used by ${jobs} job(s) and ${companies} company profile(s). Deactivate it instead of deleting.`);
  await location.deleteOne();
  await logAction(req.user, 'LOCATION_DELETED', { targetType: 'Location', targetId: location._id, targetLabel: location.city });
  sendSuccess(res, { message: 'Location deleted.' });
});
