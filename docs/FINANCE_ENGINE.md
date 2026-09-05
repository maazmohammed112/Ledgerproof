# Deterministic Finance Engine & Reconciliation Architecture

LedgerProof's financial intelligence is built on deterministic algorithms rather than unpredictable language model completions. This guarantees 100% reproducible matching, auditable scoring, and mathematical correctness.

---

## 1. 3-Way Reconciliation Matching Engine
The engine matches across three financial dimensions:
1. **Bank Statement <-> General Ledger**: Verifies cash debits and credits match general ledger cash accounts.
2. **Vendor Invoice <-> Purchase Order**: Validates quantities, unit prices, and total billed amounts against approved procurement commitments.
3. **Payment Disbursement <-> Vendor Invoice**: Ensures payments are linked to validated, non-duplicate invoices.

### Matching Hierarchy
- **`EXACT_MATCH`** (Confidence 1.00): Exact amount, reference ID match, and date within +/- 2 days.
- **`HIGH_CONFIDENCE_MATCH`** (Confidence 0.90 - 0.99): Amount matches exactly, normalized vendor matches via fuzzy distance, PO reference aligned.
- **`PARTIAL_MATCH`** (Confidence 0.60 - 0.89): Amount matches within contract tolerance (e.g. +/- 2%), vendor similarity > 80%.
- **`POSSIBLE_DUPLICATE`**: High similarity on invoice number and vendor within short time horizon.
- **`POLICY_EXCEPTION`**: Materiality threshold exceeded or unapproved GL posting.
- **`UNMATCHED`**: No corresponding ledger entry or PO found within search window.

---

## 2. Multi-Signal Duplicate Detection
A common failure of simplistic finance demos is flagging any identical amount as a duplicate. LedgerProof implements a weighted multi-signal scoring function:

$$\text{Duplicate Score} = (0.35 \times S_{\text{inv}}) + (0.25 \times S_{\text{vnd}}) + (0.20 \times S_{\text{amt}}) + (0.10 \times S_{\text{po}}) + (0.10 \times S_{\text{date}})$$

Where:
- $S_{\text{inv}}$: Exact invoice number match (1.0) or strong numeric token match (0.5).
- $S_{\text{vnd}}$: Levenshtein / token-sort vendor name similarity (0.0 to 1.0).
- $S_{\text{amt}}$: Exact amount match (1.0) or zero.
- $S_{\text{po}}$: Associated PO number match (1.0).
- $S_{\text{date}}$: Proximity score (1.0 if within 3 days, decaying to 0.0 at >30 days).

A score $\ge 0.75$ triggers an automatic hold and routes the transaction to the **Independent Verifier** and **Controller Review**.

---

## 3. Statistical Anomaly Engine
Calculates anomaly indicators across active financial ledgers:
- **Amount Z-Score**: Flags transactions exceeding 2.5 standard deviations from a vendor's historical billing baseline.
- **Vendor Velocity**: Detects structuring attempts (e.g. repeated payments just below sign-off thresholds within 48 hours).
- **Weekend / Manual Journal Anomaly**: Flags high-value journal vouchers created outside standard business hours.
- **GL Variance Detection**: Identifies accounts that diverge from approved vendor master defaults (e.g. billing cloud hosting to office supplies).
