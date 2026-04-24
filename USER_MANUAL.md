# ENLIL™ v1.0 — User Manual

> **For:** Operators, Demo Viewers, Non-Technical Users  
> **Build:** ENLIL™ v1.0 Patch 2  
> **Author:** Zachary Charles Anthony Crockett

---

## What Is ENLIL™?

ENLIL™ is a **prototype security-governance console** that demonstrates how AI systems can be monitored, constrained, and audited in real time. It runs entirely in your browser — no backend server, no cloud connection, no data leaves your machine.

It has five integrated AI modules:
- **SENTINEL™** — The Governor. Manages posture, routes all commands, and enforces policy.
- **TITAN™** — The Nucleus. Performs deep threat analysis and tactical reasoning.
- **GUARDIAN™** — The Shield. Oversees defensive perimeters and logic shielding.
- **FORGE™** — The Smith. Maintains logic synthesis and core structural integrity.
- **VENUS™** — The Scout. Reconnaissance of external intelligence and instruction vectors.

---

## How to Open

1. Open `index.html` in your web browser (Chrome, Edge, or Firefox recommended).
2. If a security modal appears, click **Acknowledge** to proceed.
3. You'll see the main SENTINEL console with the Overview tab active.

> **Note:** If running from a local file (`file://` protocol), some features like config loading may use fallback defaults. For full functionality, serve via a local HTTP server:
> ```
> npx http-server . -p 8088
> ```

---

## Screen Layout

| Area | Location | Purpose |
|------|----------|---------|
| **Left Panel** | Left side | Mode selector (SENTINEL/TITAN), tab navigation |
| **Center Panel** | Middle | Command input, output console, demo commands |
| **Right Panel** | Right side | Security posture, current status, policy pack |

---

## Using Commands

### Typing Commands

1. Click the command input box at the top (shows placeholder text with examples).
2. Type a command.
3. Press **Enter** or click **ROUTE VIA SENTINEL**.

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

### Quick Demo Buttons

On the Overview tab, you'll find **Quick Demo Commands** buttons that run these commands with one click.

---

## Understanding the Output

Each command produces an **output card** showing:

- **Title** — "COMMAND ROUTED VIA TITAN" or "COMMAND ROUTED VIA SENTINEL"
- **Summary** — Brief analysis result
- **Risk Score** — 0 (safe) to 100 (critical)
- **Findings** — Number of issues detected
- **Recommended Controls** — Suggested security measures
- **Posture** — Current security posture after the command

### Security Posture Colors

| Color | Meaning |
|-------|---------|
| 🟢 **GREEN** | Normal operations, no significant threats |
| 🟡 **AMBER** | Elevated risk, monitoring recommended |
| 🔴 **RED** | High risk, immediate action required |
| ⬛ **BLACK** | Critical, system lockdown recommended |

---

## Emergency Lockdown

The **EMERGENCY LOCKDOWN** toggle is in the center panel. When activated:

- All commands are blocked
- Posture changes to RED
- A PIN is required to unlock (`0000` in demo mode)
- The event is logged in the audit chain

---

## Audit Logs

### Viewing Logs

1. Click **Logs** in the left sidebar.
2. You'll see the audit warning banner (explaining localStorage limits).
3. Use the **filter dropdown** to show logs from specific modules (SYSTEM, SENTINEL, TITAN, OPERATOR).

### Exporting Logs

| Button | What It Does |
|--------|-------------|
| **Export JSON** | Downloads the full log chain as a JSON file |
| **Export TXT** | Downloads a human-readable text summary |
| **Full Audit Export** | Downloads logs + system config snapshot |
| **Clear Logs** | Clears all logs (asks for confirmation first) |

### Important Note

> ⚠ Logs are stored in your browser's localStorage. They are **not** tamper-proof forensic evidence. The hash chain provides integrity checking for demo purposes only. Production deployment requires server-side immutable storage.

---

## Status Badges

At the top of the Overview panel, colored badges show current system state:

| Badge | Meaning |
|-------|---------|
| 🟡 **Demo Mode Active** | Running in demo mode, not production |
| 🔵 **Local Audit Storage** | Logs stored in browser, not server |
| 🔵 **Backend Hardening Pending** | No production backend yet |
| 🟢 **Online** | Core Module is Online (SENTINEL, TITAN, GUARDIAN, FORGE, or VENUS) |

---

## TITAN Dashboard

Click the **TITAN** button in the Mode selector (left panel) to open the TITAN dashboard in a separate window. This provides a dedicated threat analysis view.

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
| Page won't load | Check browser console (F12) for errors |
| TITAN button doesn't open | Allow popups for this site |
| Commands return errors | Check that you're not in lockdown mode |
| Old content showing | Hard refresh: Ctrl+Shift+R |
| Left panel missing (mobile) | Tap the ☰ button in the top-left |

---

## What This Is NOT

- This is **NOT** a production security system.
- This is **NOT** connected to any real AI model.
- This is **NOT** storing logs in a tamper-proof way.
- This **IS** a prototype demonstrating the governance architecture.

For production deployment requirements, see `SECURITY_NOTES.md` and `BACKEND_HARDENING_PLAN.md`.

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™ are claimed trademarks.
