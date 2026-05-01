# ENLIL™ AI Governance Console

> **AI governance, risk and audit platform — backend-governed architecture.**  
> **Build:** 1.0.2-vertical | **Product:** ENLIL™ AI Governance Console

---

## What Is ENLIL™?

ENLIL™ is an **AI governance, risk and audit console** built for organisations that need real-time threat assessment, policy enforcement, tamper-evident audit logging, and operator oversight of AI systems. All security decisions are enforced server-side via a Node.js/Express backend.

The platform consists of six integrated modules:

- **SENTINEL™** — The Governor: Manages posture, routes all commands, enforces policy. *(Active)*
- **TITAN™** — The Nucleus: Performs deep threat analysis and risk scoring. *(Active)*
- **GUARDIAN™** — The Shield: Defensive perimeters and logic shielding. *(Roadmap)*
- **FORGE™** — The Smith: Logic synthesis and structural integrity. *(Roadmap)*
- **VENUS™** — The Scout: External intelligence reconnaissance. *(Roadmap)*
- **LASER™** — Override Protocol: High-privilege override protocol. *(Restricted)*

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/ElDiablo7/ELIL-v1.0.git
cd ELIL-v1.0

# Install dependencies
npm install

# Start the server
npm start

# Open in browser
# http://localhost:3000
```

### Demo Credentials

| Username | Password | Role |
|---|---|---|
| owner | enlil-owner-2026 | OWNER |
| admin | enlil-admin-2026 | ADMIN |
| operator | enlil-operator | OPERATOR |
| viewer | enlil-viewer | VIEWER |

> Demo credentials are blocked in production mode (`ENLIL_MODE=production`).

---

## Architecture

```
Browser ──HTTP──▶ Express Server (ENLIL™ AI Governance Console)
                    ├── Auth Middleware (JWT, 4-role RBAC)
                    ├── Rate Limiter (60/min API, 10/15min login)
                    ├── SENTINEL™ Policy Engine (server-side)
                    ├── TITAN™ Risk Engine (server-side, 0–100 scoring)
                    ├── Audit Service (SHA-256 hash chain + HMAC)
                    └── Static UI Serving
```

### API Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/health` | GET | No | System status, version, module overview |
| `/api/modules` | GET | No | Module manifest with status labels |
| `/api/auth/login` | POST | No | JWT authentication |
| `/api/auth/logout` | POST | Yes | Session termination |
| `/api/command` | POST | Yes | Command routing through SENTINEL + TITAN |
| `/api/audit` | GET | ADMIN+ | Paginated audit log access |
| `/api/audit/verify` | GET | ADMIN+ | Hash chain verification |
| `/api/audit/export` | GET | OWNER | Full audit bundle export |
| `/api/verticals` | GET | No | Available vertical policy packs |
| `/api/verticals/active` | GET | No | Current active vertical |
| `/api/verticals/active` | POST | ADMIN+ | Set active vertical (audit-logged) |

---

## Project Structure

```
├── server.js                  # Express backend with security middleware
├── server/
│   ├── middleware/auth.js     # JWT verification, RBAC enforcement
│   └── services/
│       ├── auth.js            # Authentication service
│       ├── audit.js           # Tamper-evident audit logging
│       ├── sentinel.js        # SENTINEL™ policy engine
│       └── titan.js           # TITAN™ risk engine
├── config/modules.json        # Module manifest
├── index.html                 # Main console UI
├── titan.html                 # TITAN dashboard UI
├── guardian.html              # GUARDIAN module (roadmap placeholder)
├── forge.html                 # FORGE module (roadmap placeholder)
├── venus.html                 # VENUS module (roadmap placeholder)
├── laser.html                 # LASER module (restricted placeholder)
├── assets/
│   ├── css/titan.css          # All styles
│   ├── js/                    # Frontend modules
│   │   ├── app.js             # Main UI controller
│   │   ├── api_client.js      # Backend API bridge
│   │   ├── sentinel.js        # Client-side sentinel (offline fallback)
│   │   ├── titan.js           # Client-side titan (offline fallback)
│   │   ├── logs.js            # Client-side audit chain
│   │   ├── policy.js          # Policy engine
│   │   └── utils.js           # Shared utilities
│   └── data/                  # Config, threat taxonomy, policy packs
├── tests/
│   ├── run.js                 # 40 automated tests
│   └── smoke.js               # Quick smoke test
├── scripts/verify-audit.js    # Standalone audit chain verification
└── docs/                      # Documentation
```

---

## Testing

```bash
# Run 32 automated tests (requires server running)
npm test

# Quick smoke test
npm run smoke

# Verify audit chain integrity
npm run verify:audit
```

---

## Documentation

| File | Purpose |
|------|---------| 
| `SECURITY_MODEL.md` | 6-layer security architecture |
| `COMPLIANCE_MAPPING.md` | NIST AI RMF, EU AI Act, ISO 42001, SOC 2 alignment |
| `INVESTOR_TECHNICAL_SUMMARY.md` | Investor-safe technical overview |
| `DEPLOYMENT_GUIDE.md` | Local + production deployment instructions |
| `TEST_PLAN.md` | Complete test coverage documentation |
| `CHANGELOG.md` | Full change history |
| `RELEASE_NOTES.md` | Release summary |
| `PRODUCTION_READINESS.md` | Production readiness assessment |
| `USER_MANUAL.md` | Operator instructions |
| `DEVELOPER_HANDOVER.md` | Technical architecture reference |
| `VERTICAL_PRODUCTISATION.md` | Commercial vertical strategy |

---

## Security Hardening (v1.0.2-vertical)

| Feature | Status |
|---|---|
| Express server with helmet/CORS/rate-limiting | ✅ |
| JWT authentication with 4-role RBAC | ✅ |
| Server-side SENTINEL™ policy enforcement | ✅ |
| Server-side TITAN™ risk analysis (aligned risk bands) | ✅ |
| Tamper-evident SHA-256 hash chain + HMAC audit | ✅ |
| Demo/production mode separation | ✅ |
| Production startup refuses weak/missing secrets | ✅ |
| Demo credentials blocked in production mode | ✅ |
| XSS/SQL injection/shell injection detection | ✅ |
| 40 automated tests, all passing | ✅ |
| Compliance mapping to 5 frameworks | ✅ |

---

## Limitations

- **Production-hardened MVP** — suitable for investor demos and controlled pilots
- **Not independently pen-tested** or certified under any compliance framework
- **TITAN uses rule-based analysis** — LLM provider abstraction is stubbed for future
- **GUARDIAN, FORGE, VENUS, LASER** are roadmap placeholders (not functional)
- **File-based audit storage** — PostgreSQL planned for production
- **SHA-256 password hashing** — bcrypt upgrade recommended
- **No MFA** — TOTP architecture ready for next phase

---

## Legal

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**

GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™, LASER™, The Eye™ and related module names are claimed trademarks of Zachary Charles Anthony Crockett.

Unauthorized reproduction, distribution, or deployment of this system without express written consent is prohibited.
