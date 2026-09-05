# LedgerProof — Build & Orchestration Process

This document details the exact engineering and build lifecycle utilized to build LedgerProof from an early prototype into a production-grade Autonomous Finance Control Layer for **Track 2 — Autonomous Office of the CFO**.

---

## 1. The AO Orchestration Lifecycle

Rather than relying on a single monolith coding pass, the repository was developed under **Agent Orchestrator (AO)** using structured task decomposition, isolated worker environments, and mandatory review gates:

```mermaid
flowchart TD
    ORCH[AO Orchestrator] --> DECOMP[Decompose Task & Scope Worktree]
    DECOMP --> W1[Worker: finance-core]
    DECOMP --> W2[Worker: data-ingestion]
    DECOMP --> W3[Worker: independent-verifier]
    DECOMP --> W4[Worker: landing-ui]
    
    W1 --> WT1[Isolated Git Worktree: worktree-money]
    W2 --> WT2[Isolated Git Worktree: worktree-ingest]
    W3 --> WT3[Isolated Git Worktree: worktree-verifier]
    W4 --> WT4[Isolated Git Worktree: worktree-landing]
    
    WT1 --> T1[Unit & Invariant Tests]
    WT2 --> T2[Schema Validation Tests]
    WT3 --> T3[Adversarial Rejection Tests]
    WT4 --> T4[Responsive Viewport Tests]
    
    T1 --> PR1[Pull Request & Diff]
    T2 --> PR2[Pull Request & Diff]
    T3 --> PR3[Pull Request & Diff]
    T4 --> PR4[Pull Request & Diff]
    
    PR1 --> REV1[Finance Reviewer Agent]
    PR2 --> REV2[Frontend Reviewer Agent]
    PR3 --> REV3[Security & Policy Reviewer]
    PR4 --> REV4[Design & A11y Reviewer]
    
    REV1 --> FIX1[Automated Feedback & Fixes]
    REV2 --> FIX2[Automated Feedback & Fixes]
    REV3 --> FIX3[Automated Feedback & Fixes]
    REV4 --> FIX4[Automated Feedback & Fixes]
    
    FIX1 --> MERGE[Merge to main branch]
    FIX2 --> MERGE
    FIX3 --> MERGE
    FIX4 --> MERGE
    
    MERGE --> CI[Static Next.js Build & Integration QA]
```

---

## 2. Reviewer Gates & Invariants

Under `AGENTS.md`, every PR was audited against 5 non-negotiable gates:

1. **Gate 1 — Functional Completeness**: No mocked static screens; all CRUD operations, file imports, and state propagation must alter memory and persistent storage.
2. **Gate 2 — Financial Integrity**: No floating-point math for money (`BigInt` / minor units used); currency symbols must not override explicit currency metadata; Indian (`₹12.5 L`) and International (`$1,250,000`) formats supported without changing numeric precision.
3. **Gate 3 — Verification Safety**: The **Resolution Agent may NEVER approve its own actions**. An Independent Verifier must validate evidence against policy before any action reaches the Autonomy Gate.
4. **Gate 4 — UI & Editorial Restraint**: No emoji, no star/sparkle icons, no robot heads, no loud neon glows. Light warm editorial financial palette (slate, muted lavender, warm neutral).
5. **Gate 5 — Offline Reliability**: Zero external API dependencies required for the default demo. The deterministic engine processes real uploaded records deterministically.

---

## 3. Local Development & Verification

### Prerequisites
- Node.js >= 18 (Tested on v24.19.0)
- Python >= 3.10 (Tested on Python 3.12)
- Git

### Commands
```bash
# 1. Install frontend dependencies
cd frontend
npm install

# 2. Verify compilation & types
npm run build

# 3. Start local development server
npm run dev
# Running at http://localhost:3000

# 4. Backend tests (pytest)
cd ..
python -m pytest tests -v
```

All 21 backend tests pass, and `npm run build` succeeds with zero warnings and static bundle optimization.
