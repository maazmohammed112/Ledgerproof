'use client';

import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Transaction } from '../lib/types';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-5 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Autonomous Governance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
            Exception Inbox
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5">
            Review discrepancies, independent verifier blocks, and policy threshold escalations.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor, ID, GL code..."
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
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-text-primary text-white font-semibold shadow-subtle'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-text-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exceptions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-xl bg-bg-secondary border border-border-subtle text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-status-verified mx-auto" />
            <h3 className="font-serif text-lg text-text-primary">No exceptions matching criteria</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              All transactions in this category have either been reconciled automatically or resolved.
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isBlocked = tx.status === 'BLOCKED';
            const isResolved = tx.status === 'RESOLVED' || tx.status === 'MANUALLY_APPROVED';
            const isReview = tx.risk_tier === 'TIER_C' && !isResolved;

            return (
              <div
                key={tx.id}
                className="p-5 rounded-xl bg-bg-secondary border border-border-subtle shadow-subtle hover:border-text-secondary/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left details */}
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-text-muted font-semibold">{tx.id}</span>
                    <span className="text-border-medium">&bull;</span>
                    
                    {/* Severity pill */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.risk_tier === 'TIER_D'
                        ? 'bg-status-blockedBg text-status-blocked border border-status-blockedBorder'
                        : tx.risk_tier === 'TIER_C'
                        ? 'bg-status-reviewBg text-status-review border border-status-reviewBorder'
                        : 'bg-status-verifiedBg text-status-verified border border-status-verifiedBorder'
                    }`}>
                      {tx.risk_tier === 'TIER_D' ? 'HIGH RISK' : tx.risk_tier === 'TIER_C' ? 'MATERIAL REVIEW' : 'ROUTINE'}
                    </span>

                    {/* Status marker */}
                    <span className="text-[11px] font-medium text-text-secondary">
                      {isBlocked ? 'Blocked by Verifier' : isResolved ? 'Controller Approved' : 'Awaiting Review'}
                    </span>

                    <span className="text-border-medium">&bull;</span>
                    <span className="text-[11px] text-text-muted uppercase tracking-wider font-mono">
                      {tx.category?.replace(/_/g, ' ') || 'EXCEPTION'}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-text-primary font-medium">
                    {tx.vendor}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {tx.notes || tx.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-text-muted pt-1">
                    <span>GL: <span className="font-mono text-text-secondary font-medium">{tx.gl_account}</span></span>
                    {tx.invoice_ref && <span>Invoice: <span className="font-mono text-text-secondary">{tx.invoice_ref}</span></span>}
                    {tx.po_ref && <span>PO: <span className="font-mono text-text-secondary">{tx.po_ref}</span></span>}
                    <span>Confidence: <span className="font-mono text-text-secondary font-medium">{Math.round(tx.confidence * 100)}%</span></span>
                  </div>
                </div>

                {/* Right amount & actions */}
                <div className="flex items-center justify-between lg:justify-end space-x-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-border-subtle shrink-0">
                  <div className="text-left lg:text-right font-tabular">
                    <span className="text-[11px] text-text-muted block">Transaction Amount</span>
                    <span className="font-semibold text-xl text-text-primary">
                      ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-text-muted block font-mono">{tx.currency || 'USD'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenDecisionTrace(tx.id)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-medium text-text-primary bg-bg-card border border-border-subtle hover:bg-bg-subtle transition-colors"
                    >
                      Inspect Trace
                    </button>

                    {isReview && (
                      <button
                        onClick={() => onOpenReviewModal(tx)}
                        className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-colors shadow-subtle"
                      >
                        Sign-Off
                      </button>
                    )}
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
