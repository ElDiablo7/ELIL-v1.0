# ENLIL™ v1.0 — Developer Handover

> **Document:** Technical Structure & Handover Guide  
> **Build:** ENLIL-v1.0 Patch 2 (Phased Finish)  
> **Author:** Zachary Charles Anthony Crockett  
> **Last Updated:** 2026-04-24

---

## Project Structure

```
ELIL-v1.0/
├── index.html                    # Main entry — SENTINEL console
├── titan.html                    # TITAN dashboard (separate window)
├── package.json                  # npm metadata
├── assets/
│   ├── css/
│   │   └── titan.css             # All styles (single file, ~1400 lines)
│   ├── js/
│   │   ├── app.js                # Main app controller (~1230 lines)
│   │   ├── sentinel.js           # SENTINEL governor (~670 lines)
│   │   ├── titan.js              # TITAN threat engine (~720 lines)
│   │   ├── policy.js             # Policy pack system
│   │   ├── logs.js               # Audit chain logging (~293 lines)
│   │   ├── training.js           # Training/simulation module
│   │   ├── utils.js              # Shared utilities (EventEmitter, Storage, etc.)
│   │   ├── core_access.js        # Core access patterns
│   │   ├── grace_x_voice.js      # Voice interface (optional)
│   │   └── verification.js       # Verification module (optional)
│   └── data/
│       ├── config.default.json   # Default configuration
│       ├── threat_taxonomy.json  # TITAN threat database
│       ├── red_team_scenarios.json # Red team scenario definitions
│       ├── policy_packs/         # Policy pack definitions
│       └── training/             # Training scenario data
├── docs/                         # Documentation folder
├── README.md                     # Project overview
├── USER_MANUAL.md                # Operator instructions
├── SECURITY_NOTES.md             # Security assessment
├── BACKEND_HARDENING_PLAN.md     # Production roadmap
├── CHANGELOG_ENLIL_PATCH_2.md    # Change log
├── MANIFEST.md                   # File inventory
├── TEST_REPORT_PHASE_3.md        # Phase 3-5 test results
└── FINAL_AUDIT_REPORT.md         # Final project audit
```

---

## Module Architecture

### Initialization Flow

```
DOMContentLoaded
  └── App.init()
      ├── Policy.init()        # Load policy packs
      ├── Sentinel.init()      # Load config, setup auth
      ├── Titan.init()         # Load threat taxonomy
      ├── Training.init()      # Load training scenarios
      ├── GraceX_Voice.init()  # (optional) Setup voice
      ├── Verification.init()  # (optional) Setup verification
      ├── setupUI()            # Modals, tabs, handlers
      ├── getDemoMode()        # Check DEMO_MODE in config
      │   ├── true  → auto-authenticate
      │   └── false → show security modal
      └── Logs.append(APP_BOOT) # Log boot event
```

### Command Flow

```
User Input (text or voice)
  └── handleRouteCommand()
      ├── Special commands: "export audit", "open titan", "help"
      │   └── Direct action (switch tab, open window, etc.)
      └── Sentinel.route(command)
          ├── sanitizeInput()
          ├── classifyIntent()        # → THREAT_SCAN, INTEGRITY_CHECK, etc.
          ├── computeRiskScore()
          ├── decideInvokeTitan()
          │   ├── true  → Titan.analyze(taskPacket)
          │   │           └── summarizeForOperator(result)
          │   └── false → direct Sentinel response
          └── return result → addOutputCard()
```

### Audit Flow

```
Any Action
  └── Logs.append({
        actor_role,    # SYSTEM, OPERATOR, ADMIN, TITAN
        action,        # COMMAND_RECEIVED, TITAN_INVOKED, etc.
        posture,       # GREEN, AMBER, RED, BLACK
        payload,       # Action-specific data
        classification # INTERNAL, TITAN_INTERNAL_ONLY
      })
      ├── Add timestamp
      ├── Compute SHA-256 hash (chained to previous entry)
      ├── Persist to localStorage
      └── Emit log:entry_added event
```

---

## Key Functions Reference

### app.js
| Function | Purpose |
|----------|---------|
| `init()` | Bootstrap all modules with defensive guards |
| `switchTab(tabId)` | Navigate between tabs (overview, logs, etc.) |
| `handleRouteCommand()` | Parse and route user commands |
| `addOutputCard(data)` | Render result cards in the output console |
| `showOverview()` | Render the overview dashboard with guide |
| `updateLogsDisplay()` | Render audit log entries (with filter support) |
| `setupEventHandlers()` | Wire all buttons (export, clear, filter, etc.) |
| `exportLogsTxt()` | Generate and download TXT audit report |
| `setupErrorOverlay()` | Global error handler with user-friendly overlay |
| `getDemoMode()` | Fetch DEMO_MODE from config.json |

### sentinel.js
| Function | Purpose |
|----------|---------|
| `init()` | Load config, set defaults |
| `authenticate(pin)` | Validate PIN against config |
| `route(command, context)` | Central command router |
| `classifyIntent(command)` | Map command text to intent category |
| `computeRiskScore(command, signals)` | Calculate 0-100 risk score |
| `setPosture(level)` | Change security posture (GREEN/AMBER/RED/BLACK) |
| `lockdown() / unlockdown()` | Emergency lockdown controls |
| `auditExport()` | Export logs + config snapshot |

### titan.js
| Function | Purpose |
|----------|---------|
| `analyze(taskPacket)` | Run full threat analysis pipeline |
| `threatScan(packet)` | Scan for known threat patterns |
| `adversarialReasoning(packet)` | Check for adversarial indicators |
| `decisionStressTest(packet)` | Simulate failure modes |
| `runRedTeamScenario(id)` | Execute specific red team scenario |
| `calculateRiskFromFindings(findings)` | Compute risk from finding severity |

### logs.js
| Function | Purpose |
|----------|---------|
| `append(entry)` | Add hash-chained entry to log |
| `verify()` | Verify integrity of entire chain |
| `export()` | Download JSON log file |
| `getAll()` | Return copy of full log chain |
| `getFiltered(filter)` | Filter by actor_role, posture, etc. |
| `clear()` | Reset log chain (demo only) |

---

## Known Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| All logic is client-side | CRITICAL | Backend hardening required |
| localStorage can be tampered | HIGH | Server-side audit store planned |
| PIN `0000` is hardcoded | HIGH | Backend auth with hashed passwords |
| No HTTPS enforcement | HIGH | Deploy behind TLS proxy |
| Hash chain is advisory only | MEDIUM | Cryptographic signing planned |
| `window.open` may be popup-blocked | LOW | User notification, fallback link |
| Some CSS features need modern browser | LOW | Progressive enhancement |

---

## Next Development Tasks

### Priority 1 (Critical Path)
- [ ] Create Express backend with auth endpoints
- [ ] Migrate audit logging to server-side storage
- [ ] Implement JWT-based session management
- [ ] Add RBAC (admin/operator/viewer roles)

### Priority 2 (Feature Completion)
- [ ] Wire GRACE-X voice to real speech recognition API
- [ ] Add more red team scenarios
- [ ] Implement two-person rule server-side
- [ ] Add real-time WebSocket event streaming

### Priority 3 (Polish)
- [ ] Add data visualization (charts for posture history)
- [ ] Implement operator activity dashboard
- [ ] Add notification system for posture changes
- [ ] Create admin panel for user management

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™ are claimed trademarks.
