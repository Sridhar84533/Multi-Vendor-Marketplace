/**
 * sanitizeInput.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Global middleware that recursively strips dangerous keys from req.body,
 * req.query, and req.params to prevent NoSQL (MongoDB) injection attacks.
 *
 * Threat model:
 *   - Attackers may send {"email": {"$gt": ""}} to bypass credential checks.
 *   - Keys that START with '$' are MongoDB operators and should never come
 *     from untrusted user input.
 *   - Keys containing '.' could traverse nested documents in unexpected ways.
 *
 * Usage: apply BEFORE any route handler (see server.js).
 */

/**
 * Recursively removes keys that begin with '$' or contain '.' from an object.
 * Works on nested objects and arrays.
 *
 * @param {*} value - Any value (object, array, string, number, etc.)
 * @returns {*} Sanitized value
 */
function deepSanitize(value) {
  // Arrays — sanitize every element
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }

  // Plain objects — strip dangerous keys, recurse into safe values
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const sanitized = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        // Drop the key entirely — do NOT forward it to the route handler
        continue;
      }
      sanitized[key] = deepSanitize(value[key]);
    }
    return sanitized;
  }

  // Primitives (strings, numbers, booleans, null) — return as-is
  return value;
}

/**
 * Express middleware: sanitizes req.body, req.query, and req.params.
 */
const sanitizeInput = (req, res, next) => {
  if (req.body)   req.body   = deepSanitize(req.body);
  if (req.query)  req.query  = deepSanitize(req.query);
  if (req.params) req.params = deepSanitize(req.params);
  next();
};

module.exports = sanitizeInput;
