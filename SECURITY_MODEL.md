# ENLIL™ v1.0 — Security Model

## Architecture Overview

ENLIL™ implements a **multi-layer, backend-governed security architecture** designed to ensure that all AI governance decisions are enforced server-side, not client-side.

## Security Layers

### Layer 1: Network Security
- **Helmet.js**: Sets secure HTTP headers (CSP, X-Frame-Options, etc.)
- **CORS**: Explicit origin whitelisting
- **Rate Limiting**: 60 req/min API, 10 login attempts/15min
- **Request Size Limits**: 16KB JSON body max
- **Request IDs**: Every request traced with UUID

### Layer 2: Authentication
- **JWT Tokens**: Signed with HS256, 1-hour expiry
- **Password Hashing**: SHA-256 with server-side salt
- **No Hardcoded Credentials**: Production mode requires environment-configured users
- **Demo/Production Separation**: Demo accounts only active in demo mode

### Layer 3: Authorization (Role-Based Access Control)
| Role | Level | Permissions |
|------|-------|-------------|
| OWNER | 4 | Full access including audit export and policy changes |
| ADMIN | 3 | Commands, audit viewing, policy management |
| OPERATOR | 2 | Approved commands, limited log access |
| VIEWER | 1 | Read-only dashboard access |

### Layer 4: SENTINEL™ Policy Engine
- Server-side command classification
- Prohibited pattern detection (SQL injection, shell commands, XSS)
- Role-permission enforcement per command category
- Critical override restricted to OWNER in production mode
- Evaluates raw input BEFORE HTML sanitization

**Policy Categories:**
| Category | Description | Severity |
|---|---|---|
| `DANGEROUS_COMMAND` | Shell injection, SQL injection, XSS, prototype pollution | CRITICAL |
| `ROLE_RESTRICTION` | User role does not permit the requested action category | HIGH |
| `CRITICAL_OVERRIDE` | Override/bypass attempt requiring OWNER approval | CRITICAL |
| `SAFE_INFORMATIONAL` | Read-only queries, policy views, log views | LOW |
| `GOVERNANCE_CHECK` | Integrity checks, compliance checks | LOW |
| `THREAT_SCAN` | Threat analysis commands | LOW |
| `RED_TEAM_SIMULATION` | Adversarial scenario testing | MEDIUM |
| `ADMIN_ACTION` | Administrative operations (export, lockdown) | MEDIUM |

**Decision Types:** `ALLOW`, `BLOCK`, `REVIEW`

### Layer 5: TITAN™ Risk Assessment
- Server-side risk scoring (0-100)
- 10 risk categories analyzed per command
- SENTINEL™ block always overrides TITAN™ assessment

**Risk Bands:**
| Band | Score Range | Action |
|---|---|---|
| LOW | 0–24 | PROCEED |
| MEDIUM | 25–49 | PROCEED_WITH_MONITORING |
| HIGH | 50–74 | REQUIRE_APPROVAL (human review) |
| CRITICAL | 75–100 | BLOCK_AND_REVIEW |

> **Important:** TITAN™ is an internal risk scoring engine, not a final autonomous decision-maker. SENTINEL™ remains the enforcement authority.

### Layer 6: Audit Chain
- Server-side append-only logging
- SHA-256 hash chain linking every event
- HMAC signatures for tamper detection
- File-based persistence (upgradeable to database)
- Independent verification script

> **Note:** The audit chain is **tamper-evident**, not tamper-proof. An attacker with filesystem access could delete the log file, but cannot silently modify individual entries without breaking the hash chain. This is a demo-grade storage mechanism.

**Production Audit Upgrade Path:**
1. **PostgreSQL** — Append-only table with row-level security
2. **S3 + Object Lock** — WORM (Write Once Read Many) storage
3. **External SIEM** — Ship to Splunk, Datadog, or ELK stack
4. **Blockchain** — Anchor hash chain to public blockchain for non-repudiation

## Trust Boundaries

```
┌─────────────────────────────────────────────┐
│  CLIENT (Browser)                           │
│  ┌──────────────────────────────────────┐   │
│  │ UI Display Only                      │   │
│  │ - Renders server responses           │   │
│  │ - Local demo cache (marked untrusted)│   │
│  │ - No security enforcement            │   │
│  └──────────────────────────────────────┘   │
├─────────── TRUST BOUNDARY ──────────────────┤
│  SERVER (Node.js/Express)                   │
│  ┌──────────────────────────────────────┐   │
│  │ Security Enforcement Zone            │   │
│  │ - JWT verification                   │   │
│  │ - Role-based access control          │   │
│  │ - SENTINEL policy decisions          │   │
│  │ - TITAN risk analysis                │   │
│  │ - Audit log ownership                │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## What Is NOT Implemented (Honest Disclosure)
- TLS/HTTPS (deployment responsibility)
- Multi-factor authentication
- Hardware security module (HSM) integration
- Database-backed audit storage (currently file-based)
- Real-time intrusion detection
- Independent penetration testing
- Security certification

## Recommended Production Hardening (Next Phase)
1. Deploy behind HTTPS reverse proxy (nginx/Cloudflare)
2. Migrate to bcrypt for password hashing
3. Add PostgreSQL for audit persistence
4. Implement session blacklisting for logout
5. Add TOTP-based MFA
6. Commission independent penetration test

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**
