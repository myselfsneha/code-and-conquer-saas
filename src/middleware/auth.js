const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sendError } = require('../utils/response');

function normalizeRole(role) {
  if (!role) return '';
  const value = String(role).toLowerCase().trim();
  return value === 'college' ? 'admin' : value;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authorization token is required');
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      user_id: decoded.user_id,
      tenant_id: decoded.tenant_id,
      role: normalizeRole(decoded.role),
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please login again');
    }
    return sendError(res, 401, 'Invalid token');
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return sendError(res, 403, 'Only admin can perform this action');
  }
  return next();
}

module.exports = { authMiddleware, requireAdmin, normalizeRole };
