# ENLIL™ v1.0 — Smoke Test Checklist

> **Build:** ENLIL-v1.0 Patch 2 (Phased Finish)  
> **Date:** 2026-04-24  
> **Tester:** _______________

---

## Instructions

Open `index.html` in Chrome, Edge, or Firefox (or serve via `npx http-server . -p 8088`).  
Check each item. Mark ✅ PASS, ⚠️ PARTIAL, or ❌ FAIL.

---

## 1. Page Load

| # | Test | Expected | Result |
|---|------|----------|--------|
| 1.1 | `index.html` opens without errors | Page renders, no blank screen | |
| 1.2 | Security modal appears (if DEMO_MODE=false) | Modal with Acknowledge/Exit buttons | |
| 1.3 | Auto-auth works (if DEMO_MODE=true) | No modal, console loads directly | |
| 1.4 | Government banner visible at top | "ENLIL™ SECURITY CONSOLE // RESTRICTED ACCESS" | |
| 1.5 | Legal footer visible at bottom | Copyright + 5 trademarked entities | |
| 1.6 | 5 Mode buttons visible in sidebar | GUARDIAN, FORGE, VENUS, TITAN, SENTINEL | |
| 1.7 | No console errors (F12 → Console) | Zero errors on clean load | |

---

## 2. Overview Tab

| # | Test | Expected | Result |
|---|------|----------|--------|
| 2.1 | Status badges visible | 5 colored pills (Demo Mode, Local Audit, etc.) | |
| 2.2 | Operator Guide visible | "▶ START HERE — Operator Guide" heading | |
| 2.3 | Quick Demo Commands visible | 7 clickable buttons in grid | |
| 2.4 | Command helper text visible | "Type a command above..." text below input | |

---

## 3. Command Input

| # | Test | Expected | Result |
|---|------|----------|--------|
| 3.1 | Placeholder text shows examples | "Try: threat scan prompt injection..." | |
| 3.2 | Type + Enter submits | Command processes, output card appears | |
| 3.3 | Route via Sentinel button works | Same as Enter | |
| 3.4 | Unknown command ("hello world") | Helpful fallback with command suggestions | |

---

## 4. TITAN Commands

| # | Test | Expected | Result |
|---|------|----------|--------|
| 4.1 | `threat scan prompt injection` | "COMMAND ROUTED VIA TITAN", findings listed | |
| 4.2 | `system integrity check` | Integrity scan results | |
| 4.3 | `compliance check data handling` | Compliance results | |
| 4.4 | `decision stress test rollout plan` | Stress test results | |
| 4.5 | `red team scenario 03` | Red team simulation results | |

---

## 5. Special Commands

| # | Test | Expected | Result |
|---|------|----------|--------|
| 5.1 | `export audit` | Switches to Logs tab | |
| 5.2 | `open titan` | TITAN dashboard opens in popup window | |
| 5.3 | `help` | Help overlay appears | |

---

## 6. Demo Command Buttons

| # | Test | Expected | Result |
|---|------|----------|--------|
| 6.1 | Click "Threat Scan" button | Command executes, output appears | |
| 6.2 | Click "System Integrity" button | Command executes | |
| 6.3 | Click "Compliance Check" button | Command executes | |
| 6.4 | Click "Stress Test" button | Command executes | |
| 6.5 | Click "Red Team" button | Command executes | |
| 6.6 | Click "Export Audit" button | Switches to Logs tab | |
| 6.7 | Click "Open TITAN" button | TITAN popup opens | |

---

## 7. Tab Navigation

| # | Test | Expected | Result |
|---|------|----------|--------|
| 7.1 | Click each sidebar tab | Tab highlights, content changes | |
| 7.2 | Logs tab shows audit viewer | Warning banner + controls + log entries | |
| 7.3 | Overview tab returns to guide | Status badges + operator guide visible | |
| 7.4 | Tab switching hides/shows correctly | No overlapping content | |

---

## 8. Audit Viewer (Logs Tab)

