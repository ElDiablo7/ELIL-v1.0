# ENLIL™ v1.0 — GRACE-X AI™ Security Console

> **Enterprise-grade AI governance and security audit prototype.**

---

## What Is ENLIL™?

ENLIL™ is a prototype **security-governance console** for AI systems. It demonstrates real-time threat assessment, policy enforcement, audit logging, and operator oversight — all running locally in your browser with zero backend dependencies.

The core architecture consists of five integrated modules:

- **SENTINEL™** — The Governor: Manages posture, routes all commands, and enforces policy.
- **TITAN™** — The Nucleus: Performs deep threat analysis and tactical reasoning.
- **GUARDIAN™** — The Shield: Oversees defensive perimeters and logic shielding.
- **FORGE™** — The Smith: Maintains logic synthesis and core structural integrity.
- **VENUS™** — The Scout: Reconnaissance of external intelligence and instruction vectors.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/ElDiablo7/ELIL-v1.0.git
cd ELIL-v1.0

# Serve locally (any static server works)
npx http-server . -p 8088

# Open in browser
http://localhost:8088/index.html
```

Or simply open `index.html` directly in your browser.

---

## Demo Mode

This build runs in **Demo Mode** by default. This means:

- ✅ Auto-authenticated (no login required)
- ✅ All features accessible immediately
- ✅ Audit logs stored in browser localStorage
- ✅ No network calls, no external dependencies
- ⚠️ Not production-hardened (see `SECURITY_NOTES.md`)

To toggle demo mode, edit `assets/data/config.default.json`:

```json
{ "system": { "DEMO_MODE": true } }
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `threat scan prompt injection` | Scan for prompt injection attacks |
| `system integrity check` | Verify system health |
| `compliance check data handling` | Check data handling compliance |
| `decision stress test rollout plan` | Stress test deployment decisions |
| `red team scenario 03` | Run red team attack simulation |
| `export audit` | Export audit logs |
| `open titan` | Open TITAN dashboard |
| `help` | Show help overlay |

---

## Project Structure

```
├── index.html          # Main console
├── titan.html          # TITAN dashboard
├── assets/
│   ├── css/titan.css   # All styles
│   ├── js/             # App modules (app, sentinel, titan, logs, etc.)
│   └── data/           # Config, threat taxonomy, policies
├── docs/               # Additional documentation
└── *.md                # Project documentation files
```
├── guardian.html       # GUARDIAN module placeholder
├── forge.html          # FORGE module placeholder
├── venus.html          # VENUS module placeholder


---

## Documentation

| File | Purpose |
|------|---------|
| `USER_MANUAL.md` | Operator instructions (non-technical) |
| `DEVELOPER_HANDOVER.md` | Technical architecture & function reference |
| `SECURITY_NOTES.md` | Current security assessment |
| `BACKEND_HARDENING_PLAN.md` | Production backend roadmap |
| `CHANGELOG_ENLIL_PATCH_2.md` | Changes in this build |
| `TEST_REPORT_PHASE_3.md` | Phase 3-5 test results |
| `FINAL_AUDIT_REPORT.md` | Project completion audit |
| `MANIFEST.md` | Complete file inventory |

---

## Limitations

- **No real authentication** — Demo mode uses auto-auth. See `SECURITY_NOTES.md`.
- **Client-side only** — All logic runs in the browser. No server-side enforcement.
- **localStorage audit** — Logs can be cleared by the user. Not forensic-grade.
- **Simulated AI** — TITAN/SENTINEL are rule-based simulators, not connected to a real AI model.

---

## What's Next

See `BACKEND_HARDENING_PLAN.md` for the production roadmap:

1. Express/Node backend with JWT auth
2. Server-side audit storage (PostgreSQL/S3)
3. Role-based access control
4. Cryptographic log signing
5. HTTPS enforcement

---

## Legal

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**

GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™, The Eye™ and related module names are claimed trademarks of Zachary Charles Anthony Crockett.

Unauthorized reproduction, distribution, or deployment of this system without express written consent is prohibited.
