# Independent Verification & Autonomy Architecture

The core tenet of LedgerProof is: **Finance agents must never approve their own work.**

---

## 1. Dual-Agent Separation: Investigator, Resolution Agent & Independent Verifier

```mermaid
sequenceDiagram
    participant D as Financial Data
    participant I as Investigator Agent
    participant R as Resolution Agent
    participant V as Independent Verifier
    participant G as Deterministic Autonomy Gate
    participant H as Human Review (Controller)
    participant A as Audit Vault

    D->>I: Raw Transaction & Context
    I->>I: Collect PO, Historical GL, Vendor Master
    I->>R: Evidence Dossier
    R->>R: Formulate Proposed Action (e.g. Map GL, Hold, Reconcile)
    R->>V: Proposed Resolution + Rationale
    Note over V: Independent Evaluation<br/>Checks Policy, Vendor Master & Prior Vouchers
    alt Verification Fails (e.g. AWS -> Office Supplies)
        V-->>G: Status: REJECTED (Veto)
        G->>H: Escalate to Controller with Evidence & Veto Notice
        H->>A: Controller Overrides or Reclassifies (Audit Logged)
    else Verification Passes
        V-->>G: Status: VERIFIED
        alt Low Risk & Below Materiality Limit
            G->>A: AUTO-EXECUTE (Posted to Ledger)
        else High Risk or High Materiality
            G->>H: Escalate to Controller for Dual Sign-off
            H->>A: Controller Sign-off (Audit Logged)
        end
    end
```

---

## 2. The Adversarial "Wow Moment": Preventing Misclassification

A live demonstration scenario showcases the critical need for independent verification:
1. **Input**: An invoice from **Amazon Web Services (AWS)** arrives for compute infrastructure (`₹103,000` / `$1,250`).
2. **Resolution Agent Error**: An initial heuristic proposes classifying the expense under GL Account `6400` (**Office Supplies & Stationery**).
3. **Independent Verifier Veto**:
   - The Independent Verifier intercepts the proposal.
   - It queries corporate policy `GL-MAPPING-04` and the Vendor Master.
   - It finds that vendor `Amazon Web Services Inc.` has an active master contract mapped strictly to GL Account `6100` (**Cloud Infrastructure**).
   - The Verifier outputs:
     ```json
     {
       "verifier_status": "REJECTED",
       "reason": "Proposed GL 6400 (Office Supplies) violates Master Vendor Mapping policy GL-MAPPING-04 for AWS. Mandated account is 6100 (Cloud Infrastructure).",
       "evidence": ["VENDOR-MASTER-AWS-001", "CONTRACT-AWS-2026-CLOUD"],
       "risk_tier": "TIER_C",
       "autonomy_action": "BLOCK_AUTO_EXECUTION"
     }
     ```
4. **Outcome**: The erroneous automated posting is blocked. The transaction is escalated to the Controller workspace with full explanatory evidence, protecting the company's financial books from corruption.

---

## 3. Autonomy Gate Decision Matrix

| Verification Status | Risk Tier | Materiality Amount | Action Type | Autonomy Gate Decision |
| :--- | :--- | :--- | :--- | :--- |
| `VERIFIED` | Low (`TIER_A`) | $< 5,000$ / $₹1,00,000$ | Standard Match | **Auto-Execute** (Instant Post) |
| `VERIFIED` | Medium (`TIER_B`) | $< 10,000$ / $₹5,00,000$ | Within Tolerance | **Auto-Execute** (With Alert) |
| `VERIFIED` | High (`TIER_C`) | $> 10,000$ / $₹10,00,000$ | Large Disbursement | **Human Review** (Dual CFO Sign-off) |
| `REJECTED` | Any | Any | Any | **BLOCKED** -> Mandatory Human Review |
| `INSUFFICIENT_EVIDENCE`| Any | Any | Any | **BLOCKED** -> Escalate for Documentation |
