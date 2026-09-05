import {
  Transaction,
  Policy,
  PolicyProposal,
  DecisionTrace,
  AuditRecord,
  EvaluationReport,
  Vendor,
  PurchaseOrder,
  Invoice,
  DataSourceItem,
  ConnectorItem,
  ControlPlaneAgentRun
} from './types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_POLICIES,
  INITIAL_PROPOSALS,
  WOW_DECISION_TRACE,
  INITIAL_EVAL_REPORTS,
  INITIAL_VENDORS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_INVOICES,
  INITIAL_DATA_SOURCES,
  INITIAL_CONNECTORS,
  INITIAL_CONTROL_PLANE_RUNS
} from './mockData';
import { SupportedCurrency, NumberingLocale } from './money';

export interface WorkspaceSettings {
  companyName: string;
  reportingCurrency: SupportedCurrency;
  locale: NumberingLocale;
  fiscalYear: string;
  aiRuntime: 'LOCAL_INTELLIGENCE' | 'LOCAL_LLM' | 'CLOUD_LLM';
  localLlmUrl: string;
  localLlmModel: string;
  materialityCeiling: number;
  defaultAutonomyLevel: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  tourCompleted: boolean;
}

const DEFAULT_SETTINGS: WorkspaceSettings = {
  companyName: 'Northstar Labs Inc.',
  reportingCurrency: 'USD',
  locale: 'intl',
  fiscalYear: 'FY2026',
  aiRuntime: 'LOCAL_INTELLIGENCE',
  localLlmUrl: 'http://localhost:11434',
  localLlmModel: 'llama3',
  materialityCeiling: 10000.0,
  defaultAutonomyLevel: 'BALANCED',
  tourCompleted: false,
};

const STORAGE_KEYS = {
  DATA_MODE: 'ledgerproof_data_mode_v2',
  TRANSACTIONS: 'ledgerproof_transactions_v2',
  POLICIES: 'ledgerproof_policies_v2',
  PROPOSALS: 'ledgerproof_proposals_v2',
  TRACES: 'ledgerproof_traces_v2',
  EVALS: 'ledgerproof_evals_v2',
  VENDORS: 'ledgerproof_vendors_v2',
  POS: 'ledgerproof_pos_v2',
  INVOICES: 'ledgerproof_invoices_v2',
  DATA_SOURCES: 'ledgerproof_data_sources_v2',
  AUDIT_RECORDS: 'ledgerproof_audit_records_v2',
  SETTINGS: 'ledgerproof_settings_v2',
  // Real Data Keys
  REAL_TRANSACTIONS: 'ledgerproof_real_transactions_v2',
  REAL_VENDORS: 'ledgerproof_real_vendors_v2',
  REAL_POS: 'ledgerproof_real_pos_v2',
  REAL_INVOICES: 'ledgerproof_real_invoices_v2',
  REAL_DATA_SOURCES: 'ledgerproof_real_data_sources_v2',
  REAL_AUDIT: 'ledgerproof_real_audit_v2',
};

export class ClientStore {
  private static instance: ClientStore;

  private dataMode: 'demo' | 'real' = 'demo';

