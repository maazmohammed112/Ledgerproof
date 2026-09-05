# Devpost Submission: LedgerProof

## Project Title
**LedgerProof — Self-Verifying, Self-Improving Autonomous Finance System**

## Track
**Track 2 — Autonomous Office of the CFO**

---

## Inspiration
Finance teams spend countless hours reconciling bank statements, reviewing purchase orders, checking duplicate invoices, and correcting misclassified general ledger accounts. While generative AI agents can automate much of this drudgery, CFOs and Controllers cannot blindly trust an autonomous agent with their general ledger. One unverified LLM assumption can lead to audit failures, restatements, or duplicate vendor payouts.

We asked: **What if an autonomous finance system doesn't just make decisions — but independently verifies and proves them before touching the books?**

---

## What It Does
LedgerProof is an autonomous financial close and exception resolution system built under the core principle: **“AI reasons. Code calculates. Humans judge exceptional risk.”**

1. **Autonomous Month-End Close**: Ingests bank records, AP invoices, and purchase orders, auto-reconciling clean items within deterministic policy limits.
2. **Multi-Source Exception Forensics**: An **Investigation Agent** cross-references vendor master agreements, contracts, and 12-month historical GL charts.
3. **Resolution Without Self-Approval**: A **Resolution Agent** proposes accounting treatments but is programmatically blocked from approving its own work.
4. **Independent Verifier Agent**: An adversarial agent independently checks arithmetic calculations, policy compliance, and accounting classifications. If it disagrees with the Resolution Agent, execution is **immediately blocked**.
5. **Deterministic Autonomy Gate (Tiers A-D)**: Strict code rules route immaterial items to auto-execution (Tier A/B), high-dollar or out-of-policy items to Controller sign-off (Tier C), and duplicates or disagreements to hard blocks (Tier D).
6. **The Judge Wow Moment**: In our deliberate benchmark scenario, the Resolution Agent erroneously proposes classifying an AWS compute charge as "Office Supplies". The Independent Verifier cross-references 48 months of history and the AWS Master Contract, flags `VERIFICATION FAILED`, and prevents the misposting in real time!
7. **Agent Lab & Self-Improvement Loop**: Benchmarks agents against 40 ground-truth finance cases, classifies failures into a formal taxonomy, and optimizes prompts from V1 (82.5% accuracy, 5.0% false approvals) to V2 (97.5% accuracy, 0.0% false approvals).
8. **Human-Controlled Policy Learning**: Suggests policy improvements (e.g., raising CloudWorks tolerance to 5%) based on observed manual approvals, active only after explicit Controller sign-off.
9. **Try Your Data**: Complete drag-and-drop CSV importer with semantic auto-mapping and manual transaction builder.

---

## How We Built It
- **Autonomous Orchestration (AO)**: Engineered using 10 isolated AO workstreams (`finance-core`, `reconciliation`, `agents`, `verifier`, `agent-lab`, `evals`, `frontend`, `observability`, `reviewer`, `demo-polish`).
- **Backend**: FastAPI (Python 3.12), Pydantic schemas, and Pytest test suite.
- **Frontend**: Next.js 14, React 18, TypeScript, and Tailwind CSS.
- **Design System**: Strict Light Mode Only editorial visual hierarchy (`#F7F6F2` primary background, `#FCFBF8` cards, `#151515` text, `#5046E5` accent, Google Fonts *DM Serif Display* & *Inter*).
- **Storage**: Browser Local / IndexedDB persistence with clean repository boundaries prepared for enterprise database migration.

---

## Challenges
1. **Preventing Agent Self-Approval**: Ensuring the Resolution Agent could never bypass the Independent Verifier or Autonomy Gate required strict architectural decoupling.
2. **Deterministic vs. Generative Boundary**: Balancing LLM semantic reasoning with hard deterministic arithmetic (floating-point precision, duplicate percentage scoring, policy threshold limits).
3. **Zero Fabricated Numbers**: Committing to 100% genuine benchmark figures across our 40-case ground-truth evaluation suite.

---

## Accomplishments We're Proud Of
- Designing and implementing a production-grade multi-agent architecture with zero mock screens—every button, modal, and tool call functions end-to-end.
- The **Judge Wow Moment** demonstrating two agents disagreeing and preventing a real financial misposting.
- Measuring a true 0.0% false auto-approval rate in Agent V2 due to the Independent Verifier layer.
- Creating an editorial Light Mode UI that feels like an early-stage funded SaaS product rather than a template.

---

## What We Learned
Autonomous finance requires adversarial checks. Just as human accounting organizations rely on separation of duties between preparers and approvers, AI finance architectures must enforce separation of duties between Resolution Agents and Independent Verifiers.

---

## What's Next
- Direct integrations with QuickBooks Online, NetSuite SuiteTalk, and SAP ERP.
- Production PostgreSQL / Supabase storage migration.
- Multi-currency real-time FX spot revaluation feeds.

---

## Built With
- Autonomous Orchestration (AO)
- FastAPI
- Python 3.12
- Pydantic
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Pytest
- Lucide Icons
- Canvas Confetti
