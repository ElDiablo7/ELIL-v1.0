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

### Layer 5: TITAN™ Risk Assessment
- Server-side risk scoring (0-100)
- 10 risk categories analyzed per command
- Automatic escalation at score ≥60
- Automatic blocking at score ≥80

### Layer 6: Audit Chain
- Server-side append-only logging
- SHA-256 hash chain linking every event
- HMAC signatures for tamper detection
- File-based persistence (upgradeable to database)
- Independent verification script

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
