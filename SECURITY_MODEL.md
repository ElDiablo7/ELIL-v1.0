# ENLIL™ AI Governance Console v1.0.3-rbac — Security Model

## Architecture Overview

ENLIL™ implements a **multi-layer, backend-governed security architecture** designed to ensure that authentication, authorization, policy enforcement, risk assessment, and audit logging are enforced server-side.

The browser client is treated as an **untrusted display layer**. All security decisions are made by the backend through JWT authentication, role-based access control, SENTINEL™ policy evaluation, TITAN™ risk assessment, and tamper-evident audit logging.

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

> **Note on password hashing:** SHA-256 with server-side salt is acceptable for controlled MVP demonstration only. Production deployment should migrate to **bcrypt or Argon2** before live enterprise use.

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
4. **External Timestamping / Optional Ledger Anchoring** — Anchor periodic audit hashes to an external timestamping or ledger service for additional non-repudiation

### Layer 7: Vertical Policy Governance
- Runtime-switchable industry vertical policy packs
- 5 pre-configured verticals: AI Agency, Legal / Professional, Construction / SiteOps, Film Production, Public Sector
- Vertical changes restricted to ADMIN and OWNER roles (RBAC-enforced)
- Every vertical switch is audit-logged as a `VERTICAL_CHANGE` event with actor, previous, and new vertical
- Active vertical injects context into SENTINEL™ decisions: `vertical`, `policyPackName`, `policyFocus`, `matchedVerticalRules`
- TITAN™ risk responses include `vertical_context` with compliance frameworks for the active vertical
- Vertical-restricted actions elevate SENTINEL™ severity from LOW → MEDIUM and trigger escalation
- Two-person rule markers included when enabled by the active vertical (e.g. Public Sector)

**Vertical Policy Pack Structure:**
| Field | Purpose |
|---|---|
| `name` | Human-readable vertical name |
| `key` | Machine identifier (e.g. `ai_agency`) |
| `policyFocus` | Primary governance concern |
| `restricted_actions` | Actions that trigger SENTINEL™ escalation |
| `compliance_frameworks` | Applicable regulatory frameworks |
| `two_person_rule` | Whether dual-approval is required |
| `escalation_rules` | Severity and notification thresholds |

> **Important:** Vertical packs are **rule/config-based governance profiles**, not independently certified compliance engines. They configure SENTINEL™ for sector-appropriate behaviour but do not constitute formal compliance certification for any regulatory framework.

---

## Command Category Permissions

| Command Category | VIEWER | OPERATOR | ADMIN | OWNER |
|---|---:|---:|---:|---:|
| GENERAL_QUERY | ✅ | ✅ | ✅ | ✅ |
| COMPLIANCE_CHECK | ✅ | ✅ | ✅ | ✅ |
| RISK_SCAN | ❌ | ✅ | ✅ | ✅ |
| THREAT_SCAN | ❌ | ✅ | ✅ | ✅ |
| AUDIT_READ | ❌ | ❌ | ✅ | ✅ |
| AUDIT_VERIFY | ❌ | ❌ | ✅ | ✅ |
| POLICY_CHANGE | ❌ | ❌ | ✅ | ✅ |
| VERTICAL_CHANGE | ❌ | ❌ | ✅ | ✅ |
| LOCKDOWN | ❌ | ❌ | ✅ | ✅ |
| EXPORT_REPORT | ❌ | ✅ | ✅ | ✅ |
| SYSTEM_CONFIG | ❌ | ❌ | ❌ | ✅ |

---

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
│  │ - Command category permissions       │   │
│  │ - SENTINEL policy decisions          │   │
│  │ - Vertical policy governance         │   │
│  │ - TITAN risk analysis                │   │
│  │ - Audit log ownership                │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Security Classification

This version is suitable for **investor demonstrations** and **controlled pilot environments**.

It is **not yet certified for full enterprise production use**. Before live enterprise deployment, ENLIL™ requires independent penetration testing, HTTPS/TLS deployment, MFA, database-backed audit storage, stronger password hashing, and external compliance review.

---

## What Is NOT Implemented (Honest Disclosure)
- TLS/HTTPS (deployment responsibility)
- Multi-factor authentication
- Hardware security module (HSM) integration
- Database-backed audit storage (currently file-based)
- Real-time intrusion detection
- Independent penetration testing
- Security certification
- bcrypt/Argon2 password hashing (currently SHA-256 with salt)
- Session revocation / token blacklist (JWT logout is advisory)
- Vertical packs are not independently certified compliance engines

## Recommended Production Hardening (Next Phase)
1. Deploy behind HTTPS reverse proxy (nginx/Cloudflare)
2. Migrate to bcrypt/Argon2 for password hashing
3. Add PostgreSQL for audit persistence
4. Implement session blacklisting for logout
5. Add TOTP-based MFA
6. Commission independent penetration test
7. External compliance review of vertical policy packs

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**
