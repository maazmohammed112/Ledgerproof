# LedgerProof 60-Second Judge Demo Script & Walkthrough

This document outlines the exact, repeatable demonstration script designed for hackathon judges, CFOs, Controllers, and AI-Agent Engineers.

---

## Pre-Flight Check & Reset

1. Click **Reset Demo** in the top navigation bar at any time to restore pristine Northstar Labs data.
2. Ensure you are viewing the interface in **Light Mode** (default).

---

## 60-Second Guided Tour Script

### Step 1: Month-End Close Cockpit
- **Navigate**: Command Center
- **Observe**: Top status shows **September Close** at **97.4% complete** across 75 ingested transactions.
- **Narrative**: *"Finance teams are ready for autonomous AI. The challenge is knowing when to trust it. LedgerProof provides verifiable autonomy."*

### Step 2: Autonomous Auto-Matching
- **Observe**: 68 ordinary operating expenses (salaries, standard software subscriptions, rent) auto-reconcile with 100% confidence without human intervention.

### Step 3: Duplicate Invoice Hard Block
- **Navigate**: Exception Inbox $\rightarrow$ Filter: "Duplicates"
- **Click**: Transaction `TX-EXC-001` (Starlight Logistics \$14,500.00).
- **Observe**: LedgerProof detects exact matching invoice `INV-STR-4401` already paid on Sep 2.
- **Action**: Composite duplicate score ($\ge 0.85$) triggers a deterministic **Tier D Hard Block**, preventing accidental double-payment.

### Step 4: Purchase Order Variance
- **Click**: Transaction `TX-EXC-002` (Apex Consulting \$103,000.00).
- **Observe**: Invoice exceeds the approved \$100,000 PO by 3.0% (\$3,000). Standard policy allows only 2.0% (`POL-VAR-001`).
- **Action**: Because the variance exceeds policy and the amount is material (\$103k), the Autonomy Gate routes it to **Tier C (Human Review)**.

### Step 5 & 6: The Judge Wow Moment (Two Agents Disagree)
- **Click**: Transaction `TX-EXC-003` (Amazon Web Services \$8,420.00).
- **Click**: **Inspect Trace**.
- **Observe**:
  1. *Resolution Agent* erroneously proposed `6400 - Office Supplies & Administration` based on a naive memo trigger ("Supplies").
  2. *Independent Verifier Agent* independently cross-checked the Vendor Master Agreement and 48 consecutive months of historical postings.
  3. *Verifier Output*: `VERIFICATION FAILED`.
  4. *Banner Alert*: **Potential incorrect posting prevented.**
  5. *Correct Account*: `6010 - Cloud Infrastructure & Hosting`.
- **Narrative**: *"The Resolution Agent can never approve its own output. When it makes a mistake, the Independent Verifier catches it before it touches the books."*

### Step 7 & 8: Human Controller Sign-Off
- **Navigate**: Exceptions $\rightarrow$ `TX-EXC-002` (Apex Consulting).
- **Click**: **Human Review**.
- **Observe**: Dual-confirmation safeguard appears because amount exceeds the \$10,000 materiality ceiling.
- **Action**: Enter audit justification note and click **Confirm & Post to Books**.

### Step 9: Reconciled Close Velocity
- **Navigate**: Command Center.
- **Observe**: All exceptions are committed, close velocity hits 100%, and celebratory confetti triggers!

### Step 10: Cryptographic Audit Vault
- **Navigate**: Audit Vault.
- **Observe**: Every decision is stamped with evidence IDs, policy references, tool latencies, and SHA-256 integrity hash.
- **Action**: Click **Export Audit JSON** to download the audit package.

### Step 11: Real Measured Agent Lab Benchmark
- **Navigate**: Evaluations.
- **Observe**: Honest, non-fabricated metrics comparing Agent V1 (82.5% accuracy, 5.0% false approvals) against Agent V2 (97.5% accuracy, 0.0% false approvals).
- **Action**: Click **Synthesize Agent Improvement** to view the prompt optimization diff.

### Step 12: Human-Controlled Policy Learning
- **Navigate**: Policy Center.
- **Observe**: LedgerProof observed 5 consecutive controller approvals for CloudWorks invoice variances and generated a transparent proposal: *"Allow <= 5.0% variance for CloudWorks Infrastructure"*.
- **Action**: Click **Approve Policy Change** to activate the rule.
