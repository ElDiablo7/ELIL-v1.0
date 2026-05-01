'use strict';

/**
 * ENLIL™ Smoke Test
 * Quick verification that server starts and responds
 */

const http = require('http');
const BASE = `http://localhost:${process.env.PORT || 3000}`;

function request(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function smoke() {
  console.log('\n  ENLIL™ Smoke Test\n');
  try {
    const health = await request('/api/health');
    console.log(`  /api/health  → ${health.status === 200 ? '✅ OK' : '❌ FAIL'} (${health.status})`);

    const modules = await request('/api/modules');
    console.log(`  /api/modules → ${modules.status === 200 ? '✅ OK' : '❌ FAIL'} (${modules.status})`);

    const ui = await request('/');
    console.log(`  /            → ${ui.status === 200 ? '✅ OK' : '❌ FAIL'} (${ui.status})`);

    const notFound = await request('/api/nonexistent');
    console.log(`  /api/404     → ${notFound.status === 404 ? '✅ OK' : '❌ FAIL'} (${notFound.status})`);

    console.log('\n  Smoke test complete.\n');
    process.exit(0);
  } catch (e) {
    console.error(`  ❌ Server not reachable: ${e.message}`);
    process.exit(1);
  }
}

setTimeout(smoke, 500);
