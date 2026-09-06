# AGENTS.md — Agent Orchestrator (AO) Project Guidelines
# LedgerProof: Autonomous Finance Control Layer (Track 2 — Autonomous Office of the CFO)

This document establishes the universal development conventions, financial safety invariants, architectural boundaries, and reviewer criteria for all autonomous worker sessions and reviewer agents operating inside the Agent Orchestrator (AO) lifecycle.

---

## 1. Project Architecture & Mission

LedgerProof is the **Autonomous Finance Control Layer** for enterprise financial close, reconciliation, exception investigation, independent verification, and audit evidence.
- **Tagline**: *Finance agents should prove their work.*
- **Sub-tagline**: *Reconcile, investigate, verify, and close — with evidence behind every decision.*
- **Core Principle**: AI reasons over multi-source forensic evidence; deterministic code calculates arithmetic and risk gates; human controllers sign off on material transactions.

```
Financial Data Ingestion (CSV / XLSX / Connectors)
      ↓
Smart Schema Detection & Multi-Currency Normalization
      ↓
Data Quality Scoring & Pre-Validation
      ↓
Deterministic 3-Way Reconciliation
      ↓
Forensic Investigation Agent
      ↓
Resolution Agent (Formulates Proposal)
      ↓
Independent Adversarial Verifier (Must Never Allow Self-Approval)
      ↓
Deterministic Autonomy Gate (Tiers A-D)
   ↙         ↘
Execute     Human Review
   ↓             ↓
Immutable SHA-256 Audit Vault
      ↓
Continuous Evaluation & Failure Taxonomy
```

---

## 2. Financial Safety Rules (Zero-Tolerance Invariants)

1. **Resolution Agents Never Approve Themselves**:
   - Under no circumstances may a reasoning agent commit or auto-execute its own proposed journal entry or variance approval.
   - All proposed actions must route to the `Independent Verifier` and pass through the `Autonomy Gate`.
2. **Decimal-Safe Financial Arithmetic**:
   - Never use floating-point arithmetic for primary financial balances or variance percentages.
   - Financial amounts must be stored in exact decimal or minor units (cents/paise) with explicit ISO 4217 currency tags.
3. **No Fabricated Data or Phony AI Results**:
   - All outcomes demonstrated in the application must stem from actual ingested records, deterministic scoring rules, or verifiable agent evaluation runs.
   - Do not display hardcoded dummy numbers that ignore user inputs.
4. **Offline First / Zero Paid API Requirement**:
   - The default runtime is `LedgerProof Local Intelligence`.
   - The platform must function with 100% fidelity without an external API key or internet connection.
   - Optional local LLM adapters (`http://localhost:11434` Ollama) and external providers are isolated behind an abstract `AgentRuntime` interface.
5. **Deterministic Materiality Limits**:
   - Transactions >= $10,000 (or ₹10,00,000 equivalent) strictly require human controller sign-off (Tier C).
   - High duplicate confidence (>= 85%) or verifier disagreement triggers an immediate hard block (Tier D).

---

## 3. Design System & Visual Identity Rules

1. **Light Mode Exclusivity**:
   - The application is strictly 100% Light Mode.
   - Palette: Warm neutral background (`#F9F8F6`), clean card backgrounds (`#FFFFFF`), subtle borders (`#E5E3DD`), muted lavender accents (`#4F46E5`), verified green (`#15803D`), blocked crimson (`#B91C1C`).
2. **Typography**:
   - Editorial headings: *DM Serif Display* / Google Fonts Serif.
   - UI & Tabular Numbers: *Inter*, with `font-variant-numeric: tabular-nums` for all financial tables and balances.
3. **Restrained Visual Language**:
   - **FORBIDDEN**: Stars, sparkles, magic wands, robot heads, generic AI brain icons, neon gradients, loud party confetti, or pseudo-3D charts.
   - **REQUIRED**: Clean geometric icons (Lucide), micro-animations (Tailwind transitions), clear evidence chips, accessible color contrasts (WCAG AAA/AA).
4. **Brand Logo Mark**:
   - Geometric vector identity combining parallel ledger rows and a precision verification notch forming an abstract `L`.

---

## 4. Coding & Architecture Conventions

- **Next.js 14 App Router**: React 18, TypeScript strict mode, Tailwind CSS.
- **Python 3.12 Backend**: FastAPI, Pydantic v2 schemas, Pytest test suites.
- **Client Storage Abstraction**:
  - IndexedDB for high-volume datasets (transactions, invoices, audit events).
  - LocalStorage for lightweight UI preferences (selected workspace, currency locale, tour completion).
  - Decoupled Repository Pattern allowing future migration to PostgreSQL/Snowflake.
- **Error Handling**:
  - Always explain what failed, why, and provide a clear remediation action (e.g. "Missing amount column — Choose column manually").
  - Never throw unhandled exceptions to the UI.
- **Skeleton Loading**:
  - Implement shape-aware skeleton placeholders that closely mirror actual tables and cards during asynchronous processing.

---

## 5. Responsive & Accessibility Benchmarks

- **Supported Breakpoints**: Every screen and modal must be fully usable without horizontal overflow across:
  `320px`, `360px`, `375px`, `390px`, `430px`, `768px`, `1024px`, `1280px`, `1440px`, `1920px`.
- **Tables**: Contained horizontal scroll or responsive card transformation on mobile viewports.
- **Sidebar**: Desktop collapsible, mobile bottom/drawer overlay with automatic focus trapping and dismiss gestures.
- **Keyboard & Screen Readers**: All buttons and interactive rows must support Tab navigation, visible focus rings, and explicit `aria-label` attributes.

---

## 6. Verification & Test Commands

- **Backend Pytest**:
  ```powershell
  $env:PYTHONPATH="c:\Users\maazm\Downloads\hackthaon"
  & "C:\Users\maazm\AppData\Local\Programs\Python\Python312\python.exe" -m pytest tests -v
  ```
- **Frontend Build**:
  ```powershell
  cd frontend
  npm run build
  ```
- **Frontend Dev**:
  ```powershell
  cd frontend
  npm run dev
  ```

---

## 7. Observability & Neatlogs Conventions

- **Workflow Naming**: Root close workflow must be named `ledgerproof-finance-close`.
- **Span Kinds**: Use official `WORKFLOW`, `AGENT`, `TOOL`, and `GUARDRAIL` span kinds.
- **Zero-Crash Resilience**: Telemetry failures must NEVER interrupt or crash financial execution. Always wrap SDK calls in defensive try/catch blocks.
- **Business Metadata**: Attach safe, non-sensitive audit metadata (record counts, exception counts, currency counts, $0 external API cost).

---

## 8. Git & Security Hygiene

- **Zero Hardcoded Secrets**: `NEATLOGS_API_KEY` and credentials must NEVER be committed to Git, README, bundle, or client storage. Use `.env.local` (gitignored). Only commit `.env.example` with empty values.
- **Formulas & Inputs**: Sanitize all CSV/XLSX cell values against formula injection (`=`, `@`, `+`, `-`).
- **Chain of Thought**: Never expose raw model reasoning traces to unauthorized external endpoints.
