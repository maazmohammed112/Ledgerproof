# AO Architecture & Multi-Agent Collaboration

This document outlines how the **Agent Orchestrator (AO)** environment was integrated into LedgerProof's software delivery process.

---

## 1. Orchestration Topology

```mermaid
graph TD
    subgraph AO_Control_Plane["AO Orchestrator (Control Plane)"]
        CONF[".ao/config.json & AGENTS.md"]
        SCHED["Task Scheduler & Dependency Graph"]
        PREV["Browser Preview Engine (Port 3000)"]
    end

    subgraph Workers["Specialized Worker Worktrees"]
        W_CORE["Worker: finance-core<br/>(money.ts, financeEngine.ts)"]
        W_INGEST["Worker: data-ingestion<br/>(DataSourcesView.tsx, xlsx)"]
        W_VERIF["Worker: independent-verifier<br/>(DecisionTrace, Policies)"]
        W_UI["Worker: frontend-redesign<br/>(LandingPage, ControlPlane)"]
    end

    subgraph Reviewers["Independent Reviewer Agents"]
        R_FIN["Finance Reviewer<br/>(Arithmetic, Double-entry, FX)"]
        R_SEC["Security Reviewer<br/>(Injection, Key Leakage, Ingestion)"]
        R_UI["UI/A11y Reviewer<br/>(Responsive, Skeletons, Modals)"]
    end

    CONF --> SCHED
    SCHED -->|Spawn| W_CORE
    SCHED -->|Spawn| W_INGEST
    SCHED -->|Spawn| W_VERIF
    SCHED -->|Spawn| W_UI

    W_CORE -->|Submit PR| R_FIN
    W_INGEST -->|Submit PR| R_SEC
    W_VERIF -->|Submit PR| R_FIN
    W_UI -->|Submit PR| R_UI

    R_FIN -->|Approve & Verify| PREV
    R_SEC -->|Approve & Verify| PREV
    R_UI -->|Approve & Verify| PREV
    PREV -->|CI Pass| MAIN[Main Git Branch]
```

---

## 2. Worktree Isolation Mechanism

In standard single-agent systems, file edits frequently step on each other or overwrite partial work. In AO:
- Each worker executes inside a dedicated Git worktree (`git worktree add ../worktree-name branch-name`).
- Edits are committed incrementally with semantic commit messages.
- Reviewer agents check the pull request diff against the workspace constraints defined in `AGENTS.md`.
- Once verified, the pull request merges into `main`, triggering the build pipeline.

---

## 3. Reviewer Protocols
Reviewer agents enforce strict financial and engineering standards:
1. **Double Verification Rule**: Code that generates financial resolutions cannot also approve them. The verifier component must remain independent.
2. **Formula Injection Neutralization**: Any CSV export must escape leading `=`, `@`, `+`, or `-` characters with a leading single quote `'`.
3. **Locale-Aware Numerals**: Numeric inputs and displays must support both Indian grouping (`12,50,000`) and International grouping (`1,250,000`) without corrupting base minor unit values.
