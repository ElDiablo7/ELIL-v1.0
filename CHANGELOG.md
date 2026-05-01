# ENLIL™ v1.0 — Changelog

## [1.0.1-hardened] — 2026-05-01

### Production Hardening Pass — Enterprise Pilot Readiness

#### Security Hardening
- **Production startup validation**: Server refuses to start if `JWT_SECRET` or `AUDIT_SECRET` are missing or weak in production mode
- **Demo credential isolation**: Demo credentials explicitly cannot authenticate in production mode (`ENLIL_MODE=production`)
- **XSS detection ordering**: SENTINEL™ now evaluates raw command input BEFORE HTML sanitization, catching XSS patterns like `<script>` reliably
- **Token exposure removed**: Frontend `getToken()` method removed from public API surface
- **Health endpoint safe output**: `uptime` field hidden in production mode to prevent information leakage
- **Malformed JSON handling**: Custom body parser returns structured `{ ok: false, error, requestId }` for parse failures and oversized payloads

#### SENTINEL™ Policy Engine
- Added structured decision format: `decision` field with `ALLOW` / `BLOCK` / `REVIEW` values
- Added `severity` field: `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`
- Added `policyCategory` field for policy classification

#### TITAN™ Risk Engine
- Aligned risk bands to spec: 0–24 LOW, 25–49 MEDIUM, 50–74 HIGH, 75–100 CRITICAL
- Added `risk_category` field to output
- Updated threshold boundaries for `should_block` (75) and `human_approval_required` (50)
- Risk levels now uppercase (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)

#### API Hardening
- Consistent error format: `{ ok: false, error, requestId }` on all error responses
- Added `ok: true` to health endpoint response
- Added input length validation on login (username max 100, password max 200)
- Whitespace-only commands now rejected
- Request ID included in all error response bodies

#### Test Expansion
- Expanded from 15 to 32 automated tests
- Added: expired token rejection, malformed token, missing token
- Added: viewer audit block, operator audit block
- Added: XSS detection, SQL injection detection
- Added: TITAN LOW/MEDIUM/HIGH risk band verification
- Added: malformed JSON rejection, request ID on errors, 404 format, health safety
- Added: whitespace command rejection

#### Files Changed
- `server.js` — production startup validation, body parser, error format, SENTINEL ordering
- `server/services/auth.js` — production demo guard, JWT_EXPIRY_SECONDS, exported createToken/JWT_SECRET
- `server/services/sentinel.js` — structured decisions with severity/policyCategory
- `server/services/titan.js` — aligned risk bands (0-24/25-49/50-74/75-100)
- `assets/js/api_client.js` — removed getToken() exposure
- `tests/run.js` — expanded to 32 tests
- `CHANGELOG.md` — this entry
- `SECURITY_MODEL.md` — updated policy categories
- `TEST_PLAN.md` — updated test inventory
- `PRODUCTION_READINESS.md` — updated readiness assessment

---

## [1.0.0-hardened] — 2026-05-01

### Production Hardening Build

#### Added
- **Backend Server** (`server.js`): Express-based server with helmet, CORS, rate limiting, request IDs
- **Authentication Service** (`server/services/auth.js`): JWT-based auth with demo/production mode separation
- **Auth Middleware** (`server/middleware/auth.js`): Token verification and role-based access control
- **Audit Service** (`server/services/audit.js`): Server-side tamper-evident hash chain with HMAC signatures
- **SENTINEL Policy Engine** (`server/services/sentinel.js`): Server-side command classification and policy enforcement
- **TITAN Risk Engine** (`server/services/titan.js`): Server-side structured risk analysis with provider abstraction
- **Module Manifest** (`config/modules.json`): Honest status labels for all 6 modules
- **Environment Config** (`.env.example`): All configuration variables documented
- **Test Suite** (`tests/run.js`): 11 automated tests covering auth, routing, SENTINEL, TITAN, audit
- **Smoke Test** (`tests/smoke.js`): Quick server health verification
- **Audit Verification** (`scripts/verify-audit.js`): Standalone hash chain verification script
- **API Endpoints**: `/api/health`, `/api/modules`, `/api/auth/login`, `/api/command`, `/api/audit`, `/api/audit/export`, `/api/audit/verify`
- **Roles**: OWNER, ADMIN, OPERATOR, VIEWER with server-enforced permissions
- **Documentation**: COMPLIANCE_MAPPING.md, INVESTOR_TECHNICAL_SUMMARY.md, SECURITY_MODEL.md, DEPLOYMENT_GUIDE.md, TEST_PLAN.md

#### Changed
- `package.json`: Updated with Express dependencies and proper scripts
- `.gitignore`: Added `.env`, `data/audit_log.json`, `node_modules/`

#### Security Fixes
- Removed reliance on hardcoded PIN `0000` for production mode
- Removed `SENTINEL_OVERRIDE` bypass from production codepath
- All policy decisions now enforced server-side
- Audit logs owned by server, not client localStorage
- JWT tokens with 1-hour expiry, no persistent sessions
- Rate limiting on auth (10 attempts/15min) and API (60/min)
- No stack traces leaked in production mode
- Request IDs on every API call for traceability

#### Known Limitations
- Frontend still uses client-side logic for demo mode (offline fallback)
- GUARDIAN, FORGE, VENUS, LASER remain roadmap placeholders
- TITAN uses rule-based analysis (LLM provider stubbed for future)
- No TLS/HTTPS enforcement (deployment concern)
- Not independently pen-tested
- Not certified under any framework

---

## [1.0.0] — 2026-04-24

### Initial Prototype (Patch 2)
- Static browser-based security governance console
- SENTINEL client-side policy enforcement
- TITAN client-side risk analysis
- Demo audit logging via localStorage
- Professional sci-fi UI with dark theme
- Placeholder pages for GUARDIAN, FORGE, VENUS

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**
ENLIL™, GRACE-X AI™, SENTINEL™, TITAN™, GUARDIAN™, FORGE™, VENUS™, LASER™ are claimed trademarks.
