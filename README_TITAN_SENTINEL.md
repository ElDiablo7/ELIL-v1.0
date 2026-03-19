# GRACE-X TITAN™ + SENTINEL™ Security Overlay

## Overview

TITAN + SENTINEL is a hardened, offline-first internal security overlay for the GRACE-X ecosystem. The system consists of:

- **Sentinel™**: Security governor that authenticates, authorizes, routes requests, enforces policies, and logs everything
- **TITAN™**: Tactical Internal Threat Assessment Nucleus that performs deep threat analysis (TITAN_INTERNAL_ONLY - cannot be invoked directly by users)

## How to Run

1. Open `index.html` in a modern web browser
2. The security modal will appear - click "Acknowledge"
3. Enter the default PIN: `0000` (or use `SENTINEL_OVERRIDE` for testing)
4. The system will initialize and you can begin using it

**Note**: This is a standalone application with no external dependencies. All data is stored locally in browser localStorage.

## System Architecture

### Sentinel (Governor)
- Handles all user interactions
- Routes commands and decides when to invoke TITAN
- Enforces policies and manages authentication
- Maintains system posture (GREEN/AMBER/RED/BLACK)
- Provides sanitized summaries of TITAN analysis to operators

### TITAN (Nucleus)
- **TITAN_INTERNAL_ONLY** - Cannot be invoked directly
- Performs threat scanning, integrity checks, compliance validation
- Executes red team scenarios and adversarial reasoning
- Generates risk assessments and mitigation plans
- Output is classified as TITAN_INTERNAL_ONLY and sanitized by Sentinel before operator view

## UI Components

### Left Panel (Router)
- **Mode Toggle**: SENTINEL (active) / TITAN (LOCKED - TITAN_INTERNAL_ONLY)
- **Navigation Tabs**:
  - Overview: System status and health
  - Threat Scan: Threat analysis operations
  - System Integrity: Integrity check operations
  - Compliance: Compliance validation
  - Decision Stress: Stress testing
  - Red Team: Red team scenario execution
  - Logs: Immutable log viewer
  - Policy & Permissions: Policy pack management
  - Training Index: Training reference index

### Center Panel (Console)
- **Command Input**: Enter commands for Sentinel to route
- **Route via Sentinel Button**: Routes command through Sentinel (may invoke TITAN if needed)
- **Emergency Lockdown Switch**: Big red switch to activate/deactivate lockdown
- **Output Console**: Displays structured output cards with findings
- **Demo Commands**: Quick-access buttons for common operations

### Right Panel (Status)
- **Presence Banner**: "WE ARE AWARE OF YOUR PRESENCE"
- **Posture Indicator**: Current system posture (GREEN/AMBER/RED/BLACK)
- **Current Status**: Role, policy pack, authentication status, lockdown status
- **Policy Pack Selector**: Switch between available policy packs
- **Last 10 Events**: Recent log entries
- **Integrity Flags**: Log chain verification, policy status, system status

## Button Descriptions

### Route via Sentinel
Routes the entered command through Sentinel. Sentinel will:
1. Log the command (redacted)
2. Classify intent
3. Compute risk score
4. Check policy compliance
5. Decide if TITAN analysis is required
6. Return sanitized results to operator

### Emergency Lockdown
Activates system lockdown:
- Disables all functions except unlockdown
- Freezes UI actions
- Sets posture to BLACK
- Requires authentication to unlock

### Demo Commands
Quick-access buttons for testing:
- **Run Threat Scan: prompt injection indicators**: Scans for prompt injection patterns
- **System Integrity Check**: Performs comprehensive integrity validation
- **Compliance Check: data handling**: Validates data handling compliance
- **Decision Stress Test: rollout plan**: Executes stress testing
- **Run Red Team Scenario #03**: Executes red team scenario 03
- **Lockdown**: Activates emergency lockdown

### Export Logs
Exports the immutable log chain as JSON file for audit purposes.

### Audit Export
Exports both logs and configuration snapshot for compliance auditing.

## Policy Packs

### baseline_internal
Standard internal security policy for general operations. Moderate restrictions, standard redaction rules.

### gov_secure
Enhanced security policy for government-level operations. Stricter controls, two-person rule enabled, enhanced redaction.

### kids_guardian_overlay
Restrictive policy overlay for child safety (LOCKED by default). Maximum restrictions, all actions require two-person verification.

## Test Checklist

### Authentication
- [ ] **Auth Success**: Enter PIN `0000` - should authenticate and grant OPERATOR role
- [ ] **Auth Failure**: Enter wrong PIN 3 times - should lockout and show error
- [ ] **Session Management**: Verify session starts on auth, ends on logout

### Policy Pack Switching
- [ ] **Load baseline_internal**: Should load successfully, update status panel
- [ ] **Load gov_secure**: Should load successfully, enable two-person rule
- [ ] **Load kids_guardian_overlay**: Should fail (locked) or require override
- [ ] **Policy Enforcement**: Try restricted action - should be denied

