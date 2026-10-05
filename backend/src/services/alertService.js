import JobAlert from '../models/JobAlert.js';
import Job from '../models/Job.js';
import { notifyMany } from './notificationService.js';

const lower = (value) => String(value || '').toLowerCase();

function alertMatchesJob(alert, job) {
  const haystack = `${lower(job.title)} ${(job.skills || []).map(lower).join(' ')} ${lower(job.company?.name)}`;
  const terms = lower(alert.keywords).split(/[\s,]+/).filter((term) => term.length > 1);
  if (terms.length && !terms.some((term) => haystack.includes(term))) return false;
  if (alert.location) {
    const wantsRemote = lower(alert.location) === 'remote';
    const cityMatches = lower(job.location?.city) === lower(alert.location);
    if (!(wantsRemote ? job.workplaceType === 'REMOTE' : cityMatches || job.workplaceType === 'REMOTE')) return false;
  }
  if (alert.category && String(alert.category) !== String(job.category?._id || job.category)) return false;
  if (alert.jobType && alert.jobType !== job.jobType) return false;
  if (alert.minSalary) {
    const top = job.salary?.max ?? job.salary?.min ?? 0;
    if (top < alert.minSalary) return false;
  }
  return true;
}

/*
 * Called whenever a job becomes public. Matching alerts get an in-app notification right away.
 * The alert's frequency is stored so an email digest (daily/weekly) can be added later in emailService.
 */
export async function notifyMatchingAlerts(jobId) {
  try {
    const job = await Job.findById(jobId).populate('company', 'name').populate('location', 'city');
    if (!job) return;
    const alerts = await JobAlert.find({ isActive: true });
    const matched = alerts.filter((alert) => String(alert.user) !== String(job.postedBy) && alertMatchesJob(alert, job));
    // One notification per user even if several of their alerts match.
    const userIds = [...new Set(matched.map((alert) => String(alert.user)))];
    await notifyMany(userIds, { type: 'JOB_ALERT', title: 'New job matches your alert', message: `${job.title} at ${job.company?.name} was just posted.`, link: `/jobs/${job._id}` });
  } catch (error) {
    console.error('Could not process job alerts:', error.message);
  }
}
