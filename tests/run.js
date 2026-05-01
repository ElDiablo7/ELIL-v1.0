'use strict';

/**
 * ENLIL™ Test Suite — Production Hardening
 * Tests: health, auth, RBAC, command routing, SENTINEL, TITAN risk bands,
 *        audit chain, input validation, error format, production safeguards
 */

const http = require('http');
const crypto = require('crypto');

const BASE = `http://localhost:${process.env.PORT || 3000}`;
let ownerToken = null;
let viewerToken = null;
let operatorToken = null;
let passed = 0;
let failed = 0;
const results = [];

function log(status, name, detail) {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`  ${icon} ${name}${detail ? ': ' + detail : ''}`);
  results.push({ status, name, detail });
  if (status === 'PASS') passed++; else failed++;
}

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body !== null && body !== undefined) {
      if (typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

function requestRaw(method, path, rawBody, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (rawBody) req.write(rawBody);
    req.end();
  });
}

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  ENLIL™ AI Governance Console — Test Suite       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // ===== HEALTH ENDPOINT =====
  console.log('  --- Health Endpoint ---');

  // 1. Health endpoint returns 200
  try {
    const r = await request('GET', '/api/health');
    log(r.status === 200 && r.body.status === 'operational' ? 'PASS' : 'FAIL',
      'Health endpoint returns 200', `status=${r.body.status}`);
    log(r.body.mode ? 'PASS' : 'FAIL', 'Health returns mode', r.body.mode);
    log(r.body.version === '1.0.1-hardened' ? 'PASS' : 'FAIL', 'Health returns version', r.body.version);
  } catch (e) {
    log('FAIL', 'Health endpoint', e.message);
  }

  // 4. Health endpoint safe output (no stack traces, no internal paths)
  try {
    const r = await request('GET', '/api/health');
    const bodyStr = JSON.stringify(r.body);
    const hasSafeOutput = !bodyStr.includes('node_modules') && !bodyStr.includes('__dirname') && !bodyStr.includes('password');
    log(hasSafeOutput ? 'PASS' : 'FAIL', 'Health endpoint safe output only', 'No sensitive data leaked');
  } catch (e) {
    log('FAIL', 'Health safe output', e.message);
  }

  // 5. Request ID returned on all responses
  try {
    const r = await request('GET', '/api/health');
    log(r.headers['x-request-id'] ? 'PASS' : 'FAIL', 'Request ID header present', r.headers['x-request-id']);
  } catch (e) {
    log('FAIL', 'Request ID header', e.message);
  }

  // ===== AUTHENTICATION =====
  console.log('\n  --- Authentication ---');

  // 6. Invalid login rejected
  try {
    const r = await request('POST', '/api/auth/login', { username: 'fake', password: 'wrong' });
    log(r.status === 401 ? 'PASS' : 'FAIL', 'Invalid login rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Invalid login test', e.message);
  }

  // 7. Valid demo login (owner)
  try {
    const r = await request('POST', '/api/auth/login', { username: 'owner', password: 'enlil-owner-2026' });
    log(r.status === 200 && r.body.token ? 'PASS' : 'FAIL', 'Valid demo login succeeds', `role=${r.body.role}`);
    ownerToken = r.body.token;
  } catch (e) {
    log('FAIL', 'Valid login test', e.message);
  }

  // 8. Viewer login
  try {
    const r = await request('POST', '/api/auth/login', { username: 'viewer', password: 'enlil-viewer' });
    log(r.status === 200 && r.body.token ? 'PASS' : 'FAIL', 'Viewer login succeeds', `role=${r.body.role}`);
    viewerToken = r.body.token;
  } catch (e) {
    log('FAIL', 'Viewer login', e.message);
  }

  // 9. Operator login
  try {
    const r = await request('POST', '/api/auth/login', { username: 'operator', password: 'enlil-operator' });
    log(r.status === 200 && r.body.token ? 'PASS' : 'FAIL', 'Operator login succeeds', `role=${r.body.role}`);
    operatorToken = r.body.token;
  } catch (e) {
    log('FAIL', 'Operator login', e.message);
  }

  // 10. Missing token rejected
  try {
    const r = await request('GET', '/api/audit');
    log(r.status === 401 ? 'PASS' : 'FAIL', 'Missing token rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Missing token test', e.message);
  }

  // 11. Malformed token rejected
  try {
    const r = await request('GET', '/api/audit', null, { Authorization: 'Bearer not.a.valid.token.at.all' });
    log(r.status === 401 ? 'PASS' : 'FAIL', 'Malformed token rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Malformed token test', e.message);
  }

  // 12. Expired token rejected (craft a token with exp in the past)
  try {
    const authService = require('../server/services/auth');
    const expiredPayload = { username: 'test', role: 'ADMIN', displayName: 'Test', mode: 'demo' };
    // Create a manually expired token
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({
      ...expiredPayload,
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600 // expired 1 hour ago
    })).toString('base64url');
    const signature = crypto.createHmac('sha256', authService.JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    const expiredToken = `${header}.${body}.${signature}`;

    const r = await request('GET', '/api/audit', null, { Authorization: `Bearer ${expiredToken}` });
    log(r.status === 401 ? 'PASS' : 'FAIL', 'Expired token rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Expired token test', e.message);
  }

  // ===== RBAC =====
  console.log('\n  --- Role-Based Access Control ---');

  // 13. Viewer blocked from audit
  try {
    if (viewerToken) {
      const r = await request('GET', '/api/audit', null, { Authorization: `Bearer ${viewerToken}` });
      log(r.status === 403 ? 'PASS' : 'FAIL', 'Viewer blocked from audit', `status=${r.status}`);
    } else {
      log('FAIL', 'Viewer audit test', 'No viewer token');
    }
  } catch (e) {
    log('FAIL', 'Viewer audit test', e.message);
  }

  // 14. Operator blocked from audit export (OWNER only)
  try {
    if (operatorToken) {
      const r = await request('GET', '/api/audit', null, { Authorization: `Bearer ${operatorToken}` });
      log(r.status === 403 ? 'PASS' : 'FAIL', 'Operator blocked from audit', `status=${r.status}`);
    } else {
      log('FAIL', 'Operator audit test', 'No operator token');
    }
  } catch (e) {
    log('FAIL', 'Operator audit test', e.message);
  }

  // ===== COMMAND VALIDATION =====
  console.log('\n  --- Command Validation ---');

  // 15. Empty command rejected
  try {
    const r = await request('POST', '/api/command', { command: '' }, { Authorization: `Bearer ${ownerToken}` });
    log(r.status === 400 ? 'PASS' : 'FAIL', 'Empty command rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Command validation test', e.message);
  }

  // 16. Whitespace-only command rejected
  try {
    const r = await request('POST', '/api/command', { command: '   ' }, { Authorization: `Bearer ${ownerToken}` });
    log(r.status === 400 ? 'PASS' : 'FAIL', 'Whitespace-only command rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Whitespace command test', e.message);
  }

  // 17. Threat scan command processes
  try {
    const r = await request('POST', '/api/command', { command: 'threat scan prompt injection' }, { Authorization: `Bearer ${ownerToken}` });
    log(r.status === 200 && r.body.success ? 'PASS' : 'FAIL', 'Threat scan command processes', `intent=${r.body.sentinel?.intent}`);
    log(r.body.titan?.risk_score !== undefined ? 'PASS' : 'FAIL', 'TITAN returns risk score', `score=${r.body.titan?.risk_score}`);
    log(r.body.eventId ? 'PASS' : 'FAIL', 'Audit event ID returned', r.body.eventId);
  } catch (e) {
    log('FAIL', 'Command route test', e.message);
  }

  // ===== SENTINEL =====
  console.log('\n  --- SENTINEL™ Policy Engine ---');

  // 20. Prohibited command blocked
  try {
    const r = await request('POST', '/api/command', { command: 'rm -rf /' }, { Authorization: `Bearer ${ownerToken}` });
    log(r.body.sentinel?.decision === 'BLOCKED' ? 'PASS' : 'FAIL', 'SENTINEL blocks prohibited command', `decision=${r.body.sentinel?.decision}`);
  } catch (e) {
    log('FAIL', 'SENTINEL block test', e.message);
  }

  // 21. SQL injection blocked
  try {
    const r = await request('POST', '/api/command', { command: 'drop table users' }, { Authorization: `Bearer ${ownerToken}` });
    log(r.body.sentinel?.decision === 'BLOCKED' ? 'PASS' : 'FAIL', 'SENTINEL blocks SQL injection', `decision=${r.body.sentinel?.decision}`);
  } catch (e) {
    log('FAIL', 'SENTINEL SQL injection test', e.message);
  }

  // 22. XSS attempt blocked
  try {
    const r = await request('POST', '/api/command', { command: 'inject <script>alert(1)</script>' }, { Authorization: `Bearer ${ownerToken}` });
    log(r.body.sentinel?.decision === 'BLOCKED' ? 'PASS' : 'FAIL', 'SENTINEL blocks XSS attempt', `decision=${r.body.sentinel?.decision}`);
  } catch (e) {
    log('FAIL', 'SENTINEL XSS test', e.message);
  }

  // 23. Allowed command passes
  try {
    const r = await request('POST', '/api/command', { command: 'compliance check data handling' }, { Authorization: `Bearer ${ownerToken}` });
    log(r.body.success === true ? 'PASS' : 'FAIL', 'SENTINEL allows valid command', `intent=${r.body.sentinel?.intent}`);
  } catch (e) {
    log('FAIL', 'SENTINEL allow test', e.message);
  }

  // ===== TITAN =====
  console.log('\n  --- TITAN™ Risk Engine ---');

  // 24. LOW risk band
  try {
    const r = await request('POST', '/api/command', { command: 'view policy settings' }, { Authorization: `Bearer ${ownerToken}` });
    log(r.body.titan?.risk_level === 'LOW' ? 'PASS' : 'FAIL', 'TITAN LOW risk band (0-24)', `score=${r.body.titan?.risk_score}, level=${r.body.titan?.risk_level}`);
  } catch (e) {
    log('FAIL', 'TITAN LOW test', e.message);
  }

  // 25. MEDIUM risk band
  try {
    const r = await request('POST', '/api/command', { command: 'red team scenario social engineering urgent' }, { Authorization: `Bearer ${ownerToken}` });
    const score = r.body.titan?.risk_score || 0;
    const level = r.body.titan?.risk_level || '';
    log(score >= 25 && score < 50 ? 'PASS' : 'FAIL', 'TITAN MEDIUM risk band (25-49)', `score=${score}, level=${level}`);
  } catch (e) {
    log('FAIL', 'TITAN MEDIUM test', e.message);
  }

  // 26. HIGH risk band
  try {
    const r = await request('POST', '/api/command', { command: 'export dump all data copy all records auto schedule cron transfer remote api url' }, { Authorization: `Bearer ${ownerToken}` });
    const score = r.body.titan?.risk_score || 0;
    const level = r.body.titan?.risk_level || '';
    log(score >= 50 && score < 75 ? 'PASS' : 'FAIL', 'TITAN HIGH risk band (50-74)', `score=${score}, level=${level}`);
  } catch (e) {
    log('FAIL', 'TITAN HIGH test', e.message);
  }

  // ===== AUDIT =====
  console.log('\n  --- Audit Chain ---');

  // 27. Audit pagination
  try {
    const r = await request('GET', '/api/audit?page=1&limit=5', null, { Authorization: `Bearer ${ownerToken}` });
    log(r.status === 200 && r.body.entries ? 'PASS' : 'FAIL', 'Audit pagination works', `entries=${r.body.entries?.length}`);
  } catch (e) {
    log('FAIL', 'Audit pagination test', e.message);
  }

  // 28. Audit hash chain verifies
  try {
    const r = await request('GET', '/api/audit/verify', null, { Authorization: `Bearer ${ownerToken}` });
    log(r.status === 200 && r.body.valid === true ? 'PASS' : 'FAIL', 'Audit hash chain verifies', `valid=${r.body.valid}`);
  } catch (e) {
    log('FAIL', 'Audit verify test', e.message);
  }

  // 29. Mode clearly reports demo or production
  try {
    const r = await request('GET', '/api/health');
    log(r.body.mode === 'demo' || r.body.mode === 'production' ? 'PASS' : 'FAIL', 'Mode is clearly demo or production', r.body.mode);
  } catch (e) {
    log('FAIL', 'Mode check', e.message);
  }

  // ===== INPUT VALIDATION / ERROR FORMAT =====
  console.log('\n  --- API Validation ---');

  // 30. Malformed JSON rejected
  try {
    const r = await requestRaw('POST', '/api/auth/login', '{this is not json}', { 'Content-Type': 'application/json' });
    log(r.status === 400 ? 'PASS' : 'FAIL', 'Malformed JSON rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Malformed JSON test', e.message);
  }

  // 31. Request ID returned on error responses
  try {
    const r = await request('POST', '/api/auth/login', { username: 'fake', password: 'wrong' });
    log(r.body.requestId || r.headers['x-request-id'] ? 'PASS' : 'FAIL', 'Request ID on error response', `requestId=${r.body.requestId || r.headers['x-request-id']}`);
  } catch (e) {
    log('FAIL', 'Request ID on error', e.message);
  }

  // 32. 404 API endpoint returns proper format
  try {
    const r = await request('GET', '/api/nonexistent');
    log(r.status === 404 && r.body.ok === false ? 'PASS' : 'FAIL', '404 returns proper error format', `ok=${r.body.ok}`);
  } catch (e) {
    log('FAIL', '404 format test', e.message);
  }

  // ===== SUMMARY =====
  console.log('\n' + '═'.repeat(50));
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═'.repeat(50) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Wait for server then run
setTimeout(runTests, 1000);
