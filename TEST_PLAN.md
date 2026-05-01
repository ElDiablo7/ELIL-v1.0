# ENLIL™ v1.0 — Test Plan

## Test Framework
Lightweight Node.js test runner (no external dependencies required).

## Automated Tests (`npm test`) — 32 Tests

### Health Endpoint (5 tests)
| # | Test | Expected | Category |
|---|---|---|---|
| 1 | `GET /api/health` returns 200 | `status: operational` | Health |
| 2 | Health returns `mode` field | `demo` or `production` | Health |
| 3 | Health returns `version` field | String present | Health |
| 4 | Health endpoint safe output | No passwords, paths, or internal data | Health |
| 5 | Request ID header present | `X-Request-ID` header set | Health |

### Authentication (7 tests)
| # | Test | Expected | Category |
|---|---|---|---|
| 6 | Invalid login returns 401 | `status: 401` | Auth |
| 7 | Valid demo login returns token | JWT token present, role=OWNER | Auth |
| 8 | Viewer login succeeds | JWT token present, role=VIEWER | Auth |
| 9 | Operator login succeeds | JWT token present, role=OPERATOR | Auth |
| 10 | Missing token rejected | `status: 401` | Auth |
| 11 | Malformed token rejected | `status: 401` | Auth |
| 12 | Expired token rejected | `status: 401` with crafted expired JWT | Auth |

### Role-Based Access Control (2 tests)
| # | Test | Expected | Category |
|---|---|---|---|
| 13 | Viewer blocked from audit | `status: 403` | RBAC |
| 14 | Operator blocked from audit | `status: 403` | RBAC |

### Command Validation (5 tests)
| # | Test | Expected | Category |
|---|---|---|---|
| 15 | Empty command returns 400 | Input validation error | Command |
| 16 | Whitespace-only command returns 400 | Input validation error | Command |
| 17 | Threat scan command processes | `success: true`, TITAN score present | Command |
| 18 | TITAN risk score returned | Numeric score present | Command |
| 19 | Audit event ID returned | UUID present | Command |

### SENTINEL™ Policy Engine (4 tests)
| # | Test | Expected | Category |
|---|---|---|---|
| 20 | Prohibited command blocked | `decision: BLOCKED` for `rm -rf /` | SENTINEL |
| 21 | SQL injection blocked | `decision: BLOCKED` for `drop table` | SENTINEL |
| 22 | XSS attempt blocked | `decision: BLOCKED` for `<script>` | SENTINEL |
| 23 | Valid command allowed | `success: true` for compliance check | SENTINEL |

### TITAN™ Risk Engine (3 tests)
| # | Test | Expected | Category |
|---|---|---|---|
| 24 | LOW risk band (0–24) | Score 0–24, level=LOW | TITAN |
| 25 | MEDIUM risk band (25–49) | Score 25–49, level=MEDIUM | TITAN |
| 26 | HIGH risk band (50–74) | Score 50–74, level=HIGH | TITAN |

### Audit Chain (3 tests)
| # | Test | Expected | Category |
|---|---|---|---|
| 27 | Audit pagination works | Paginated entries returned | Audit |
| 28 | Audit hash chain verifies | `valid: true` | Audit |
| 29 | Mode clearly reported | `demo` or `production` | Audit |

### API Validation (3 tests)
| # | Test | Expected | Category |
|---|---|---|---|
| 30 | Malformed JSON rejected | `status: 400` | Validation |
| 31 | Request ID on error | `requestId` in body or header | Validation |
| 32 | 404 returns proper format | `ok: false` with requestId | Validation |

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

## Production Hardening Baseline (2026-05-01)

| Suite | Result |
|---|---|
| Automated Tests | **32 passed, 0 failed** |
| Smoke Test | **4/4 OK** |
| Audit Verification | **All entries verified, chain intact** |

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
