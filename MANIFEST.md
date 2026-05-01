# ENLIL™ AI Governance Console — Project Manifest

> **Build:** 1.0.1-hardened  
> **Updated:** 2026-05-01

---

## Root Files

| File | Type | Purpose |
|------|------|---------|
| `server.js` | JS | Express backend (security middleware, routing, error handling) |
| `index.html` | HTML | Main SENTINEL console entry point |
| `titan.html` | HTML | TITAN dashboard (popup window) |
| `guardian.html` | HTML | GUARDIAN module (roadmap placeholder) |
| `forge.html` | HTML | FORGE module (roadmap placeholder) |
| `venus.html` | HTML | VENUS module (roadmap placeholder) |
| `laser.html` | HTML | LASER module (restricted placeholder) |
| `package.json` | JSON | npm project metadata |
| `.env.example` | Config | Environment variable template with instructions |
| `render.yaml` | Config | Render deployment configuration |

## Server (`server/`)

| File | Purpose |
|------|---------|
| `server/middleware/auth.js` | JWT verification, RBAC enforcement |
| `server/services/auth.js` | Authentication service (demo/production mode) |
| `server/services/audit.js` | Tamper-evident audit logging (SHA-256 + HMAC) |
| `server/services/sentinel.js` | SENTINEL™ server-side policy engine |
| `server/services/titan.js` | TITAN™ server-side risk engine |

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Product overview, quick start, API reference |
| `USER_MANUAL.md` | Operator instructions |
| `DEVELOPER_HANDOVER.md` | Technical architecture & function reference |
| `DEPLOYMENT_GUIDE.md` | Local + production deployment instructions |
| `SECURITY_MODEL.md` | 6-layer security architecture |
| `COMPLIANCE_MAPPING.md` | NIST AI RMF, EU AI Act, ISO 42001, SOC 2 alignment |
| `INVESTOR_TECHNICAL_SUMMARY.md` | Investor-safe technical overview |
| `VERTICAL_PRODUCTISATION.md` | Commercial vertical strategy |
| `PRODUCTION_READINESS.md` | Production readiness assessment |
| `FINAL_STATUS.md` | Current build status and classification |
| `TEST_PLAN.md` | Complete test coverage documentation |
| `CHANGELOG.md` | Full change history |
| `RELEASE_NOTES.md` | Release summary |
| `ENLIL_V1_PRODUCTION_HARDENING_REPORT.md` | Production hardening report |
| `MANIFEST.md` | This file — project inventory |
| `VERSION.md` | Current version number |

## Tests & Scripts

| File | Purpose |
|------|---------|
| `tests/run.js` | 32 automated tests |
| `tests/smoke.js` | Quick smoke test |
| `scripts/verify-audit.js` | Standalone audit chain verification |

## Frontend (`assets/js/`)

| File | Module | Purpose |
|------|--------|---------|
| `app.js` | `App` | Main controller, UI, tab switching, event handling |
| `api_client.js` | `EnlilAPI` | Backend API bridge (auto health monitoring) |
| `sentinel.js` | `Sentinel` | Client-side policy governor (offline fallback) |
| `titan.js` | `Titan` | Client-side threat analysis (offline fallback) |
| `policy.js` | `Policy` | Policy pack management |
| `logs.js` | `Logs` | Client-side audit chain logging |
| `training.js` | `Training` | Training scenarios and simulations |
| `utils.js` | `Utils` | Shared utilities (EventEmitter, Storage) |
| `core_access.js` | `CoreAccess` | Core access control |
| `grace_x_voice.js` | `GraceX_Voice` | Voice interface (optional, stub) |
| `verification.js` | `Verification` | Hash verification (optional) |

## Data & Config

| File | Purpose |
|------|---------|
| `config/modules.json` | Module manifest with status labels |
| `assets/data/config.default.json` | Default system configuration |
| `assets/data/threat_taxonomy.json` | TITAN threat pattern database |
| `assets/data/redteam_scenarios.json` | Red team scenario definitions |
| `assets/data/policy_packs.json` | Built-in policy pack definitions |
| `assets/data/vertical_packs.json` | Vertical-specific policy packs (5 verticals) |

## Archive (`docs/legacy/`)

Legacy pre-backend documentation preserved for reference. These documents describe the original browser-only prototype and are **not current**.

---

**Total server services:** 4  
**Total frontend modules:** 11  
**Total HTML pages:** 6  
**Total documentation files:** 17  
**Total automated tests:** 32  
**Total vertical policy packs:** 5
