# Security & Financial Integrity Architecture

LedgerProof treats financial safety, data integrity, and policy compliance as non-negotiable architectural requirements.

---

## 1. Zero Cloud API Key Requirement & Local-First Processing
- **Offline By Default**: Core finance intelligence, fuzzy matching, duplicate scoring, and verification logic execute locally without making external network calls.
- **No Client Credential Exposure**: No cloud LLM API keys (OpenAI, Anthropic, Gemini) are ever stored or bundled into client code.
- **Optional Local LLM Endpoint**: If the user configures a local LLM via Settings (e.g. `http://localhost:11434`), requests are routed strictly through local network protocols or backend environment variables.

---

## 2. Ingestion Security & File Sanitization
- **Spreadsheet Macro Prohibition**: The ingestion parser (`xlsx`) only reads cell values and structural data; it strictly refuses to evaluate or run Excel VBA macros or embedded OLE objects.
- **CSV Formula Injection Neutralization (CWE-1236)**:
  - Financial data containing values starting with `=`, `@`, `+`, `-`, or tab characters can trigger command execution when opened in Microsoft Excel.
  - LedgerProof's export utilities automatically sanitize string cells by prefixing them with a single quote (`'`), ensuring formulas are treated as plain text by spreadsheets.
- **Input Validation Gates**:
  - File size threshold: Max 50 MB per workbook in browser memory.
  - Row ceiling: Pagination and virtualization protect the browser thread from unbounded row counts.
  - MIME type and file extension verification (`.xlsx`, `.xls`, `.csv`, `.json`).

---

## 3. Financial Safety Invariants
1. **Separation of Proposal & Verification**: The Resolution Agent cannot approve its own suggested action. The Independent Verifier evaluates policies (`AP-VARIANCE-02`, `GL-MAPPING-04`, `TREASURY-AUTH-01`) independently.
2. **Deterministic Autonomy Gate**: LLM confidence scores alone cannot trigger autonomous disbursement. Execution is gated by hard-coded deterministic thresholds:
   - High materiality items (> $10,000 / ₹10,00,000) **always require human sign-off**.
   - Verifier rejection **always blocks automated execution**.
   - Missing supporting evidence **always escalates to a human reviewer**.
3. **Decimal-Safe Financial Arithmetic**: Amounts are tracked in minor currency units (`BigInt` / integer cents) to prevent binary floating-point IEEE-754 calculation drift.

---

## 4. Immutable Audit Vault
- Every material action (import, auto-reconcile, exception flagged, verifier rejection, human approval, policy edit) generates an immutable, append-only audit event in the **Audit Vault**.
- Each record includes:
  - `event_id`: Unique UUIDv4 identifier.
  - `timestamp`: UTC ISO-8601 timestamp.
  - `user`: Acting user or agent ID.
  - `source_record`: Target transaction or invoice ID.
  - `before_state` & `after_state`: Complete state diff.
  - `decision`: Action taken (`VERIFIED`, `REJECTED`, `MANUALLY_APPROVED`).
  - `policy`: Applicable corporate compliance policy.
  - `evidence`: Cryptographically traceable IDs and file references.
