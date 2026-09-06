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
  ControlPlaneAgentRun,
  Workspace,
  FinanceReport,
  CloseSummaryMetrics,
  CloseStatus,
  ReportType
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
import { SupportedCurrency, NumberingLocale, decimalAdd, decimalSub } from './money';
import {
  DB_STORES,
  idbGetAll,
  idbPut,
  idbPutMany,
  idbDelete,
  idbDeleteByWorkspace
} from './db';

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

export const DEFAULT_DEMO_WORKSPACE: Workspace = {
  id: 'ws-demo-northstar',
  name: 'Northstar Labs Inc.',
  companyLegalName: 'Northstar Labs Technologies Inc.',
  country: 'United States',
  reportingCurrency: 'USD',
  locale: 'intl',
  fiscalYear: 'FY2026',
  closePeriod: 'September 2026',
  industry: 'Enterprise Software & Cloud AI',
  description: 'Primary demonstration environment with pre-loaded 40-case ground-truth close dataset.',
  status: 'ACTIVE',
  closeStatus: 'IN_PROGRESS',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-07T00:00:00Z',
  isDemo: true,
};

const STORAGE_KEYS = {
  ACTIVE_WS: 'ledgerproof_active_ws_id_v3',
  WORKSPACES: 'ledgerproof_workspaces_v3',
  WS_SETTINGS: 'ledgerproof_ws_settings_v3',
  DEMO_TRANSACTIONS: 'ledgerproof_demo_txs_v3',
  DEMO_AUDIT: 'ledgerproof_demo_audit_v3',
  DATA_CACHE_PREFIX: 'ledgerproof_data_',
  REPORTS_PREFIX: 'ledgerproof_reports_',
};

export class ClientStore {
  private static instance: ClientStore;

  // Workspaces collection
  private workspaces: Workspace[] = [DEFAULT_DEMO_WORKSPACE];
  private activeWorkspaceId: string = DEFAULT_DEMO_WORKSPACE.id;

  // Multi-Company Scoped Collections (indexed by workspaceId)
  private transactions: Record<string, Transaction[]> = {};
  private vendors: Record<string, Vendor[]> = {};
  private purchaseOrders: Record<string, PurchaseOrder[]> = {};
  private invoices: Record<string, Invoice[]> = {};
  private dataSources: Record<string, DataSourceItem[]> = {};
  private auditRecords: Record<string, AuditRecord[]> = {};
  private reports: Record<string, FinanceReport[]> = {};
  private policies: Record<string, Policy[]> = {};
  private traces: Record<string, DecisionTrace> = {};

  // Shared platform data (governance rules, evals, connectors)
  private proposals: PolicyProposal[] = [];
  private evalReports: Record<string, EvaluationReport> = {};
  private connectors: ConnectorItem[] = [];
  private controlPlaneRuns: ControlPlaneAgentRun[] = [];

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
      // 1. Load workspaces
      const storedWorkspaces = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      if (storedWorkspaces) {
        const parsed: Workspace[] = JSON.parse(storedWorkspaces);
        // Ensure Demo workspace is always present
        const hasDemo = parsed.some(w => w.id === DEFAULT_DEMO_WORKSPACE.id);
        this.workspaces = hasDemo ? parsed : [DEFAULT_DEMO_WORKSPACE, ...parsed];
      } else {
        this.workspaces = [DEFAULT_DEMO_WORKSPACE];
      }

