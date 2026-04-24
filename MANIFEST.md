# ENLIL™ v1.0 — Project Manifest

> Generated: 2026-04-24  
> Baseline: ENLIL-v1.0_AUDITED_PATCH_1  
> Status: Pre-Patch 2

---

## Root Files

| File | Purpose |
|------|---------|
| `index.html` | Main SENTINEL™ security console entry point |
| `titan.html` | TITAN™ OS command center (standalone dashboard) |
| `package.json` | Node/NPM metadata for Render deployment |
| `README.md` | Quick-start README |
| `README_TITAN_SENTINEL.md` | Full technical documentation & test checklist |
| `.gitignore` | Version control exclusion rules |
| `.gitattributes` | Git line-ending configuration |
| `git_log.txt` | Historical commit log snapshot |

## Assets — JavaScript (`assets/js/`)

| File | Module | Purpose |
|------|--------|---------|
| `app.js` | App | Main UI orchestration, tab navigation, command routing, demo commands |
| `sentinel.js` | Sentinel™ | Security governor: auth, routing, risk scoring, lockdown, posture management |
| `titan.js` | TITAN™ | Threat assessment nucleus: analysis engine, threat scan, red team, compliance |
| `core_access.js` | CoreAccess | System-wide gateway for external resource gating via Sentinel policy |
| `logs.js` | Logs | Immutable append-only log system with hash chain verification |
| `policy.js` | Policy | Policy pack loading, evaluation, redaction, classification engine |
| `training.js` | Training | Interactive training lessons, simulations, and educational content |
| `grace_x_voice.js` | GraceX_Voice | GRACE-X AI™ voice: wake word, speech-to-text, tactical TTS |
| `verification.js` | Verification | Identity verification stubs (offline-only, no external calls) |
| `titan_os.js` | TitanOS | TITAN OS dashboard logic: agents, browser, terminal, chat |
| `titan_map.js` | TitanMap | TITAN Command Center map & direct module chat routing |
| `utils.js` | Utils | Shared utilities: hashing, date formatting, storage, event emitter |

## Assets — CSS (`assets/css/`)

| File | Purpose |
|------|---------|
| `titan.css` | Primary stylesheet — sci-fi theme, glassmorphism, all SENTINEL console styles |
| `titan_os.css` | TITAN OS dashboard-specific styles (agent roster, terminal, chat) |

## Assets — Data (`assets/data/`)

| File | Purpose |
|------|---------|
| `config.default.json` | Default system configuration (auth, rate limiting, posture, UI) |
| `policy_packs.json` | Policy pack definitions (baseline_internal, gov_secure, kids_guardian_overlay) |
| `threat_taxonomy.json` | Threat classification taxonomy for TITAN scan engine |
| `redteam_scenarios.json` | Red team scenario definitions for adversarial simulation |
| `training_index.json` | Training module index with lesson/simulation metadata |

### Assets — Data — Training (`assets/data/training/`)

Training module content files (JSON lesson/simulation data).

## Documentation (`docs/`)

| File | Purpose |
|------|---------|
| `CANONICAL_BUILD_PROMPT_TITAN_SENTINEL.txt` | Original canonical build specification |
| `README.md` | Docs directory index |
| `VerificationReports.d.ts` | TypeScript type definitions for verification report shapes |

## Deployment / Package Files

| File | Purpose |
|------|---------|
| `package.json` | `npm start` via `serve` for Render deployment; no build step required |

## Backup / Restore Points

| Folder | Purpose |
|--------|---------|
| `ENLIL-v1.0_AUDITED_PATCH_1_RESTORE_POINT/` | Full snapshot before Patch 2 (excluded from git) |

---

**Total Files:** ~30 tracked files + training data  
**Total JS Modules:** 12  
**Total CSS Files:** 2  
**Total Data/Config Files:** 5 + training directory  
**Total Doc Files:** 3
