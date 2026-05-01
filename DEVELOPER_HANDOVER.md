# ENLIL™ v1.0 — Developer Handover

> **Document:** Technical Structure & Handover Guide  
> **Build:** ENLIL v1.0 Production Hardening (1.0.0-hardened)  
> **Author:** Zachary Charles Anthony Crockett  
> **Last Updated:** 2026-05-01

---

## Project Structure

```
ELIL-v1.0/
├── server.js                        # Express backend (security middleware, routing)
├── server/
│   ├── middleware/
│   │   └── auth.js                  # JWT verification, RBAC middleware
│   └── services/
│       ├── auth.js                  # Authentication (JWT, demo/production accounts)
│       ├── audit.js                 # Tamper-evident hash chain (SHA-256 + HMAC)
│       ├── sentinel.js              # SENTINEL™ server-side policy engine
│       └── titan.js                 # TITAN™ server-side risk engine
├── config/
│   └── modules.json                 # Module manifest with status labels
├── tests/
│   ├── run.js                       # 15 automated tests
│   └── smoke.js                     # Quick smoke test
├── scripts/
│   └── verify-audit.js              # Standalone audit chain verification
├── index.html                       # Main SENTINEL console UI
├── titan.html                       # TITAN dashboard (separate window)
├── guardian.html                    # GUARDIAN module (placeholder)
├── forge.html                       # FORGE module (placeholder)
├── venus.html                       # VENUS module (placeholder)
├── laser.html                       # LASER module (placeholder)
├── assets/
│   ├── css/
│   │   ├── titan.css                # Main styles (~1400 lines)
│   │   └── titan_os.css             # TITAN OS dashboard styles
│   ├── js/
│   │   ├── app.js                   # Main UI controller (~1270 lines)
│   │   ├── api_client.js            # Backend API bridge (NEW)
│   │   ├── sentinel.js              # Client-side SENTINEL (offline fallback)
│   │   ├── titan.js                 # Client-side TITAN (offline fallback)
│   │   ├── policy.js                # Policy pack system
│   │   ├── logs.js                  # Client-side audit chain (~293 lines)
│   │   ├── utils.js                 # Shared utilities (EventEmitter, Storage)
│   │   ├── core_access.js           # Core access gateway
│   │   ├── grace_x_voice.js         # Voice interface (optional)
│   │   ├── training.js              # Training/simulation module
│   │   ├── verification.js          # Verification module (optional)
│   │   ├── titan_os.js              # TITAN OS controller
│   │   └── titan_map.js             # TITAN map module
│   └── data/
│       ├── config.default.json      # Default configuration
│       ├── threat_taxonomy.json     # TITAN threat database
│       ├── redteam_scenarios.json   # Red team scenario definitions
│       └── policy_packs.json        # Policy pack definitions
├── data/
│   └── audit_log.json               # Server-side audit log (gitignored)
├── .env.example                     # Environment configuration template
├── package.json                     # npm metadata and scripts
└── *.md                             # Documentation files
```

---

## Architecture: Dual-Mode Operation

### Backend-Governed Mode (Production)
When the Express server is running, the system operates in backend-governed mode:

```
User Input → EnlilAPI.sendCommand()
  └─▶ POST /api/command
       ├── Auth Middleware (JWT verification)
       ├── SENTINEL Policy Engine (server-side)
       ├── TITAN Risk Engine (server-side)
       ├── Audit Service (server-side hash chain)
       └── Response → UI Display
```

### Offline Fallback Mode (Demo)
When no backend is available, the frontend falls back to client-side processing:

```
User Input → handleRouteCommand()
  └─▶ Sentinel.route(command) [client-side]
       ├── classifyIntent()
       ├── computeRiskScore()
       ├── Titan.analyze() [client-side]
       └── Logs.append() [localStorage]
```

### API Client Bridge (`api_client.js`)
The `EnlilAPI` module automatically detects backend availability via health checks and routes commands accordingly. If backend goes offline, it emits events and falls back to client-side processing.

---

## Server-Side Module Reference

### server.js
| Feature | Description |
|---------|-------------|
| `helmet` | Secure HTTP headers (CSP, X-Frame-Options, etc.) |
| `cors` | Origin whitelisting |
| `express-rate-limit` | 60 req/min API, 10 login/15min |
| Request IDs | UUID on every request for traceability |
| Error handler | No stack traces in production |

### server/services/auth.js
| Function | Purpose |
|----------|---------|
| `login(username, password, mode)` | Validate credentials, issue JWT |
| `verifyToken(token)` | Verify JWT signature and expiry |
| `hasPermission(role, permission)` | Check role-level permission |
| `hasRole(userRole, ...required)` | Check if user has required role |