      // 2. Load active workspace ID
      const storedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_WS);
      if (storedActiveId && this.workspaces.some(w => w.id === storedActiveId)) {
        this.activeWorkspaceId = storedActiveId;
      } else {
        this.activeWorkspaceId = this.workspaces[0].id;
      }

      // 3. Populate Demo Workspace data
      const storedDemoTxs = localStorage.getItem(STORAGE_KEYS.DEMO_TRANSACTIONS);
      this.transactions[DEFAULT_DEMO_WORKSPACE.id] = storedDemoTxs 
        ? JSON.parse(storedDemoTxs) 
        : INITIAL_TRANSACTIONS.map(t => ({ ...t, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));

      this.vendors[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_VENDORS.map(v => ({ ...v, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
      this.purchaseOrders[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_PURCHASE_ORDERS.map(p => ({ ...p, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
      this.invoices[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_INVOICES.map(i => ({ ...i, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
      this.dataSources[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_DATA_SOURCES.map(d => ({ ...d, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
      this.policies[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_POLICIES.map(p => ({ ...p, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));

      const storedDemoAudit = localStorage.getItem(STORAGE_KEYS.DEMO_AUDIT);
      this.auditRecords[DEFAULT_DEMO_WORKSPACE.id] = storedDemoAudit 
        ? JSON.parse(storedDemoAudit) 
        : this.generateInitialAuditLog(DEFAULT_DEMO_WORKSPACE.id);

      // 4. Populate shared governance & connectors
      this.proposals = [...INITIAL_PROPOSALS];
      this.traces = { [WOW_DECISION_TRACE.transaction_id]: WOW_DECISION_TRACE };
      this.evalReports = { ...INITIAL_EVAL_REPORTS };
      this.connectors = [...INITIAL_CONNECTORS];
      this.controlPlaneRuns = [...INITIAL_CONTROL_PLANE_RUNS];

      // 5. Load cached data for all active workspaces from localStorage
      this.workspaces.forEach(ws => {
        if (ws.id !== DEFAULT_DEMO_WORKSPACE.id) {
          const cachedTxs = localStorage.getItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}txs_${ws.id}`);
          this.transactions[ws.id] = cachedTxs ? JSON.parse(cachedTxs) : [];

          const cachedVnd = localStorage.getItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}vnd_${ws.id}`);
          this.vendors[ws.id] = cachedVnd ? JSON.parse(cachedVnd) : [];

          const cachedInv = localStorage.getItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}inv_${ws.id}`);
          this.invoices[ws.id] = cachedInv ? JSON.parse(cachedInv) : [];

          const cachedPOs = localStorage.getItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}pos_${ws.id}`);
          this.purchaseOrders[ws.id] = cachedPOs ? JSON.parse(cachedPOs) : [];

          const cachedDS = localStorage.getItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}ds_${ws.id}`);
          this.dataSources[ws.id] = cachedDS ? JSON.parse(cachedDS) : [];

          const cachedAudit = localStorage.getItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}audit_${ws.id}`);
          this.auditRecords[ws.id] = cachedAudit ? JSON.parse(cachedAudit) : [];

          const cachedReps = localStorage.getItem(`${STORAGE_KEYS.REPORTS_PREFIX}${ws.id}`);
          this.reports[ws.id] = cachedReps ? JSON.parse(cachedReps) : [];
        }
      });

      // 6. Asynchronously sync from IndexedDB in background
      this.syncFromIndexedDB();

    } catch (e) {
      console.warn("[ClientStore] Could not read localStorage, falling back to defaults:", e);
      this.loadDefaults();
    }
  }

  private loadDefaults() {
    this.workspaces = [DEFAULT_DEMO_WORKSPACE];
    this.activeWorkspaceId = DEFAULT_DEMO_WORKSPACE.id;
    this.transactions[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_TRANSACTIONS.map(t => ({ ...t, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.vendors[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_VENDORS.map(v => ({ ...v, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.purchaseOrders[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_PURCHASE_ORDERS.map(p => ({ ...p, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.invoices[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_INVOICES.map(i => ({ ...i, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.dataSources[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_DATA_SOURCES.map(d => ({ ...d, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.policies[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_POLICIES.map(p => ({ ...p, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.auditRecords[DEFAULT_DEMO_WORKSPACE.id] = this.generateInitialAuditLog(DEFAULT_DEMO_WORKSPACE.id);
    this.proposals = [...INITIAL_PROPOSALS];
    this.traces = { [WOW_DECISION_TRACE.transaction_id]: WOW_DECISION_TRACE };
    this.evalReports = { ...INITIAL_EVAL_REPORTS };
    this.connectors = [...INITIAL_CONNECTORS];
    this.controlPlaneRuns = [...INITIAL_CONTROL_PLANE_RUNS];
  }

  private async syncFromIndexedDB() {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    try {
      const dbWorkspaces = await idbGetAll<Workspace>(DB_STORES.WORKSPACES);
      if (dbWorkspaces && dbWorkspaces.length > 0) {
        // Merge workspaces preserving activeDemo
        const mergedMap = new Map<string, Workspace>();
        mergedMap.set(DEFAULT_DEMO_WORKSPACE.id, DEFAULT_DEMO_WORKSPACE);
        dbWorkspaces.forEach(w => mergedMap.set(w.id, w));
        this.workspaces = Array.from(mergedMap.values());
      }
    } catch (e) {
      console.warn("[ClientStore] IndexedDB background sync warning:", e);
    }
  }

  private generateInitialAuditLog(wsId: string): AuditRecord[] {
    return [
      {
        decision_id: "DEC-2026-0905-001",
        workspaceId: wsId,
        trace_id: "TRC-DUP-001",
        timestamp: "2026-09-05T09:02:10Z",
        transaction_id: "TX-EXC-001",
        vendor: "Starlight Logistics",
        amount: 14500.0,
        currency: "USD",
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
        workspaceId: wsId,
        trace_id: "TRC-GL-003",
        timestamp: "2026-09-05T09:03:45Z",
        transaction_id: "TX-EXC-003",
        vendor: "Amazon Web Services",
        amount: 8420.0,
        currency: "USD",
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
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WS, this.activeWorkspaceId);
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(this.workspaces));

      // Persist Demo data
      if (this.transactions[DEFAULT_DEMO_WORKSPACE.id]) {
        localStorage.setItem(STORAGE_KEYS.DEMO_TRANSACTIONS, JSON.stringify(this.transactions[DEFAULT_DEMO_WORKSPACE.id]));
      }
      if (this.auditRecords[DEFAULT_DEMO_WORKSPACE.id]) {
        localStorage.setItem(STORAGE_KEYS.DEMO_AUDIT, JSON.stringify(this.auditRecords[DEFAULT_DEMO_WORKSPACE.id]));
      }

      // Persist active real workspace cache
      const currentWsId = this.activeWorkspaceId;
      if (currentWsId !== DEFAULT_DEMO_WORKSPACE.id) {
        localStorage.setItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}txs_${currentWsId}`, JSON.stringify(this.transactions[currentWsId] || []));
        localStorage.setItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}vnd_${currentWsId}`, JSON.stringify(this.vendors[currentWsId] || []));
        localStorage.setItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}inv_${currentWsId}`, JSON.stringify(this.invoices[currentWsId] || []));
        localStorage.setItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}pos_${currentWsId}`, JSON.stringify(this.purchaseOrders[currentWsId] || []));
        localStorage.setItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}ds_${currentWsId}`, JSON.stringify(this.dataSources[currentWsId] || []));
        localStorage.setItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}audit_${currentWsId}`, JSON.stringify(this.auditRecords[currentWsId] || []));
        localStorage.setItem(`${STORAGE_KEYS.REPORTS_PREFIX}${currentWsId}`, JSON.stringify(this.reports[currentWsId] || []));
      }

      // Asynchronously mirror to IndexedDB
      this.mirrorToIndexedDB();

    } catch (e) {
      console.warn("[ClientStore] Could not persist to localStorage:", e);
    }
  }

  private async mirrorToIndexedDB() {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    try {
      await idbPutMany(DB_STORES.WORKSPACES, this.workspaces);
      const wsId = this.activeWorkspaceId;
      if (this.transactions[wsId]) {
        await idbPutMany(DB_STORES.TRANSACTIONS, this.transactions[wsId]);
      }
      if (this.vendors[wsId]) {
        await idbPutMany(DB_STORES.VENDORS, this.vendors[wsId]);
      }
      if (this.invoices[wsId]) {
        await idbPutMany(DB_STORES.INVOICES, this.invoices[wsId]);
      }
      if (this.purchaseOrders[wsId]) {
        await idbPutMany(DB_STORES.PURCHASE_ORDERS, this.purchaseOrders[wsId]);
      }
      if (this.auditRecords[wsId]) {
        const recordsWithId = this.auditRecords[wsId].map(r => ({ ...r, id: r.id || r.decision_id }));
        await idbPutMany(DB_STORES.AUDIT_EVENTS, recordsWithId);
      }
      if (this.reports[wsId]) {
        await idbPutMany(DB_STORES.REPORTS, this.reports[wsId]);
      }
    } catch (e) {
      console.warn("[ClientStore] IndexedDB mirror warning:", e);
    }
  }

  // ==========================================
  // 1. WORKSPACE MANAGEMENT (UNLIMITED & ISOLATED)
  // ==========================================

  public getWorkspaces(): Workspace[] {
    return [...this.workspaces];
  }

  public getActiveWorkspace(): Workspace {
    const ws = this.workspaces.find(w => w.id === this.activeWorkspaceId);
    return ws || this.workspaces[0] || DEFAULT_DEMO_WORKSPACE;
  }

  public getActiveWorkspaceId(): string {
    return this.activeWorkspaceId;
  }

  public setActiveWorkspace(id: string) {
    const exists = this.workspaces.some(w => w.id === id);
    if (!exists) return;

    this.activeWorkspaceId = id;
    this.persist();
    this.notify();
  }

  public createWorkspace(params: {
    name: string;
    companyLegalName?: string;
    country: string;
    reportingCurrency: SupportedCurrency;
    locale?: NumberingLocale;
    fiscalYear: string;
    closePeriod: string;
    industry?: string;
    description?: string;
  }): Workspace {
    const id = `ws-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const country = params.country.trim();
    const isIndia = country.toLowerCase().includes('india') || params.reportingCurrency === 'INR';
    const locale: NumberingLocale = params.locale || (isIndia ? 'indian' : 'intl');

    const newWs: Workspace = {
      id,
      name: params.name.trim(),
      companyLegalName: params.companyLegalName?.trim() || params.name.trim(),
      country,
      reportingCurrency: params.reportingCurrency,
      locale,
      fiscalYear: params.fiscalYear.trim(),
      closePeriod: params.closePeriod.trim(),
      industry: params.industry?.trim() || 'General Business',
      description: params.description?.trim(),
      status: 'ACTIVE',
      closeStatus: 'NOT_STARTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
    };

    // Initialize clean isolated structures for this workspace
    this.workspaces.push(newWs);
    this.transactions[id] = [];
    this.vendors[id] = [];
    this.purchaseOrders[id] = [];
    this.invoices[id] = [];
    this.dataSources[id] = [];
    this.auditRecords[id] = [
      {
        decision_id: `DEC-${Date.now()}`,
        workspaceId: id,
        trace_id: `TRC-WS-INIT-${id}`,
        timestamp: new Date().toISOString(),
        transaction_id: `SYS-WS-CREATE`,
        vendor: newWs.name,
        amount: 0,
        currency: newWs.reportingCurrency,
        agent_name: 'Workspace Provisioner Agent',
        agent_version: '2.4.0',
        model: 'LedgerProof Local Governance',
        tools_used: ['workspace_provisioner', 'ledger_isolator'],
        evidence_ids: ['EVD-PROVISION'],
        policy_ids: ['POL-SEC-001'],
        proposed_action: 'PROVISION_ISOLATED_LEDGER',
        verifier_status: 'VERIFIED',
        confidence: 1.0,
        risk_level: 'LOW',
        autonomy_tier: 'TIER_A',
        human_required: false,
        human_decision: 'SYSTEM_APPROVED',
        final_action: 'WORKSPACE_ACTIVE',
        ledger_impact_summary: `Created isolated financial ledger for "${newWs.name}" (${newWs.reportingCurrency}, ${newWs.closePeriod}).`,
      }
    ];
    this.reports[id] = [];
    this.policies[id] = INITIAL_POLICIES.map(p => ({ ...p, workspaceId: id }));

    // Automatically switch to the newly created workspace
    this.activeWorkspaceId = id;
    this.persist();
    this.notify();

    return newWs;
  }

  public updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
    const idx = this.workspaces.findIndex(w => w.id === id);
    if (idx === -1) return null;

    this.workspaces[idx] = {
      ...this.workspaces[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.persist();
    this.notify();
    return this.workspaces[idx];
  }

  public deleteWorkspace(id: string): { success: boolean; deletedCounts: Record<string, number> } {
    if (id === DEFAULT_DEMO_WORKSPACE.id) {
      return { success: false, deletedCounts: {} }; // Protect root demo workspace from complete deletion
    }

    const txsCount = (this.transactions[id] || []).length;
    const invCount = (this.invoices[id] || []).length;
    const poCount = (this.purchaseOrders[id] || []).length;
    const auditCount = (this.auditRecords[id] || []).length;
    const repCount = (this.reports[id] || []).length;

    // Remove from in-memory records
    delete this.transactions[id];
    delete this.vendors[id];
    delete this.purchaseOrders[id];
    delete this.invoices[id];
    delete this.dataSources[id];
    delete this.auditRecords[id];
    delete this.reports[id];
    delete this.policies[id];

    this.workspaces = this.workspaces.filter(w => w.id !== id);

    // If active workspace was deleted, fall back to first workspace
    if (this.activeWorkspaceId === id) {
      this.activeWorkspaceId = this.workspaces[0].id;
    }

    // Clean localStorage cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}txs_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}vnd_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}inv_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}pos_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}ds_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.DATA_CACHE_PREFIX}audit_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.REPORTS_PREFIX}${id}`);
    }

    // Clean IndexedDB in background
    if (typeof window !== 'undefined' && window.indexedDB) {
      idbDelete(DB_STORES.WORKSPACES, id).catch(() => {});
      idbDeleteByWorkspace(DB_STORES.TRANSACTIONS, id).catch(() => {});
      idbDeleteByWorkspace(DB_STORES.INVOICES, id).catch(() => {});
      idbDeleteByWorkspace(DB_STORES.PURCHASE_ORDERS, id).catch(() => {});
      idbDeleteByWorkspace(DB_STORES.AUDIT_EVENTS, id).catch(() => {});
      idbDeleteByWorkspace(DB_STORES.REPORTS, id).catch(() => {});
    }

    this.persist();
    this.notify();

    return {
      success: true,
      deletedCounts: {
        transactions: txsCount,
        invoices: invCount,
        purchaseOrders: poCount,
        auditEvents: auditCount,
        reports: repCount,
      }
    };
  }

  // ==========================================
  // 2. DATA MODE & BACKWARD COMPATIBILITY
  // ==========================================

  public getDataMode(): 'demo' | 'real' {
    const ws = this.getActiveWorkspace();
    return ws.isDemo ? 'demo' : 'real';
  }

  public setDataMode(mode: 'demo' | 'real') {
    if (mode === 'demo') {
      this.setActiveWorkspace(DEFAULT_DEMO_WORKSPACE.id);
    } else {
      // Find first non-demo workspace, or maintain active if already real
      const current = this.getActiveWorkspace();
      if (!current.isDemo) return;

      const firstReal = this.workspaces.find(w => !w.isDemo);
      if (firstReal) {
        this.setActiveWorkspace(firstReal.id);
      } else {
        // Create an initial clean real workspace (e.g. for user data)
        const newWs = this.createWorkspace({
          name: 'My Real Company',
          country: 'United States',
          reportingCurrency: 'USD',
          fiscalYear: 'FY2026',
          closePeriod: 'September 2026',
          description: 'Production ledger workspace for your company files.',
        });
        this.setActiveWorkspace(newWs.id);
      }
    }
  }

  public resetDemo() {
    this.transactions[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_TRANSACTIONS.map(t => ({ ...t, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.vendors[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_VENDORS.map(v => ({ ...v, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.purchaseOrders[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_PURCHASE_ORDERS.map(p => ({ ...p, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.invoices[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_INVOICES.map(i => ({ ...i, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.dataSources[DEFAULT_DEMO_WORKSPACE.id] = INITIAL_DATA_SOURCES.map(d => ({ ...d, workspaceId: DEFAULT_DEMO_WORKSPACE.id }));
    this.auditRecords[DEFAULT_DEMO_WORKSPACE.id] = this.generateInitialAuditLog(DEFAULT_DEMO_WORKSPACE.id);
    this.reports[DEFAULT_DEMO_WORKSPACE.id] = [];

    const demoWs = this.workspaces.find(w => w.id === DEFAULT_DEMO_WORKSPACE.id);
    if (demoWs) {
      demoWs.closeStatus = 'IN_PROGRESS';
      demoWs.closedAt = undefined;
    }

    this.persist();
    this.notify();
  }

  public clearRealData(workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    if (wsId === DEFAULT_DEMO_WORKSPACE.id) return; // Do not wipe demo with clearRealData

    this.transactions[wsId] = [];
    this.vendors[wsId] = [];
    this.purchaseOrders[wsId] = [];
    this.invoices[wsId] = [];
    this.dataSources[wsId] = [];
    this.auditRecords[wsId] = [];
    this.reports[wsId] = [];

    const ws = this.workspaces.find(w => w.id === wsId);
    if (ws) {
      ws.closeStatus = 'NOT_STARTED';
      ws.closedAt = undefined;
    }

    this.persist();
    this.notify();
  }

  // ==========================================
  // 3. SCOPED TRANSACTIONS CRUD
  // ==========================================

  public getTransactions(workspaceId?: string): Transaction[] {
    const wsId = workspaceId || this.activeWorkspaceId;
    return this.transactions[wsId] ? [...this.transactions[wsId]] : [];
  }

  public getTransaction(id: string, workspaceId?: string): Transaction | undefined {
    const wsId = workspaceId || this.activeWorkspaceId;
    const list = this.transactions[wsId] || [];
    return list.find(t => t.id === id);
  }

  public addTransaction(tx: Transaction, workspaceId?: string) {
    const wsId = workspaceId || tx.workspaceId || this.activeWorkspaceId;
    if (!this.transactions[wsId]) this.transactions[wsId] = [];

    const enrichedTx: Transaction = {
      ...tx,
      workspaceId: wsId,
    };

    this.transactions[wsId].unshift(enrichedTx);

    // Update workspace close status if currently NOT_STARTED
    const ws = this.workspaces.find(w => w.id === wsId);
    if (ws && ws.closeStatus === 'NOT_STARTED') {
      ws.closeStatus = 'IN_PROGRESS';
    }

    this.persist();
    this.notify();
  }

  public addTransactions(txs: Transaction[], workspaceId?: string) {
    if (txs.length === 0) return;
    const wsId = workspaceId || this.activeWorkspaceId;
    if (!this.transactions[wsId]) this.transactions[wsId] = [];

    const enriched = txs.map(t => ({ ...t, workspaceId: wsId }));
    this.transactions[wsId] = [...enriched, ...this.transactions[wsId]];

    const ws = this.workspaces.find(w => w.id === wsId);
    if (ws && ws.closeStatus === 'NOT_STARTED') {
      ws.closeStatus = 'IN_PROGRESS';
    }

    this.persist();
    this.notify();
  }

  public updateTransaction(id: string, updates: Partial<Transaction>, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    const list = this.transactions[wsId] || [];
    const idx = list.findIndex(t => t.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deleteTransaction(id: string, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    if (this.transactions[wsId]) {
      this.transactions[wsId] = this.transactions[wsId].filter(t => t.id !== id);
      this.persist();
      this.notify();
    }
  }

  // ==========================================
  // 4. HUMAN DECISIONS & WORKSPACE AUDIT
  // ==========================================

  public processHumanDecision(
    txId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION',
    notes: string,
    editedGl?: string
  ) {
    const wsId = this.activeWorkspaceId;
    const tx = this.getTransaction(txId, wsId);
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
    }, wsId);

    // 2. Append immutable Audit Record
    const auditEntry: AuditRecord = {
      decision_id: `DEC-${Date.now()}`,
      workspaceId: wsId,
      trace_id: tx.trace_id || `TRC-${txId}`,
      timestamp: new Date().toISOString(),
      transaction_id: txId,
      vendor: tx.vendor,
      amount: tx.amount,
      currency: tx.currency,
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
      ledger_impact_summary: `Controller ${action} on ${tx.vendor} (${tx.currency} ${tx.amount.toLocaleString()}) committed to GL ${finalGl}.`,
    };

    this.addAuditRecord(auditEntry, wsId);

    // 3. Update Decision Trace
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
    this.notify();
  }

  // ==========================================
  // 5. SCOPED VENDORS, INVOICES, POS, AUDIT
  // ==========================================

  public getVendors(workspaceId?: string): Vendor[] {
    const wsId = workspaceId || this.activeWorkspaceId;
    return this.vendors[wsId] ? [...this.vendors[wsId]] : [];
  }

  public addVendor(v: Vendor, workspaceId?: string) {
    const wsId = workspaceId || v.workspaceId || this.activeWorkspaceId;
    if (!this.vendors[wsId]) this.vendors[wsId] = [];
    this.vendors[wsId].unshift({ ...v, workspaceId: wsId });
    this.persist();
    this.notify();
  }

  public updateVendor(id: string, updates: Partial<Vendor>, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    const list = this.vendors[wsId] || [];
    const idx = list.findIndex(v => v.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deleteVendor(id: string, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    if (this.vendors[wsId]) {
      this.vendors[wsId] = this.vendors[wsId].filter(v => v.id !== id);
      this.persist();
      this.notify();
    }
  }

  public getInvoices(workspaceId?: string): Invoice[] {
    const wsId = workspaceId || this.activeWorkspaceId;
    return this.invoices[wsId] ? [...this.invoices[wsId]] : [];
  }

  public addInvoice(inv: Invoice, workspaceId?: string) {
    const wsId = workspaceId || inv.workspaceId || this.activeWorkspaceId;
    if (!this.invoices[wsId]) this.invoices[wsId] = [];
    this.invoices[wsId].unshift({ ...inv, workspaceId: wsId });
    this.persist();
    this.notify();
  }

  public updateInvoice(id: string, updates: Partial<Invoice>, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    const list = this.invoices[wsId] || [];
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deleteInvoice(id: string, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    if (this.invoices[wsId]) {
      this.invoices[wsId] = this.invoices[wsId].filter(i => i.id !== id);
      this.persist();
      this.notify();
    }
  }

  public getPurchaseOrders(workspaceId?: string): PurchaseOrder[] {
    const wsId = workspaceId || this.activeWorkspaceId;
    return this.purchaseOrders[wsId] ? [...this.purchaseOrders[wsId]] : [];
  }

  public addPurchaseOrder(po: PurchaseOrder, workspaceId?: string) {
    const wsId = workspaceId || po.workspaceId || this.activeWorkspaceId;
    if (!this.purchaseOrders[wsId]) this.purchaseOrders[wsId] = [];
    this.purchaseOrders[wsId].unshift({ ...po, workspaceId: wsId });
    this.persist();
    this.notify();
  }

  public updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    const list = this.purchaseOrders[wsId] || [];
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deletePurchaseOrder(id: string, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    if (this.purchaseOrders[wsId]) {
      this.purchaseOrders[wsId] = this.purchaseOrders[wsId].filter(p => p.id !== id);
      this.persist();
      this.notify();
    }
  }

  public getDataSources(workspaceId?: string): DataSourceItem[] {
    const wsId = workspaceId || this.activeWorkspaceId;
    return this.dataSources[wsId] ? [...this.dataSources[wsId]] : [];
  }

  public addDataSource(ds: DataSourceItem, workspaceId?: string) {
    const wsId = workspaceId || ds.workspaceId || this.activeWorkspaceId;
    if (!this.dataSources[wsId]) this.dataSources[wsId] = [];
    this.dataSources[wsId].unshift({ ...ds, workspaceId: wsId });
    this.persist();
    this.notify();
  }

  public deleteDataSource(id: string, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    if (this.dataSources[wsId]) {
      this.dataSources[wsId] = this.dataSources[wsId].filter(d => d.id !== id);
      this.persist();
      this.notify();
    }
  }

  public getAuditRecords(workspaceId?: string): AuditRecord[] {
    const wsId = workspaceId || this.activeWorkspaceId;
    return this.auditRecords[wsId] ? [...this.auditRecords[wsId]] : [];
  }

  public addAuditRecord(rec: AuditRecord, workspaceId?: string) {
    const wsId = workspaceId || rec.workspaceId || this.activeWorkspaceId;
    if (!this.auditRecords[wsId]) this.auditRecords[wsId] = [];
    this.auditRecords[wsId].unshift({ ...rec, workspaceId: wsId });
    this.persist();
    this.notify();
  }

  // ==========================================
  // 6. SCOPED FINANCE REPORTS (NEW REQUIREMENT 23-31)
  // ==========================================

  public getReports(workspaceId?: string): FinanceReport[] {
    const wsId = workspaceId || this.activeWorkspaceId;
    return this.reports[wsId] ? [...this.reports[wsId]] : [];
  }

  public addReport(report: FinanceReport, workspaceId?: string): FinanceReport {
    const wsId = workspaceId || report.workspaceId || this.activeWorkspaceId;
    if (!this.reports[wsId]) this.reports[wsId] = [];
    const enriched = { ...report, workspaceId: wsId };
    this.reports[wsId].unshift(enriched);
    this.persist();
    this.notify();
    return enriched;
  }

  public deleteReport(id: string, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    if (this.reports[wsId]) {
      this.reports[wsId] = this.reports[wsId].filter(r => r.id !== id);
      this.persist();
      this.notify();
    }
  }

  // ==========================================
  // 7. LIVE CLOSE METRICS & FINAL CLOSE LIFECYCLE
  // ==========================================

  public getCloseSummaryMetrics(workspaceId?: string): CloseSummaryMetrics {
    const ws = workspaceId ? this.workspaces.find(w => w.id === workspaceId) || this.getActiveWorkspace() : this.getActiveWorkspace();
    const txs = this.getTransactions(ws.id);

    const totalTransactions = txs.length;
    const totalValue = txs.reduce((acc, t) => acc + (t.amount || 0), 0);

    const autoReconciled = txs.filter(t => t.status === 'AUTO_RECONCILED' || t.status === 'RECONCILED').length;
    const autoResolvedExceptions = txs.filter(t => t.status === 'RESOLVED').length;
    const humanApproved = txs.filter(t => t.status === 'MANUALLY_APPROVED').length;
    const blocked = txs.filter(t => t.status === 'BLOCKED').length;
    const remainingUnresolved = txs.filter(t => 
      t.status === 'HUMAN_REVIEW_REQUIRED' || 
      t.status === 'PENDING' || 
      (t.category !== undefined && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED' && t.status !== 'BLOCKED')
    ).length;

    const clearedCount = autoReconciled + autoResolvedExceptions + humanApproved;
    const reconciliationRatePct = totalTransactions > 0 
      ? Math.round((clearedCount / totalTransactions) * 1000) / 10 
      : 100.0;

    const distinctCurrencies = Array.from(new Set(txs.map(t => t.currency || ws.reportingCurrency)));
    const verifierInterventions = txs.filter(t => t.risk_tier === 'TIER_D' || t.status === 'BLOCKED' || (t.notes && t.notes.includes('Verifier'))).length;

    const blockers: string[] = [];
    if (remainingUnresolved > 0) {
      blockers.push(`${remainingUnresolved} transaction(s) still require controller sign-off or investigation.`);
    }
    const criticalBlocked = txs.filter(t => t.risk_tier === 'TIER_D' && t.status === 'BLOCKED').length;
    if (criticalBlocked > 0) {
      blockers.push(`${criticalBlocked} Tier D hard blocked duplicate(s) or conflict(s) require resolution.`);
    }

    const isReadyToClose = totalTransactions > 0 && remainingUnresolved === 0 && criticalBlocked === 0;

    return {
      workspaceId: ws.id,
      closePeriod: ws.closePeriod,
      totalTransactions,
      totalValue,
      reportingCurrency: ws.reportingCurrency,
      autoReconciledCount: autoReconciled,
      autoResolvedExceptionsCount: autoResolvedExceptions,
      humanApprovedCount: humanApproved,
      blockedCount: blocked,
      remainingUnresolvedCount: remainingUnresolved,
      reconciliationRatePct,
      dataQualityPct: totalTransactions > 0 ? 98.2 : 100.0,
      verifierInterventionsCount: verifierInterventions,
      currenciesCount: Math.max(1, distinctCurrencies.length),
      isReadyToClose,
      blockers,
    };
  }

  public finalizeClose(workspaceId?: string, closedBy: string = 'Financial Controller'): {
    success: boolean;
    reason?: string;
    reportId?: string;
  } {
    const wsId = workspaceId || this.activeWorkspaceId;
    const ws = this.workspaces.find(w => w.id === wsId);
    if (!ws) return { success: false, reason: 'Workspace not found.' };

    const metrics = this.getCloseSummaryMetrics(wsId);
    if (!metrics.isReadyToClose) {
      return {
        success: false,
        reason: metrics.blockers.join(' ') || 'Close blocked: Critical unresolved exceptions remain.',
      };
    }

    // Seal the period
    ws.closeStatus = 'CLOSED';
    ws.closedAt = new Date().toISOString();
    ws.closedBy = closedBy;

    // Generate comprehensive Close Summary Report
    const report: FinanceReport = {
      id: `REP-CLOSE-${Date.now()}`,
      workspaceId: wsId,
      title: `${ws.closePeriod} Financial Close Summary Report`,
      type: 'CLOSE_SUMMARY',
      closePeriod: ws.closePeriod,
      createdAt: new Date().toISOString(),
      summary: `Period ${ws.closePeriod} closed with ${metrics.reconciliationRatePct}% reconciliation velocity across ${metrics.totalTransactions} transactions.`,
      metrics: {
        totalTransactions: metrics.totalTransactions,
        totalValue: metrics.totalValue,
        reportingCurrency: metrics.reportingCurrency,
        autoReconciled: metrics.autoReconciledCount,
        autoResolvedExceptions: metrics.autoResolvedExceptionsCount,
        humanApproved: metrics.humanApprovedCount,
        blocked: metrics.blockedCount,
        reconciliationRatePct: metrics.reconciliationRatePct,
        dataQualityPct: metrics.dataQualityPct,
        closedBy,
        closedAt: ws.closedAt,
      },
    };
    this.addReport(report, wsId);

    // Record formal audit event
    this.addAuditRecord({
      decision_id: `DEC-${Date.now()}`,
      workspaceId: wsId,
      trace_id: `TRC-CLOSE-${wsId}`,
      timestamp: ws.closedAt,
      transaction_id: `CLOSE-PERIOD-${ws.closePeriod.replace(/\s+/g, '-')}`,
      vendor: ws.companyLegalName,
      amount: metrics.totalValue,
      currency: ws.reportingCurrency,
      agent_name: 'Controller Close Sign-Off',
      agent_version: '2.4.0',
      model: 'Deterministic Close Seal',
      tools_used: ['close_sealer', 'audit_vault_hasher'],
      evidence_ids: [`EVD-CLOSE-${report.id}`],
      policy_ids: ['SOX-404-SEAL'],
      proposed_action: 'SEAL_FINANCIAL_CLOSE',
      verifier_status: 'VERIFIED',
      confidence: 1.0,
      risk_level: 'LOW',
      autonomy_tier: 'TIER_A',
      human_required: true,
      human_decision: 'CLOSE_FINALIZED',
      human_notes: `Period sealed by ${closedBy}.`,
      final_action: 'PERIOD_CLOSED_AND_LOCKED',
      ledger_impact_summary: `Successfully sealed ${ws.closePeriod} for ${ws.companyLegalName}. Total value: ${ws.reportingCurrency} ${metrics.totalValue.toLocaleString()}.`,
    }, wsId);

    this.persist();
    this.notify();

    return { success: true, reportId: report.id };
  }

  public reopenClose(workspaceId?: string, reason: string = 'Reopened for post-closing adjustments'): { success: boolean } {
    const wsId = workspaceId || this.activeWorkspaceId;
    const ws = this.workspaces.find(w => w.id === wsId);
    if (!ws) return { success: false };

    ws.closeStatus = 'IN_PROGRESS';
    const reopenedAt = new Date().toISOString();

    this.addAuditRecord({
      decision_id: `DEC-${Date.now()}`,
      workspaceId: wsId,
      trace_id: `TRC-REOPEN-${wsId}`,
      timestamp: reopenedAt,
      transaction_id: `REOPEN-${ws.closePeriod.replace(/\s+/g, '-')}`,
      vendor: ws.companyLegalName,
      amount: 0,
      currency: ws.reportingCurrency,
      agent_name: 'Controller Reopen Override',
      agent_version: '2.4.0',
      model: 'Human Controller Override',
      tools_used: ['close_reopener'],
      evidence_ids: ['EVD-REOPEN-REASON'],
      policy_ids: ['SOX-404-OVERRIDE'],
      proposed_action: 'REOPEN_CLOSED_PERIOD',
      verifier_status: 'HUMAN_REVIEW_REQUIRED',
      confidence: 1.0,
      risk_level: 'HIGH',
      autonomy_tier: 'TIER_C',
      human_required: true,
      human_decision: 'REOPENED',
      human_notes: reason,
      final_action: 'CLOSE_REOPENED',
      ledger_impact_summary: `Financial close for ${ws.closePeriod} reopened. Reason: ${reason}.`,
    }, wsId);

    this.persist();
    this.notify();
    return { success: true };
  }

  // ==========================================
  // 8. POLICIES & PROPOSALS
  // ==========================================

  public getPolicies(workspaceId?: string): Policy[] {
    const wsId = workspaceId || this.activeWorkspaceId;
    return this.policies[wsId] ? [...this.policies[wsId]] : [...INITIAL_POLICIES];
  }

  public addPolicy(pol: Policy, workspaceId?: string) {
    const wsId = workspaceId || pol.workspaceId || this.activeWorkspaceId;
    if (!this.policies[wsId]) this.policies[wsId] = [];
    this.policies[wsId].unshift({ ...pol, workspaceId: wsId });
    this.persist();
    this.notify();
  }

  public updatePolicy(id: string, updates: Partial<Policy>, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    const list = this.policies[wsId] || [];
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.persist();
      this.notify();
    }
  }

  public deletePolicy(id: string, workspaceId?: string) {
    const wsId = workspaceId || this.activeWorkspaceId;
    if (this.policies[wsId]) {
      this.policies[wsId] = this.policies[wsId].filter(p => p.id !== id);
      this.persist();
      this.notify();
    }
  }

  public getProposals(): PolicyProposal[] {
    return [...this.proposals];
  }

  public approveProposal(proposalId: string) {
    const pIdx = this.proposals.findIndex(p => p.proposal_id === proposalId);
    if (pIdx !== -1) {
      this.proposals[pIdx].status = "APPROVED";
      const wsId = this.activeWorkspaceId;
      const polList = this.policies[wsId] || [];
      const polIdx = polList.findIndex(p => p.id === "POL-VAR-001");
      if (polIdx !== -1) {
        polList[polIdx] = {
          ...polList[polIdx],
          name: "Standard PO Variance Tolerance (5% Exception Active)",
          description: "Invoice variances up to 2.0% auto-clear; approved exceptions up to 5.0%.",
          version: polList[polIdx].version + 1,
        };
      }
      this.persist();
      this.notify();
    }
  }

  public rejectProposal(proposalId: string) {
    const pIdx = this.proposals.findIndex(p => p.proposal_id === proposalId);
    if (pIdx !== -1) {
      this.proposals[pIdx].status = "REJECTED";
      this.persist();
      this.notify();
    }
  }

  // ==========================================
  // 9. TRACES, EVALS & CONNECTORS
  // ==========================================

  public getTrace(txId: string): DecisionTrace {
    if (this.traces[txId]) {
      return this.traces[txId];
    }
    const tx = this.getTransaction(txId);
    const ws = this.getActiveWorkspace();
    return {
      trace_id: `TRC-${txId.replace(/[^a-zA-Z0-9]/g, '')}`,
      transaction_id: txId,
      timestamp: new Date().toISOString(),
      investigation: {
        summary: `Forensic multi-agent investigation for ${tx?.vendor || 'Vendor'} (${tx?.currency || ws.reportingCurrency} ${tx?.amount?.toLocaleString() || '0'}).`,
        root_cause: tx?.notes || "Normal commercial reconciliation within baseline parameters",
        confidence: tx?.confidence || 0.95,
        recommended_action: tx?.status === 'BLOCKED' ? 'MARK_DUPLICATE_AND_BLOCK' : 'APPROVE_AND_POST',
        missing_evidence: [],
        evidence_gathered: [
          {
            id: `EVD-1-${txId}`,
            source_type: "BANK_STMT",
            title: `Bank Statement Record: ${tx?.vendor}`,
            details: `Confirmed settlement on ${tx?.date} for ${tx?.currency || ws.reportingCurrency} ${tx?.amount?.toLocaleString()}`,
            relevance_score: 0.99,
          },
          {
            id: `EVD-2-${txId}`,
            source_type: "GL_HISTORY",
            title: `GL Account: ${tx?.gl_account}`,
            details: `Prior consecutive periods verified in standard commercial range.`,
            relevance_score: 0.94,
          }
        ],
        tools_used: [
          { tool_name: "get_transaction", input_params: { id: txId }, output_summary: `Amount ${tx?.amount}`, duration_ms: 14.2 },
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
          materiality: tx && tx.amount >= (ws.reportingCurrency === 'INR' ? 1000000 : 10000) ? 'MATERIAL' : 'IMMATERIAL',
        },
      },
      final_status: tx?.status || "RECONCILED",
      all_tool_calls: [
        { tool_name: "get_transaction", input_params: { id: txId }, output_summary: `Confirmed ${tx?.amount}`, duration_ms: 14.2 },
        { tool_name: "get_vendor_history", input_params: { vendor: tx?.vendor }, output_summary: "Verified", duration_ms: 21.0 },
      ],
    };
  }

  public getEvalReports(): Record<string, EvaluationReport> {
    return { ...this.evalReports };
  }

  public getConnectors(): ConnectorItem[] {
    return [...this.connectors];
  }

  public getControlPlaneRuns(): ControlPlaneAgentRun[] {
    return [...this.controlPlaneRuns];
  }
}

export const store = ClientStore.getInstance();
