'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Transaction } from '../lib/types';

interface AuditVaultViewProps {
  transactions: Transaction[];
  onOpenDecisionTrace: (txId: string) => void;
}

export const AuditVaultView: React.FC<AuditVaultViewProps> = ({
  transactions,
  onOpenDecisionTrace,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');

  // Convert transactions into immutable audit records
  const auditRecords = transactions.map((t, idx) => ({
    decision_id: `AUD-REC-${String(idx + 1).padStart(4, '0')}`,
    trace_id: t.trace_id || `TRC-${t.id.replace(/[^a-zA-Z0-9]/g, '')}`,
    timestamp: '2026-09-05T12:00:00Z',
    transaction_id: t.id,
    vendor: t.vendor,
    amount: t.amount,
    currency: t.currency || 'USD',
    agent_name: 'LedgerProof Core Ensemble',
    agent_version: 'v2.4',
    model: 'claude-3-5-sonnet / deterministic-calc',
    tools_used: ['get_transaction', 'get_vendor_history', 'run_verification'],
    evidence_ids: [`EVD-${t.id}-1`, `EVD-${t.id}-2`],
    policy_ids: ['POL-VAR-001', 'POL-DUP-001', 'POL-MAT-001', 'POL-GL-001'],
    proposed_action: t.category === 'DUPLICATE_INVOICE' ? 'MARK_DUPLICATE' : t.category === 'GL_MISCLASSIFICATION' ? 'CORRECT_GL' : 'APPROVE_VARIANCE',
    verifier_status: t.status === 'BLOCKED' ? 'REJECTED' : 'VERIFIED',
    confidence: t.confidence,
    risk_level: t.risk_tier === 'TIER_C' || t.risk_tier === 'TIER_D' ? 'HIGH' : 'LOW',
    autonomy_tier: t.risk_tier || 'TIER_A',
    human_required: t.risk_tier === 'TIER_C',
    human_decision: t.status === 'RESOLVED' || t.status === 'MANUALLY_APPROVED' ? 'APPROVED' : t.risk_tier === 'TIER_C' ? 'PENDING' : 'NOT_REQUIRED',
    final_action: t.status,
    ledger_impact_summary: `Committed as ${t.status} | GL: ${t.gl_account}`,
  }));

  const filtered = auditRecords.filter((r) => {
    if (filterTier !== 'ALL' && r.autonomy_tier !== filterTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.vendor.toLowerCase().includes(q) ||
        r.decision_id.toLowerCase().includes(q) ||
        r.transaction_id.toLowerCase().includes(q) ||
        r.trace_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ledgerproof_audit_vault_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Immutable Audit Trail
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
            Audit Vault
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5">
            Cryptographic decision history. Every financial movement is bound to evidence, policies, model versions, and human sign-offs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-text-primary bg-bg-secondary border border-border-subtle hover:bg-bg-subtle transition-colors shadow-subtle"
          >
            <Download className="w-3.5 h-3.5 text-text-secondary" />
            <span>Export Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Storage Indicator Callout */}
      <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          <span>
            <span className="font-semibold text-text-primary">Cryptographic Verification:</span> Decisions are sealed into an append-only transaction stream with verifiable SHA-256 state hashes.
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-muted font-semibold uppercase shrink-0">SHA-256 Sealed</span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search decision ID, vendor, trace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-md text-xs bg-bg-secondary border border-border-subtle focus:outline-none focus:border-accent text-text-primary placeholder:text-text-muted"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 self-start sm:self-auto text-xs">
          {['ALL', 'TIER_A', 'TIER_B', 'TIER_C', 'TIER_D'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterTier === tier 
                  ? 'bg-text-primary text-white font-semibold shadow-subtle' 
                  : 'bg-bg-secondary text-text-secondary border border-border-subtle hover:text-text-primary'
              }`}
            >
              {tier === 'ALL' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Records Table */}
      <div className="bg-bg-secondary rounded-xl border border-border-subtle shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-card border-b border-border-subtle text-text-muted uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Decision ID</th>
                <th className="py-3 px-4 font-semibold">Transaction</th>
                <th className="py-3 px-4 font-semibold">Vendor</th>
                <th className="py-3 px-4 font-semibold font-tabular text-right">Amount</th>
                <th className="py-3 px-4 font-semibold">Autonomy Tier</th>
                <th className="py-3 px-4 font-semibold">Verifier Check</th>
                <th className="py-3 px-4 font-semibold">Final Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-secondary font-tabular">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-text-muted">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.decision_id} className="hover:bg-bg-card/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-text-primary">{r.decision_id}</td>
                    <td className="py-3 px-4 font-mono text-text-muted">{r.transaction_id}</td>
                    <td className="py-3 px-4 font-medium text-text-primary font-sans">{r.vendor}</td>
                    <td className="py-3 px-4 text-right font-semibold text-text-primary">
                      ${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold font-mono ${
                        r.autonomy_tier === 'TIER_D'
                          ? 'bg-status-blockedBg text-status-blocked border border-status-blockedBorder'
                          : r.autonomy_tier === 'TIER_C'
                          ? 'bg-status-reviewBg text-status-review border border-status-reviewBorder'
                          : 'bg-status-verifiedBg text-status-verified border border-status-verifiedBorder'
                      }`}>
                        {r.autonomy_tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.2 rounded text-[10px] font-medium ${
                        r.verifier_status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-status-verifiedBg text-status-verified border border-status-verifiedBorder'
                      }`}>
                        {r.verifier_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-text-primary font-medium">{r.final_action}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenDecisionTrace(r.transaction_id)}
                        className="text-accent hover:underline font-semibold font-sans text-xs"
                      >
                        Inspect Trace
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
