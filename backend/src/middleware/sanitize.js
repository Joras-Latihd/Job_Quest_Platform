// Removes keys that start with "$" or contain "." so input like { "email": { "$gt": "" } }
// cannot turn into a MongoDB operator (NoSQL injection).
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).filter(([key]) => !key.startsWith('$') && !key.includes('.')).map(([key, item]) => [key, clean(item)]),
    );
  }
  return value;
}

export default function sanitize(req, res, next) {
  if (req.body) req.body = clean(req.body);
  if (req.query) req.query = clean(req.query);
  if (req.params) req.params = clean(req.params);
  next();
}
