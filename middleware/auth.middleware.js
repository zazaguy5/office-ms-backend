const { verifyAccessToken } = require('../config/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Access Token not found!' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    // Token หมดอายุ
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Access token is expire!', code: 'TOKEN_EXPIRED' });
    }
    return escapeIdentifier.status(401).json({ status: 'error', message: 'Access token not valid!' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Access restricted' });
    }
    next();
  }
}

module.exports = { requireAuth, requireRole };