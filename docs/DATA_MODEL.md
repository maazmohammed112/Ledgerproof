# LedgerProof Data Model & Storage Architecture

LedgerProof's domain models are structured for mathematical precision, multi-currency accounting, and future migration to enterprise cloud warehouses (PostgreSQL, Snowflake, BigQuery).

---

## 1. Core Domain Models

### 1.1 Money Model & Decimal Integrity
To avoid IEEE-754 binary floating-point errors (e.g. `0.1 + 0.2 = 0.30000000000000004`), monetary amounts are stored in minor currency units and normalized into reporting currency:

```typescript
export interface MoneyAmount {
  amountMinorUnits: bigint;        // e.g. 10300000 for INR 103,000.00
  currency: SupportedCurrency;     // ISO 4217 code (INR, USD, EUR, GBP, CHF, etc.)
  decimals: number;                // 2 for USD/INR/EUR, 0 for JPY
  originalAmount: number;          // Float convenience for display only
  reportingAmount: number;         // Normalized into reporting currency (USD)
  reportingCurrency: SupportedCurrency;
  fxRate: number;                  // Reference FX rate applied
  fxSource: string;                // e.g., 'Reference FX Table (Offline Deterministic)'
  fxDate: string;                  // YYYY-MM-DD
}
```

### 1.2 Transaction Model
```typescript
export interface Transaction {
  id: string;                      // Unique transaction identifier (e.g., TRX-IN-8821)
  date: string;                    // ISO-8601 YYYY-MM-DD
  description: string;             // Raw transaction narration
  amount: number;                  // Normalized reporting amount
  currency: SupportedCurrency;     // Reporting currency
  type: 'DEBIT' | 'CREDIT';        // Book entry type
  gl_account: string;              // Chart of accounts code (e.g., 6100)
  status: MatchStatus;             // RECONCILED, EXCEPTION, BLOCKED, etc.
  risk: RiskTier;                  // TIER_A (Low) to TIER_D (Critical)
  vendor_id?: string;              // Resolved master vendor ID
  vendor_name?: string;            // Normalized legal vendor name
  invoice_ref?: string;            // Matched invoice reference
  po_ref?: string;                 // Matched purchase order reference
  account_name?: string;           // Bank account or ledger label
  amount_original?: number;        // Raw currency amount
  currency_original?: SupportedCurrency;
  normalized_amount?: number;      // Converted amount in USD
  reporting_currency?: SupportedCurrency;
  fx_rate?: number;
  fx_rate_source?: string;
  fx_rate_date?: string;
  notes?: string;
}
```

### 1.3 3-Way Reconciliation Matching
```typescript
export interface ReconciliationMatch {
  bankTransactionId: string;
  glVoucherId?: string;
  invoiceId?: string;
  purchaseOrderId?: string;
  category: 'EXACT_MATCH' | 'HIGH_CONFIDENCE_MATCH' | 'PARTIAL_MATCH' | 'UNMATCHED' | 'POSSIBLE_DUPLICATE' | 'POLICY_EXCEPTION';
  confidenceScore: number;         // 0.0 to 1.0
  varianceAmount: number;
  variancePercentage: number;
  auditTrail: string[];
}
```

### 1.4 Audit Record
```typescript
export interface AuditRecord {
  event_id: string;                // UUIDv4
  timestamp: string;               // ISO-8601 UTC
  user: string;                    // User or agent identifier
  source_record: string;           // Entity ID affected
  event_type: string;              // RECONCILE, EXCEPTION_FLAGGED, VETO, MANUAL_APPROVE
  previous_state: string;          // JSON snapshot or summary
  new_state: string;               // JSON snapshot or summary
  decision: string;                // Outcome taken
  policy?: string;                 // Corporate policy violated or validated
  agent?: string;                  // Agent name (e.g., Independent Verifier)
  agent_version?: string;          // e.g., v2.4
  verification?: string;           // VERIFIED / REJECTED
  risk?: RiskTier;
  human_decision?: string;         // APPROVED / REJECTED with notes
  final_action?: string;           // POSTED_TO_LEDGER / HELD_FOR_AUDIT
}
```

---

## 2. Storage Abstraction Layer
The application architecture abstracts storage behind repository interfaces, ensuring zero coupling between UI/business logic and the client storage layer:

```typescript
export interface ITransactionRepository {
  getById(id: string): Promise<Transaction | null>;
  list(filter?: TransactionFilter): Promise<Transaction[]>;
  create(tx: Transaction): Promise<Transaction>;
  update(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  delete(id: string): Promise<boolean>;
}
```

- **Hackathon Mode**: Backed by high-performance browser in-memory store and reactive state with localStorage backup.
- **Enterprise Mode**: Easily replaced by `PostgresTransactionRepository` or `SnowflakeRepository` without rewriting UI components or finance reasoning engines.
