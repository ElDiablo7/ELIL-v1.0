# ENLIL™ v1.0 — Project Manifest

> **Updated:** 2026-04-24 (Patch 2 Phased Finish)

---

## Root Files

| File | Type | Purpose |
|------|------|---------|
| `index.html` | HTML | Main SENTINEL console entry point |
| `titan.html` | HTML | TITAN dashboard (popup window) |
| `package.json` | JSON | npm project metadata |
| `.gitignore` | Config | Git ignore rules |

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start, commands |
| `USER_MANUAL.md` | Operator instructions (non-technical) |
| `DEVELOPER_HANDOVER.md` | Technical architecture & function reference |
| `SECURITY_NOTES.md` | Security assessment & auth limitations |
| `BACKEND_HARDENING_PLAN.md` | Production backend roadmap |
| `CHANGELOG_ENLIL_PATCH_2.md` | Patch 2 change log |
| `MANIFEST.md` | This file — project inventory |
| `TEST_REPORT_PHASE_3.md` | Phase 3-5 test results |
| `FINAL_AUDIT_REPORT.md` | Project completion audit |
| `AUDIT_LOG_PHASE_0.md` | Baseline issues (Phase 0) |
| `README_TITAN_SENTINEL.md` | Legacy technical README |

## JavaScript Modules (`assets/js/`)

| File | Module | Purpose |
|------|--------|---------|
| `app.js` | `App` | Main controller, UI, tab switching, event handling |
| `sentinel.js` | `Sentinel` | Policy governor, command routing, auth |
| `titan.js` | `Titan` | Threat analysis, risk scoring, red team |
| `policy.js` | `Policy` | Policy pack management |
| `logs.js` | `Logs` | Audit chain logging, export, verification |
| `training.js` | `Training` | Training scenarios and simulations |
| `utils.js` | `Utils` | Shared utilities (EventEmitter, Storage, formatters) |
| `core_access.js` | `CoreAccess` | Core access control patterns |
| `grace_x_voice.js` | `GraceX_Voice` | Voice interface (optional, stub) |
| `verification.js` | `Verification` | Hash verification (optional, advisory) |

## CSS (`assets/css/`)

| File | Purpose |
|------|---------|
| `titan.css` | All styles — layout, components, responsive, animations |

## Data & Config (`assets/data/`)

| File | Purpose |
|------|---------|
| `config.default.json` | Default system configuration (DEMO_MODE, auth, logging) |
| `threat_taxonomy.json` | TITAN threat pattern database |
| `red_team_scenarios.json` | Red team scenario definitions |
| `policy_packs/` | Directory of policy pack JSON files |
| `training/` | Directory of training scenario data |

## Assets (`assets/`)

| Directory | Contents |
|-----------|----------|
| `assets/img/` | Icons, logos (if present) |
| `assets/audio/` | Audio files (if present) |

## Backup (excluded from git)

| Directory | Purpose |
|-----------|---------|
| `ENLIL-v1.0_AUDITED_PATCH_1_RESTORE_POINT/` | Pre-patch backup (gitignored) |

---

**Total JS modules:** 10  
**Total CSS files:** 1  
**Total HTML pages:** 2  
**Total documentation files:** 11  
**Total data/config files:** 3+ (plus policy pack & training directories)
