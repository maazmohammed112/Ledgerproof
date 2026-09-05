# Built with Agent Orchestrator (AO)

## What is Agent Orchestrator (AO)?
[Agent Orchestrator (AO)](https://github.com/Untrivial-ai/agent-orchestrator) is an enterprise multi-agent software development lifecycle orchestration engine. Instead of relying on a single AI prompt trying to write an entire complex codebase, AO enables a team of specialized autonomous agents to collaborate, isolate changes in Git worktrees, conduct peer reviews, preview web builds in real-time, and run automated CI validation gates.

---

## Why LedgerProof Used AO
LedgerProof is an enterprise autonomous finance control layer designed for **Track 2 — Autonomous Office of the CFO**. Financial systems require absolute mathematical correctness, zero hallucination tolerance, rigorous verification separation, and clean auditability. Building such a platform required:

1. **Separation of Concerns**: Specialized workers for money math, data ingestion, reconciliation, independent verification, and financial UI.
2. **Conflict Prevention via Git Worktrees**: Isolated worktrees allowed the data ingestion worker to parse Excel sheets without clashing with the financial UI worker redesigning the landing page.
3. **Independent Reviewer Loops**: Just as LedgerProof uses an **Independent Verifier Agent** to block incorrect financial postings, AO uses independent **Reviewer Agents** (Finance Reviewer, Security Reviewer, Frontend Reviewer) to inspect code before merge.
4. **Session Supervision**: Real session logs (`docs/AO_SESSION_LOG.md`) and configuration (`.ao/config.json`) track every agent action, test output, and PR approval.
5. **Browser Previews**: Real-time validation of responsive layouts (320px to 1920px), guided tours, and chart rendering.

---

## The AO Development Workflow

```text
LedgerProof Repository
       ↓
Add Project to AO (.ao/config.json)
       ↓
Start Orchestrator (ledgerproof-orchestrator)
       ↓
Decompose Features into Worker Tasks
       ↓
Spawn Specialized Workers (finance-core, data-ingest, verifier, landing-ui)
       ↓
Each Worker Operates in an Isolated Git Worktree
       ↓
Worker Implements Feature & Runs Invariant Tests
       ↓
Pull Request Submitted
       ↓
Independent Reviewer Agent Audits Diff & Invariants
       ↓
Worker Applies Corrections (if flagged)
       ↓
CI Validation Pass (npm run build + pytest)
       ↓
Human Approval Gate
       ↓
Merge to Main
```

---

## Worker & Reviewer Architecture

### 1. Worker Sessions
- **`lp-data-ingestion`**: Implemented `.xlsx` multi-sheet workbook parsing via `xlsx`, column alias inference (`Txn Dt` -> `date`), and data quality validation.
- **`lp-currency-engine`**: Implemented decimal-safe representation (`amountMinorUnits`), ISO 4217 detection, and dual formatting (₹12.5 L / $1.25M).
- **`lp-reconciliation`**: Implemented 3-way matching (Bank <-> GL <-> PO) with multi-signal duplicate scoring.
- **`lp-verifier-agent`**: Implemented the adversarial verification gate preventing self-approval by resolution agents (e.g. vetoing AWS Office Supplies posting).
- **`lp-landing-redesign`**: Built the editorial, light-mode landing page with restrained animations, minimal floating header, and scroll storytelling.

### 2. Reviewer Sessions
- **`Finance Reviewer`**: Verified decimal-safe math, prohibited floating-point rounding errors, and enforced double-entry invariants.
- **`Security Reviewer`**: Audited CSV formula injection sanitization (`=`, `@`, `+`, `-`), sanitized DOM rendering, and confirmed zero client-side API key leakage.
- **`Frontend Reviewer`**: Tested responsive breakpoints (320px to 1920px), verified branded confirmation modals (no browser `confirm()`), and verified shape-aware skeleton states.
- **`Final Reviewer`**: Executed the end-to-end judge flow: landing -> tour -> upload Excel -> reconcile -> verifier rejection -> human approval -> audit vault -> evaluation suite.

---

## Repository Artifacts
- **[AO Configuration](file:///c:/Users/maazm/Downloads/hackthaon/.ao/config.json)**
- **[Agent Conventions & Invariants](file:///c:/Users/maazm/Downloads/hackthaon/AGENTS.md)**
- **[AO Session Log](file:///c:/Users/maazm/Downloads/hackthaon/docs/AO_SESSION_LOG.md)**
- **[AO Architecture](file:///c:/Users/maazm/Downloads/hackthaon/docs/AO_ARCHITECTURE.md)**
- **[AO Reviews Log](file:///c:/Users/maazm/Downloads/hackthaon/docs/AO_REVIEWS.md)**
- **[AO Build Timeline](file:///c:/Users/maazm/Downloads/hackthaon/docs/AO_BUILD_TIMELINE.md)**
