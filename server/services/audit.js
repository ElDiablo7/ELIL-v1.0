'use strict';

/**
 * ENLIL™ Audit Service — Server-Side Tamper-Evident Logging
 * Append-only hash chain with HMAC signatures.
 * Stores audit events in-memory + file for persistence.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const AUDIT_SECRET = process.env.AUDIT_SECRET || crypto.randomBytes(32).toString('hex');
const AUDIT_LOG_MODE = process.env.AUDIT_LOG_MODE || 'file';
const AUDIT_FILE = path.join(__dirname, '..', '..', 'data', 'audit_log.json');

let auditChain = [];
let initialized = false;

function initialize() {
  if (initialized) return;
  
  // Ensure data directory exists
  const dataDir = path.dirname(AUDIT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing log if file mode
  if (AUDIT_LOG_MODE === 'file' && fs.existsSync(AUDIT_FILE)) {
    try {
      const raw = fs.readFileSync(AUDIT_FILE, 'utf8');
      auditChain = JSON.parse(raw);
      console.log(`[AUDIT] Loaded ${auditChain.length} existing audit entries`);
    } catch (e) {
      console.error('[AUDIT] Failed to load audit file, starting fresh:', e.message);
      auditChain = [];
    }
  }
  initialized = true;
}

function computeHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function computeHMAC(data) {
  return crypto.createHmac('sha256', AUDIT_SECRET).update(JSON.stringify(data)).digest('hex');
}

function append(event) {
  initialize();

  const eventId = crypto.randomUUID();
  const previousHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].currentHash : '0'.repeat(64);

  const entry = {
    eventId,
    timestamp: new Date().toISOString(),
    requestId: event.requestId || null,
    actor: event.actor || 'SYSTEM',
    role: event.role || 'SYSTEM',
    command: event.command || '',
    action: event.action || 'UNKNOWN',
    classification: event.classification || 'INTERNAL',
    policyDecision: event.policyDecision || 'NONE',
    titanRiskScore: event.titanRiskScore || 0,
    result: event.result || 'UNKNOWN',
    mode: event.mode || 'unknown',
    sourceIp: event.sourceIp || null,
    previousHash
  };

  // Compute hash of entry content (excluding hash fields)
  entry.currentHash = computeHash({
    eventId: entry.eventId,
    timestamp: entry.timestamp,
    actor: entry.actor,
    role: entry.role,
    action: entry.action,
    command: entry.command,
    previousHash: entry.previousHash
  });

  // HMAC signature for tamper detection
  entry.signature = computeHMAC({
    eventId: entry.eventId,
    currentHash: entry.currentHash,
    previousHash: entry.previousHash
  });

  auditChain.push(entry);

  // Persist to file
  if (AUDIT_LOG_MODE === 'file') {
    try {
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(auditChain, null, 2), 'utf8');
    } catch (e) {
      console.error('[AUDIT] Failed to persist audit log:', e.message);
    }
  }

  return eventId;
}

function getPage(page = 1, limit = 25) {
  initialize();
  const total = auditChain.length;
  const totalPages = Math.ceil(total / limit);
  const start = Math.max(0, total - (page * limit));
  const end = Math.max(0, total - ((page - 1) * limit));
  const entries = auditChain.slice(start, end).reverse();

  return {
    entries,
    page,
    limit,
    total,
    totalPages,
    chainVerified: verify().valid
  };
}

function verify() {
  initialize();
  if (auditChain.length === 0) return { valid: true, entries: 0, errors: [] };

  const errors = [];

  for (let i = 0; i < auditChain.length; i++) {
    const entry = auditChain[i];

    // Verify hash chain linkage
    if (i === 0) {
      if (entry.previousHash !== '0'.repeat(64)) {
        errors.push({ index: i, error: 'Genesis entry has invalid previousHash' });
      }
    } else {
      if (entry.previousHash !== auditChain[i - 1].currentHash) {
        errors.push({ index: i, error: 'Hash chain broken — previousHash mismatch' });
      }
    }

    // Verify current hash
    const expectedHash = computeHash({
      eventId: entry.eventId,
      timestamp: entry.timestamp,
      actor: entry.actor,
      role: entry.role,
      action: entry.action,
      command: entry.command,
      previousHash: entry.previousHash
    });

    if (entry.currentHash !== expectedHash) {
      errors.push({ index: i, error: 'Current hash mismatch — entry may be tampered' });
    }

    // Verify HMAC signature
    const expectedSig = computeHMAC({
      eventId: entry.eventId,
      currentHash: entry.currentHash,
      previousHash: entry.previousHash
    });

    if (entry.signature !== expectedSig) {
      errors.push({ index: i, error: 'HMAC signature mismatch — entry may be tampered' });
    }
  }

  return {
    valid: errors.length === 0,
    entries: auditChain.length,
    errors,
    lastHash: auditChain[auditChain.length - 1]?.currentHash || null
  };
}

function exportBundle() {
  initialize();
  const verification = verify();
  return {
    exportTimestamp: new Date().toISOString(),
    product: 'ENLIL™ v1.0',
    totalEntries: auditChain.length,
    chainVerification: verification,
    entries: auditChain,
    exportSignature: computeHMAC({
      totalEntries: auditChain.length,
      lastHash: auditChain.length > 0 ? auditChain[auditChain.length - 1].currentHash : null,
      exportTimestamp: new Date().toISOString()
    })
  };
}

module.exports = { append, getPage, verify, exportBundle, initialize };
