# LedgerProof — Enterprise Architecture Specification

## Product Vision
**LedgerProof** is the **Autonomous Finance Control Layer** designed for **Track 2 — Autonomous Office of the CFO**.

Tagline: **Finance agents should prove their work.**  
Mission: **Reconcile, investigate, verify, and close — with evidence behind every decision.**

---

## 1. End-to-End Financial Control Workflow

```mermaid
flowchart TD
    DS[Data Sources<br/>CSV / XLSX / ERP / Manual / Connectors] --> ING[Ingestion & Multi-Sheet Workbook Parser]
    ING --> NORM[Schema Mapping & Multi-Currency Normalization]
    NORM --> DQ[Data Quality Engine & Validation Gate]
    DQ --> FC[Finance Core & Chart of Accounts]
    FC --> REC[3-Way Reconciliation Matching]
    REC --> EXC[Exception & Anomaly Detection]
    EXC --> INV[Investigator Agent: Evidence Collection]
    INV --> RES[Resolution Agent: Action Proposal]
    RES --> VER[Independent Verifier: Adversarial Audit]
    VER --> GATE[Deterministic Autonomy Gate]
    
    GATE -->|Verified Low-Risk| AUTO[Auto-Execute: Direct Ledger Post]
    GATE -->|Vetoed / High Materiality| HUMAN[Human Review Center: Controller Workspace]
    
    AUTO --> AUDIT[Audit Vault: Immutable Append-Only Ledger]
    HUMAN --> AUDIT
    
    AUDIT --> EVAL[Evaluation Suite: Accuracy & Latency Benchmarks]
    EVAL --> LAB[Agent Lab: Continuous Policy & Prompt Improvement]
```

---

## 2. Agent Orchestrator (AO) as Development Control Plane

```mermaid
graph LR
    subgraph AO_Development_Control_Plane["Agent Orchestrator (AO) Development Layer"]
        ORCH["AO Orchestrator"] --> W1["Worker: finance-core"]
        ORCH --> W2["Worker: data-ingestion"]
        ORCH --> W3["Worker: independent-verifier"]
        ORCH --> W4["Worker: landing-ui"]
        
        W1 -.-> R1["Finance Reviewer"]
        W2 -.-> R2["Security Reviewer"]
        W3 -.-> R3["Policy Reviewer"]
        W4 -.-> R4["Frontend Reviewer"]
        
        R1 & R2 & R3 & R4 --> PREV["Browser Preview & CI Validation"]
    end

    PREV ==> CODEBASE["LedgerProof Production Application"]
```

---

## 3. Implemented Hackathon Architecture vs. Future Enterprise Architecture

### Implemented Today (Hackathon Local-First Production Build)
- **Frontend Layer**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons, Lucide geometric brand marks.
- **Client Storage**: In-Memory Reactive Store with LocalStorage synchronization and Repository pattern abstractions.
- **Ingestion**: Client-side streaming `.xlsx` workbook parser (`xlsx`) and CSV parser with column alias heuristics.
- **Finance Engine**: Deterministic multi-signal duplicate detection, 3-way reconciliation (Bank <-> GL <-> PO), statistical anomaly detection, and decimal minor-unit money math.
- **AI Runtime**: Local Intelligence (Default, 100% offline, zero API keys required) with optional local OpenAI-compatible endpoint adapter (Ollama/vLLM).
- **Control & Audit**: Real-time Finance Control Plane with workflow detail drawers, dedicated Human Review workspace, and JSON-exportable Audit Vault.
- **Evaluation**: 80-case ground-truth benchmark suite with version comparison and failure taxonomy.

### Future Enterprise Production Architecture (Scalable to 10M+ Records)

```mermaid
flowchart TD
    CLIENT[Web Client / Mobile App] --> APIGW[Enterprise API Gateway / Envoy]
    APIGW --> AUTH[Enterprise IAM / Okta / SAML 2.0]
    
    AUTH --> FPS[Finance Processing Service: Go / Rust]
    AUTH --> ARS[Agent Runtime Service: Python / Ray]
    AUTH --> PS[Policy & Governance Service: Open Policy Agent]
    AUTH --> ES[Evaluation & Benchmarking Service]
    
    FPS --> QUEUE[Distributed Event Queue: Apache Kafka / RabbitMQ]
    ARS --> QUEUE
    
    QUEUE --> PG[(Transactional DB: PostgreSQL with TimescaleDB)]
    QUEUE --> S3[(Object Store: AWS S3 / GCS for Spreadsheets)]
    QUEUE --> WH[(Data Warehouse: Snowflake / BigQuery)]
    QUEUE --> AUDIT_VAULT[(Immutable Ledger: QLDB / Hyperledger)]
```

*Note: For the hackathon submission, all core workflows execute deterministically in the local application bundle to guarantee 100% judge reliability without depending on third-party cloud infrastructure.*
