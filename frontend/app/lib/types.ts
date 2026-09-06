import { SupportedCurrency, NumberingLocale } from './money';
export type { SupportedCurrency, NumberingLocale };

export type RiskTier = 'TIER_A' | 'TIER_B' | 'TIER_C' | 'TIER_D';

export type VerifierStatus = 'VERIFIED' | 'REJECTED' | 'INSUFFICIENT_EVIDENCE' | 'HUMAN_REVIEW_REQUIRED';

export type MatchStatus = 
  | 'RECONCILED' 
  | 'AUTO_RECONCILED' 
  | 'EXCEPTION' 
  | 'BLOCKED' 
  | 'PENDING' 
  | 'RESOLVED' 
  | 'HUMAN_REVIEW_REQUIRED' 
  | 'MANUALLY_APPROVED';

export type ExceptionCategory = 
  | 'DUPLICATE_INVOICE'
  | 'PO_VARIANCE'
  | 'GL_MISCLASSIFICATION'
  | 'MISSING_DOCUMENT'
  | 'UNSUPPORTED_VENDOR'
  | 'FX_VARIANCE'
  | 'MISSING_RECEIPT';

export interface EvidenceItem {
  id: string;
  source_type: string;
  title: string;
  details: string;
  relevance_score: number;
  data?: Record<string, any>;
}

export interface ToolCallRecord {
  tool_name: string;
  input_params: Record<string, any>;
  output_summary: string;
  duration_ms: number;
  timestamp?: string;
}

export interface InvestigationResult {
  summary: string;
  root_cause: string;
  evidence_gathered: EvidenceItem[];
  missing_evidence: string[];
  confidence: number;
  recommended_action: string;
  tools_used: ToolCallRecord[];
}

export interface ResolutionResult {
  proposed_action: string;
  explanation: string;
  target_account?: string;
  original_account?: string;
  calculated_variance_pct?: number;
  journal_entry_suggestion?: Record<string, any>;
  confidence: number;
  tools_used: ToolCallRecord[];
}

export interface VerifierResult {
  status: VerifierStatus;
  arithmetic_valid: boolean;
  policy_compliant: boolean;
  classification_valid: boolean;
  materiality_assessed: boolean;
  notes: string;
  blocking_reasons: string[];
  disagreement_detected: boolean;
  disagreement_details?: string;
  corrected_action?: string;
  corrected_account?: string;
}

export interface AutonomyGateResult {
  tier: RiskTier;
  reason: string;
  can_auto_execute: boolean;
  requires_human_approval: boolean;
  is_blocked: boolean;
  deterministic_checks: Record<string, any>;
}

export interface DecisionTrace {
  trace_id: string;
  transaction_id: string;
  timestamp: string;
  investigation: InvestigationResult;
  resolution: ResolutionResult;
  verifier: VerifierResult;
  autonomy_gate: AutonomyGateResult;
  final_status: string;
  all_tool_calls: ToolCallRecord[];
}

export interface Transaction {
  id: string;
  workspaceId?: string;
  date: string;
  vendor: string;
  description: string;
  amount: number;                  // normalized reporting amount
  currency: SupportedCurrency;     // reporting currency
  type: 'DEBIT' | 'CREDIT';
  gl_account: string;
  status: MatchStatus;
  invoice_ref?: string;
  po_ref?: string;
  category?: ExceptionCategory;
  confidence: number;
  risk_tier?: RiskTier;
  trace_id?: string;
  notes?: string;

  // Multi-Currency Intelligence fields
  amount_original?: number;
  currency_original?: SupportedCurrency;
  fx_rate?: number;
  fx_rate_source?: string;
  fx_rate_date?: string;
}

export interface Vendor {
  id: string;
  workspaceId?: string;
  name: string;
  normalized_name: string;
  tax_id: string;
  country: string;
  default_gl: string;
  payment_terms: string;
  risk_rating: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'FLAGGED' | 'INACTIVE';
  total_spend: number;
}

export interface PurchaseOrder {
  id: string;
  workspaceId?: string;
  po_number: string;
  vendor: string;
  issue_date: string;
  amount: number;
  currency: SupportedCurrency;
  status: 'APPROVED' | 'PARTIALLY_BILLED' | 'CLOSED' | 'CANCELLED';
  department: string;
  permitted_variance_pct: number;
}

export interface Invoice {
  id: string;
  workspaceId?: string;
  invoice_number: string;
  vendor: string;
  date: string;
  amount: number;
  currency: SupportedCurrency;
  po_number?: string;
  gl_account: string;
  status: 'PAID' | 'PENDING_MATCH' | 'DISPUTED' | 'VOID';
}

export interface Policy {
  id: string;
  workspaceId?: string;
  name: string;
  category: string;
  description: string;
  rule_expression: string;
  threshold_value: number;
  is_active: boolean;
  is_suggested?: boolean;
  source?: string;
  version: number;
}

