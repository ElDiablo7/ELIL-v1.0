# ENLIL™ v1.0 — Changelog

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