| # | Test | Expected | Result |
|---|------|----------|--------|
| 8.1 | Warning banner visible | Yellow text about localStorage limits | |
| 8.2 | Filter dropdown works | Switching filters changes displayed entries | |
| 8.3 | Export JSON downloads file | `.json` file downloads | |
| 8.4 | Export TXT downloads file | `.txt` file downloads | |
| 8.5 | Full Audit Export downloads | JSON with logs + config snapshot | |
| 8.6 | Clear Logs prompts confirmation | Confirm dialog appears | |
| 8.7 | Clear + confirm clears entries | Log list clears (new clear event logged) | |

---

## 9. Emergency Lockdown

| # | Test | Expected | Result |
|---|------|----------|--------|
| 9.1 | Toggle lockdown on | Toggle turns red, commands blocked | |
| 9.2 | Enter command during lockdown | "System is in lockdown" message | |
| 9.3 | Toggle lockdown off | PIN prompt appears, enter `0000` to unlock | |

---

## 10. Right Panel (Status)

| # | Test | Expected | Result |
|---|------|----------|--------|
| 10.1 | Posture indicator shows GREEN | Green bordered box with "GREEN" text | |
| 10.2 | "We are aware of your presence" banner | Blue presence banner visible | |
| 10.3 | Current Status section | Posture, Role, Policy Pack, Auth, Lockdown | |
| 10.4 | Policy Pack dropdown | Selectable policy packs | |

---

## 11. TITAN Dashboard

| # | Test | Expected | Result |
|---|------|----------|--------|
| 11.1 | Click TITAN mode button | New window opens with titan.html | |
| 11.2 | TITAN page renders | Dashboard with header, shell, grid | |
| 11.3 | Legal footer on TITAN page | Same copyright/5-trademark text | |
| 11.4 | TITAN Agent Roster | 5 Agents (GUARDIAN, FORGE, VENUS, TITAN, SENTINEL) | |
| 11.5 | Select Agent works | Agent name/role updates correctly | |

---

## 12. Help Overlay

| # | Test | Expected | Result |
|---|------|----------|--------|
| 12.1 | Press H key | Help overlay appears | |
| 12.2 | Press Escape | Help overlay closes | |
| 12.3 | Click X button | Help overlay closes | |

---

## 13. Mobile/Responsive (resize to 768px or narrower)

| # | Test | Expected | Result |
|---|------|----------|--------|
| 13.1 | Hamburger menu visible | ☰ button in top-left | |
| 13.2 | Click hamburger | Left panel slides in | |
| 13.3 | Click tab on mobile | Panel closes, content loads | |
| 13.4 | No horizontal overflow | No horizontal scrollbar | |
| 13.5 | Command input usable | Input and button stack vertically | |

---

## 14. Documentation Check

| # | File | Present in project? | Result |
|---|------|---------------------|--------|
| 14.1 | `README.md` | | |
| 14.2 | `USER_MANUAL.md` | | |
| 14.3 | `DEVELOPER_HANDOVER.md` | | |
| 14.4 | `SECURITY_NOTES.md` | | |
| 14.5 | `BACKEND_HARDENING_PLAN.md` | | |
| 14.6 | `CHANGELOG_ENLIL_PATCH_2.md` | | |
| 14.7 | `MANIFEST.md` | | |
| 14.8 | `FINAL_AUDIT_REPORT.md` | | |
| 14.9 | `FINAL_STATUS.md` | | |
| 14.10 | `SMOKE_TEST_CHECKLIST.md` | | |

---

## Summary

| Category | Total Tests | Pass | Partial | Fail |
|----------|------------|------|---------|------|
| Page Load | 6 | | | |
| Overview | 4 | | | |
| Command Input | 4 | | | |
| TITAN Commands | 5 | | | |
| Special Commands | 3 | | | |
| Demo Buttons | 7 | | | |
| Tab Navigation | 4 | | | |
| Audit Viewer | 7 | | | |
| Lockdown | 3 | | | |
| Right Panel | 4 | | | |
| TITAN Dashboard | 3 | | | |
| Help Overlay | 3 | | | |
| Mobile | 5 | | | |
| Documentation | 10 | | | |
| **TOTAL** | **68** | | | |

---

**Tested by:** _______________  
**Date:** _______________  
**Build classification:** Demo-ready security governance prototype.
