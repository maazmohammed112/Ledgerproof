'use client';

import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  SlidersHorizontal,
  X,
  ShieldAlert,
  ShieldCheck,
  FileSearch,
  HelpCircle,
  Tag,
  MessageSquare,
  ChevronDown,
  Lock,
  RotateCcw
} from 'lucide-react';
import { Transaction, RiskTier } from '../lib/types';
import { store } from '../lib/store';
import { formatMoney } from '../lib/money';

interface ExceptionInboxViewProps {
  transactions: Transaction[];
  onOpenDecisionTrace: (txId: string) => void;
  onOpenReviewModal: (tx: Transaction) => void;
  initialFilter?: string;
}

export const ExceptionInboxView: React.FC<ExceptionInboxViewProps> = ({
  transactions,
  onOpenDecisionTrace,
  onOpenReviewModal,
  initialFilter = 'ALL',
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reclassifyingTxId, setReclassifyingTxId] = useState<string | null>(null);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  const activeWs = store.getActiveWorkspace();
  const materialityCeiling = activeWs.reportingCurrency === 'INR' ? 1000000 : 10000;

  // All exception transactions
  const allExceptions = transactions.filter(
    (t) => t.category !== undefined || t.status === 'EXCEPTION' || t.status === 'BLOCKED'
  );

  const filtered = allExceptions.filter((t) => {
    // Filter by tab
    if (activeFilter === 'REVIEW' && (t.risk_tier !== 'TIER_C' || t.status === 'RESOLVED' || t.status === 'MANUALLY_APPROVED')) return false;
    if (activeFilter === 'BLOCKED' && t.status !== 'BLOCKED') return false;
    if (activeFilter === 'RESOLVED' && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED') return false;
    if (activeFilter === 'DUPLICATE_INVOICE' && t.category !== 'DUPLICATE_INVOICE') return false;
    if (activeFilter === 'PO_VARIANCE' && t.category !== 'PO_VARIANCE') return false;
    if (activeFilter === 'GL_MISCLASSIFICATION' && t.category !== 'GL_MISCLASSIFICATION') return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.vendor.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.gl_account && t.gl_account.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const filterTabs = [
    { id: 'ALL', label: 'All Exceptions', count: allExceptions.length },
    { id: 'REVIEW', label: 'Review Queue', count: allExceptions.filter(t => t.risk_tier === 'TIER_C' && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED').length },
    { id: 'BLOCKED', label: 'Blocked by Verifier', count: allExceptions.filter(t => t.status === 'BLOCKED').length },
    { id: 'RESOLVED', label: 'Resolved', count: allExceptions.filter(t => t.status === 'RESOLVED' || t.status === 'MANUALLY_APPROVED').length },
    { id: 'DUPLICATE_INVOICE', label: 'Duplicates', count: allExceptions.filter(t => t.category === 'DUPLICATE_INVOICE').length },
    { id: 'PO_VARIANCE', label: 'PO Variance', count: allExceptions.filter(t => t.category === 'PO_VARIANCE').length },
    { id: 'GL_MISCLASSIFICATION', label: 'GL Misclassification', count: allExceptions.filter(t => t.category === 'GL_MISCLASSIFICATION').length },
  ];

  const getTierRationale = (tx: Transaction) => {
    const currency = tx.currency || activeWs.reportingCurrency || 'USD';
    const ceilingFmt = formatMoney(materialityCeiling, currency, activeWs.locale);
    const amountFmt = formatMoney(tx.amount, currency, activeWs.locale);

    if (tx.risk_tier === 'TIER_D' || tx.status === 'BLOCKED') {
      if (tx.category === 'DUPLICATE_INVOICE') {
        return {
          tier: 'TIER_D',
          badgeText: 'Tier D • Hard Block',
          badgeClass: 'bg-pastel-pink text-status-blocked border border-pastel-pinkBorder',
          title: 'Zero-Tolerance Duplicate Collision',
          ruleCode: 'POL-DUP-001',
          explanation: `Duplicate collision confidence is ${Math.round((tx.confidence || 0.98) * 100)}%. The invoice reference is already recorded in the active ledger or vendor batch. Autonomous execution is permanently hard-blocked to eliminate double-payment risk.`,
          options: [
            { label: 'Inspect Invoice Collision Hash', action: 'trace' },
            { label: 'Flag Fraud / Reject Bill', action: 'reject' },
            { label: 'Controller Override (De-duplicate)', action: 'override_tier_c' }
          ]
        };
      }
      return {
        tier: 'TIER_D',
        badgeText: 'Tier D • Verifier Rejection',
        badgeClass: 'bg-pastel-pink text-status-blocked border border-pastel-pinkBorder',
        title: 'Adversarial Verifier Disagreement',
        ruleCode: 'INV-SAFE-001',
        explanation: 'Resolution Agent proposed auto-clearance, but the Independent Verifier rejected the entry based on multi-year vendor subledger evidence. Self-approval is strictly forbidden under system invariants.',
        options: [
          { label: 'View Verifier Disagreement Proof', action: 'trace' },
          { label: 'Route to Chief Accounting Officer', action: 'flag' },
          { label: 'Reassign to Tier C for Manual Review', action: 'override_tier_c' }
        ]
      };
    }

    if (tx.risk_tier === 'TIER_C' || tx.amount >= materialityCeiling) {
      return {
        tier: 'TIER_C',
        badgeText: 'Tier C • Material Review',
        badgeClass: 'bg-pastel-cream text-[#B45309] border border-[#FDE68A]',
        title: 'Materiality Threshold Escalation',
        ruleCode: 'POL-MAT-001',
        explanation: `Transaction value (${amountFmt}) exceeds the deterministic materiality ceiling (${ceilingFmt}). Under financial control policies, autonomous agents cannot commit material balance sheet movements without dual human controller sign-off.`,
        options: [
          { label: 'Sign-Off as Controller', action: 'review' },
          { label: 'Inspect Trace & Policy Proof', action: 'trace' },
          { label: 'Request Vendor Credit Note', action: 'credit_note' },
          { label: 'Reclassify to Tier B (Under Policy Waiver)', action: 'override_tier_b' }
        ]
      };
    }

    if (tx.risk_tier === 'TIER_B') {
      return {
        tier: 'TIER_B',
        badgeText: 'Tier B • Flagged Auto-Clearance',
        badgeClass: 'bg-pastel-aqua text-accent border border-pastel-aquaBorder',
        title: 'Operational Tolerance Auto-Clearance',
        ruleCode: 'POL-TOL-002',
        explanation: `Minor variance (< 2.0%) within recurring vendor tolerances. System automatically cleared the transaction with continuous audit hashing.`,
        options: [
          { label: 'Inspect Historical Tolerance Band', action: 'trace' },
          { label: 'Escalate to Tier C Review', action: 'override_tier_c' }
        ]
      };
    }

    return {
      tier: 'TIER_A',
      badgeText: 'Tier A • Fully Autonomous',
      badgeClass: 'bg-pastel-mint text-status-verified border border-pastel-mintBorder',
      title: 'Full Deterministic Clearance',
      ruleCode: 'POL-REC-001',
      explanation: '100% 3-way match across Subledger, Bank, and Purchase Order. Arithmetic variance is zero. Fully authorized for auto-execution.',
      options: [
        { label: 'Inspect Match Proof', action: 'trace' }
      ]
    };
  };

  const handleTierAction = (tx: Transaction, action: string) => {
    if (action === 'trace') {
      onOpenDecisionTrace(tx.id);
    } else if (action === 'review') {
      onOpenReviewModal(tx);
    } else if (action === 'override_tier_c') {
      store.updateTransaction(tx.id, {
        risk_tier: 'TIER_C',
        status: 'EXCEPTION',
        notes: `${tx.notes || ''} [Controller Re-tiering: Assigned Tier C for explicit human review]`.trim(),
      }, activeWs.id);
      setOverrideSuccessMsg(`Transaction ${tx.id} re-classified to Tier C (Material Human Review).`);
      setTimeout(() => setOverrideSuccessMsg(null), 4000);
    } else if (action === 'override_tier_b') {
      store.updateTransaction(tx.id, {
        risk_tier: 'TIER_B',
        status: 'RECONCILED',
        notes: `${tx.notes || ''} [Controller Policy Waiver: Tier B Auto-Clearance applied]`.trim(),
      }, activeWs.id);
      setOverrideSuccessMsg(`Transaction ${tx.id} cleared under Tier B tolerance waiver.`);
      setTimeout(() => setOverrideSuccessMsg(null), 4000);
    } else if (action === 'credit_note') {
      store.updateTransaction(tx.id, {
        notes: `${tx.notes || ''} [Vendor Action: Credit note requested for overage amount]`.trim(),
      }, activeWs.id);
      setOverrideSuccessMsg(`Credit note request logged for ${tx.vendor}. Audit trail updated.`);
      setTimeout(() => setOverrideSuccessMsg(null), 4000);
    } else if (action === 'reject') {
      store.updateTransaction(tx.id, {
        status: 'BLOCKED',
        notes: `${tx.notes || ''} [Controller Decision: Transaction rejected as duplicate / fraudulent]`.trim(),
      }, activeWs.id);
      setOverrideSuccessMsg(`Transaction ${tx.id} permanently rejected by controller.`);
      setTimeout(() => setOverrideSuccessMsg(null), 4000);
    } else if (action === 'flag') {
      store.updateTransaction(tx.id, {
        notes: `${tx.notes || ''} [Audit Flag: Escalated to Chief Accounting Officer]`.trim(),
      }, activeWs.id);
      setOverrideSuccessMsg(`Flagged ${tx.id} for CAO review.`);
      setTimeout(() => setOverrideSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {overrideSuccessMsg && (
        <div className="p-4 rounded-xl bg-pastel-mint border border-pastel-mintBorder text-status-verified font-medium text-xs flex items-center justify-between shadow-subtle animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-status-verified shrink-0" />
            <span>{overrideSuccessMsg}</span>
          </div>
          <button onClick={() => setOverrideSuccessMsg(null)} className="text-text-muted hover:text-text-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-5 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0E332E]">
            Autonomous Governance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
            Exception Inbox
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5">
            Review discrepancies, adversarial verifier blocks, and policy threshold escalations with explicit agent justifications.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor, ID, GL code, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-bg-secondary border border-border-subtle focus:outline-none focus:border-accent text-text-primary placeholder:text-text-muted"
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
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0E332E] text-white font-semibold shadow-card'
                  : 'bg-white text-text-secondary hover:text-text-primary border border-border-subtle hover:bg-bg-subtle'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-text-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exceptions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-border-subtle text-center space-y-2 shadow-subtle">
            <CheckCircle2 className="w-8 h-8 text-status-verified mx-auto" />
            <h3 className="font-serif text-lg text-text-primary">No exceptions matching criteria</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              All transactions in this category have either been reconciled automatically or resolved by the controller.
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isBlocked = tx.status === 'BLOCKED';
            const isResolved = tx.status === 'RESOLVED' || tx.status === 'MANUALLY_APPROVED';
            const isReview = tx.risk_tier === 'TIER_C' && !isResolved;
            const rationale = getTierRationale(tx);
            const currency = tx.currency || activeWs.reportingCurrency || 'USD';
            const formattedAmount = formatMoney(tx.amount, currency, activeWs.locale);

            return (
              <div
                key={tx.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-border-subtle shadow-subtle hover:border-text-secondary/30 transition-all space-y-4"
              >
                {/* Header line: ID, Category, Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-text-muted font-semibold">{tx.id}</span>
                    <span className="text-border-medium">&bull;</span>
                    
                    {/* Severity / Tier Pill */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rationale.badgeClass}`}>
                      {rationale.badgeText}
                    </span>

                    {/* Status marker */}
                    <span className="text-[11px] font-medium text-text-secondary">
                      {isBlocked ? 'Blocked by Verifier' : isResolved ? 'Controller Approved' : 'Awaiting Controller Review'}
                    </span>

                    <span className="text-border-medium">&bull;</span>
                    <span className="text-[11px] text-text-muted uppercase tracking-wider font-mono">
                      {tx.category?.replace(/_/g, ' ') || 'EXCEPTION'}
                    </span>
                  </div>

                  {/* Transaction Amount */}
                  <div className="flex items-baseline space-x-2 font-tabular">
                    <span className="text-xs text-text-muted">Transaction Amount:</span>
                    <span className="font-serif text-xl font-bold text-text-primary">
                      {formattedAmount}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono uppercase">{currency}</span>
                  </div>
                </div>

                {/* Middle: Vendor & Forensic Investigation Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* Left Column: Vendor info */}
                  <div className="lg:col-span-4 space-y-1.5">
                    <h3 className="font-serif text-xl text-text-primary font-medium">
                      {tx.vendor}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {tx.description}
                    </p>
                    <div className="pt-2 space-y-1 text-[11px] text-text-secondary font-tabular">
                      <div><span className="text-text-muted">GL Account:</span> <span className="font-mono font-medium text-text-primary">{tx.gl_account}</span></div>
                      {tx.invoice_ref && <div><span className="text-text-muted">Invoice Ref:</span> <span className="font-mono">{tx.invoice_ref}</span></div>}
                      {tx.po_ref && <div><span className="text-text-muted">PO Reference:</span> <span className="font-mono">{tx.po_ref}</span></div>}
                      <div><span className="text-text-muted">Booking Date:</span> <span>{tx.date}</span></div>
                      <div><span className="text-text-muted">Model Confidence:</span> <span className="font-mono font-bold text-text-primary">{Math.round((tx.confidence || 0.95) * 100)}%</span></div>
                    </div>
                  </div>

                  {/* Right Column: Agent Tier Rationale Box (The User Requirement) */}
                  <div className="lg:col-span-8 p-4 rounded-xl bg-bg-secondary border border-border-subtle space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 text-[#0E332E]" />
                        <span className="text-xs font-bold text-text-primary">
                          Agent Autonomy Rationale: Why {rationale.tier} Was Assigned
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-border-subtle text-text-muted font-semibold">
                        Rule: {rationale.ruleCode}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed font-normal">
                      {rationale.explanation}
                    </p>

                    {tx.notes && (
                      <div className="p-2.5 rounded-lg bg-white border border-border-subtle text-[11px] text-text-secondary flex items-start space-x-2">
                        <MessageSquare className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <span><strong className="text-text-primary">Forensic Note:</strong> {tx.notes}</span>
                      </div>
                    )}

                    {/* Controller Action Options */}
                    <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                        Available Controller Options:
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {rationale.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleTierAction(tx, opt.action)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              opt.action === 'review'
                                ? 'bg-[#0E332E] text-white font-semibold shadow-subtle hover:opacity-90'
                                : opt.action === 'trace'
                                ? 'bg-white text-text-primary border border-border-subtle hover:bg-bg-subtle'
                                : 'bg-white text-text-secondary border border-border-subtle hover:text-text-primary hover:bg-bg-subtle'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
