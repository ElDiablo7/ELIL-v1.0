# ENLIL™ v1.0 — Release Notes

> **Build:** ENLIL™ v1.0 Production Hardening Build
> **Version:** 1.0.0-hardened
> **Date:** 2026-05-01
> **Classification:** Production-hardened prototype

---

## Summary

This release transforms ENLIL™ from a static browser-based prototype into a **backend-governed, audit-ready security console**. All security decisions (authentication, authorization, policy enforcement, risk analysis, audit logging) are now enforced server-side via a Node.js/Express backend.

## What's New

### Backend Foundation
- Express server with helmet, CORS, rate limiting, and secure error handling
- Environment-based configuration (demo/production mode separation)
- Request ID tracing on every API call

### Authentication & Access Control
- JWT-based authentication with 1-hour token expiry
- Four roles: OWNER, ADMIN, OPERATOR, VIEWER — enforced server-side
- No hardcoded PINs or bypasses in production mode
- Login rate limiting (10 attempts per 15 minutes)

### Server-Side Security Engines
- SENTINEL™ policy engine: command classification, prohibited pattern detection, role enforcement
- TITAN™ risk engine: 10-category risk analysis with structured outputs and provider abstraction

### Audit Hardening
- Server-side tamper-evident hash chain with HMAC signatures
- File-based persistence (upgradeable to database)
- Independent verification script (`npm run verify:audit`)

### Module Transparency
- Module manifest (`config/modules.json`) with honest status labels
- SENTINEL and TITAN: active production services
- GUARDIAN, FORGE, VENUS: clearly labelled as roadmap
- LASER: restricted, requires OWNER approval

### Documentation
- Security Model, Compliance Mapping, Investor Summary, Deployment Guide
- Test Plan, Changelog, Release Notes

## How to Run

```bash
npm install
npm start
# Open http://localhost:3000
# Demo login: owner / enlil-owner-2026
```

## How to Test

```bash
# Start server in one terminal
npm start

# Run tests in another terminal
npm test

# Quick smoke test
npm run smoke

# Verify audit chain
npm run verify:audit
```

## Known Limitations

- This is a **production-hardened prototype**, designed for further enterprise hardening
- Not independently pen-tested
- Not certified under any compliance framework
- TITAN uses rule-based analysis (LLM provider stubbed)
- GUARDIAN, FORGE, VENUS, LASER are roadmap modules
- TLS/HTTPS is a deployment responsibility

## Next Recommended Phase

1. Migrate to bcrypt for password hashing
2. Add PostgreSQL for immutable audit storage
3. Implement TOTP-based MFA
4. Deploy behind HTTPS reverse proxy
5. Commission independent security audit
6. Connect TITAN to approved LLM provider
7. Build out GUARDIAN defensive telemetry

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**
ENLIL™, GRACE-X AI™, SENTINEL™, TITAN™, GUARDIAN™, FORGE™, VENUS™, LASER™ are claimed trademarks.
