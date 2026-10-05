/*
 * Job match score (0-100). Simple and explainable on purpose:
 *   skills overlap        40  (share of the job's skills that the candidate lists)
 *   category affinity     20  (the job's category matches jobs they applied to or saved)
 *   preferred location    15  (preferred/current location equals the job city, or the job is remote)
 *   job type preference   10  (matches their preference; half marks if they have none)
 *   experience fit        15  (full marks when inside the range, partial when slightly below)
 * It is a relevance hint shown to the user - never a prediction of being hired.
 */
const lower = (value) => String(value || '').toLowerCase().trim();

export function computeMatchScore(user, job, affinityCategoryIds = new Set()) {
  let score = 0;

  const jobSkills = (job.skills || []).map(lower).filter(Boolean);
  const userSkills = new Set((user.skills || []).map(lower));
  if (jobSkills.length) score += (jobSkills.filter((skill) => userSkills.has(skill)).length / jobSkills.length) * 40;

  const categoryId = String(job.category?._id || job.category || '');
  if (categoryId && affinityCategoryIds.has(categoryId)) score += 20;

  const jobCity = lower(job.location?.city);
  const wanted = [lower(user.preferredLocation), lower(user.location)].filter(Boolean);
  if (job.workplaceType === 'REMOTE' || (jobCity && wanted.some((place) => place.includes(jobCity)))) score += 15;

  if (user.jobTypePreference) score += user.jobTypePreference === job.jobType ? 10 : 0;
  else score += 5;

  const years = user.yearsOfExperience;
  const minYears = job.experience?.min ?? 0;
  const maxYears = job.experience?.max;
  if (years == null) score += minYears === 0 ? 15 : 0;
  else if (years >= minYears && (maxYears == null || years <= maxYears + 2)) score += 15;
  else if (years < minYears) score += Math.max(0, 15 * (1 - (minYears - years) / Math.max(minYears, 1)));

  return Math.min(100, Math.round(score));
}
