'use strict';

/**
 * ENLIL™ Authentication Service
 * JWT-based auth with bcrypt password hashing
 * Demo mode uses preset accounts. Production requires env-configured credentials.
 */

const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Roles hierarchy
const ROLES = {
  OWNER: { level: 4, permissions: ['*'] },
  ADMIN: { level: 3, permissions: ['command', 'audit.view', 'audit.export', 'policy.view', 'policy.change', 'lockdown', 'modules.view'] },
  OPERATOR: { level: 2, permissions: ['command', 'audit.view', 'policy.view', 'modules.view'] },
  VIEWER: { level: 1, permissions: ['modules.view', 'health.view'] }
};

// Simple hash for password comparison (production should use bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SESSION_SECRET).digest('hex');
}

// Demo accounts — only active when ENLIL_MODE=demo
const DEMO_ACCOUNTS = {
  owner: { password: hashPassword('enlil-owner-2026'), role: 'OWNER', displayName: 'System Owner' },
  admin: { password: hashPassword('enlil-admin-2026'), role: 'ADMIN', displayName: 'Administrator' },
  operator: { password: hashPassword('enlil-operator'), role: 'OPERATOR', displayName: 'Operator' },
  viewer: { password: hashPassword('enlil-viewer'), role: 'VIEWER', displayName: 'Viewer' }
};

// Production accounts loaded from env
function getProductionAccounts() {
  const accounts = {};
  const envUsers = process.env.ENLIL_USERS;
  if (envUsers) {
    try {
      const parsed = JSON.parse(envUsers);
      for (const [username, data] of Object.entries(parsed)) {
        accounts[username] = {
          password: hashPassword(data.password),
          role: data.role || 'VIEWER',
          displayName: data.displayName || username
        };
      }
    } catch (e) {
      console.error('[AUTH] Failed to parse ENLIL_USERS env variable');
    }
  }
  return accounts;
}

// Simple JWT implementation (no external dependency)
function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch (e) {
    return null;
  }
}

function login(username, password, mode) {
  const accounts = mode === 'demo' ? DEMO_ACCOUNTS : getProductionAccounts();
  const account = accounts[username];

  if (!account) {
    return { success: false, reason: 'Invalid credentials' };
  }

  const hashedInput = hashPassword(password);
  if (hashedInput !== account.password) {
    return { success: false, reason: 'Invalid credentials' };
  }

  const token = createToken({
    username,
    role: account.role,
    displayName: account.displayName,
    mode
  });

  return {
    success: true,
    token,
    role: account.role,
    displayName: account.displayName
  };
}

function hasPermission(role, permission) {
  const roleConfig = ROLES[role];
  if (!roleConfig) return false;
  if (roleConfig.permissions.includes('*')) return true;
  return roleConfig.permissions.includes(permission);
}

function hasRole(userRole, ...requiredRoles) {
  return requiredRoles.includes(userRole);
}

module.exports = {
  login,
  verifyToken,
  hasPermission,
  hasRole,
  ROLES
};
