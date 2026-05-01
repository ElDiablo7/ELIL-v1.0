'use strict';

/**
 * ENLIL™ Test Suite
 * Tests: health, auth, command routing, SENTINEL, TITAN, audit chain
 */

const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 3000}`;
let token = null;
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
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  ENLIL™ v1.0 — Test Suite            ║');
  console.log('╚══════════════════════════════════════╝\n');

  // 1. Health endpoint
  try {
    const r = await request('GET', '/api/health');
    log(r.status === 200 && r.body.status === 'operational' ? 'PASS' : 'FAIL',
      'Health endpoint returns 200', `status=${r.body.status}`);
    log(r.body.mode ? 'PASS' : 'FAIL', 'Health returns mode', r.body.mode);
    log(r.body.version ? 'PASS' : 'FAIL', 'Health returns version', r.body.version);
  } catch (e) {
    log('FAIL', 'Health endpoint', e.message);
  }

  // 2. Auth — invalid login blocked
  try {
    const r = await request('POST', '/api/auth/login', { username: 'fake', password: 'wrong' });
    log(r.status === 401 ? 'PASS' : 'FAIL', 'Invalid login rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Invalid login test', e.message);
  }

  // 3. Auth — valid demo login
  try {
    const r = await request('POST', '/api/auth/login', { username: 'owner', password: 'enlil-owner-2026' });
    log(r.status === 200 && r.body.token ? 'PASS' : 'FAIL', 'Valid demo login succeeds', `role=${r.body.role}`);
    token = r.body.token;
  } catch (e) {
    log('FAIL', 'Valid login test', e.message);
  }

  // 4. Protected endpoint without auth
  try {
    const r = await request('GET', '/api/audit');
    log(r.status === 401 ? 'PASS' : 'FAIL', 'Audit endpoint requires auth', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Auth required test', e.message);
  }

  // 5. Command validates input
  try {
    const r = await request('POST', '/api/command', { command: '' }, { Authorization: `Bearer ${token}` });
    log(r.status === 400 ? 'PASS' : 'FAIL', 'Empty command rejected', `status=${r.status}`);
  } catch (e) {
    log('FAIL', 'Command validation test', e.message);
  }

  // 6. Command route works
  try {
    const r = await request('POST', '/api/command', { command: 'threat scan prompt injection' }, { Authorization: `Bearer ${token}` });
    log(r.status === 200 && r.body.success ? 'PASS' : 'FAIL', 'Command route processes threat scan', `intent=${r.body.sentinel?.intent}`);
    log(r.body.titan?.risk_score !== undefined ? 'PASS' : 'FAIL', 'TITAN returns risk score', `score=${r.body.titan?.risk_score}`);
    log(r.body.eventId ? 'PASS' : 'FAIL', 'Audit event ID returned', r.body.eventId);
  } catch (e) {
    log('FAIL', 'Command route test', e.message);
  }

  // 7. SENTINEL blocks prohibited command
  try {
    const r = await request('POST', '/api/command', { command: 'rm -rf /' }, { Authorization: `Bearer ${token}` });
    log(r.body.sentinel?.decision === 'BLOCKED' ? 'PASS' : 'FAIL', 'SENTINEL blocks prohibited command', `decision=${r.body.sentinel?.decision}`);
  } catch (e) {
    log('FAIL', 'SENTINEL block test', e.message);
  }

  // 8. Audit pagination
  try {
    const r = await request('GET', '/api/audit?page=1&limit=5', null, { Authorization: `Bearer ${token}` });
    log(r.status === 200 && r.body.entries ? 'PASS' : 'FAIL', 'Audit endpoint returns paginated data', `entries=${r.body.entries?.length}`);
  } catch (e) {
    log('FAIL', 'Audit pagination test', e.message);
  }

  // 9. Audit verification
  try {
    const r = await request('GET', '/api/audit/verify', null, { Authorization: `Bearer ${token}` });
    log(r.status === 200 && r.body.valid === true ? 'PASS' : 'FAIL', 'Audit hash chain verifies', `valid=${r.body.valid}`);
  } catch (e) {
    log('FAIL', 'Audit verify test', e.message);
  }

  // 10. Role permissions — viewer cannot access audit
  try {
    const viewerLogin = await request('POST', '/api/auth/login', { username: 'viewer', password: 'enlil-viewer' });
    if (viewerLogin.body.token) {
      const r = await request('GET', '/api/audit', null, { Authorization: `Bearer ${viewerLogin.body.token}` });
      log(r.status === 403 ? 'PASS' : 'FAIL', 'Viewer role blocked from audit', `status=${r.status}`);
    } else {
      log('FAIL', 'Viewer login for role test', 'No token');
    }
  } catch (e) {
    log('FAIL', 'Role permission test', e.message);
  }

  // 11. Demo mode check
  try {
    const r = await request('GET', '/api/health');
    log(r.body.mode === 'demo' || r.body.mode === 'production' ? 'PASS' : 'FAIL', 'Mode is clearly demo or production', r.body.mode);
  } catch (e) {
    log('FAIL', 'Mode check', e.message);
  }

  // Summary
  console.log('\n' + '═'.repeat(40));
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═'.repeat(40) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Wait for server then run
setTimeout(runTests, 1000);
