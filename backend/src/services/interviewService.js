import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import ApiError from '../utils/ApiError.js';
import { idEquals } from '../utils/helpers.js';
import { notify } from './notificationService.js';

const INTERVIEW_POPULATE = [
  { path: 'job', select: 'title company', populate: { path: 'company', select: 'name' } },
  { path: 'candidate', select: 'name email' },
];

const formatWhen = (date) => date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export async function scheduleInterview(user, body) {
  const application = await Application.findById(body.application).populate('job', 'title postedBy company');
  const canManage = application && (idEquals(application.job.postedBy, user._id) || (user.company && idEquals(application.job.company, user.company)));
  if (!canManage) throw ApiError.notFound('Application not found.');
  if (['WITHDRAWN', 'REJECTED'].includes(application.status)) throw ApiError.badRequest('You cannot schedule an interview for this application.');

  // Only one live interview per application: rescheduling replaces the previous one.
  if (application.interview) await Interview.findByIdAndUpdate(application.interview, { status: 'CANCELLED' });

  const interview = await Interview.create({
    application: application._id, job: application.job._id, candidate: application.candidate, employer: user._id,
    scheduledAt: body.scheduledAt, type: body.type, locationOrLink: body.locationOrLink, notes: body.notes,
  });
  application.interview = interview._id;
  if (['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(application.status)) {
    application.status = 'INTERVIEW';
    application.statusHistory.push({ status: 'INTERVIEW', changedBy: user._id, note: 'Interview scheduled' });
  }
  await application.save();

  await notify(application.candidate, { type: 'INTERVIEW_SCHEDULED', title: 'Interview scheduled', message: `Interview for ${application.job.title} on ${formatWhen(interview.scheduledAt)}.`, link: `/dashboard/applications/${application._id}` });
  return interview;
}

export async function listMyInterviews(user) {
  const filter = { status: 'SCHEDULED', ...(user.role === 'EMPLOYER' ? { employer: user._id } : { candidate: user._id }) };
  return Interview.find(filter).sort({ scheduledAt: 1 }).limit(100).populate(INTERVIEW_POPULATE).lean();
}

async function findOwnInterview(user, id) {
  const interview = await Interview.findOne({ _id: id, employer: user._id });
  if (!interview) throw ApiError.notFound('Interview not found.');
  return interview;
}

export async function updateInterview(user, id, changes) {
  const interview = await findOwnInterview(user, id);
  interview.set(changes);
  await interview.save();
  await notify(interview.candidate, { type: 'INTERVIEW_UPDATED', title: 'Interview updated', message: `Your interview is now on ${formatWhen(interview.scheduledAt)}.`, link: `/dashboard/applications/${interview.application}` });
  return interview;
}

export async function cancelInterview(user, id) {
  const interview = await findOwnInterview(user, id);
  interview.status = 'CANCELLED';
  await interview.save();
  await Application.updateOne({ _id: interview.application, interview: interview._id }, { $unset: { interview: 1 } });
  await notify(interview.candidate, { type: 'INTERVIEW_CANCELLED', title: 'Interview cancelled', message: 'An employer cancelled a scheduled interview.', link: `/dashboard/applications/${interview.application}` });
}
