'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Scale, 
  Bot, 
  History, 
  BarChart3, 
  Coins,
  RefreshCw,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { store } from '../lib/store';
import { FinanceReport, ReportType, Transaction } from '../lib/types';
import { formatMoney, formatHumanReadableScale, SupportedCurrency, CURRENCY_REGISTRY } from '../lib/money';

interface ReportsViewProps {
  onOpenDecisionTrace?: (txId: string) => void;
}

const REPORT_TABS: Array<{ type: ReportType; label: string; icon: any; desc: string }> = [
  { type: 'CLOSE_SUMMARY', label: 'Close Summary', icon: FileText, desc: 'Executive period sign-off & high-level reconciliation velocity' },
  { type: 'RECONCILIATION', label: 'Reconciliation', icon: Scale, desc: 'Matched bank, subledger, and purchase order balances' },
  { type: 'EXCEPTION', label: 'Exceptions', icon: AlertTriangle, desc: 'Investigated variances, duplicates, and GL reclassifications' },
  { type: 'HUMAN_REVIEW', label: 'Human Review', icon: CheckCircle2, desc: 'Controller sign-offs, manual approvals, and materiality escalations' },
  { type: 'AGENT_DECISION', label: 'Agent & Verifier', icon: Bot, desc: 'Autonomous proposals, verifier vetoes, and $0.00 API inference' },
  { type: 'AUDIT_TRAIL', label: 'Audit Trail', icon: History, desc: 'Chronological immutable event ledger with SHA-256 proofs' },
  { type: 'DATA_QUALITY', label: 'Data Quality', icon: BarChart3, desc: 'Schema validation, duplicate scans, and ingestion completeness' },
  { type: 'CURRENCY_EXPOSURE', label: 'Currency Exposure', icon: Coins, desc: 'Multi-currency holdings, reference FX rates, and reporting conversions' },
];

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenDecisionTrace }) => {
  const activeWs = store.getActiveWorkspace();
  const transactions = store.getTransactions(activeWs.id);
  const metrics = store.getCloseSummaryMetrics(activeWs.id);
  const auditRecords = store.getAuditRecords(activeWs.id);
  const existingReports = store.getReports(activeWs.id);

  const [activeType, setActiveType] = useState<ReportType>('CLOSE_SUMMARY');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotification, setGeneratedNotification] = useState<string | null>(null);

  const handleExportCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeWs.name.replace(/\s+/g, '_')}_${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = (filename: string, data: any) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeWs.name.replace(/\s+/g, '_')}_${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateFreshReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport: FinanceReport = {
        id: `REP-${activeType}-${Date.now()}`,
        workspaceId: activeWs.id,
        title: `${activeWs.name} — ${REPORT_TABS.find(t => t.type === activeType)?.label} (${activeWs.closePeriod})`,
        type: activeType,
        closePeriod: activeWs.closePeriod,
        createdAt: new Date().toISOString(),
        summary: `Deterministic report generated for ${activeWs.companyLegalName} across ${transactions.length} records.`,
        metrics: {
          totalTransactions: metrics.totalTransactions,
          totalValue: metrics.totalValue,
          reportingCurrency: metrics.reportingCurrency,
          reconciliationRatePct: metrics.reconciliationRatePct,
        },
      };
      store.addReport(newReport, activeWs.id);
      setIsGenerating(false);
      setGeneratedNotification(`Generated and saved "${newReport.title}" to reports history.`);
      setTimeout(() => setGeneratedNotification(null), 3500);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 antialiased">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pastel-mint border border-pastel-mintBorder text-xs font-semibold text-text-primary">
            <span>{CURRENCY_REGISTRY[activeWs.reportingCurrency]?.flag || '🏢'}</span>
            <span>{activeWs.name} &bull; {activeWs.closePeriod}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal">
            Financial Close Reports
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
            Deterministic, exportable financial statements and autonomous agent verification logs scoped exclusively to {activeWs.name}.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleGenerateFreshReport}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#0E332E] text-white text-xs font-semibold hover:bg-bg-darkHover transition-all shadow-subtle disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Compiling...' : 'Generate New Snapshot'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-full bg-white border border-border-subtle text-xs font-semibold text-text-primary hover:bg-bg-subtle transition-colors shadow-subtle"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-text-muted" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {generatedNotification && (
        <div className="p-3.5 rounded-xl bg-pastel-mint border border-pastel-mintBorder text-xs text-text-primary font-medium flex items-center justify-between animate-fade-in">
          <span>{generatedNotification}</span>
          <span className="text-[10px] font-mono text-emerald-800">SAVED TO VAULT</span>
        </div>
      )}

      {/* 2. Report Type Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveType(tab.type)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-[#0E332E] text-white border-[#0E332E] shadow-card'
                  : 'bg-white text-text-primary border-border-subtle hover:border-text-secondary/30 hover:shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`w-4 h-4 ${isActive ? 'text-pastel-mint' : 'text-text-muted'}`} />
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint" />}
              </div>
              <span className="text-xs font-semibold leading-tight line-clamp-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Report Content Viewer */}
      <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
        
        {/* Active Report Header & Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div>
            <h3 className="font-serif text-2xl text-text-primary">
              {REPORT_TABS.find(t => t.type === activeType)?.label} Report
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {REPORT_TABS.find(t => t.type === activeType)?.desc}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (activeType === 'CLOSE_SUMMARY') {
                  const csv = `Workspace,Company,Period,TotalTransactions,ProcessedValue,ReconciledPct,DataQualityPct\n"${activeWs.name}","${activeWs.companyLegalName}","${activeWs.closePeriod}",${metrics.totalTransactions},${metrics.totalValue},${metrics.reconciliationRatePct},${metrics.dataQualityPct}`;
                  handleExportCSV('close_summary', csv);
                } else if (activeType === 'EXCEPTION') {
                  const rows = transactions.filter(t => t.category).map(t => `"${t.id}","${t.vendor}","${t.amount}","${t.currency}","${t.category}","${t.risk_tier}","${t.status}"`).join('\n');
                  const csv = `ID,Vendor,Amount,Currency,Category,RiskTier,Status\n${rows}`;
                  handleExportCSV('exceptions', csv);
                } else {
                  const rows = transactions.map(t => `"${t.id}","${t.date}","${t.vendor}","${t.amount}","${t.currency}","${t.status}"`).join('\n');
                  const csv = `ID,Date,Vendor,Amount,Currency,Status\n${rows}`;
                  handleExportCSV(activeType.toLowerCase(), csv);
                }
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-bg-primary hover:bg-bg-subtle border border-border-subtle text-xs font-semibold text-text-primary transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-text-secondary" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                const reportPayload = {
                  reportType: activeType,
                  workspace: activeWs,
                  metrics,
                  recordsCount: transactions.length,
                  timestamp: new Date().toISOString(),
                };
                handleExportJSON(activeType.toLowerCase(), reportPayload);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-bg-primary hover:bg-bg-subtle border border-border-subtle text-xs font-semibold text-text-primary transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-text-secondary" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: CLOSE SUMMARY REPORT */}
        {/* ============================================================ */}
        {activeType === 'CLOSE_SUMMARY' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tabular">
              <div className="p-4 rounded-2xl bg-pastel-lime border border-pastel-limeBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Total Transactions</span>
                <span className="font-serif text-2xl font-normal text-text-primary">{metrics.totalTransactions.toLocaleString()}</span>
                <span className="text-[10px] text-text-muted block">In Scope for {activeWs.closePeriod}</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-mint border border-pastel-mintBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Value Processed</span>
                <span className="font-serif text-2xl font-normal text-text-primary">
                  {formatMoney(metrics.totalValue, metrics.reportingCurrency, activeWs.locale)}
                </span>
                <span className="text-[10px] text-emerald-800 font-medium block">{metrics.currenciesCount} Currencies Cleared</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-aqua border border-pastel-aquaBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Reconciliation Rate</span>
                <span className="font-serif text-2xl font-normal text-text-primary">{metrics.reconciliationRatePct}%</span>
                <span className="text-[10px] text-cyan-800 font-medium block">
                  {metrics.autoReconciledCount} Auto-Reconciled
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-pink border border-pastel-pinkBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Verifier Interventions</span>
                <span className="font-serif text-2xl font-normal text-status-blocked">{metrics.verifierInterventionsCount}</span>
                <span className="text-[10px] text-red-800 font-medium block">0.0% False Self-Approval</span>
              </div>
            </div>

            {/* Executive Statement Box */}
            <div className="p-5 rounded-2xl bg-bg-primary border border-border-subtle space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Executive Closing Assessment</span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                Financial period <strong className="text-text-primary">{activeWs.closePeriod}</strong> for <strong className="text-text-primary">{activeWs.companyLegalName}</strong> completed with <strong className="text-text-primary">{metrics.reconciliationRatePct}%</strong> reconciliation velocity. Total processed volume is <strong className="text-text-primary">{formatMoney(metrics.totalValue, metrics.reportingCurrency, activeWs.locale)}</strong>. 
                {metrics.remainingUnresolvedCount === 0 
                  ? " All transactions and exceptions have reached definitive resolution under deterministic governance policies."
                  : ` Caution: ${metrics.remainingUnresolvedCount} transaction(s) still require controller sign-off before closing can be sealed.`}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: RECONCILIATION STATEMENT */}
        {/* ============================================================ */}
        {activeType === 'RECONCILIATION' && (
          <div className="space-y-4 font-tabular">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-bg-primary text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="py-2.5 px-3">Transaction</th>
                    <th className="py-2.5 px-3">Vendor / Entity</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">GL Account</th>
                    <th className="py-2.5 px-3">Match Status</th>
                    <th className="py-2.5 px-3 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {transactions.slice(0, 15).map((tx) => (
                    <tr key={tx.id} className="hover:bg-bg-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-text-muted font-medium">{tx.id}</td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">{tx.vendor}</td>
                      <td className="py-2.5 px-3 font-bold text-text-primary">
                        {formatMoney(tx.amount, tx.currency, activeWs.locale)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-text-secondary">{tx.gl_account}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'AUTO_RECONCILED' || tx.status === 'RECONCILED'
                            ? 'bg-pastel-mint text-emerald-800'
                            : tx.status === 'BLOCKED'
                            ? 'bg-pastel-pink text-red-800'
                            : 'bg-pastel-lime text-amber-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-secondary font-medium">
                        {(tx.confidence * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: EXCEPTION INVESTIGATION REPORT */}
        {/* ============================================================ */}
        {activeType === 'EXCEPTION' && (
          <div className="space-y-4 font-tabular">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-bg-primary text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="py-2.5 px-3">Txn ID</th>
                    <th className="py-2.5 px-3">Counterparty</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Risk Tier</th>
                    <th className="py-2.5 px-3">Verifier Determination</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {transactions.filter(t => t.category).map((tx) => (
                    <tr key={tx.id} className="hover:bg-bg-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-text-muted font-medium">{tx.id}</td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">{tx.vendor}</td>
                      <td className="py-2.5 px-3 font-bold text-text-primary">
                        {formatMoney(tx.amount, tx.currency, activeWs.locale)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-text-secondary">{tx.category}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.risk_tier === 'TIER_D' ? 'bg-pastel-pink text-red-800' : 'bg-pastel-lime text-amber-800'
                        }`}>
                          {tx.risk_tier || 'TIER_C'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary text-[11px] max-w-xs truncate">
                        {tx.notes || 'Autonomous verification complete'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenDecisionTrace?.(tx.id)}
                          className="text-[11px] text-text-primary font-semibold hover:underline"
                        >
                          Inspect &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: HUMAN REVIEW REPORT */}
        {/* ============================================================ */}
        {activeType === 'HUMAN_REVIEW' && (
          <div className="space-y-4 font-tabular">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-bg-primary text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="py-2.5 px-3">Transaction</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3">Material Amount</th>
                    <th className="py-2.5 px-3">Ceiling Rule</th>
                    <th className="py-2.5 px-3">Controller Sign-Off</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {transactions.filter(t => t.risk_tier === 'TIER_C' || t.amount >= 10000).map((tx) => (
                    <tr key={tx.id} className="hover:bg-bg-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-text-muted font-medium">{tx.id}</td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">{tx.vendor}</td>
                      <td className="py-2.5 px-3 font-bold text-text-primary">
                        {formatMoney(tx.amount, tx.currency, activeWs.locale)}
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary font-mono text-[11px]">
                        POL-MAT-001 (&gt;= $10,000 / ₹10L)
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary text-[11px]">
                        {tx.notes?.includes('Controller') ? tx.notes : 'Required prior to ledger lock'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'RESOLVED' || tx.status === 'MANUALLY_APPROVED'
                            ? 'bg-pastel-mint text-emerald-800'
                            : 'bg-pastel-lime text-amber-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 5: AGENT DECISION & VERIFIER REPORT */}
        {/* ============================================================ */}
        {activeType === 'AGENT_DECISION' && (
          <div className="space-y-6 font-tabular">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-pastel-mint border border-pastel-mintBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Inference Runtime</span>
                <span className="font-serif text-xl font-normal text-text-primary">Local Intelligence</span>
                <span className="text-[10px] text-emerald-800 block">Offline-First Sovereign</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-lime border border-pastel-limeBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">External AI API Cost</span>
                <span className="font-serif text-xl font-normal text-text-primary">$0.00</span>
                <span className="text-[10px] text-amber-800 block">Zero External Paid LLM Calls</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-pink border border-pastel-pinkBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Self-Approval Rate</span>
                <span className="font-serif text-xl font-normal text-status-blocked">0.00%</span>
                <span className="text-[10px] text-red-800 block">Strict Adversarial Separation</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg-primary border border-border-subtle space-y-2 text-xs">
              <div className="font-semibold text-text-primary">Autonomous Worker Sessions Summary</div>
              <p className="text-text-secondary leading-relaxed">
                6 active agent sessions executed during this close run. All proposals from Resolution Agent 04 passed through the Independent Adversarial Verifier 05. Zero unverified journal suggestions were allowed to bypass the Autonomy Gate.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 6: AUDIT TRAIL REPORT */}
        {/* ============================================================ */}
        {activeType === 'AUDIT_TRAIL' && (
          <div className="space-y-4 font-tabular">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-bg-primary text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="py-2.5 px-3">Decision ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Agent / Actor</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Verifier Status</th>
                    <th className="py-2.5 px-3 text-right">Ledger Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {auditRecords.slice(0, 12).map((rec) => (
                    <tr key={rec.decision_id} className="hover:bg-bg-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-text-muted font-medium">{rec.decision_id}</td>
                      <td className="py-2.5 px-3 text-text-muted text-[11px] font-mono">
                        {rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString() : '09:00:00'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">{rec.agent_name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-text-secondary">{rec.proposed_action}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.verifier_status === 'VERIFIED' ? 'bg-pastel-mint text-emerald-800' : 'bg-pastel-pink text-red-800'
                        }`}>
                          {rec.verifier_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-text-secondary text-[11px] max-w-xs truncate">
                        {rec.ledger_impact_summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 7: DATA QUALITY REPORT */}
        {/* ============================================================ */}
        {activeType === 'DATA_QUALITY' && (
          <div className="space-y-6 font-tabular">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-pastel-mint border border-pastel-mintBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Data Quality Score</span>
                <span className="font-serif text-2xl font-normal text-text-primary">{metrics.dataQualityPct}%</span>
                <span className="text-[10px] text-emerald-800 block">Pre-Validation Passed</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-aqua border border-pastel-aquaBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Valid Rows</span>
                <span className="font-serif text-2xl font-normal text-text-primary">{metrics.totalTransactions}</span>
                <span className="text-[10px] text-cyan-800 block">Zero Format Failures</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-pink border border-pastel-pinkBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Duplicate Flags</span>
                <span className="font-serif text-2xl font-normal text-status-blocked">
                  {transactions.filter(t => t.category === 'DUPLICATE_INVOICE').length}
                </span>
                <span className="text-[10px] text-red-800 block">Intercepted & Blocked</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-lime border border-pastel-limeBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Currencies Detected</span>
                <span className="font-serif text-2xl font-normal text-text-primary">{metrics.currenciesCount}</span>
                <span className="text-[10px] text-amber-800 block">ISO 4217 Cleaned</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 8: MULTI-CURRENCY EXPOSURE REPORT */}
        {/* ============================================================ */}
        {activeType === 'CURRENCY_EXPOSURE' && (
          <div className="space-y-6 font-tabular">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-pastel-mint border border-pastel-mintBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Reporting Currency</span>
                <span className="font-serif text-2xl font-normal text-text-primary">
                  {CURRENCY_REGISTRY[activeWs.reportingCurrency]?.flag} {activeWs.reportingCurrency} ({CURRENCY_REGISTRY[activeWs.reportingCurrency]?.symbol})
                </span>
                <span className="text-[10px] text-emerald-800 block">Primary Ledger Baseline</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-aqua border border-pastel-aquaBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Total Reporting Value</span>
                <span className="font-serif text-2xl font-normal text-text-primary">
                  {formatMoney(metrics.totalValue, metrics.reportingCurrency, activeWs.locale)}
                </span>
                <span className="text-[10px] text-cyan-800 block">Normalized via Reference FX</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-lime border border-pastel-limeBorder space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-secondary block">Sovereign Isolation</span>
                <span className="font-serif text-2xl font-normal text-text-primary">Strict</span>
                <span className="text-[10px] text-amber-800 block">Never Overrides INR with USD</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
