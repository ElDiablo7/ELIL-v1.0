# ENLIL™ AI Governance Console — User Manual

> **For:** Operators, Demo Viewers, Administrators  
> **Build:** 1.0.1-hardened  
> **Author:** Zachary Charles Anthony Crockett

---

## What Is ENLIL™?

ENLIL™ is an **AI governance, risk and audit console** that provides real-time threat assessment, policy enforcement, tamper-evident audit logging, and operator oversight. All security decisions are enforced server-side via a Node.js/Express backend.

It has six integrated modules:
- **SENTINEL™** — The Governor. Manages posture, routes all commands, and enforces policy. *(Active)*
- **TITAN™** — The Nucleus. Performs deep threat analysis and tactical reasoning. *(Active)*
- **GUARDIAN™** — The Shield. Oversees defensive perimeters and logic shielding. *(Roadmap)*
- **FORGE™** — The Smith. Maintains logic synthesis and core structural integrity. *(Roadmap)*
- **VENUS™** — The Scout. Reconnaissance of external intelligence and instruction vectors. *(Roadmap)*
- **LASER™** — Override Protocol. High-privilege override protocol. *(Restricted)*

---

## How to Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config (optional for demo)
cp .env.example .env

# 3. Start the server
npm start

# 4. Open in browser
# http://localhost:3000
```

### Demo Credentials

When `ENLIL_MODE=demo` (default), use these credentials:

| Username | Password | Role |
|---|---|---|
| owner | enlil-owner-2026 | OWNER |
| admin | enlil-admin-2026 | ADMIN |
| operator | enlil-operator | OPERATOR |
| viewer | enlil-viewer | VIEWER |

> **Note:** Demo credentials are blocked in production mode (`ENLIL_MODE=production`).

---

## Screen Layout

| Area | Location | Purpose |
|------|----------|---------|
| **Left Panel** | Left side | Mode selector (SENTINEL/TITAN/GUARDIAN/FORGE/VENUS/LASER), tab navigation |
| **Center Panel** | Middle | Command input, output console, demo commands |
| **Right Panel** | Right side | Security posture, current status, policy pack, recent events |

---

## Using Commands

### Typing Commands

1. Log in with valid credentials.
2. Click the command input box at the top.
3. Type a command and press **Enter** or click **Route via Sentinel**.
4. All commands are routed through the backend SENTINEL™ policy engine and TITAN™ risk engine.

### Available Commands

| Command | What It Does |
|---------|-------------|
| `threat scan prompt injection` | Run a prompt injection threat scan |
| `system integrity check` | Check system health and integrity |
| `compliance check data handling` | Verify data handling compliance |
| `decision stress test rollout plan` | Stress test a deployment decision |
| `red team scenario 03` | Run a red team attack simulation |
| `export audit` | Switch to Logs tab and trigger export |
| `open titan` | Open the TITAN dashboard in a new window |
| `help` | Open the help overlay |

---

## Understanding the Output

Each command produces an **output card** showing:

- **SENTINEL™ Decision** — ALLOW / BLOCK / REVIEW with severity level
- **TITAN™ Risk Score** — 0 (LOW) to 100 (CRITICAL)
- **Risk Level** — LOW (0–24) · MEDIUM (25–49) · HIGH (50–74) · CRITICAL (75–100)
- **Categories** — Risk categories detected
- **Posture** — Current security posture after the command

### Security Posture Colors

| Color | Meaning |
|-------|---------|
| 🟢 **GREEN** | Normal operations, no significant threats |
| 🟡 **AMBER** | Elevated risk, monitoring recommended |
| 🔴 **RED** | High risk, immediate action required |
| ⬛ **BLACK** | Critical, system lockdown recommended |

---

## Role-Based Access

| Role | Level | What You Can Do |
|------|-------|----------------|
| OWNER | 4 | Full access including audit export and LASER |
| ADMIN | 3 | Commands, audit view, policy management |
| OPERATOR | 2 | Approved commands, limited log access |
| VIEWER | 1 | Read-only (health and module status only) |

---

## Audit Logs

### Viewing Logs

1. Click **Logs** in the left sidebar.
2. Use the **filter dropdown** to show logs from specific modules.
3. All audit entries include a cryptographic hash chain linking each entry to the previous one.

### About the Audit Chain

The audit system uses a **tamper-evident SHA-256 hash chain with HMAC signatures**:
- Each entry is linked to the previous entry via hash
- HMAC signatures detect modification attempts
- Verify integrity with `npm run verify:audit` or via `/api/audit/verify`

> **Note:** Audit storage is currently file-based (`data/audit_log.json`). Production deployment should use PostgreSQL or S3 with append-only storage for forensic-grade immutability.

---

## Emergency Lockdown

The **EMERGENCY LOCKDOWN** toggle is in the center panel. When activated:
- All commands are blocked
- Posture changes to RED
- The event is logged in the audit chain

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **H** | Toggle help overlay |
| **Escape** | Close help overlay or modals |
| **Enter** | Submit command |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page won't load | Ensure server is running (`npm start`) |
| Login fails | Check credentials match demo mode accounts |
| TITAN button doesn't open | Allow popups for this site |
| Commands return errors | Check that you're not in lockdown mode |
| Old content showing | Hard refresh: Ctrl+Shift+R |
| Left panel missing (mobile) | Tap the ☰ button in the top-left |

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™, LASER™ are claimed trademarks.
