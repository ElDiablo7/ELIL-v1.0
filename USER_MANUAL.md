# ENLIL™ v1.0 — Operator Manual

> **System:** ENLIL™ — GRACE-X AI™ Security Console  
> **Version:** 1.0.0 (Demo / Prototype)  
> **Author:** Zachary Charles Anthony Crockett  
> **Last Updated:** 2026-04-24

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [What is ENLIL™?](#what-is-enlil)
3. [System Architecture](#system-architecture)
4. [Screen Guide](#screen-guide)
5. [Full Command Reference](#full-command-reference)
6. [Authentication](#authentication)
7. [Posture Levels](#posture-levels)
8. [Demo Commands — What to Try](#demo-commands--what-to-try)
9. [Logs, Audit & Export](#logs-audit--export)
10. [TITAN™ Command Center](#titan-command-center)
11. [Keyboard Shortcuts](#keyboard-shortcuts)
12. [Troubleshooting](#troubleshooting)
13. [Current Limitations (Demo Mode)](#current-limitations-demo-mode)
14. [Next Hardening Steps](#next-hardening-steps)

---

## Quick Start

### Option A — Open Directly (Simplest)

1. Double-click `index.html` in your file explorer
2. Your browser opens the ENLIL™ Security Console
3. Click **Acknowledge** on the security modal
4. You're in — start clicking commands or tabs

> **Note:** Some browsers may restrict `file://` protocol features. If data fails to load, use Option B.

### Option B — Local HTTP Server (Recommended)

```bash
# If you have Python installed:
python -m http.server 8080

# OR if you have Node.js:
npm install
npm start
```

Then open: **http://localhost:8080** (or the port shown)

### Option C — Deploy on Render

1. Push the repo to GitHub
2. Create a **Web Service** on Render
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Render will serve the app on its assigned URL

---

## What is ENLIL™?

**ENLIL™** is a prototype security-governance console. It provides a visual interface for:

- Running threat scans on system inputs
- Verifying compliance against security policies
- Performing decision stress-tests on operational plans
- Running red team adversarial simulations
- Training operators on security doctrine
- Auditing all actions via an append-only log chain

**Current Status:** Demo Mode. All processing happens locally in your browser. No external services are called.

---

## System Architecture

ENLIL™ operates through two core engines:

### SENTINEL™ — The Governor
- **What it does:** Routes all commands, enforces policies, manages access control, controls system lockdowns, and maintains the audit log chain.
- **User interaction:** Every command you type or click passes through SENTINEL first. It validates the request against the active Policy Pack before allowing execution.

### TITAN™ — The Analyst
- **What it does:** Performs deep threat analysis, decision stress-testing, red team simulations, and behavioral assessment.
- **User interaction:** You don't invoke TITAN directly. SENTINEL delegates tasks to TITAN when threat analysis is required. TITAN operates at `TITAN_INTERNAL_ONLY` classification.

### GRACE-X AI™
- The overarching AI platform powering both engines. Voice commands (when enabled) are handled by the GRACE-X AI™ Voice module.

---

## Screen Guide

### Main Console (`index.html`)

| Area | Location | What It Does |
|------|----------|--------------|
| **Command Bar** | Top of center panel | Type commands here and press Enter. Shows placeholder examples. |
| **Quick Command Buttons** | Below command bar | Pre-built buttons that execute common demo commands with one click. |
| **Left Panel — Tabs** | Left sidebar | Navigate between modules: Overview, Threat Scan, System Integrity, Compliance, Decision Stress, Red Team, Logs, Policy, Training. |
| **Left Panel — Mode** | Top of left sidebar | Toggle between SENTINEL (default) and TITAN (opens Command Center). |
| **Center Panel — Output** | Main content area | Shows results from commands and module views. Scrollable. |
| **Right Panel — Status** | Right sidebar | Shows current posture (GREEN/AMBER/RED/BLACK), auth status, policy pack, and recent events. |
| **Right Panel — Policy Pack** | Right sidebar dropdown | Select a different policy pack to change enforcement rules. |
| **Emergency Lockdown** | Center panel toggle | Activates full system lockdown. Requires PIN to unlock. |
| **Help Overlay** | Press [H] key | Full system help guide with commands, postures, and troubleshooting. |
| **Legal Footer** | Bottom of page | Copyright and trademark notice. |

### TITAN™ Command Center (`titan.html`)

| Area | Location | What It Does |
|------|----------|--------------|
| **Agent Roster** | Left panel | Lists AI agents: TITAN Core, RECON, NEXUS, SHIELD, GRACE. Click to select. |
| **Embedded Browser** | Center top | Internal browser for TITAN operations. |
| **Local Terminal** | Center bottom | Command-line terminal emulator. Type `help` for commands. |
| **Agent Chat** | Right panel | Chat interface for communicating with the selected agent. |

---

## Full Command Reference

All commands are typed into the **Command Bar** at the top of the main console and routed via SENTINEL™.

### Threat Scan
| Command | What It Does |
|---------|--------------|
| `threat scan prompt injection` | Scans for prompt injection attack patterns |
| `threat scan [any text]` | Scans provided text for threat taxonomy matches |

### System Integrity
| Command | What It Does |
|---------|--------------|
| `system integrity check` | Verifies log chain integrity, policy config, and system health |

### Compliance
| Command | What It Does |
|---------|--------------|
| `compliance check data handling` | Checks data handling practices against active policy |
| `compliance check [action]` | Evaluates any action string against the Policy Pack |

### Decision Stress Test
| Command | What It Does |
|---------|--------------|
| `decision stress test rollout plan` | Stress-tests a rollout plan for failure modes |
| `decision stress test [plan description]` | Analyzes any plan for edge cases and vulnerabilities |

### Red Team
| Command | What It Does |
|---------|--------------|
| `red team scenario 03` | Runs Red Team Scenario #03 (demo) |
| `red team scenario auth_bypass` | Simulates authentication bypass attack |
| `red team scenario data_exfil` | Simulates data exfiltration attempt |

### System Control
| Command | What It Does |
|---------|--------------|
| `lockdown emergency` | Activates emergency system lockdown |
| `export audit` | Exports full audit log as JSON (via Logs tab) |
| `open titan` | Opens the TITAN™ Command Center dashboard |

---

## Authentication

| Credential | Value | Access Level |
|------------|-------|-------------|
| Default PIN | `0000` | OPERATOR |
| Override Key | `SENTINEL_OVERRIDE` | ADMIN (full access) |

In the current demo build, authentication is auto-bypassed on load. The auth system is fully implemented but disabled for ease of demo access.

---

## Posture Levels

SENTINEL™ manages a 4-tier posture system:

| Posture | Meaning | Trigger |
|---------|---------|---------|
| 🟢 **GREEN** | Normal operations | Default state |
| 🟡 **AMBER** | Elevated monitoring | Medium-risk command detected |
| 🔴 **RED** | Critical threat detected | High-risk scan result or policy violation |
| ⚫ **BLACK** | Total system lockdown | Manual lockdown or critical breach |

Posture changes are automatic based on command risk scores. You can also trigger lockdown manually via the **Emergency Lockdown** toggle.

---

## Demo Commands — What to Try

New to the system? Try these in order:

1. **Click "Overview" tab** → Read the Operator Guide
2. **Click "🔍 Threat Scan: Prompt Injection"** → Watch SENTINEL route the command and TITAN produce findings
3. **Click "🔐 System Integrity Check"** → See the full system health report
4. **Click "Logs" tab** → View all recorded actions
5. **Click "📦 Export Audit Logs"** → Download the session log
6. **Click "🖥 Open TITAN™ Dashboard"** → Explore the full Command Center
7. **Type your own command** → Try `compliance check unauthorized data transfer`

---

## Logs, Audit & Export

Every action in ENLIL™ is automatically recorded in an append-only log chain with hash verification.

### Viewing Logs
- Click the **Logs** tab in the left panel
- The right panel also shows the **Last 10 Events** at all times

### Exporting Logs
- Click **Export Logs** on the Logs tab → downloads all log entries as JSON
- Click **Audit Export** → downloads with hash chain verification data included

### Log Integrity
- Each log entry is chained to the previous one via SHA-256 hash
- The **Integrity Flags** section in the right panel shows chain verification status
- Any tampering with log entries will break the chain and flag a verification failure

---

## TITAN™ Command Center

The TITAN™ Command Center is a separate dashboard (`titan.html`) designed for advanced operations.

### How to Open
- Click the **TITAN** button in the left panel mode selector
- Or click **"🖥 Open TITAN™ Dashboard"** in the demo commands
- Or navigate directly to `titan.html`

### Terminal Commands (in TITAN OS)
| Command | What It Does |
|---------|--------------|
| `help` | Lists available commands |
| `status` | Shows system status |
| `agents` | Lists active AI agents |
| `scan` | Runs a basic scan |
| `clear` | Clears the terminal |
| `dir` | Shows simulated directory listing |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `H` | Toggle the System Help overlay |
| `Escape` | Close any open overlay or modal |
| `Enter` | Submit the current command |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page is blank | Make sure `index.html` is in the same folder as the `assets/` directory |
| Data won't load | Use a local HTTP server instead of opening via `file://` protocol |
| TITAN button does nothing | Browser may be blocking popups — allow popups for `localhost` |
| Command says "Authentication required" | Refresh the page — auth auto-bypasses on load |
| Logs say "Chain Broken" | This is expected if you clear localStorage — it resets the chain |
| Console shows 404 for favicon | Cosmetic only — doesn't affect functionality |
| Posture won't reset to GREEN | Refresh the page to reset session state |

---

## Current Limitations (Demo Mode)

| Limitation | Details |
|------------|---------|
| **Local storage only** | All data is in browser `localStorage`. Clearing browser data erases everything. |
| **No backend** | No server-side processing, database, or persistent storage. |
| **Simulated results** | Threat scans, compliance checks, and red team results use pre-built sample data. |
| **Single operator** | No multi-user sessions or role-based access control between operators. |
| **No real threat feeds** | All threat data comes from local `threat_taxonomy.json`. |
| **No encryption at rest** | localStorage is not encrypted. |
| **Voice commands limited** | Require browser microphone permission and may not work on all browsers. |

---

## Next Hardening Steps

These are planned improvements for production readiness:

| Phase | Feature | Description |
|-------|---------|-------------|
| **2.1** | Encrypted Backend | Server-side data persistence with encrypted audit storage |
| **2.2** | Real-time Threat Feeds | Integration with external threat intelligence APIs |
| **2.3** | Multi-Operator Sessions | Role-based access control with hardware key authentication |
| **2.4** | Formal Audit Chain | Cryptographically signed, export-ready audit reports |
| **2.5** | CI/CD Pipeline | Automated testing and deployment pipeline |
| **2.6** | Penetration Testing | Third-party security audit of the codebase |

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, The Eye™ and related module names are claimed trademarks of Zachary Charles Anthony Crockett.