export interface PolicyProposal {
  proposal_id: string;
  policy_id: string;
  title: string;
  current_rule: string;
  suggested_rule: string;
  reasoning: string;
  supporting_evidence: string[];
  projected_manual_reviews_reduced_pct: number;
  requires_human_approval: boolean;
  status: string;
}

export interface AuditRecord {
  id?: string;
  decision_id: string;
  workspaceId?: string;
  trace_id: string;
  timestamp: string;
  transaction_id: string;
  vendor: string;
  amount: number;
  currency?: SupportedCurrency;
  agent_name: string;
  agent_version: string;
  model: string;
  tools_used: string[];
  evidence_ids: string[];
  policy_ids: string[];
  proposed_action: string;
  verifier_status: VerifierStatus;
  confidence: number;
  risk_level: string;
  autonomy_tier: RiskTier;
  human_required: boolean;
  human_decision: string;
  human_notes?: string;
  final_action: string;
  ledger_impact_summary: string;
}

export interface EvaluationReport {
  run_id: string;
  agent_version: string;
  timestamp: string;
  total_cases: number;
  passed_cases: number;
  accuracy: number;
  false_auto_approval_rate: number;
  escalation_precision: number;
  completion_rate: number;
  average_latency_ms: number;
  estimated_cost_usd: number;
  failure_breakdown: Record<string, number>;
  failed_case_ids: string[];
}

export type AgentControlStatus = 
  | 'IDLE'
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_FOR_DATA'
  | 'WAITING_FOR_HUMAN'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'FAILED_VERIFICATION'
  | 'BLOCKED_BY_POLICY'
  | 'READY_TO_EXECUTE'
  | 'COMPLETED'
  | 'FAILED';

export interface ControlPlaneAgentRun {
  id: string;
  agent_name: string;
  role: string;
  status: AgentControlStatus;
  progress_pct: number;
  current_task: string;
  items_processed: number;
  total_items: number;
  exceptions_found: number;
  started_at: string;
  duration_ms: number;
  verifier_result?: string;
  evidence_count: number;
  tools_invoked: string[];
}

export interface DataSourceItem {
  id: string;
  workspaceId?: string;
  name: string;
  category: 'BANK' | 'GENERAL_LEDGER' | 'INVOICES' | 'PURCHASE_ORDERS' | 'VENDOR_MASTER';
  format: 'CSV' | 'XLSX' | 'CONNECTOR' | 'MANUAL';
  record_count: number;
  last_imported: string;
  data_quality_pct: number;
  currencies: SupportedCurrency[];
  exceptions_count: number;
  status: 'ACTIVE' | 'SYNCING' | 'ERROR';
}

export interface ConnectorItem {
  id: string;
  name: string;
  category: 'ERP' | 'WAREHOUSE' | 'BANKING' | 'STORAGE';
  logo_text: string;
  status: 'NOT_CONNECTED' | 'CONNECTED';
  description: string;
  notes: string;
}

export type CloseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_REVIEW' | 'READY_TO_CLOSE' | 'CLOSED';

export interface Workspace {
  id: string;
  name: string;
  companyLegalName: string;
  country: string;
  reportingCurrency: SupportedCurrency;
  locale: NumberingLocale;
  fiscalYear: string;
  closePeriod: string;
  industry?: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  closeStatus: CloseStatus;
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export type ReportType = 
  | 'CLOSE_SUMMARY' 
  | 'RECONCILIATION' 
  | 'EXCEPTION' 
  | 'HUMAN_REVIEW' 
  | 'AGENT_DECISION' 
  | 'AUDIT_TRAIL' 
  | 'DATA_QUALITY' 
  | 'CURRENCY_EXPOSURE';

export interface FinanceReport {
  id: string;
  workspaceId: string;
  title: string;
  type: ReportType;
  closePeriod: string;
  createdAt: string;
  summary: string;
  metrics: Record<string, any>;
  data?: any[];
}

export interface ImportBatch {
  id: string;
  workspaceId: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  dataQualityPct: number;
  detectedCurrencies: SupportedCurrency[];
  detectedVendorsCount: number;
  potentialDuplicatesCount: number;
  exceptionsCount: number;
  importedAt: string;
}

export interface CloseSummaryMetrics {
  workspaceId: string;
  closePeriod: string;
  totalTransactions: number;
  totalValue: number;
  reportingCurrency: SupportedCurrency;
  autoReconciledCount: number;
  autoResolvedExceptionsCount: number;
  humanApprovedCount: number;
  blockedCount: number;
  remainingUnresolvedCount: number;
  reconciliationRatePct: number;
  dataQualityPct: number;
  verifierInterventionsCount: number;
  currenciesCount: number;
  isReadyToClose: boolean;
  blockers: string[];
}
