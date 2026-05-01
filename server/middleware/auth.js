'use strict';

/**
 * ENLIL™ Auth Middleware
 * JWT verification and role-based access control
 */

const authService = require('../services/auth');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
  }

  const token = authHeader.substring(7);
  const payload = authService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }

  req.user = {
    username: payload.username,
    role: payload.role,
    displayName: payload.displayName,
    mode: payload.mode
  };

  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!authService.hasRole(req.user.role, ...roles)) {
      return res.status(403).json({ error: 'Insufficient permissions', required: roles, current: req.user.role });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
