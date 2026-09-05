'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  Filter, 
  ExternalLink,
  Search,
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction } from '../lib/types';
import { store } from '../lib/store';
import { formatMoney } from '../lib/money';

interface ReconciliationViewProps {
  transactions: Transaction[];
  onOpenDecisionTrace: (txId: string) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  transactions,
  onOpenDecisionTrace,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample pairs comparing bank transactions with GL subledger lines
  const bankPairs = transactions.slice(0, 15).map((t, idx) => {
    const isException = t.category !== undefined;
    const isBlocked = t.status === 'BLOCKED';

    let matchCategory: 
      | 'EXACT_MATCH'
      | 'HIGH_CONFIDENCE_MATCH'
      | 'PARTIAL_MATCH'
      | 'POSSIBLE_DUPLICATE'
      | 'POLICY_EXCEPTION'
      | 'REQUIRES_INVESTIGATION' = 'EXACT_MATCH';

    let confidence = 0.99;
    let variance = 0;

    if (t.category === 'DUPLICATE_INVOICE') {
      matchCategory = 'POSSIBLE_DUPLICATE';
      confidence = 0.98;
    } else if (t.category === 'PO_VARIANCE') {
      matchCategory = 'POLICY_EXCEPTION';
      confidence = 0.92;
      variance = 3000;
    } else if (t.category === 'GL_MISCLASSIFICATION') {
      matchCategory = 'REQUIRES_INVESTIGATION';
      confidence = 0.72;
    } else if (t.category === 'FX_VARIANCE') {
      matchCategory = 'PARTIAL_MATCH';
      confidence = 0.88;
      variance = 240;
    }

    return {
      id: `PAIR-${idx + 1}`,
      txId: t.id,
      bankLine: {
        vendor: t.vendor,
        amount: t.amount,
        currency: t.currency,
        date: t.date,
        ref: t.invoice_ref || `WIRE-${t.id}`,
      },
      glLine: {
        account: t.gl_account,
        amount: t.category === 'PO_VARIANCE' ? t.amount - 3000 : t.amount,
        currency: t.currency,
        date: t.date,
        status: t.status,
      },
      matchCategory,
      confidence,
      variance,
      notes: t.notes || 'Three-way match confirmed against SVB Wire settlement and AP Invoice register.',
    };
  });

  const filteredPairs = bankPairs.filter((p) => {
    const matchesSearch = 
      p.bankLine.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bankLine.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.glLine.account.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedFilter === 'ALL' || p.matchCategory === selectedFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Automated 3-Way Matching Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary">
            Reconciliation
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1 max-w-xl">
            Real-time reconciliation grid comparing external bank feeds, vendor invoices, and the general ledger chart of accounts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Reconciliation Rate: 97.8%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-secondary p-3 rounded-xl border border-border-subtle text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search matching pairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Pairs' },
            { id: 'EXACT_MATCH', label: 'Exact Match' },
            { id: 'POLICY_EXCEPTION', label: 'Policy Exception' },
            { id: 'POSSIBLE_DUPLICATE', label: 'Duplicate' },
            { id: 'REQUIRES_INVESTIGATION', label: 'Investigate' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedFilter === cat.id 
                  ? 'bg-accent text-white shadow-subtle' 
                  : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matching Grid */}
      <div className="space-y-3">
        {filteredPairs.map((pair) => (
          <div
            key={pair.id}
            className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-subtle hover:border-text-secondary/40 transition-all space-y-3 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-text-muted text-[11px] font-semibold">{pair.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  pair.matchCategory === 'EXACT_MATCH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  pair.matchCategory === 'POSSIBLE_DUPLICATE' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  pair.matchCategory === 'POLICY_EXCEPTION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {pair.matchCategory.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] font-mono text-text-secondary">
                  Confidence: {(pair.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <button
                onClick={() => onOpenDecisionTrace(pair.txId)}
                className="text-accent hover:underline flex items-center space-x-1 font-semibold text-[11px]"
              >
                <span>Inspect Trace</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Side by Side: Bank vs GL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left: Bank Statement Side */}
              <div className="p-3 bg-bg-secondary rounded-lg border border-border-subtle space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span className="font-semibold uppercase tracking-wider">Bank Feed Source</span>
                  <span className="font-mono">{pair.bankLine.date}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-text-primary text-sm">{pair.bankLine.vendor}</span>
                  <span className="font-mono font-semibold text-text-primary text-sm font-tabular">
                    {formatMoney(pair.bankLine.amount, pair.bankLine.currency)}
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary font-mono">Ref: {pair.bankLine.ref}</div>
              </div>

              {/* Right: General Ledger Side */}
              <div className="p-3 bg-bg-secondary rounded-lg border border-border-subtle space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span className="font-semibold uppercase tracking-wider">General Ledger Match</span>
                  <span className="font-mono">{pair.glLine.date}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-text-primary truncate max-w-[180px]">{pair.glLine.account}</span>
                  <span className="font-mono font-semibold text-text-primary text-sm font-tabular">
                    {formatMoney(pair.glLine.amount, pair.glLine.currency)}
                  </span>
                </div>
                <div className="text-[11px] flex items-center justify-between text-text-secondary font-mono">
                  <span>Status: {pair.glLine.status}</span>
                  {pair.variance > 0 && (
                    <span className="text-amber-700 font-bold">Variance: +${pair.variance.toLocaleString()}</span>
                  )}
                </div>
              </div>

            </div>

            {/* Note & Rationale */}
            <div className="text-[11px] text-text-secondary leading-relaxed bg-bg-subtle p-2 rounded border border-border-subtle">
              <span className="font-semibold text-text-primary">Matching Rationale: </span>
              {pair.notes}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
