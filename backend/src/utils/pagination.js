export function getPagination(query, { defaultLimit = 10, maxLimit = 50 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export const buildPagination = (page, limit, total) => ({ page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });

/*
 * ?sort=-createdAt -> { createdAt: -1 }. Only fields in `allowed` are accepted,
 * so clients cannot sort on arbitrary (or sensitive) fields.
 */
export function parseSort(sortParam, allowed, fallback = { createdAt: -1 }) {
  if (!sortParam || typeof sortParam !== 'string') return fallback;
  const descending = sortParam.startsWith('-');
  const field = descending ? sortParam.slice(1) : sortParam;
  if (!allowed.includes(field)) return fallback;
  return { [field]: descending ? -1 : 1, _id: 1 };
}
