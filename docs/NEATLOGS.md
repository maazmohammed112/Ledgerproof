# Neatlogs Observability in LedgerProof

> **Track 2**: Autonomous Office of the CFO  
> **Engine**: LedgerProof Local Intelligence ($0 External AI API Cost)  
> **Root Workflow**: `ledgerproof-finance-close`

---

## 1. Why Neatlogs?

Autonomous finance agents must **prove their work**. In enterprise accounting, black-box decision making is unacceptable to CFOs, external auditors, and regulators. 

We integrated **Neatlogs** to provide forensic, span-by-span observability across our entire autonomous finance pipeline. Because LedgerProof operates using high-speed deterministic heuristics, similarity matrices, and policy verifiers, Neatlogs provides:
- **Real-Time Pipeline Visibility**: Track every step from ingestion to SHA-256 audit hashing.
- **Forensic Disagreement Inspection**: Instantly surface when the Independent Verifier rejects an unsafe proposed resolution.
- **Self-Improvement Root-Cause Analysis**: Pinpoint the exact reason for an evaluation regression without guesswork.
- **Audit-Ready Evidence**: Correlate business transaction IDs with execution spans.

---

## 2. Tracing Architecture

LedgerProof uses a **zero-overhead, server-side telemetry proxy pattern**:

```
┌────────────────────────────────────────────────────────┐
│             Browser Client (Next.js App)               │
│  - User uploads CSV/XLSX or clicks "Run Close"         │
│  - Local state computes reconciliation & exceptions    │
│  - Sanitized business metadata sent to server route    │
└──────────────────────────┬─────────────────────────────┘
                           │ POST /api/close/run
                           ▼
┌────────────────────────────────────────────────────────┐
│             Next.js Server API Route                   │
│  - Reads NEATLOGS_API_KEY from environment             │
│  - Zero API key exposure to browser or client bundle   │
│  - Resilient try/catch shield (telemetry never blocks) │
└──────────────────────────┬─────────────────────────────┘
                           │ Neatlogs TypeScript SDK
                           ▼
┌────────────────────────────────────────────────────────┐
│             Neatlogs Ingestion Service                 │
│  - https://ingest.neatlogs.com/v1/traces               │
│  - Span tree with WORKFLOW, AGENT, TOOL, GUARDRAIL     │
└────────────────────────────────────────────────────────┘
```

### Zero-Crash Invariant
> [!IMPORTANT]
> Telemetry failure must **never** disrupt financial execution. All Neatlogs calls are wrapped in defensive error shields. If Neatlogs is offline or rate-limited, LedgerProof logs a quiet fallback and completes the financial close unimpeded.

---

## 3. Span Hierarchy & Taxonomy

Neatlogs traces LedgerProof's 14-stage deterministic finance pipeline under one clean parent workflow:

```
ledgerproof-finance-close [WORKFLOW]
│
├── ingest_financial_data [TOOL]
│   └── Multi-source feeds (bank, GL, invoices, purchase orders)
│
├── detect_schema [TOOL]
│   └── Header inference, column aliasing, data typing
│
├── validate_records [GUARDRAIL]
│   └── Data quality scoring, sign conventions, required fields
│
├── detect_currency [TOOL]
│   └── ISO 4217 symbol extraction (₹, $, €, £, ¥, CHF)
│
├── normalize_transactions [TOOL]
│   └── Minor unit conversion, reporting base currency alignment
│
├── reconcile_transactions [WORKFLOW]
│   └── Deterministic 3-way matching across bank, invoice, and ledger
│
├── detect_exceptions [AGENT]
│   └── Categorization into duplicate, variance, and anomaly queues
│
├── investigate_exception [AGENT: Forensic Investigator]
│   └── Historical vendor analysis, contract terms, GL lookups
│
├── propose_resolution [AGENT: Resolution Agent]
│   └── Journal entry formulation (reclassify, accrue, or write off)
│
├── verify_resolution [GUARDRAIL: Independent Verifier]
│   └── Adversarial cross-check (NEVER permits self-approval)
│
├── apply_autonomy_policy [GUARDRAIL: Autonomy Controller]
│   └── Tiers A-D risk routing and materiality limits
│
├── request_human_review [AGENT: Controller Dispatcher]
│   └── Dossier routing to Controller / CFO queue (Tier C)
│
├── finalize_decision [WORKFLOW]
│   └── Synthesis of approved items, blocked items, and review items
│
└── create_audit_record [TOOL]
    └── Tamper-evident SHA-256 hash commit to Audit Vault
```

---

## 4. Key Scenarios Captured in Traces

### Scenario A: The Judge WOW Moment (Misclassification Prevented)
- **Transaction**: AWS EMEA compute billing ($4,250.00).
- **Proposal**: Resolution Agent suggests account `6100 (Office Supplies)`.
- **Verifier**: **REJECTS**. Historical vendor ledger mandates `6040 (Cloud Infrastructure)`.
- **Autonomy Gate**: Escalates to **TIER D (HARD BLOCK)**. Auto-execution aborted.
- **Trace Value**: Proves that LedgerProof prevents silent financial misstatements.

### Scenario B: Multi-Signal Duplicate Invoice Interception
- **Transaction**: Suspect invoice `INV-2026-8801-DUP` ($8,900.00).
- **Detector**: Multi-signal scoring evaluates exact invoice match (1.0), vendor match (1.0), amount match (1.0), and PO match (1.0).
- **Composite Score**: `0.94` (>= 0.85 threshold).
- **Autonomy Gate**: Hard block. Zero risk of duplicate disbursement.

### Scenario C: PO Variance & Controller Sign-Off
- **Transaction**: Tata Communications invoice of ₹1,03,000 against PO of ₹1,00,000.
- **Variance**: 3.0% vs permitted policy tolerance of 2.0%.
- **Autonomy Gate**: Routes to **TIER C (HUMAN REVIEW REQUIRED)**.
- **Resolution**: Controller signs off with dual-authorization notes.

---

## 5. Non-Sensitive Business Metadata Attached

Every trace includes sanitized, audit-relevant metadata without exposing raw sensitive personal data:
- `workflow`: `"month_end_close"`
- `runtime`: `"local-intelligence"`
- `track`: `"autonomous-office-cfo"`
- `dataset`: `"northstar-demo"`
- `record_count`: `40`
- `currency_count`: `7`
- `exception_count`: `7`
- `processing_mode`: `"local"`
- `API_cost`: `0.00`
- `tamper_evident_hash`: SHA-256 root digest

---

## 6. Configuration & Local Verification

### Step 1: Configure Environment
Add your Neatlogs API key to `.env.local` (server-side only, never in source control):

```bash
NEATLOGS_API_KEY=your_neatlogs_project_api_key_here
```

### Step 2: Run Close Workflow
1. Start LedgerProof:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open `http://localhost:3000/dashboard`.
3. Click the **Run Close** button in the top navigation bar.
4. The backend endpoint `/api/close/run` executes and dispatches the trace.

### Step 3: Inspect in Neatlogs Dashboard
1. Log into your **Neatlogs Dashboard**.
2. Navigate to **Traces**.
3. Locate the `ledgerproof-finance-close` workflow trace.
4. Expand the trace to inspect each child span (`investigate_exception`, `verify_resolution`, `apply_autonomy_policy`).
