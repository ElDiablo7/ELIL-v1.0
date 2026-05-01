# ENLIL™ AI Governance Console — Vertical Productisation

> **Document:** Commercial Vertical Strategy  
> **Build:** 1.0.1-hardened  
> **Author:** Zachary Charles Anthony Crockett

---

## Product Position

**ENLIL™ AI Governance Console** is positioned as the first commercial product from the GRACE-X AI™ platform — a backend-governed AI governance, risk and audit console designed for organisations that deploy, manage, or oversee AI systems.

The product enforces **policy-based command routing, real-time risk scoring, tamper-evident audit logging, and role-based access control** across all operator interactions with AI infrastructure.

---

## Target Verticals

ENLIL™ is designed to serve five initial verticals, each with a tailored policy pack that configures the governance posture, risk thresholds, and compliance alignment for that sector.

### 1. AI Agency
**Use Case:** AI development studios, consultancies, and SaaS providers who build or deploy AI for clients.

| Concern | ENLIL™ Response |
|---|---|
| Client prompt injection | SENTINEL™ prohibited pattern detection |
| Model misuse risk | TITAN™ risk scoring per command |
| Audit trail for client work | Tamper-evident hash chain |
| Multi-operator oversight | RBAC with OWNER/ADMIN/OPERATOR/VIEWER |

**Policy Pack:** `ai_agency`

### 2. Legal / Professional Services
**Use Case:** Law firms, accounting firms, and professional services using AI for document review, contract analysis, or advisory.

| Concern | ENLIL™ Response |
|---|---|
| Privilege and confidentiality | Classification-based redaction rules |
| Data handling compliance | Compliance check commands |
| Regulatory audit readiness | Full audit export with signatures |
| Operator accountability | Per-user audit trail with role logging |

**Policy Pack:** `legal_professional`

### 3. Construction / SiteOps
**Use Case:** Construction firms, engineering consultancies, and site operations using AI for planning, safety, and logistics.

| Concern | ENLIL™ Response |
|---|---|
| Safety-critical decision oversight | TITAN™ risk bands with human approval |
| Site access and credential control | RBAC with restricted LASER override |
| Incident logging and accountability | Tamper-evident audit chain |
| Subcontractor access management | Viewer and Operator role separation |

**Policy Pack:** `construction_siteops`

### 4. Film Production Safety
**Use Case:** Film studios, production companies, and VFX houses using AI for pre-visualisation, safety assessment, and production management.

| Concern | ENLIL™ Response |
|---|---|
| On-set safety compliance | Compliance check commands |
| AI-generated content governance | SENTINEL™ policy enforcement |
| Intellectual property protection | Classification and redaction rules |
| Production audit trail | Exportable audit log for insurance/compliance |

**Policy Pack:** `film_production`

### 5. Public Sector Pilot
**Use Case:** Government agencies, local authorities, and public bodies piloting AI systems under regulatory oversight.

| Concern | ENLIL™ Response |
|---|---|
| EU AI Act alignment | Compliance mapping to EU AI Act, NIST AI RMF |
| Transparency and explainability | Structured SENTINEL™ decisions with reasoning |
| Audit readiness | Full audit export with hash chain verification |
| Two-person rule requirements | Two-person rule architecture (server-side stub) |
| Public accountability | Read-only Viewer role for oversight officers |

**Policy Pack:** `public_sector`

---

## Policy Pack Architecture

Each vertical policy pack is a JSON configuration file in `assets/data/vertical_packs/` that defines:

```json
{
  "name": "AI Agency Governance",
  "vertical": "ai_agency",
  "version": "1.0",
  "description": "Policy configuration for AI agencies and development studios",
  "posture_thresholds": { "GREEN": 0, "AMBER": 25, "RED": 50, "BLACK": 75 },
  "allowed_actions": [...],
  "restricted_actions": [...],
  "compliance_frameworks": ["NIST AI RMF", "EU AI Act", "ISO 42001"],
  "two_person_rule": { "enabled": false },
  "escalation_rules": {...}
}
```

Policy packs are loaded at runtime and enforced by the SENTINEL™ engine. Operators can switch packs via the Policy & Permissions tab. Custom packs can be created per client.

---

## Commercial Readiness

| Criterion | Status |
|---|---|
| Core governance engine | ✅ Active (SENTINEL™ + TITAN™) |
| Multi-role access control | ✅ Active (4 roles, server-enforced) |
| Tamper-evident audit | ✅ Active (SHA-256 + HMAC) |
| Vertical policy packs | ✅ Defined (5 verticals) |
| Compliance framework mapping | ✅ Active (NIST, EU AI Act, ISO 42001, SOC 2) |
| Investor demonstration | ✅ Ready |
| Controlled pilot deployment | ✅ Ready (with documented limitations) |
| Full enterprise production | ⚠️ Requires pen testing, database, MFA, HTTPS |

---

## Pricing Model (Recommended)

| Tier | Includes |
|---|---|
| **Pilot** | Single-operator, demo mode, email support |
| **Professional** | Multi-operator, production mode, 1 vertical pack, SLA |
| **Enterprise** | Multi-operator, custom packs, SSO integration, dedicated support |
| **Government** | Full compliance documentation, on-prem deployment, audit support |

---

## Next Steps

1. Package vertical policy packs for client deployment
2. Build per-vertical onboarding documentation
3. Commission independent penetration test
4. Integrate production database (PostgreSQL)
5. Add TOTP-based MFA
6. Deploy reference instance behind HTTPS
7. Begin SOC 2 Type I preparation

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™, LASER™ are claimed trademarks.
