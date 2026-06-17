const { createUserClient, supabase } = require('../config/supabase');
const { httpError } = require('../utils/httpError');

async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(httpError(401, 'Missing bearer token'));
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return next(httpError(401, 'Invalid or expired token'));
  }

  req.user = data.user;
  req.supabase = createUserClient(token);
  return next();
}

module.exports = { requireAuth };
