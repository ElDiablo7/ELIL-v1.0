# ENLIL™ v1.0 — Backend Hardening Plan

> **Document:** Production Backend Roadmap  
> **Status:** PLANNING  
> **Author:** Zachary Charles Anthony Crockett  
> **Last Updated:** 2026-04-24

---

## Current Architecture

```
┌─────────────┐     ┌──────────────────────┐
│  Browser     │────▶│  Static Files (HTML/  │
│  (Client)    │◀────│  JS/CSS/JSON)         │
└─────────────┘     └──────────────────────┘
      │
      ▼
┌─────────────────┐
│  localStorage   │  ◀── Audit logs, config
│  (Browser)      │
└─────────────────┘
```

**No server-side logic exists.** All processing is client-side JavaScript.

---

## Target Architecture

```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────┐
│  Browser     │────▶│  Express/Node API     │────▶│  PostgreSQL  │
│  (Client)    │◀────│  Server               │◀────│  + Redis     │
└─────────────┘     └──────────────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Audit Store │  ◀── Signed, append-only
                    │  (S3/DB)     │
                    └──────────────┘
```

---

## Planned Backend Structure

```
server/
├── server.js                 # Express entry point
├── routes/
│   ├── auth.js               # Login, logout, session validation
│   ├── command.js            # Command routing API
│   ├── audit.js              # Audit log retrieval and export
│   ├── export.js             # Secure export endpoints
│   └── health.js             # System health check
├── middleware/
│   ├── auth.js               # JWT/session validation middleware
│   ├── rate-limit.js         # Server-side rate limiting
│   └── cors.js               # CORS configuration
├── storage/
│   ├── audit-store.js        # Append-only audit storage
│   ├── session-store.js      # Session management (Redis-backed)
│   └── config-store.js       # Server-side config management
├── services/
│   ├── sentinel-service.js   # Server-side policy enforcement
│   ├── titan-service.js      # Server-side threat analysis
│   └── crypto-service.js     # Log signing and verification
└── config/
    ├── .env.example           # Environment variable template
    └── production.json        # Production configuration
```

---

## API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/health` | GET | System health check | No |
| `/api/auth/login` | POST | Authenticate operator | No |
| `/api/auth/logout` | POST | End session | Yes |
| `/api/auth/session` | GET | Validate current session | Yes |
| `/api/command` | POST | Route command via SENTINEL | Yes |
| `/api/titan/analyze` | POST | TITAN analysis (internal) | Yes + Role |
| `/api/sentinel/posture` | GET/PUT | Get/set security posture | Yes + Role |
| `/api/audit/logs` | GET | Retrieve audit logs | Yes + Role |
| `/api/audit/export` | GET | Export audit log (JSON/TXT) | Yes + Admin |
| `/api/audit/verify` | GET | Verify audit chain integrity | Yes |
| `/api/export/config` | GET | Export config snapshot | Yes + Admin |

---

## Production Requirements

### Phase 1: Authentication (Priority: CRITICAL)
- [ ] Bcrypt/Argon2 password hashing
- [ ] JWT tokens with short expiry (15 min) + refresh tokens
- [ ] HTTPS-only enforcement
- [ ] Secure cookie flags (HttpOnly, Secure, SameSite)
- [ ] Login attempt rate limiting (5 per minute)
- [ ] Account lockout after 5 failed attempts
- [ ] Password complexity requirements

### Phase 2: Session Security (Priority: HIGH)
- [ ] Redis-backed session store
- [ ] Server-signed session tokens
- [ ] Auto-logout on idle (configurable timeout)
- [ ] Concurrent session limits (1 per operator)
- [ ] Session invalidation on password change
- [ ] IP binding (optional, configurable)

### Phase 3: Audit Hardening (Priority: HIGH)
- [ ] Server-side append-only log store (PostgreSQL or S3)
- [ ] Ed25519 cryptographic log signing
- [ ] Chain integrity verification endpoint
- [ ] Tamper-detection alerts
- [ ] Log export with verifiable signatures
- [ ] Log retention policy (configurable)

### Phase 4: Access Control (Priority: HIGH)
- [ ] Role-based access control (RBAC)
  - `admin` — full access, config changes, user management
  - `operator` — command routing, posture changes, exports
  - `viewer` — read-only dashboard, log viewing
- [ ] Two-person rule enforcement (server-validated)
- [ ] Action-level permissions matrix

### Phase 5: Input & Network Security (Priority: MEDIUM)
- [ ] Server-side input validation and sanitization
- [ ] CORS whitelist configuration
- [ ] Content-Security-Policy headers
- [ ] Helmet.js security headers
- [ ] Request body size limits
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)

### Phase 6: Deployment Security (Priority: MEDIUM)
- [ ] Environment variables for all secrets (no hardcoded values)
- [ ] `.env` not committed to git
- [ ] Docker containerization (optional)
- [ ] Health check endpoint for monitoring
- [ ] Graceful shutdown handling
- [ ] Error logging to external service (optional)

---

## Frontend Fallback Strategy

The frontend must gracefully handle backend unavailability:

```javascript
// Example: API call with fallback
async function routeCommand(command) {
  try {
    const response = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ command })
    });
    return await response.json();
  } catch (e) {
    // Backend unavailable — fall back to local demo mode
    console.warn('Backend unavailable — running in local demo mode');
    return Sentinel.route(command, {}); // Use client-side routing
  }
}
```

The existing client-side code continues to work unchanged when no backend is present. The `DEMO_MODE: true` flag in config controls this behavior.

---

## Migration Path

1. **Phase 0:** Deploy current static demo (as-is) ✅
2. **Phase 1:** Add Express server with auth endpoints
3. **Phase 2:** Migrate audit logging to server-side storage
4. **Phase 3:** Move SENTINEL policy enforcement to server
5. **Phase 4:** Add RBAC and session management
6. **Phase 5:** Harden with security headers and input validation
7. **Phase 6:** Production deployment with monitoring

Each phase is independently deployable. The frontend falls back to local mode if the backend is not available.

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™ are claimed trademarks.
