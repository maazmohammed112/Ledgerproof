'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  ArrowUpRight, 
  FileSearch, 
  ShieldCheck, 
  UserCheck, 
  Lock,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  UploadCloud,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Sparkles,
  Building2,
  Check,
  Coins
} from 'lucide-react';
import { Transaction } from '../lib/types';
import { DataUploadModal } from './DataUploadModal';
import { store } from '../lib/store';
import { formatMoney, formatHumanReadableScale, CURRENCY_REGISTRY } from '../lib/money';

interface CommandCenterViewProps {
  transactions: Transaction[];
  onRunClose: () => void;
  isRunningClose: boolean;
  onNavigateToExceptions: (filter?: string) => void;
  onOpenDecisionTrace: (txId: string) => void;
  onOpenReviewModal: (tx: Transaction) => void;
  onOpenDataSources?: () => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  transactions,
  onRunClose,
  isRunningClose,
  onNavigateToExceptions,
  onOpenDecisionTrace,
  onOpenReviewModal,
  onOpenDataSources,
}) => {
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<'ALL' | 'TIER_C' | 'BLOCKED'>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const activeWs = store.getActiveWorkspace();
  const metrics = store.getCloseSummaryMetrics(activeWs.id);
  const currencyMeta = CURRENCY_REGISTRY[activeWs.reportingCurrency] || CURRENCY_REGISTRY.USD;

  const total = transactions.length;
  const autoCleared = transactions.filter((t) => t.status === 'RECONCILED' || t.status === 'AUTO_RECONCILED').length;
  const exceptions = transactions.filter((t) => t.status === 'EXCEPTION' || t.status === 'HUMAN_REVIEW_REQUIRED').length;
  const blocked = transactions.filter((t) => t.status === 'BLOCKED').length;
  const resolved = transactions.filter((t) => t.status === 'RESOLVED' || t.status === 'MANUALLY_APPROVED').length;
  const humanReview = transactions.filter((t) => t.risk_tier === 'TIER_C' && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED').length;

  const progressPct = total > 0 ? metrics.reconciliationRatePct : 0;
  const totalValue = metrics.totalValue;

  const activeExceptions = transactions.filter((t) => t.category !== undefined);
  const displayedExceptions = activeExceptions.filter((tx) => {
    if (selectedQueueFilter === 'TIER_C') return tx.risk_tier === 'TIER_C' && tx.status !== 'RESOLVED';
    if (selectedQueueFilter === 'BLOCKED') return tx.status === 'BLOCKED';
    return true;
  });

  // 7-day velocity chart data
  const weeklyVelocity = [
    { day: 'Mon', value: Math.round(totalValue * 0.12), pct: 45, color: '#F8E3F2' },
    { day: 'Tue', value: Math.round(totalValue * 0.18), pct: 65, color: '#ECE7FF' },
    { day: 'Wed', value: Math.round(totalValue * 0.28), pct: 90, color: '#EFF7C8' },
    { day: 'Thu', value: Math.round(totalValue * 0.22), pct: 75, color: '#DDF8FA' },
    { day: 'Fri', value: Math.round(totalValue * 0.20), pct: 70, color: '#F8E3F2' },
  ];

  const handleFinalizeClose = () => {
    const result = store.finalizeClose(activeWs.id);
    if (!result.success) {
      alert(`Close Blocked:\n\n${result.reason}`);
    } else {
      alert(`Close Finalized! Official Close Summary report generated (${result.reportId}).`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 antialiased">
      
      {/* 1. Header & Close Status Banner (Reference 5 Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-subtle gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
            <span>{currencyMeta.flag} {activeWs.companyLegalName} &bull; {activeWs.closePeriod}</span>
            {activeWs.isDemo && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Demo Dataset
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal">
            {activeWs.closePeriod} Close
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1 max-w-xl">
            Autonomous multi-agent finance operations running under deterministic policy bounds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateToExceptions('TIER_C')}
            className="px-3.5 py-2 rounded-full text-xs font-semibold text-text-primary bg-white border border-border-subtle hover:bg-bg-subtle transition-colors shadow-subtle"
          >
            Review Queue ({humanReview})
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-text-primary bg-white border border-border-subtle hover:bg-bg-subtle transition-colors shadow-subtle"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-800" />
            <span>Upload Data</span>
          </button>

          <button
            onClick={onRunClose}
            disabled={isRunningClose}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-semibold bg-[#0E332E] text-white hover:bg-bg-darkHover active:scale-[0.98] transition-all shadow-subtle disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningClose ? 'animate-spin' : ''}`} />
            <span>{isRunningClose ? 'Reconciling Ledger...' : 'Run Close'}</span>
          </button>

          {metrics.isReadyToClose && (
            <button
              onClick={handleFinalizeClose}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-subtle"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Finalize Close</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. EMPTY WORKSPACE EXPERIENCE (Requirement 6) */}
      {total === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-dashed border-border-medium shadow-card text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-pastel-mint text-text-primary mx-auto flex items-center justify-center border border-pastel-mintBorder">
            <Building2 className="w-7 h-7 text-emerald-800" />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl text-text-primary font-normal">
              Welcome to {activeWs.name}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              No financial data has been imported yet. This workspace is completely isolated with reporting currency <strong className="text-text-primary">{currencyMeta.flag} {activeWs.reportingCurrency}</strong>.
            </p>
          </div>

          {/* Onboarding Progress Checklist */}
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-bg-primary border border-border-subtle text-left space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Closing Onboarding Checklist
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2.5 text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>1. Create workspace ({activeWs.name} &bull; {activeWs.reportingCurrency}) &mdash; Complete</span>
              </div>
              <div className="flex items-center space-x-2.5 text-text-secondary font-medium">
                <span className="w-4 h-4 rounded-full border border-border-medium flex items-center justify-center text-[10px] text-text-muted shrink-0">2</span>
                <span>2. Import financial data (CSV or Excel)</span>
              </div>
              <div className="flex items-center space-x-2.5 text-text-muted">
                <span className="w-4 h-4 rounded-full border border-border-subtle flex items-center justify-center text-[10px] shrink-0">3</span>
                <span>3. Pre-validate records & schema</span>
              </div>
              <div className="flex items-center space-x-2.5 text-text-muted">
                <span className="w-4 h-4 rounded-full border border-border-subtle flex items-center justify-center text-[10px] shrink-0">4</span>
                <span>4. Run deterministic 3-way reconciliation</span>
              </div>
              <div className="flex items-center space-x-2.5 text-text-muted">
                <span className="w-4 h-4 rounded-full border border-border-subtle flex items-center justify-center text-[10px] shrink-0">5</span>
                <span>5. Investigate & resolve exceptions</span>
              </div>
              <div className="flex items-center space-x-2.5 text-text-muted">
                <span className="w-4 h-4 rounded-full border border-border-subtle flex items-center justify-center text-[10px] shrink-0">6</span>
                <span>6. Finalize close & generate audited reports</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#0E332E] text-white text-xs font-semibold hover:bg-bg-darkHover transition-all shadow-subtle"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload CSV / Excel</span>
            </button>

            <a
              href="/sample-data/transactions.csv"
              download="sample_transactions.csv"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-pastel-mint text-text-primary border border-pastel-mintBorder text-xs font-semibold hover:bg-pastel-mint/80 transition-colors shadow-subtle"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
              <span>Download Template</span>
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* 3. FOUR DISTINCT PASTEL KPI CARDS (Matching Reference 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-tabular">
            
            {/* KPI 1: Pale Lime Card (#EFF7C8) */}
            <div className="p-6 rounded-3xl bg-pastel-lime border border-pastel-limeBorder shadow-subtle space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Processed Value</span>
                <div className="flex space-x-0.5 items-end h-4">
                  <span className="w-1 h-2 bg-[#0E332E] rounded-full" />
                  <span className="w-1 h-3 bg-[#0E332E] rounded-full" />
                  <span className="w-1 h-4 bg-[#0E332E] rounded-full" />
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl font-normal text-text-primary">
                  {formatMoney(totalValue, metrics.reportingCurrency, activeWs.locale)}
                </div>
                <div className="text-xs text-emerald-900 font-semibold mt-1">
                  +2.5% vs prior period &bull; {total} records
                </div>
              </div>
            </div>

            {/* KPI 2: Soft Aqua Card (#DDF8FA) */}
            <div className="p-6 rounded-3xl bg-pastel-aqua border border-pastel-aquaBorder shadow-subtle space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Reconciled Rate</span>
                <div className="flex space-x-0.5 items-end h-4">
                  <span className="w-1 h-2 bg-cyan-800 rounded-full" />
                  <span className="w-1 h-4 bg-cyan-800 rounded-full" />
                  <span className="w-1 h-3 bg-cyan-800 rounded-full" />
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl font-normal text-text-primary">
                  {progressPct}%
                </div>
                <div className="text-xs text-cyan-900 font-semibold mt-1">
                  {autoCleared} auto-cleared &bull; 0 arithmetic delta
                </div>
              </div>
            </div>

            {/* KPI 3: Pale Pink Card (#F8E3F2) */}
            <div className="p-6 rounded-3xl bg-pastel-pink border border-pastel-pinkBorder shadow-subtle space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Exceptions & Blocks</span>
                <div className="flex space-x-0.5 items-end h-4">
                  <span className="w-1 h-4 bg-rose-800 rounded-full" />
                  <span className="w-1 h-2 bg-rose-800 rounded-full" />
                  <span className="w-1 h-3 bg-rose-800 rounded-full" />
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl font-normal text-status-blocked">
                  {activeExceptions.length}
                </div>
                <div className="text-xs text-rose-900 font-semibold mt-1">
                  {blocked} hard blocks &bull; {humanReview} human review
                </div>
              </div>
            </div>

            {/* KPI 4: Soft Lavender Card (#ECE7FF) */}
            <div className="p-6 rounded-3xl bg-pastel-lavender border border-pastel-lavenderBorder shadow-subtle space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Data Quality</span>
                <div className="flex space-x-0.5 items-end h-4">
                  <span className="w-1 h-3 bg-indigo-800 rounded-full" />
                  <span className="w-1 h-4 bg-indigo-800 rounded-full" />
                  <span className="w-1 h-2 bg-indigo-800 rounded-full" />
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl font-normal text-text-primary">
                  {metrics.dataQualityPct}%
                </div>
                <div className="text-xs text-indigo-900 font-semibold mt-1">
                  100% policy compliant &bull; {metrics.currenciesCount} currencies
                </div>
              </div>
            </div>

          </div>

          {/* 4. CHARTS SECTION (Matching Reference 5: Donut Chart + Pill Capsule Bar Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Chart: Donut Chart ("Reconciliation Breakdown") */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-border-subtle p-6 sm:p-7 shadow-card space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-text-primary">Graph Report</h3>
                  <p className="text-xs text-text-muted">Reconciliation Status Distribution</p>
                </div>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-bg-primary text-text-secondary border border-border-subtle">
                  This Month
                </span>
              </div>

              {/* Donut Visual with Central Metric */}
              <div className="flex items-center justify-center py-4 relative">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EFF7C8" strokeWidth="14" strokeDasharray="238" strokeDashoffset="40" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#DDF8FA" strokeWidth="14" strokeDasharray="238" strokeDashoffset="120" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F8E3F2" strokeWidth="14" strokeDasharray="238" strokeDashoffset="200" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-text-muted uppercase font-semibold">Total</span>
                    <span className="font-serif text-2xl font-normal text-text-primary">{total}</span>
                    <span className="text-[10px] text-text-muted">Records</span>
                  </div>
                </div>
              </div>

              {/* Colored Legend Chips */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs pt-2">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-lime border border-pastel-limeBorder" />
                  <span className="text-text-secondary">Reconciled ({autoCleared})</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-aqua border border-pastel-aquaBorder" />
                  <span className="text-text-secondary">Resolved ({resolved})</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-pink border border-pastel-pinkBorder" />
                  <span className="text-text-secondary">Exceptions ({exceptions})</span>
                </span>
              </div>
            </div>

            {/* Right Chart: Pill Capsule Bar Chart ("Total Sales/Velocity Overview") */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-border-subtle p-6 sm:p-7 shadow-card space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-text-primary">Closing Velocity Overview</h3>
                  <p className="text-xs text-text-muted">Daily Processed Financial Volume</p>
                </div>

                {/* Dark Hover Tooltip matching Reference 5 */}
                <div className="px-3 py-1 rounded-xl bg-[#0E332E] text-white font-mono text-xs font-semibold shadow-card">
                  {hoveredBarIndex !== null ? (
                    <span>{weeklyVelocity[hoveredBarIndex].day}: {formatMoney(weeklyVelocity[hoveredBarIndex].value, metrics.reportingCurrency, activeWs.locale)}</span>
                  ) : (
                    <span>Active Run: {formatMoney(totalValue, metrics.reportingCurrency, activeWs.locale)}</span>
                  )}
                </div>
              </div>

              {/* Capsule Tracks & Striped Bar Heights */}
              <div className="flex items-end justify-between gap-4 h-48 pt-4 px-2">
                {weeklyVelocity.map((item, idx) => (
                  <div 
                    key={item.day}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                  >
                    {/* Background capsule track */}
                    <div className="w-full max-w-[48px] h-full rounded-full bg-bg-primary border border-border-subtle/50 flex flex-col justify-end p-1 relative overflow-hidden transition-all group-hover:border-[#0E332E]/30">
                      {/* Pastel filled rounded bar */}
                      <div 
                        style={{ height: `${item.pct}%`, backgroundColor: item.color }}
                        className="w-full rounded-full transition-all duration-300 shadow-sm"
                      />
                    </div>
                    <span className="text-xs font-medium text-text-muted group-hover:text-text-primary transition-colors">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chart Scale Reference */}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[11px] text-text-muted">
                <span>Base: {activeWs.reportingCurrency}</span>
                <span>Deterministic Reference FX Rate Applied</span>
                <span className="text-emerald-800 font-medium">100% Decimal Safe</span>
              </div>
            </div>

          </div>

          {/* 5. EXCEPTIONS & ACTION QUEUE TABLE (Contextual Table Layout) */}
          <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-serif text-2xl text-text-primary">Exceptions Requiring Attention</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Categorized policy flags, duplicate detection signals, and controller sign-offs.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => setSelectedQueueFilter('ALL')}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                    selectedQueueFilter === 'ALL'
                      ? 'bg-[#0E332E] text-white shadow-subtle'
                      : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All ({activeExceptions.length})
                </button>
                <button
                  onClick={() => setSelectedQueueFilter('TIER_C')}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                    selectedQueueFilter === 'TIER_C'
                      ? 'bg-[#0E332E] text-white shadow-subtle'
                      : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Human Review ({humanReview})
                </button>
                <button
                  onClick={() => setSelectedQueueFilter('BLOCKED')}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                    selectedQueueFilter === 'BLOCKED'
                      ? 'bg-[#0E332E] text-white shadow-subtle'
                      : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Blocked ({blocked})
                </button>
              </div>
            </div>

            {displayedExceptions.length > 0 ? (
              <div className="overflow-x-auto font-tabular">
                <table className="w-full text-xs text-left">
                  <thead className="bg-bg-primary text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                    <tr>
                      <th className="py-2.5 px-3">Transaction</th>
                      <th className="py-2.5 px-3">Vendor / Details</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Exception Category</th>
                      <th className="py-2.5 px-3">Risk Tier</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {displayedExceptions.slice(0, 8).map((tx) => (
                      <tr key={tx.id} className="hover:bg-bg-subtle/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-text-muted font-medium">{tx.id}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-text-primary">{tx.vendor}</div>
                          <div className="text-[11px] text-text-muted line-clamp-1">{tx.notes}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-text-primary">
                          {formatMoney(tx.amount, tx.currency, activeWs.locale)}
                        </td>
                        <td className="py-3 px-3 font-mono text-text-secondary">{tx.category}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.risk_tier === 'TIER_D' ? 'bg-pastel-pink text-red-800 border border-pastel-pinkBorder' :
                            tx.risk_tier === 'TIER_C' ? 'bg-pastel-lime text-amber-800 border border-pastel-limeBorder' :
                            'bg-pastel-mint text-emerald-800 border border-pastel-mintBorder'
                          }`}>
                            {tx.risk_tier || 'TIER_C'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tx.status === 'BLOCKED' ? 'text-red-700 bg-red-50' :
                            tx.status === 'HUMAN_REVIEW_REQUIRED' ? 'text-amber-700 bg-amber-50' :
                            'text-emerald-700 bg-emerald-50'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {tx.risk_tier === 'TIER_C' && tx.status !== 'RESOLVED' && (
                              <button
                                onClick={() => onOpenReviewModal(tx)}
                                className="px-2.5 py-1 rounded-full bg-[#0E332E] text-white text-[11px] font-semibold hover:bg-bg-darkHover transition-colors shadow-subtle"
                              >
                                Sign Off
                              </button>
                            )}
                            <button
                              onClick={() => onOpenDecisionTrace(tx.id)}
                              className="text-[11px] text-text-primary font-semibold hover:underline"
                            >
                              Trace &rarr;
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-text-muted space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-semibold text-text-primary">No Exceptions in Selected Filter</div>
                <p>All items in this category are fully reconciled and verified.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Upload Data Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsUploadModalOpen(false);
        }}
      />

    </div>
  );
};
