'use strict';

/**
 * ENLIL™ v1.0 — Production Server
 * Backend-governed security console with Express
 * Copyright © Zachary Charles Anthony Crockett. All rights reserved.
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');

// --- Services ---
const auditService = require('./server/services/audit');
const sentinelService = require('./server/services/sentinel');
const titanService = require('./server/services/titan');
const authService = require('./server/services/auth');

// --- Config ---
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ENLIL_MODE = process.env.ENLIL_MODE || 'demo';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

const app = express();

// ---------------------
// Security Middleware
// ---------------------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Try again later.' }
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

// Body parsing with size limits
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// Request logging (non-production)
if (NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${req.method} ${req.path} [${req.requestId}]`);
    next();
  });
}

// ---------------------
// Static file serving
// ---------------------
app.use(express.static(path.join(__dirname, '.'), {
  index: 'index.html',
  extensions: ['html'],
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// ---------------------
// Auth Middleware
// ---------------------
const { authMiddleware, requireRole } = require('./server/middleware/auth');

// ---------------------
// API Routes
// ---------------------

// Health check — public
app.get('/api/health', (req, res) => {
  const modules = require('./config/modules.json');
  const modulesSummary = {};
  modules.forEach(m => { modulesSummary[m.name] = m.status; });

  res.json({
    status: 'operational',
    version: '1.0.0-hardened',
    product: 'ENLIL™',
    mode: ENLIL_MODE,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    modules: modulesSummary
  });
});

// Module status — public
app.get('/api/modules', (req, res) => {
  const modules = require('./config/modules.json');
  res.json({ modules });
});

// Auth routes
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const result = authService.login(username, password, ENLIL_MODE);
  if (!result.success) {
    auditService.append({
      actor: username || 'unknown',
      role: 'NONE',
      action: 'AUTH_FAILURE',
      command: '',
      classification: 'INTERNAL',
      policyDecision: 'DENIED',
      titanRiskScore: 0,
      result: 'FAILURE',
      mode: ENLIL_MODE,
      requestId: req.requestId,
      sourceIp: crypto.createHash('sha256').update(req.ip || '').digest('hex').substring(0, 16)
    });
    return res.status(401).json({ error: result.reason });
  }

  auditService.append({
    actor: username,
    role: result.role,
    action: 'AUTH_SUCCESS',
    command: '',
    classification: 'INTERNAL',
    policyDecision: 'ALLOWED',
    titanRiskScore: 0,
    result: 'SUCCESS',
    mode: ENLIL_MODE,
    requestId: req.requestId,
    sourceIp: crypto.createHash('sha256').update(req.ip || '').digest('hex').substring(0, 16)
  });

  res.json({
    success: true,
    token: result.token,
    role: result.role,
    mode: ENLIL_MODE,
    expiresIn: '1h'
  });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  auditService.append({
    actor: req.user.username,
    role: req.user.role,
    action: 'LOGOUT',
    command: '',
    classification: 'INTERNAL',
    policyDecision: 'ALLOWED',
    titanRiskScore: 0,
    result: 'SUCCESS',
    mode: ENLIL_MODE,
    requestId: req.requestId,
    sourceIp: crypto.createHash('sha256').update(req.ip || '').digest('hex').substring(0, 16)
  });
  res.json({ success: true, message: 'Logged out' });
});

// Command route — authenticated
app.post('/api/command', authMiddleware, (req, res) => {
  const { command } = req.body;
  if (!command || typeof command !== 'string' || command.length > 500) {
    return res.status(400).json({ error: 'Invalid command. Must be a string under 500 characters.' });
  }

  const sanitizedCommand = command.trim().replace(/[<>]/g, '');

  // SENTINEL policy check
  const sentinelResult = sentinelService.evaluate(sanitizedCommand, req.user.role, ENLIL_MODE);

  // TITAN risk analysis
  const titanResult = titanService.analyze(sanitizedCommand, sentinelResult.intent);

  // Determine final action
  let finalAction = 'APPROVED';
  if (sentinelResult.blocked) {
    finalAction = 'BLOCKED';
  } else if (titanResult.risk_score >= 80 || sentinelResult.escalated) {
    finalAction = 'ESCALATED';
  }

  // Write audit log
  const auditEventId = auditService.append({
    actor: req.user.username,
    role: req.user.role,
    action: 'COMMAND_EXECUTED',
    command: sanitizedCommand.substring(0, 100),
    classification: sentinelResult.classification,
    policyDecision: finalAction,
    titanRiskScore: titanResult.risk_score,
    result: finalAction === 'BLOCKED' ? 'DENIED' : 'PROCESSED',
    mode: ENLIL_MODE,
    requestId: req.requestId,
    sourceIp: crypto.createHash('sha256').update(req.ip || '').digest('hex').substring(0, 16)
  });

  res.json({
    success: finalAction !== 'BLOCKED',
    eventId: auditEventId,
    sentinel: {
      intent: sentinelResult.intent,
      classification: sentinelResult.classification,
      decision: finalAction,
      reason: sentinelResult.reason || null
    },
    titan: {
      risk_score: titanResult.risk_score,
      risk_level: titanResult.risk_level,
      categories: titanResult.categories,
      reasoning: titanResult.reasoning,
      recommended_action: titanResult.recommended_action,
      human_approval_required: titanResult.human_approval_required,
      should_block: titanResult.should_block,
      confidence: titanResult.confidence
    },
    posture: sentinelResult.posture,
    timestamp: new Date().toISOString()
  });
});

// Audit routes — restricted
app.get('/api/audit', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
  const result = auditService.getPage(page, limit);
  res.json(result);
});

app.get('/api/audit/export', authMiddleware, requireRole('OWNER'), (req, res) => {
  const bundle = auditService.exportBundle();
  auditService.append({
    actor: req.user.username,
    role: req.user.role,
    action: 'AUDIT_EXPORT',
    command: '',
    classification: 'SECRET',
    policyDecision: 'ALLOWED',
    titanRiskScore: 0,
    result: 'SUCCESS',
    mode: ENLIL_MODE,
    requestId: req.requestId,
    sourceIp: crypto.createHash('sha256').update(req.ip || '').digest('hex').substring(0, 16)
  });
  res.json(bundle);
});

app.get('/api/audit/verify', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
  const result = auditService.verify();
  res.json(result);
});

// ---------------------
// Error Handling
// ---------------------

// 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Fallback: serve index.html for non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler — no stack traces in production
app.use((err, req, res, _next) => {
  const isProduction = NODE_ENV === 'production';
  console.error(`[ERROR] ${req.requestId}: ${err.message}`);
  if (!isProduction) console.error(err.stack);

  res.status(err.status || 500).json({
    error: isProduction ? 'Internal server error' : err.message,
    requestId: req.requestId
  });
});

// ---------------------
// Start Server
// ---------------------
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  ENLIL™ v1.0 — Production Server        ║');
  console.log('║  GRACE-X AI™ Security Console            ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`  Mode:    ${ENLIL_MODE.toUpperCase()}`);
  console.log(`  Port:    ${PORT}`);
  console.log(`  Env:     ${NODE_ENV}`);
  console.log(`  Time:    ${new Date().toISOString()}`);
  console.log('');
});

module.exports = app;
