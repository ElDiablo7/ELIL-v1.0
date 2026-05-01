# ENLIL™ v1.0 — Test Plan

## Test Framework
Lightweight Node.js test runner (no external dependencies required).

## Automated Tests (`npm test`)

| # | Test | Expected | Category |
|---|---|---|---|
| 1 | `GET /api/health` returns 200 | `status: operational` | Health |
| 2 | Health returns `mode` field | `demo` or `production` | Health |
| 3 | Health returns `version` field | String present | Health |
| 4 | Invalid login returns 401 | `status: 401` | Auth |
| 5 | Valid demo login returns token | JWT token present | Auth |
| 6 | Audit endpoint requires auth | `status: 401` without token | Auth |
| 7 | Empty command returns 400 | Input validation error | Command |
| 8 | Threat scan command processes | `success: true`, TITAN score present | Command |
| 9 | SENTINEL blocks prohibited command | `decision: BLOCKED` for `rm -rf /` | SENTINEL |
| 10 | Audit hash chain verifies | `valid: true` | Audit |
| 11 | Viewer role blocked from audit | `status: 403` | RBAC |

## Smoke Tests (`npm run smoke`)

| # | Test | Expected |
|---|---|---|
| 1 | `/api/health` responds | 200 |
| 2 | `/api/modules` responds | 200 |
| 3 | `/` serves UI | 200 |
| 4 | `/api/nonexistent` returns 404 | 404 |

## Audit Verification (`npm run verify:audit`)

| # | Check | Expected |
|---|---|---|
| 1 | Genesis entry has valid previousHash | `0` × 64 |
| 2 | Each entry links to previous hash | Chain unbroken |
| 3 | Content hashes verify | No mismatches |
| 4 | HMAC signatures verify | No mismatches |

## Manual Test Checklist

- [ ] `npm install` succeeds without errors
- [ ] `npm start` launches server on configured port
- [ ] Browser loads main ENLIL console at `/`
- [ ] Login with demo credentials works
- [ ] Commands route through backend
- [ ] Lockdown toggle functions
- [ ] Module pages load (TITAN, GUARDIAN, FORGE, VENUS, LASER)
- [ ] Help overlay opens with `H` key
- [ ] Logs tab displays entries
- [ ] Audit export works

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**
