# ENLIL™ v1.0 — Security Notes

> **Document:** Security Assessment & Auth Architecture Notes  
> **Status:** DEMO / PROTOTYPE  
> **Author:** Zachary Charles Anthony Crockett  
> **Last Updated:** 2026-04-24

---

## Current Demo Authentication Behavior

### How Auth Works Now

| Aspect | Current State |
|--------|--------------|
| **Auto-authenticated** | Yes — when `DEMO_MODE: true` in config |
| **PIN bypass** | Yes — default PIN is `0000` |
| **Login disabled** | Security modal is skipped in demo mode |
| **Hardcoded PIN** | Yes, in `config.default.json` (demo only) |
| **Session management** | Client-side only, no server sessions |
| **Multi-user** | Not supported |

### The `DEMO_MODE` Flag

Located in `assets/data/config.default.json`:

```json
{
  "system": {
    "DEMO_MODE": true
  }
}
```

- **`true` (default):** Auto-authenticates on load. No security modal. "Demo Mode Active" badge shown. All features accessible immediately.
- **`false`:** Shows security modal. Requires PIN entry (`0000` or `SENTINEL_OVERRIDE`). Failed attempts are logged and counted.

---

## What Is Safe in Demo Mode

| Feature | Security Level | Notes |
|---------|---------------|-------|
| Audit logging | ✅ Functional | Hash-chained, but stored in localStorage |
| Command routing | ✅ Functional | All commands pass through SENTINEL policy checks |
| Policy enforcement | ✅ Functional | Active policy pack is enforced on every action |
| Rate limiting | ✅ Functional | Request counting per command per minute |
| Lockdown system | ✅ Functional | Blocks all commands when activated |
| Two-person rule | ✅ Stub | Logic exists but second operator flow is not wired |
| Data isolation | ✅ Local only | No external calls, no data leaves browser |

---

## What Is NOT Safe

| Risk | Severity | Details |
|------|----------|---------|
| **No real authentication** | 🔴 Critical | PIN `0000` is hardcoded and public. Anyone with the URL can access all features. |
| **localStorage is not secure** | 🔴 Critical | Any user or browser extension can read, modify, or delete audit logs. localStorage is not encrypted. |
| **No server-side validation** | 🔴 Critical | All security logic runs client-side. A user can bypass it using browser dev tools. |
| **No session tokens** | 🟡 High | No JWT, session cookie, or server-validated session exists. |
| **No HTTPS enforcement** | 🟡 High | Prototype may run on HTTP or `file://` protocol. |
| **No CORS/CSP headers** | 🟡 Medium | No Content-Security-Policy or Cross-Origin headers configured. |
| **Hash chain is advisory only** | 🟡 Medium | SHA-256 chain exists but is not cryptographically signed. Modification detection works, but proof-of-origin is not verifiable. |
| **Audit log can be cleared** | 🟡 Medium | The clear button exists for demo convenience. Production should require admin + second person approval. |

---

## Production Authentication Requirements

To move from DEMO to production-grade auth, the following must be implemented:

### Phase 1: Backend Auth Layer
- [ ] Server-side auth endpoint (Node.js/Express or equivalent)
- [ ] Bcrypt or Argon2 password hashing (no plaintext/hardcoded PINs)
- [ ] JWT or session-based tokens with expiry
- [ ] HTTPS-only enforcement
- [ ] Rate limiting at the server level (not just client)
- [ ] CORS and CSP headers

### Phase 2: Hardened Sessions
- [ ] Server-signed session tokens
- [ ] Auto-logout on idle timeout
- [ ] Session invalidation on password change
- [ ] Concurrent session detection/limits
- [ ] IP binding or device fingerprinting (optional)

### Phase 3: Multi-Operator
- [ ] Role-based access control (RBAC) with database-backed roles
- [ ] Two-person rule enforcement via server state
- [ ] Operator-specific audit trails
- [ ] Hardware key support (WebAuthn / FIDO2)

### Phase 4: Audit Hardening
- [ ] Server-side append-only log storage (database or S3)
- [ ] Cryptographic log signing (RSA/Ed25519)
- [ ] Independent audit verification endpoint
- [ ] Log export with verifiable signatures
- [ ] Tamper-detection alerts to admin

---

## How to Switch from Demo to Production Mode

1. Set `DEMO_MODE` to `false` in `assets/data/config.default.json`
2. Deploy behind a proper backend (the current static server will not enforce auth server-side)
3. Replace the PIN system with your auth backend
4. Set up HTTPS with a valid certificate
5. Implement the Phase 1 backend auth layer described above

> **Important:** Setting `DEMO_MODE: false` without a backend auth layer will show the login modal but does NOT make the system secure — it only adds a client-side gate. Real security requires server-side enforcement.

---

## Summary

| Question | Answer |
|----------|--------|
| Can I demo this safely? | **Yes** — it runs locally, no external calls |
| Is the auth real? | **No** — it's a UI stub for demo purposes |
| Can someone hack this? | **Yes** — via browser dev tools in seconds |
| Is the audit log tamper-proof? | **No** — it's localStorage with a hash chain indicator |
| Should I show this to investors? | **Yes** — with the understanding that production auth is a separate build phase |
| Is the roadmap to production clear? | **Yes** — see the phases above |

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™ are claimed trademarks.
