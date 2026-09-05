# LedgerProof Multi-Agent Specification

LedgerProof employs a specialized ensemble of autonomous agents designed for financial reconciliation, exception forensics, and adversarial governance.

---

## 1. Finance Orchestrator (`FinanceOrchestrator`)
- **Core Mission**: Coordinate the autonomous month-end close objective from end to end.
- **Workflow Pipeline**:
  1. Understands financial objective (e.g., *"Complete September 2026 month-end reconciliation"*).
  2. Ingests bank feed records and AP subledger items.
  3. Executes deterministic 3-way matching.
  4. Dispatches detected discrepancies to the Investigation Agent.
  5. Sequences Resolution Agent treatment formulation.
  6. Submits proposals to the Independent Verifier Agent.
  7. Evaluates output against the Deterministic Autonomy Gate.
  8. Commits auto-reconciled items or routes to Controller human sign-off.
  9. Creates immutable cryptographic audit records in the Audit Vault.

---

## 2. Investigation Agent (`InvestigationAgent`)
- **Core Mission**: Autonomous forensic evidence discovery across multi-source enterprise documents.
- **Available Tool Layer**:
  - `get_transaction(tx_id)`
  - `get_invoice(invoice_ref)`
  - `get_purchase_order(po_ref)`
  - `get_vendor_history(vendor_name)`
  - `get_contract(vendor_name)`
  - `get_policy(policy_id)`
  - `calculate_variance(actual, baseline)`
  - `detect_possible_duplicate(invoice, candidates)`
  - `get_historical_classification(vendor_name)`
- **Output Schema**:
  - `evidence_gathered`: List of evidence items with relevance score ($\ge 0.0$ to $1.0$).
  - `missing_evidence`: Specific documents or data fields that could not be verified.
  - `root_cause`: Concise diagnosis of the financial exception.
  - `confidence`: Calibrated probability score ($0.0$ to $1.0$).
  - `recommended_action`: Proposed initial direction for the Resolution Agent.

---

## 3. Resolution Agent (`ResolutionAgent`)
- **Core Mission**: Formulates proposed accounting treatments, variance adjustments, duplicate tags, or accrual journal entries.
- **Possible Actions**:
  - `AUTO_MATCH`: Standard 3-way match cleared.
  - `CORRECT_GL`: Reclassifies incorrect chart of accounts posting.
  - `MARK_DUPLICATE`: Identifies redundant billing and tags for AP stop-payment.
  - `CREATE_ACCRUAL`: Proposes double-entry month-end accrual for unbilled recurring SaaS.
  - `APPROVE_VARIANCE`: Recommends variance clearance within policy limits.
  - `ESCALATE_POLICY`: Routes out-of-tolerance variance to human Controller.
  - `REQUEST_EVIDENCE`: Requests missing documentation from vendor or department.
- **Non-Negotiable Constraint**: The Resolution Agent **must never** directly approve or commit its own output. All output is submitted to the Independent Verifier.

---

## 4. Independent Verifier Agent (`IndependentVerifierAgent`)
- **Core Mission**: Adversarial, independent auditor ensuring zero hallucinated accounting entries.
- **Input Fact Vector**: Original transaction, gathered evidence chips, active policy, and Resolution Agent proposal.
- **Independent Validation Checks**:
  1. *Arithmetic Consistency*: Recalculates all percentages, absolute differences, and tax totals deterministically.
  2. *Policy Compliance*: Verifies against active governance ceilings (e.g., `POL-VAR-001` 2.0% tolerance).
  3. *Vendor Master Consistency*: Validates that proposed categories do not contradict Vendor Master Agreements.
  4. *Materiality Assessment*: Flags amounts $\ge \$10,000$ for human review.
- **Possible Determinations**:
  - `VERIFIED`
  - `REJECTED`
  - `INSUFFICIENT_EVIDENCE`
  - `HUMAN_REVIEW_REQUIRED`
- **Disagreement Rule**: If the Verifier rejects the proposed classification or detects a contradiction, execution is **immediately blocked (Tier D)**.

---

## 5. The Judge Wow Moment: AWS Cloud Misclassification
- **Scenario**:
  - Transaction: Amazon Web Services (\$8,420.00).
  - Draft GL Account: `6400 - Office Supplies & Administration`.
  - Resolution Agent: Attempts to propose `6400 - Office Supplies & Administration` based on a naive memo trigger ("Supplies").
  - Verifier Intervention: Verifier cross-references the AWS Master Agreement and 48 consecutive historical reconciliations.
  - Determination: `VERIFICATION FAILED`.
  - Outcome: The system flags a prominent disagreement alert in the Decision Trace:
    > *"Potential incorrect posting prevented. Proposed: Office Supplies. Correct: 6010 - Cloud Infrastructure & Hosting."*
