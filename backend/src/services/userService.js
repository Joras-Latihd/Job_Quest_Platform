import User from '../models/User.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import JobAlert from '../models/JobAlert.js';
import Interview from '../models/Interview.js';
import Notification from '../models/Notification.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import JobReport from '../models/JobReport.js';
import ApiError from '../utils/ApiError.js';
import { MAX_RESUMES_PER_USER } from '../constants/index.js';
import { saveFile, removeFile } from './uploadService.js';
import { getRecommendedJobs, JOB_POPULATE } from './jobService.js';

const PROFILE_ARRAYS = ['education', 'experience', 'languages', 'certifications', 'projects'];

export async function updateProfile(user, changes) {
  const { dateOfBirth, ...rest } = changes;
  user.set(rest);
  if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth || undefined;
  PROFILE_ARRAYS.forEach((key) => user.markModified(key));
  await user.save();
  return user;
}

export async function setProfileImage(user, file) {
  const stored = await saveFile(file, { folder: 'avatars', kind: 'image' });
  const previous = user.profileImagePublicId;
  user.profileImage = stored.url;
  user.profileImagePublicId = stored.publicId;
  await user.save();
  await removeFile(previous);
  return user;
}

// A resume file may still be linked from applications employers are reading. Keep the file in that case.
async function deleteResumeFileIfUnused(resume) {
  const stillUsed = await Application.exists({ 'resume.url': resume.url });
  if (!stillUsed) await removeFile(resume.publicId);
}

export async function addResume(user, file) {
  if (user.resumes.length >= MAX_RESUMES_PER_USER) throw ApiError.badRequest(`You can keep up to ${MAX_RESUMES_PER_USER} resumes. Delete one first.`);
  const stored = await saveFile(file, { folder: 'resumes', kind: 'resume' });
  user.resumes.push({ name: file.originalname, url: stored.url, publicId: stored.publicId, size: file.size, mimeType: file.mimetype, isDefault: user.resumes.length === 0 });
  await user.save();
  return user.resumes[user.resumes.length - 1];
}

export async function replaceResume(user, resumeId, file) {
  const resume = user.resumes.id(resumeId);
  if (!resume) throw ApiError.notFound('Resume not found.');
  const old = { url: resume.url, publicId: resume.publicId };
  const stored = await saveFile(file, { folder: 'resumes', kind: 'resume' });
  Object.assign(resume, { name: file.originalname, url: stored.url, publicId: stored.publicId, size: file.size, mimeType: file.mimetype, uploadedAt: new Date() });
  await user.save();
  await deleteResumeFileIfUnused(old);
  return resume;
}

export async function setDefaultResume(user, resumeId) {
  if (!user.resumes.id(resumeId)) throw ApiError.notFound('Resume not found.');
  user.resumes.forEach((resume) => { resume.isDefault = String(resume._id) === String(resumeId); });
  await user.save();
  return user.resumes;
}

export async function deleteResume(user, resumeId) {
  const resume = user.resumes.id(resumeId);
  if (!resume) throw ApiError.notFound('Resume not found.');
  const copy = { url: resume.url, publicId: resume.publicId, isDefault: resume.isDefault };
  resume.deleteOne();
  if (copy.isDefault && user.resumes.length) user.resumes[0].isDefault = true;
  await user.save();
  await deleteResumeFileIfUnused(copy);
}

export async function getSeekerDashboard(user) {
  const now = new Date();
  const [applications, savedCount, upcomingCount, recentApplications, recommendedJobs, saved, upcomingInterviews, alerts] = await Promise.all([
    Application.countDocuments({ candidate: user._id }),
    SavedJob.countDocuments({ user: user._id }),
    Interview.countDocuments({ candidate: user._id, status: 'SCHEDULED', scheduledAt: { $gte: now } }),
    Application.find({ candidate: user._id }).sort({ appliedAt: -1 }).limit(5)
      .populate({ path: 'job', select: 'title company', populate: { path: 'company', select: 'name logo' } }).lean(),
    getRecommendedJobs(user, 3),
    SavedJob.find({ user: user._id }).sort({ savedAt: -1 }).limit(3).populate({ path: 'job', populate: JOB_POPULATE }).lean(),
    Interview.find({ candidate: user._id, status: 'SCHEDULED', scheduledAt: { $gte: now } }).sort({ scheduledAt: 1 }).limit(3).populate('job', 'title').lean(),
    JobAlert.countDocuments({ user: user._id, isActive: true }),
  ]);
  return {
    stats: { applications, savedJobs: savedCount, interviews: upcomingCount },
    recentApplications,
    recommendedJobs,
    savedJobs: saved.map((item) => item.job).filter(Boolean),
    upcomingInterviews,
    alerts,
  };
}

// Deletes an account and everything attached to it (used by the admin user management page).
export async function deleteUserCascade(user) {
  if (user.role === 'EMPLOYER') {
    const jobIds = await Job.find({ postedBy: user._id }).distinct('_id');
    await Promise.all([
      Application.deleteMany({ job: { $in: jobIds } }), SavedJob.deleteMany({ job: { $in: jobIds } }),
      Interview.deleteMany({ job: { $in: jobIds } }), JobReport.deleteMany({ job: { $in: jobIds } }),
      Job.deleteMany({ postedBy: user._id }),
    ]);
    const company = await Company.findOne({ owner: user._id });
    if (company) {
      await Promise.all([removeFile(company.logoPublicId), removeFile(company.coverImagePublicId)]);
      await company.deleteOne();
    }
  }
  const applications = await Application.find({ candidate: user._id }).select('job');
  await Promise.all(applications.map((item) => Job.updateOne({ _id: item.job }, { $inc: { applicationsCount: -1 } })));
  await Promise.all([
    Application.deleteMany({ candidate: user._id }), SavedJob.deleteMany({ user: user._id }), JobAlert.deleteMany({ user: user._id }),
    Interview.deleteMany({ $or: [{ candidate: user._id }, { employer: user._id }] }), Notification.deleteMany({ user: user._id }),
    JobReport.deleteMany({ reporter: user._id }),
  ]);
  await Promise.all([removeFile(user.profileImagePublicId), ...user.resumes.map((resume) => removeFile(resume.publicId))]);
  await user.deleteOne();
}