### server/services/sentinel.js
| Function | Purpose |
|----------|---------|
| `evaluate(command, role, mode)` | Full policy evaluation pipeline |
| `classifyIntent(command)` | Map command to intent category |

### server/services/titan.js
| Function | Purpose |
|----------|---------|
| `analyze(command, intent)` | Risk analysis across 10 categories |
| `RuleBasedProvider` | Offline pattern-matching provider |
| `LLMProvider` | Stub for future LLM integration |

### server/services/audit.js
| Function | Purpose |
|----------|---------|
| `append(event)` | Add entry with hash chain + HMAC |
| `getPage(page, limit)` | Paginated read access |
| `verify()` | Full chain verification |
| `exportBundle()` | Complete audit export with signature |

---

## Client-Side Module Reference

### app.js
| Function | Purpose |
|----------|---------|
| `init()` | Bootstrap all modules with defensive guards |
| `switchTab(tabId)` | Navigate between tabs |
| `handleRouteCommand()` | Parse and route user commands |
| `addOutputCard(data)` | Render result cards |
| `showOverview()` | Render overview dashboard |
| `updateLogsDisplay()` | Render audit log entries |
| `getDemoMode()` | Check DEMO_MODE in config |

### api_client.js (NEW)
| Function | Purpose |
|----------|---------|
| `init()` | Start health monitoring |
| `login(username, password)` | Authenticate via backend |
| `sendCommand(command)` | Route command through backend |
| `getAuditLogs(page, limit)` | Fetch server-side audit entries |
| `verifyAuditChain()` | Request server chain verification |
| `isBackendAvailable()` | Check backend connectivity |

### sentinel.js (client-side)
| Function | Purpose |
|----------|---------|
| `route(command, context)` | Central command router (offline fallback) |
| `authenticate(pin)` | Validate PIN (demo mode only) |
| `classifyIntent(command)` | Map command to intent category |
| `computeRiskScore(command, signals)` | Calculate 0-100 risk score |

### logs.js
| Function | Purpose |
|----------|---------|
| `append(entry)` | Add hash-chained entry to localStorage |
| `verify()` | Verify integrity of client-side chain |
| `export()` | Download JSON log file |
| `getAll()` | Return copy of full log chain |

---

## Role-Based Access Control

| Role | Level | API Permissions |
|------|-------|-----------------|
| OWNER | 4 | Full access (all endpoints including audit export) |
| ADMIN | 3 | Commands, audit view, policy management |
| OPERATOR | 2 | Approved commands, limited log access |
| VIEWER | 1 | Read-only (health and module status only) |

---

## Development Tasks Completed ✅

### Priority 1 (Critical Path) — DONE
- [x] Create Express backend with auth endpoints
- [x] Migrate audit logging to server-side storage
- [x] Implement JWT-based session management
- [x] Add RBAC (OWNER/ADMIN/OPERATOR/VIEWER roles)
- [x] Server-side SENTINEL policy engine
- [x] Server-side TITAN risk engine
- [x] Frontend API client bridge
- [x] Compliance documentation

### Priority 2 (Next Phase)
- [ ] Wire GRACE-X voice to real speech recognition API
- [ ] Add more red team scenarios
- [ ] Implement two-person rule server-side
- [ ] Add real-time WebSocket event streaming
- [ ] Connect TITAN to approved LLM provider

### Priority 3 (Polish)
- [ ] Add data visualization (charts for posture history)
- [ ] Implement operator activity dashboard
- [ ] Add notification system for posture changes
- [ ] Create admin panel for user management
- [ ] Migrate to PostgreSQL for audit persistence
- [ ] Add TOTP-based MFA

---

## Known Risks (Updated)

| Risk | Severity | Status |
|------|----------|--------|
| ~~All logic is client-side~~ | ~~CRITICAL~~ | ✅ Resolved — server-side enforcement |
| ~~localStorage can be tampered~~ | ~~HIGH~~ | ✅ Resolved — server-side audit chain |
| ~~PIN 0000 is hardcoded~~ | ~~HIGH~~ | ✅ Resolved — JWT auth, no PINs in production |
| No HTTPS enforcement | HIGH | Deployment responsibility (reverse proxy) |
| TITAN rule-based only | MEDIUM | LLM provider stubbed for future |
| File-based audit storage | MEDIUM | PostgreSQL planned |
| Not independently pen-tested | MEDIUM | Planned for next phase |

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™, LASER™ are claimed trademarks.