### Command Rate Limiting
- [ ] **Normal Usage**: Send commands normally - should work
- [ ] **Rate Limit**: Send 60+ commands in 1 minute - should rate limit and show error
- [ ] **Rate Limit Reset**: Wait 1 minute - should allow commands again

### TITAN Invocation (via Sentinel only)
- [ ] **Direct TITAN Access**: TITAN button should be disabled/locked
- [ ] **Via Sentinel**: Send "threat scan" command - Sentinel should invoke TITAN
- [ ] **TITAN Output**: Verify TITAN results are sanitized before operator view
- [ ] **Classification**: Verify TITAN output marked as TITAN_INTERNAL_ONLY

### Logs Hash Chain Verification
- [ ] **Chain Integrity**: Execute commands - verify logs.append() creates hash chain
- [ ] **Verification**: Call Logs.verify() - should return true for valid chain
- [ ] **Export**: Export logs - verify JSON contains hash_prev and hash_current
- [ ] **Tamper Detection**: Manually modify log in storage - verify() should detect tampering

### Lockdown/Unlockdown
- [ ] **Activate Lockdown**: Click lockdown switch - system should lock, posture BLACK
- [ ] **Lockdown Effects**: Try to send command - should be rejected
- [ ] **Unlockdown**: Enter PIN - should unlock, return to GREEN posture
- [ ] **Lockdown Reason**: Verify reason is logged

### Redaction
- [ ] **Sensitive Data**: Send command with sensitive keywords - verify redaction in logs
- [ ] **Output Classification**: Verify output classified correctly (PUBLIC/INTERNAL/SECRET/TITAN_INTERNAL_ONLY)
- [ ] **Policy Redaction**: Switch policy packs - verify different redaction rules apply

### Posture Changes with Risk
- [ ] **Low Risk**: Send safe command - posture should remain GREEN
- [ ] **Medium Risk**: Send moderate risk command - posture should change to AMBER
- [ ] **High Risk**: Send high-risk command - posture should change to RED
- [ ] **Critical Risk**: Send critical command - posture should change to BLACK

### Additional Tests
- [ ] **Tab Navigation**: Click all tabs - should switch content correctly
- [ ] **Demo Commands**: Click all demo buttons - should execute correctly
- [ ] **Status Panel Updates**: Verify status panel updates on state changes
- [ ] **Log Display**: Verify recent events display correctly
- [ ] **No Console Errors**: Open browser console - should have no errors
- [ ] **Offline Operation**: Disconnect network - should still function (offline-first)

## Security Features

### TITAN_INTERNAL_ONLY
- TITAN cannot be invoked directly by users
- Only Sentinel can invoke TITAN
- TITAN output is always classified as TITAN_INTERNAL_ONLY
- Sentinel sanitizes TITAN output before operator view

### Offline-First
- No external API calls by default
- All data stored locally
- External connectors stubbed with warnings
- Works completely offline

### Immutable Logging
- Append-only log stream
- Hash chain verification
- Cannot delete or modify logs
- Export for audit purposes

### Human-in-the-Loop
- Sentinel is the governor
- TITAN is the nucleus
- All actions go through Sentinel
- Operator receives sanitized summaries

## Default Configuration

- **Default PIN**: `0000`
- **Max Auth Attempts**: 3
- **Session Timeout**: 3600 seconds
- **Rate Limit**: 60 requests/minute
- **Default Policy Pack**: baseline_internal
- **Initial Posture**: GREEN
- **TITAN Auto-Invoke Threshold**: 50 risk score

## File Structure

```
/index.html
/assets/css/titan.css
/assets/js/app.js
/assets/js/sentinel.js
/assets/js/titan.js
/assets/js/logs.js
/assets/js/policy.js
/assets/js/utils.js
/assets/data/policy_packs.json
/assets/data/training_index.json
/assets/data/threat_taxonomy.json
/assets/data/redteam_scenarios.json
/assets/data/config.default.json
/README_TITAN_SENTINEL.md
```

## Notes

- All functions are deterministic and local
- No external dependencies required
- Lightweight CSS animations only (no heavy images)
- TITAN responses are terse, operational, non-chatty
- System follows spec exactly - no drift
- Sci-fi aesthetic: steel, blue glow, silver lines, subtle grid
- Animated scanline and faint starfield background

## Troubleshooting

**Issue**: Modal doesn't appear
- **Solution**: Check browser console for errors, ensure all files are in correct locations

**Issue**: Authentication fails
- **Solution**: Default PIN is `0000`, or use `SENTINEL_OVERRIDE` for testing

**Issue**: TITAN not invoked
- **Solution**: TITAN only invoked for high-risk commands or specific intents (threat scan, integrity check, etc.)

**Issue**: Logs not persisting
- **Solution**: Check browser localStorage is enabled, logs stored under key `titan_sentinel_logs`

**Issue**: Policy pack won't load
- **Solution**: Check if pack is locked (kids_guardian_overlay), verify JSON file is valid

## Version

Version 1.0.0 - Initial Release
