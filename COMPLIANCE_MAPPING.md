# ENLIL™ v1.0 — Compliance Mapping

> **Disclaimer**: ENLIL™ is **not certified** under any framework. This document maps ENLIL™ controls to recognized governance frameworks to demonstrate **alignment readiness**. The language used is "designed to support" and "alignment-ready", not "certified" or "compliant".

---

## NIST AI Risk Management Framework (AI RMF)

| NIST AI RMF Function | ENLIL™ Mapped Control | Status |
|---|---|---|
| GOVERN 1.1 — Policies | Policy packs (JSON-configurable governance rules) | ✅ Implemented |
| GOVERN 1.3 — Roles & Responsibilities | OWNER/ADMIN/OPERATOR/VIEWER role hierarchy | ✅ Implemented |
| MAP 1.1 — Context of Use | Module manifest with status and risk levels | ✅ Implemented |
| MEASURE 2.1 — Risk Assessment | TITAN risk scoring (0-100) with 10 categories | ✅ Implemented |
| MEASURE 2.3 — Monitoring | Server-side audit chain with tamper detection | ✅ Implemented |
| MANAGE 1.1 — Risk Treatment | SENTINEL policy blocking and escalation | ✅ Implemented |
| MANAGE 2.1 — Risk Prioritization | Escalation matrix with role-based approval gates | ✅ Implemented |

## EU AI Act Readiness

| EU AI Act Theme | ENLIL™ Alignment | Status |
|---|---|---|
| Risk Classification | Modules labelled with risk_level (low/medium/high/critical) | ✅ Alignment-ready |
| Human Oversight | OWNER approval required for critical overrides | ✅ Alignment-ready |
| Transparency | Module manifest clearly states what is functional vs. roadmap | ✅ Alignment-ready |
| Record-Keeping | Tamper-evident audit chain with hash verification | ✅ Alignment-ready |
| Accuracy & Robustness | TITAN confidence scoring with provider abstraction | ✅ Alignment-ready |

## UK AI Assurance

| UK Principle | ENLIL™ Alignment | Status |
|---|---|---|
| Safety | SENTINEL blocks prohibited/dangerous commands | ✅ Alignment-ready |
| Transparency | Honest module status labels, demo vs. production separation | ✅ Alignment-ready |
| Fairness | Role-based access control prevents privilege abuse | ✅ Alignment-ready |
| Accountability | Full audit trail with request IDs and operator attribution | ✅ Alignment-ready |
| Contestability | Audit export for independent review | ✅ Alignment-ready |

## ISO/IEC 42001 AI Management System

| ISO 42001 Control Area | ENLIL™ Control | Status |
|---|---|---|
| 5.2 — AI Policy | Configurable policy packs with escalation rules | ✅ Designed to support |
| 6.1 — Risk Assessment | TITAN multi-category risk analysis | ✅ Designed to support |
| 7.2 — Competence | Role-based access with minimum privilege | ✅ Designed to support |
| 8.1 — Operational Planning | Module manifest with production readiness flags | ✅ Designed to support |
| 9.1 — Monitoring | Server-side audit logging with verification | ✅ Designed to support |

## SOC 2 Alignment

| SOC 2 Trust Principle | ENLIL™ Control | Status |
|---|---|---|
| Security | Helmet, CORS, rate limiting, JWT auth | ✅ Designed to support |
| Availability | Health endpoint, graceful error handling | ✅ Designed to support |
| Processing Integrity | SENTINEL validates all commands before processing | ✅ Designed to support |
| Confidentiality | Classification-based redaction, role permissions | ✅ Designed to support |
| Privacy | PII detection in TITAN, data handling rules | ✅ Designed to support |

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**
