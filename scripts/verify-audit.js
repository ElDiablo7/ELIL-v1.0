'use strict';

/**
 * ENLIL™ Audit Verification Script
 * Verifies the tamper-evident hash chain of the server-side audit log.
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const AUDIT_FILE = path.join(__dirname, '..', 'data', 'audit_log.json');
const AUDIT_SECRET = process.env.AUDIT_SECRET || '';

function computeHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function computeHMAC(data) {
  if (!AUDIT_SECRET) return null;
  return crypto.createHmac('sha256', AUDIT_SECRET).update(JSON.stringify(data)).digest('hex');
}

console.log('\n  ENLIL™ Audit Chain Verification\n');

if (!fs.existsSync(AUDIT_FILE)) {
  console.log('  ⚠ No audit log file found at:', AUDIT_FILE);
  console.log('  Run the server first to generate audit events.\n');
  process.exit(0);
}

const raw = fs.readFileSync(AUDIT_FILE, 'utf8');
const chain = JSON.parse(raw);

console.log(`  Entries: ${chain.length}`);

let errors = 0;
for (let i = 0; i < chain.length; i++) {
  const entry = chain[i];

  // Check chain linkage
  if (i === 0) {
    if (entry.previousHash !== '0'.repeat(64)) {
      console.log(`  ❌ Entry ${i}: Genesis previousHash invalid`);
      errors++;
    }
  } else {
    if (entry.previousHash !== chain[i - 1].currentHash) {
      console.log(`  ❌ Entry ${i}: Chain broken — previousHash mismatch`);
      errors++;
    }
  }

  // Verify content hash
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
    console.log(`  ❌ Entry ${i}: Content hash mismatch — possible tampering`);
    errors++;
  }
}

if (errors === 0) {
  console.log(`  ✅ All ${chain.length} entries verified. Chain is intact.`);
} else {
  console.log(`\n  ❌ ${errors} error(s) found. Chain integrity compromised.`);
}
console.log('');
process.exit(errors > 0 ? 1 : 0);