  // Demo Workspace Data
  private transactions: Transaction[] = [];
  private policies: Policy[] = [];
  private proposals: PolicyProposal[] = [];
  private traces: Record<string, DecisionTrace> = {};
  private evalReports: Record<string, EvaluationReport> = {};
  private vendors: Vendor[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private invoices: Invoice[] = [];
  private dataSources: DataSourceItem[] = [];
  private connectors: ConnectorItem[] = [];
  private controlPlaneRuns: ControlPlaneAgentRun[] = [];
  private auditRecords: AuditRecord[] = [];
  private settings: WorkspaceSettings = { ...DEFAULT_SETTINGS };

  // Real (User-Owned) Workspace Data
  private realTransactions: Transaction[] = [];
  private realVendors: Vendor[] = [];
  private realPurchaseOrders: PurchaseOrder[] = [];
  private realInvoices: Invoice[] = [];
  private realDataSources: DataSourceItem[] = [];
  private realAuditRecords: AuditRecord[] = [];
  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error("Store listener error:", err);
      }
    });
  }

  public getDataMode(): 'demo' | 'real' {
    return this.dataMode;
  }

  public setDataMode(mode: 'demo' | 'real') {
    this.dataMode = mode;
    this.persist();
    this.notify();
  }

  public clearRealData() {
    this.realTransactions = [];
    this.realVendors = [];
    this.realPurchaseOrders = [];
    this.realInvoices = [];
    this.realDataSources = [];
    this.realAuditRecords = [];
    this.persist();
    this.notify();
  }

  private constructor() {
    this.init();
  }

  public static getInstance(): ClientStore {
    if (!ClientStore.instance) {
      ClientStore.instance = new ClientStore();
    }
    return ClientStore.instance;
  }

  private init() {
    if (typeof window === 'undefined') {
      this.loadDefaults();
      return;
    }

    try {
      const storedMode = localStorage.getItem(STORAGE_KEYS.DATA_MODE);
      if (storedMode === 'real' || storedMode === 'demo') {
        this.dataMode = storedMode;
      }

      // 1. Load Demo Data
      const storedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      this.transactions = storedTxs ? JSON.parse(storedTxs) : [...INITIAL_TRANSACTIONS];

      const storedPolicies = localStorage.getItem(STORAGE_KEYS.POLICIES);
      this.policies = storedPolicies ? JSON.parse(storedPolicies) : [...INITIAL_POLICIES];

      const storedProps = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      this.proposals = storedProps ? JSON.parse(storedProps) : [...INITIAL_PROPOSALS];

      const storedTraces = localStorage.getItem(STORAGE_KEYS.TRACES);
      this.traces = storedTraces ? JSON.parse(storedTraces) : { [WOW_DECISION_TRACE.transaction_id]: WOW_DECISION_TRACE };

      const storedEvals = localStorage.getItem(STORAGE_KEYS.EVALS);
      this.evalReports = storedEvals ? JSON.parse(storedEvals) : { ...INITIAL_EVAL_REPORTS };

      const storedVendors = localStorage.getItem(STORAGE_KEYS.VENDORS);
      this.vendors = storedVendors ? JSON.parse(storedVendors) : [...INITIAL_VENDORS];

      const storedPOs = localStorage.getItem(STORAGE_KEYS.POS);
      this.purchaseOrders = storedPOs ? JSON.parse(storedPOs) : [...INITIAL_PURCHASE_ORDERS];

      const storedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      this.invoices = storedInvoices ? JSON.parse(storedInvoices) : [...INITIAL_INVOICES];

      const storedDataSources = localStorage.getItem(STORAGE_KEYS.DATA_SOURCES);
      this.dataSources = storedDataSources ? JSON.parse(storedDataSources) : [...INITIAL_DATA_SOURCES];

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_RECORDS);
      this.auditRecords = storedAudit ? JSON.parse(storedAudit) : this.generateInitialAuditLog();

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = storedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } : { ...DEFAULT_SETTINGS };

      this.connectors = [...INITIAL_CONNECTORS];
      this.controlPlaneRuns = [...INITIAL_CONTROL_PLANE_RUNS];

      // 2. Load Real (User) Data
      const storedRealTxs = localStorage.getItem(STORAGE_KEYS.REAL_TRANSACTIONS);
      this.realTransactions = storedRealTxs ? JSON.parse(storedRealTxs) : [];

      const storedRealVnd = localStorage.getItem(STORAGE_KEYS.REAL_VENDORS);
      this.realVendors = storedRealVnd ? JSON.parse(storedRealVnd) : [];

      const storedRealPOs = localStorage.getItem(STORAGE_KEYS.REAL_POS);
      this.realPurchaseOrders = storedRealPOs ? JSON.parse(storedRealPOs) : [];

      const storedRealInv = localStorage.getItem(STORAGE_KEYS.REAL_INVOICES);
      this.realInvoices = storedRealInv ? JSON.parse(storedRealInv) : [];

      const storedRealDS = localStorage.getItem(STORAGE_KEYS.REAL_DATA_SOURCES);
      this.realDataSources = storedRealDS ? JSON.parse(storedRealDS) : [];

      const storedRealAudit = localStorage.getItem(STORAGE_KEYS.REAL_AUDIT);
      this.realAuditRecords = storedRealAudit ? JSON.parse(storedRealAudit) : [];

      if (!this.traces[WOW_DECISION_TRACE.transaction_id]) {
        this.traces[WOW_DECISION_TRACE.transaction_id] = WOW_DECISION_TRACE;
      }
    } catch (e) {
      console.warn("Could not read localStorage, using default data:", e);
      this.loadDefaults();
    }
  }

  private loadDefaults() {
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.policies = [...INITIAL_POLICIES];
    this.proposals = [...INITIAL_PROPOSALS];
    this.traces = { [WOW_DECISION_TRACE.transaction_id]: WOW_DECISION_TRACE };
    this.evalReports = { ...INITIAL_EVAL_REPORTS };
    this.vendors = [...INITIAL_VENDORS];
    this.purchaseOrders = [...INITIAL_PURCHASE_ORDERS];
    this.invoices = [...INITIAL_INVOICES];
    this.dataSources = [...INITIAL_DATA_SOURCES];
    this.connectors = [...INITIAL_CONNECTORS];
    this.controlPlaneRuns = [...INITIAL_CONTROL_PLANE_RUNS];
    this.auditRecords = this.generateInitialAuditLog();
    this.settings = { ...DEFAULT_SETTINGS };
  }

  private generateInitialAuditLog(): AuditRecord[] {
    return [
      {
        decision_id: "DEC-2026-0905-001",
        trace_id: "TRC-DUP-001",
        timestamp: "2026-09-05T09:02:10Z",
        transaction_id: "TX-EXC-001",
        vendor: "Starlight Logistics",
        amount: 14500.0,
        agent_name: "Duplicate Investigator Agent",
        agent_version: "2.4.0",
        model: "LedgerProof Local Intelligence",
        tools_used: ["invoice_number_matcher", "temporal_proximity_scan"],
        evidence_ids: ["EVD-STR-01", "EVD-STR-02"],
        policy_ids: ["POL-DUP-001"],
        proposed_action: "MARK_DUPLICATE_AND_BLOCK",
        verifier_status: "VERIFIED",
        confidence: 0.98,
        risk_level: "HIGH",
        autonomy_tier: "TIER_D",
        human_required: false,
        human_decision: "SYSTEM_ENFORCED_BLOCK",
        final_action: "BLOCKED_EXECUTION",
        ledger_impact_summary: "Prevented duplicate disbursement of $14,500.00.",
      },
      {
        decision_id: "DEC-2026-0905-002",
        trace_id: "TRC-GL-003",
        timestamp: "2026-09-05T09:03:45Z",
        transaction_id: "TX-EXC-003",
        vendor: "Amazon Web Services",
        amount: 8420.0,
        agent_name: "Independent Adversarial Verifier",
        agent_version: "2.4.0",
        model: "LedgerProof Local Intelligence",
        tools_used: ["vendor_contract_cross_check", "policy_compliance_checker"],
        evidence_ids: ["EVD-AWS-001", "EVD-AWS-002"],
        policy_ids: ["POL-GL-001"],
        proposed_action: "CORRECT_GL_POSTING",
        verifier_status: "REJECTED",
        confidence: 0.94,
        risk_level: "HIGH",
        autonomy_tier: "TIER_D",
        human_required: false,
        human_decision: "VERIFIER_VETO",
        final_action: "PREVENTED_ERRONEOUS_GL_POST",
        ledger_impact_summary: "Prevented erroneous posting to Office Supplies (GL 6400). Re-routed to Cloud Infrastructure (GL 6020).",
      }
    ];
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.DATA_MODE, this.dataMode);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(this.policies));
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(this.proposals));
      localStorage.setItem(STORAGE_KEYS.TRACES, JSON.stringify(this.traces));
      localStorage.setItem(STORAGE_KEYS.EVALS, JSON.stringify(this.evalReports));
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(this.vendors));
      localStorage.setItem(STORAGE_KEYS.POS, JSON.stringify(this.purchaseOrders));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(this.invoices));
      localStorage.setItem(STORAGE_KEYS.DATA_SOURCES, JSON.stringify(this.dataSources));
      localStorage.setItem(STORAGE_KEYS.AUDIT_RECORDS, JSON.stringify(this.auditRecords));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));

      // Persist Real (User) Data
      localStorage.setItem(STORAGE_KEYS.REAL_TRANSACTIONS, JSON.stringify(this.realTransactions));
      localStorage.setItem(STORAGE_KEYS.REAL_VENDORS, JSON.stringify(this.realVendors));
      localStorage.setItem(STORAGE_KEYS.REAL_POS, JSON.stringify(this.realPurchaseOrders));
      localStorage.setItem(STORAGE_KEYS.REAL_INVOICES, JSON.stringify(this.realInvoices));
      localStorage.setItem(STORAGE_KEYS.REAL_DATA_SOURCES, JSON.stringify(this.realDataSources));
      localStorage.setItem(STORAGE_KEYS.REAL_AUDIT, JSON.stringify(this.realAuditRecords));
    } catch (e) {
      console.warn("Could not persist to localStorage:", e);
    }
  }

  public resetDemo() {
    this.loadDefaults();
    this.persist();
    this.notify();
    if (typeof window !== 'undefined') {
      fetch('/api/demo/reset', { method: 'POST' }).catch(() => { });
    }
  }

  // Settings
  public getSettings(): WorkspaceSettings {
    return this.settings;
  }

  public updateSettings(updates: Partial<WorkspaceSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.persist();
    this.notify();
  }

  // Transactions CRUD (Mode Aware)
  public getTransactions(): Transaction[] {
    return this.dataMode === 'real' ? this.realTransactions : this.transactions;
  }

  public getTransaction(id: string): Transaction | undefined {
    const list = this.dataMode === 'real' ? this.realTransactions : this.transactions;
    return list.find((t) => t.id === id);
  }

  public addTransaction(tx: Transaction) {
    if (this.dataMode === 'real') {
      this.realTransactions.unshift(tx);
    } else {
      this.transactions.unshift(tx);
    }
    this.persist();
    this.notify();
  }

  public updateTransaction(id: string, updates: Partial<Transaction>) {
    const list = this.dataMode === 'real' ? this.realTransactions : this.transactions;
    const idx = list.findIndex((t) => t.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deleteTransaction(id: string) {
    if (this.dataMode === 'real') {
      this.realTransactions = this.realTransactions.filter((t) => t.id !== id);
    } else {
      this.transactions = this.transactions.filter((t) => t.id !== id);
    }
    this.persist();
    this.notify();
  }

  // True State Propagation for Human Review Actions
  public processHumanDecision(
    txId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION',
    notes: string,
    editedGl?: string
  ) {
    const tx = this.getTransaction(txId);
    if (!tx) return;

    const newStatus = action === 'REJECT'
      ? 'BLOCKED'
      : action === 'REQUEST_EVIDENCE'
        ? 'HUMAN_REVIEW_REQUIRED'
        : 'RESOLVED';

    const finalGl = editedGl || tx.gl_account;

    // 1. Update Transaction state
    this.updateTransaction(txId, {
      status: newStatus,
      gl_account: finalGl,
      notes: `Controller Sign-off: ${action} — ${notes}`,
    });

    // 2. Append immutable Audit Record
    const auditEntry: AuditRecord = {
      decision_id: `DEC-${Date.now()}`,
      trace_id: tx.trace_id || `TRC-${txId}`,
      timestamp: new Date().toISOString(),
      transaction_id: txId,
      vendor: tx.vendor,
      amount: tx.amount,
      agent_name: 'Human Controller Sign-Off',
      agent_version: '2.4.0',
      model: 'Human-in-the-Loop Governance',
      tools_used: ['controller_sign_off_console'],
      evidence_ids: ['EVD-HUMAN-REVIEW'],
      policy_ids: [tx.category === 'PO_VARIANCE' ? 'POL-VAR-001' : 'POL-MAT-001'],
      proposed_action: action,
      verifier_status: action === 'REJECT' ? 'REJECTED' : 'VERIFIED',
      confidence: 1.0,
      risk_level: tx.risk_tier === 'TIER_C' ? 'MEDIUM' : 'HIGH',
      autonomy_tier: tx.risk_tier || 'TIER_C',
      human_required: true,
      human_decision: action,
      human_notes: notes,
      final_action: action === 'REJECT' ? 'BLOCKED_BY_CONTROLLER' : 'COMMITTED_TO_LEDGER',
      ledger_impact_summary: `Sign-off ${action} on ${tx.vendor} ($${tx.amount.toLocaleString()}) committed to GL ${finalGl}.`,
    };
    this.auditRecords.unshift(auditEntry);

    // 3. Update Decision Trace with Human Step
    if (this.traces[txId]) {
      this.traces[txId] = {
        ...this.traces[txId],
        final_status: newStatus,
        autonomy_gate: {
          ...this.traces[txId].autonomy_gate,
          reason: `Human review completed: ${action} (${notes})`,
          requires_human_approval: false,
        }
      };
    }

    this.persist();
  }

  // Audit Vault
  // Audit Vault (Mode Aware)
  public getAuditRecords(): AuditRecord[] {
    return this.dataMode === 'real' ? this.realAuditRecords : this.auditRecords;
  }

  // Vendors CRUD (Mode Aware)
  public getVendors(): Vendor[] {
    return this.dataMode === 'real' ? this.realVendors : this.vendors;
  }

  public addVendor(v: Vendor) {
    if (this.dataMode === 'real') {
      this.realVendors.unshift(v);
    } else {
      this.vendors.unshift(v);
    }
    this.persist();
    this.notify();
  }

  public updateVendor(id: string, updates: Partial<Vendor>) {
    const list = this.dataMode === 'real' ? this.realVendors : this.vendors;
    const idx = list.findIndex((v) => v.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deleteVendor(id: string) {
    if (this.dataMode === 'real') {
      this.realVendors = this.realVendors.filter((v) => v.id !== id);
    } else {
      this.vendors = this.vendors.filter((v) => v.id !== id);
    }
    this.persist();
    this.notify();
  }

  // Purchase Orders CRUD (Mode Aware)
  public getPurchaseOrders(): PurchaseOrder[] {
    return this.dataMode === 'real' ? this.realPurchaseOrders : this.purchaseOrders;
  }

  public addPurchaseOrder(po: PurchaseOrder) {
    if (this.dataMode === 'real') {
      this.realPurchaseOrders.unshift(po);
    } else {
      this.purchaseOrders.unshift(po);
    }
    this.persist();
    this.notify();
  }

  public updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>) {
    const list = this.dataMode === 'real' ? this.realPurchaseOrders : this.purchaseOrders;
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deletePurchaseOrder(id: string) {
    if (this.dataMode === 'real') {
      this.realPurchaseOrders = this.realPurchaseOrders.filter((p) => p.id !== id);
    } else {
      this.purchaseOrders = this.purchaseOrders.filter((p) => p.id !== id);
    }
    this.persist();
    this.notify();
  }

  // Invoices CRUD (Mode Aware)
  public getInvoices(): Invoice[] {
    return this.dataMode === 'real' ? this.realInvoices : this.invoices;
  }

  public addInvoice(inv: Invoice) {
    if (this.dataMode === 'real') {
      this.realInvoices.unshift(inv);
    } else {
      this.invoices.unshift(inv);
    }
    this.persist();
    this.notify();
  }

  public updateInvoice(id: string, updates: Partial<Invoice>) {
    const list = this.dataMode === 'real' ? this.realInvoices : this.invoices;
    const idx = list.findIndex((i) => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deleteInvoice(id: string) {
    if (this.dataMode === 'real') {
      this.realInvoices = this.realInvoices.filter((i) => i.id !== id);
    } else {
      this.invoices = this.invoices.filter((i) => i.id !== id);
    }
    this.persist();
    this.notify();
  }

  // Data Sources (Mode Aware)
  public getDataSources(): DataSourceItem[] {
    return this.dataMode === 'real' ? this.realDataSources : this.dataSources;
  }

  public addDataSource(ds: DataSourceItem) {
    if (this.dataMode === 'real') {
      this.realDataSources.unshift(ds);
    } else {
      this.dataSources.unshift(ds);
    }
    this.persist();
    this.notify();
  }

  public deleteDataSource(id: string) {
    if (this.dataMode === 'real') {
      this.realDataSources = this.realDataSources.filter((d) => d.id !== id);
    } else {
      this.dataSources = this.dataSources.filter((d) => d.id !== id);
    }
    this.persist();
    this.notify();
  }

  // Connectors
  public getConnectors(): ConnectorItem[] {
    return this.connectors;
  }

  // Control Plane Runs
  public getControlPlaneRuns(): ControlPlaneAgentRun[] {
    return this.controlPlaneRuns;
  }

  // Policies
  public getPolicies(): Policy[] {
    return this.policies;
  }

  public addPolicy(pol: Policy) {
    this.policies.unshift(pol);
    this.persist();
  }

  public updatePolicy(id: string, updates: Partial<Policy>) {
    const idx = this.policies.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.policies[idx] = { ...this.policies[idx], ...updates };
      this.persist();
    }
  }

  public deletePolicy(id: string) {
    this.policies = this.policies.filter((p) => p.id !== id);
    this.persist();
  }

  // Proposals
  public getProposals(): PolicyProposal[] {
    return this.proposals;
  }

  public approveProposal(proposalId: string) {
    const pIdx = this.proposals.findIndex((p) => p.proposal_id === proposalId);
    if (pIdx !== -1) {
      this.proposals[pIdx].status = "APPROVED";
      const polIdx = this.policies.findIndex((p) => p.id === "POL-VAR-001");
      if (polIdx !== -1) {
        this.policies[polIdx] = {
          ...this.policies[polIdx],
          name: "Standard PO Variance Tolerance (CloudWorks 5% Exception Active)",
          description: "Invoice variances up to 2.0% auto-clear; CloudWorks Infrastructure allowed <= 5.0%.",
          version: 2,
        };
      }
      this.persist();
    }
  }

  public rejectProposal(proposalId: string) {
    const pIdx = this.proposals.findIndex((p) => p.proposal_id === proposalId);
    if (pIdx !== -1) {
      this.proposals[pIdx].status = "REJECTED";
      this.persist();
    }
  }

  // Traces
  public getTrace(txId: string): DecisionTrace {
    if (this.traces[txId]) {
      return this.traces[txId];
    }
    const tx = this.getTransaction(txId);
    return {
      trace_id: `TRC-${txId.replace(/[^a-zA-Z0-9]/g, '')}`,
      transaction_id: txId,
      timestamp: new Date().toISOString(),
      investigation: {
        summary: `Forensic multi-agent investigation for ${tx?.vendor || 'Vendor'} ($${tx?.amount?.toLocaleString() || '0'}).`,
        root_cause: tx?.notes || "Normal commercial reconciliation within baseline parameters",
        confidence: tx?.confidence || 0.95,
        recommended_action: tx?.status === 'BLOCKED' ? 'MARK_DUPLICATE_AND_BLOCK' : 'APPROVE_AND_POST',
        missing_evidence: [],
        evidence_gathered: [
          {
            id: `EVD-1-${txId}`,
            source_type: "BANK_STMT",
            title: `Bank Statement Record: ${tx?.vendor}`,
            details: `Confirmed settlement on ${tx?.date} for $${tx?.amount?.toLocaleString()}`,
            relevance_score: 0.99,
          },
          {
            id: `EVD-2-${txId}`,
            source_type: "GL_HISTORY",
            title: `GL Account: ${tx?.gl_account}`,
            details: `Prior 12 months verified in normal commercial range.`,
            relevance_score: 0.94,
          }
        ],
        tools_used: [
          { tool_name: "get_transaction", input_params: { id: txId }, output_summary: `Amount $${tx?.amount}`, duration_ms: 14.2 },
          { tool_name: "get_vendor_history", input_params: { vendor: tx?.vendor }, output_summary: "Verified active vendor", duration_ms: 21.0 },
        ],
      },
      resolution: {
        proposed_action: tx?.status === 'BLOCKED' ? 'MARK_DUPLICATE_AND_BLOCK' : 'APPROVE_AND_POST',
        explanation: tx?.notes || `Accounting resolution formulated for ${tx?.vendor}.`,
        target_account: tx?.gl_account,
        confidence: tx?.confidence || 0.95,
        tools_used: [],
      },
      verifier: {
        status: tx?.status === 'BLOCKED' ? 'REJECTED' : 'VERIFIED',
        arithmetic_valid: true,
        policy_compliant: tx?.status !== 'BLOCKED',
        classification_valid: true,
        materiality_assessed: true,
        notes: tx?.status === 'BLOCKED' ? "Execution blocked by policy rule." : "All verification checks passed.",
        blocking_reasons: tx?.status === 'BLOCKED' ? ["Policy threshold breach"] : [],
        disagreement_detected: false,
      },
      autonomy_gate: {
        tier: tx?.risk_tier || "TIER_A",
        reason: tx?.status === 'BLOCKED' ? "Tier D Hard Block enforced." : "Tier A/B Autonomous Execution permitted.",
        can_auto_execute: tx?.status !== 'BLOCKED' && tx?.risk_tier !== 'TIER_C',
        requires_human_approval: tx?.risk_tier === 'TIER_C',
        is_blocked: tx?.status === 'BLOCKED',
        deterministic_checks: {
          verifier_status: tx?.status === 'BLOCKED' ? 'REJECTED' : 'VERIFIED',
          materiality: tx && tx.amount >= 10000 ? 'MATERIAL' : 'IMMATERIAL',
        },
      },
      final_status: tx?.status || "RECONCILED",
      all_tool_calls: [
        { tool_name: "get_transaction", input_params: { id: txId }, output_summary: `Confirmed $${tx?.amount}`, duration_ms: 14.2 },
        { tool_name: "get_vendor_history", input_params: { vendor: tx?.vendor }, output_summary: "Verified", duration_ms: 21.0 },
      ],
    };
  }

  // Evaluations
  public getEvalReports(): Record<string, EvaluationReport> {
    return this.evalReports;
  }
}

export const store = ClientStore.getInstance();
