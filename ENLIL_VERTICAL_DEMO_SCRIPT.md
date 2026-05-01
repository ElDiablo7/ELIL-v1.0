# ENLIL™ AI Governance Console — Vertical Demo Script

> **Purpose:** Buyer-facing 2-minute demonstration  
> **Version:** 1.0.2-vertical  
> **Audience:** Investors, enterprise buyers, pilot partners  
> **Preparation:** Server running (`npm start`), browser open at `http://localhost:3000`

---

## Pre-Demo Checklist

- [ ] Server started with `npm start` (demo mode)
- [ ] Browser cleared of previous session (Ctrl+Shift+R)
- [ ] Audit log has sample entries from test run (`npm test`)
- [ ] Screen resolution suitable for presentation (1920×1080 recommended)

---

## Demo Flow (≈2 minutes)

### Step 1: Login (15 seconds)

**Action:** Log in with OWNER credentials.

| Field | Value |
|---|---|
| Username | `owner` |
| Password | `enlil-owner-2026` |

**Say:**
> "ENLIL™ uses JWT-based authentication with four role levels. I'm logging in as an OWNER — the highest privilege level. In production, demo credentials are blocked and only environment-configured accounts work."

---

### Step 2: Show Active Governance Mode (15 seconds)

**Action:** Draw attention to the **right panel** — the "Active Governance Mode" section.

**Say:**
> "The console is currently running the **AI Agency** governance profile. This is ENLIL's vertical policy engine — each industry gets a tailored policy pack that configures what actions are restricted, what compliance frameworks apply, and whether a two-person rule is required."

---

### Step 3: Switch Vertical — Legal / Professional (15 seconds)

**Action:** Use the governance mode dropdown to select **Legal / Professional Services**. Show the UI update.

**Say:**
> "Watch what happens when I switch to Legal / Professional. The governance focus changes to privilege and confidentiality, the compliance frameworks update to include SRA and Law Society guidance, and this switch is written to the tamper-evident audit log. Only ADMIN or OWNER roles can change the vertical."

---

### Step 4: Run a Safe Command (15 seconds)

**Action:** Type `compliance check data handling` and press Enter.

**Say:**
> "This is a standard compliance check. SENTINEL™ evaluates the command server-side, classifies it as a governance check with LOW severity, and TITAN™ assigns a low risk score. The command is approved and the result shows the current vertical context."

**Point out:**
- SENTINEL™ decision: **ALLOW**
- TITAN™ risk score: **LOW** band
- Vertical context visible in the response

---

### Step 5: Run a Risky Command (15 seconds)

**Action:** Type `rm -rf /` and press Enter.

**Say:**
> "Now watch what happens with a dangerous command. SENTINEL™ detects this as a shell injection attempt and immediately blocks it — this decision happens server-side, not in the browser. The command never executes. TITAN™ flags it as CRITICAL risk."

**Point out:**
- SENTINEL™ decision: **BLOCKED**
- Severity: **CRITICAL**
- Policy category: **DANGEROUS_COMMAND**

---

### Step 6: Show SENTINEL™ Decision Detail (10 seconds)

**Action:** Point to the SENTINEL™ section of the most recent output card.

**Say:**
> "Every SENTINEL™ decision includes structured metadata — the intent classification, severity level, policy category, and now the active vertical context. This is the same data that feeds into the audit trail."

---

### Step 7: Show TITAN™ Risk Context (10 seconds)

**Action:** Point to the TITAN™ section of the output card.

**Say:**
> "TITAN™ provides a 0-to-100 risk score with four bands — LOW, MEDIUM, HIGH, CRITICAL. It analyses ten risk categories per command and now includes the active vertical's compliance frameworks in its context. TITAN™ is a risk scoring engine — SENTINEL™ remains the enforcement authority."

---

### Step 8: Show Audit Log Entry (10 seconds)

**Action:** Click **Logs** in the left sidebar. Show the most recent entries including the `VERTICAL_CHANGE` event.

**Say:**
> "Every action — login, command, vertical change — is recorded in a tamper-evident SHA-256 hash chain with HMAC signatures. Each entry links cryptographically to the previous one. You can verify the entire chain with a single command. This is the kind of audit trail that regulators and compliance officers need."

---

### Step 9: Commercial Value Proposition (15 seconds)

**Action:** Return to the main console view.

**Say:**
> "This is why ENLIL™ matters commercially: organisations deploying AI need governance, not just guardrails. ENLIL™ gives them role-based access control, policy enforcement, risk scoring, and a cryptographic audit trail — all configured for their specific industry.
>
> We ship five verticals today — AI agencies, legal, construction, film production, and public sector — and custom packs can be built per client. The architecture maps to NIST AI RMF, the EU AI Act, ISO 42001, and SOC 2.
>
> This is investor-demo and controlled-pilot ready today, with a clear roadmap to full enterprise production."

---

## Post-Demo Notes

### What You Can Truthfully Say
- "Backend-governed — all security decisions are enforced server-side"
- "Tamper-evident audit chain with cryptographic verification"
- "40 automated tests covering security, policy, risk, and vertical governance"
- "5 industry verticals with runtime switching"
- "Mapped to 4 compliance frameworks"

### What You Must NOT Say
- Do NOT claim ENLIL™ is "enterprise-ready" without qualification
- Do NOT claim any certification or compliance
- Do NOT claim GUARDIAN/FORGE/VENUS/LASER are functional
- Do NOT claim the system has been pen-tested
- Do NOT claim TITAN™ uses AI/ML (it uses rule-based analysis)
- Do NOT use "tamper-proof" (use "tamper-evident")

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**  
GRACE-X AI™, ENLIL™, TITAN™, SENTINEL™, GUARDIAN™, FORGE™, VENUS™, LASER™ are claimed trademarks.
