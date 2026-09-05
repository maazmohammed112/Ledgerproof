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
  UploadCloud
} from 'lucide-react';
import { Transaction } from '../lib/types';
import { WorkflowCanvas } from './WorkflowCanvas';
import { DataUploadModal } from './DataUploadModal';
import { store } from '../lib/store';

interface CommandCenterViewProps {
  transactions: Transaction[];
  onRunClose: () => void;
  isRunningClose: boolean;
  onNavigateToExceptions: (filter?: string) => void;
  onOpenDecisionTrace: (txId: string) => void;
  onOpenReviewModal: (tx: Transaction) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  transactions,
  onRunClose,
  isRunningClose,
  onNavigateToExceptions,
  onOpenDecisionTrace,
  onOpenReviewModal,
}) => {
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<'ALL' | 'TIER_C' | 'BLOCKED'>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const total = transactions.length;
  const autoCleared = transactions.filter((t) => t.status === 'RECONCILED' || t.status === 'AUTO_RECONCILED').length;
  const exceptions = transactions.filter((t) => t.status === 'EXCEPTION' || t.status === 'HUMAN_REVIEW_REQUIRED').length;
  const blocked = transactions.filter((t) => t.status === 'BLOCKED').length;
  const resolved = transactions.filter((t) => t.status === 'RESOLVED' || t.status === 'MANUALLY_APPROVED').length;
  const humanReview = transactions.filter((t) => t.risk_tier === 'TIER_C' && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED').length;

  const progressPct = Math.min(Math.round(((autoCleared + resolved + blocked) / Math.max(total, 1)) * 1000) / 10, 100);

  // Financial values
  const totalValue = transactions.reduce((acc, t) => acc + t.amount, 0);
  const clearedValue = transactions
    .filter((t) => t.status === 'RECONCILED' || t.status === 'AUTO_RECONCILED' || t.status === 'RESOLVED' || t.status === 'MANUALLY_APPROVED')
    .reduce((acc, t) => acc + t.amount, 0);
  const atRiskValue = transactions
    .filter((t) => t.risk_tier === 'TIER_C' && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED')
    .reduce((acc, t) => acc + t.amount, 0);
  const blockedValue = transactions
    .filter((t) => t.status === 'BLOCKED')
    .reduce((acc, t) => acc + t.amount, 0);

  // Active exception items
  const activeExceptions = transactions.filter((t) => t.category !== undefined);
  const displayedExceptions = activeExceptions.filter((tx) => {
    if (selectedQueueFilter === 'TIER_C') return tx.risk_tier === 'TIER_C' && tx.status !== 'RESOLVED';
    if (selectedQueueFilter === 'BLOCKED') return tx.status === 'BLOCKED';
    return true;
  });

  const timelineStages = [
    { id: 'ingest', label: 'Ingestion & Matching', status: 'COMPLETED', time: '09:00:04', desc: '4,082 lines auto-cleared' },
    { id: 'investigate', label: 'Forensic Investigation', status: 'COMPLETED', time: '09:02:18', desc: '7 exceptions triaged' },
    { id: 'verify', label: 'Independent Verification', status: 'COMPLETED', time: '09:03:45', desc: '2 hard blocks enforced' },
    { id: 'review', label: 'Controller Sign-Off', status: humanReview > 0 ? 'ACTIVE' : 'COMPLETED', time: 'In Progress', desc: `${humanReview} items require sign-off` },
    { id: 'close', label: 'General Ledger Seal', status: progressPct >= 100 ? 'READY' : 'WAITING', time: 'Final Step', desc: 'Immutable audit packet' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header & Close Status Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-subtle gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-text-secondary uppercase tracking-widest mb-1.5">
            <span className="w-2 h-2 rounded-full bg-status-verified" />
            <span>Northstar Labs Inc. &bull; Books As of Sep 30, 2026</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal">
            September Close
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1 max-w-xl">
            Autonomous multi-agent reconciliation running under deterministic governance bounds.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="tour-review-queue-btn"
            onClick={() => onNavigateToExceptions('TIER_C')}
            className="px-3.5 py-2 rounded-md text-xs font-semibold text-text-primary bg-bg-secondary border border-border-subtle hover:bg-bg-subtle transition-colors"
          >
            Review Queue ({humanReview})
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-semibold text-text-primary bg-bg-secondary border border-border-subtle hover:bg-bg-subtle transition-colors shadow-subtle"
            title="Upload CSV or Excel spreadsheets"
          >
            <UploadCloud className="w-3.5 h-3.5 text-accent" />
            <span>Upload Data</span>
          </button>
          <button
            onClick={onRunClose}
            disabled={isRunningClose}
            className="flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-semibold bg-accent text-white hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningClose ? 'animate-spin' : ''}`} />
            <span>{isRunningClose ? 'Reconciling Ledger...' : 'Run Close'}</span>
          </button>
        </div>
      </div>

      {/* Real Data Clean Workspace Alert if in Real Mode with no data */}
      {store.getDataMode() === 'real' && transactions.length === 0 && (
        <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-accent/40 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-accent-light text-accent mx-auto flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif text-xl text-text-primary">Real Data Workspace Active</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Demo records have been cleared. Upload your company's bank statements, invoice CSVs, or general ledger files to test autonomous reconciliation on your own data.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-subtle flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Your CSV / Excel</span>
            </button>
            <button
              onClick={() => {
                store.setDataMode('demo');
                onRunClose();
              }}
              className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-semibold text-text-secondary hover:bg-bg-subtle transition-colors"
            >
              Switch Back to Demo Data
            </button>
          </div>
        </div>
      )}

      {/* 1.5. Interactive Real-Time Agent Execution Pipeline (n8n-style) */}
      <div id="tour-workflow-pipeline" className="space-y-2">
        <WorkflowCanvas 
          onOpenDecisionTrace={onOpenDecisionTrace}
          onNavigateToTab={(tab) => onNavigateToExceptions(tab)}
          isDashboard={true}
          isRunningClose={isRunningClose}
        />
      </div>

      {/* 2. Primary Close Velocity Cockpit Card */}
      <div className="bg-bg-secondary p-6 rounded-2xl border border-border-subtle shadow-card space-y-6">
        
        {/* Top bar: Percent & Value breakdown */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-border-subtle">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
              Close Velocity
            </span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="font-serif text-4xl font-normal text-text-primary font-tabular">
                {progressPct}%
              </span>
              <span className="text-xs text-status-verified font-medium">
                Reconciled & Verified
              </span>
            </div>
            <span className="text-[11px] text-text-muted mt-1 block">
              Target close: Sep 30 &bull; Est. completion in 45m
            </span>
          </div>

          {/* Intelligently Arranged Value Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-tabular">
            <div className="p-3 rounded-lg bg-bg-card border border-border-subtle">
              <span className="text-text-muted block text-[11px]">Total Volume</span>
              <span className="font-semibold text-text-primary text-base mt-0.5 block">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 block">{total} Transactions</span>
            </div>

            <div className="p-3 rounded-lg bg-bg-card border border-status-verifiedBorder bg-status-verifiedBg/30">
              <span className="text-status-verified block text-[11px] font-medium">Auto-Cleared</span>
              <span className="font-semibold text-status-verified text-base mt-0.5 block">
                ${clearedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-status-verified/80 mt-0.5 block">{autoCleared} Items (97.4%)</span>
            </div>

            <div className="p-3 rounded-lg bg-bg-card border border-status-reviewBorder bg-status-reviewBg/30">
              <span className="text-status-review block text-[11px] font-medium">Material Variance</span>
              <span className="font-semibold text-status-review text-base mt-0.5 block">
                ${atRiskValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-status-review/80 mt-0.5 block">{humanReview} Human Sign-offs</span>
            </div>

            <div className="p-3 rounded-lg bg-bg-card border border-status-blockedBorder bg-status-blockedBg/30">
              <span className="text-status-blocked block text-[11px] font-medium">Blocked by Gate</span>
              <span className="font-semibold text-status-blocked text-base mt-0.5 block">
                ${blockedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-status-blocked/80 mt-0.5 block">{blocked} Discrepancies</span>
            </div>
          </div>
        </div>

        {/* Segmented Close Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="font-medium">Reconciliation Distribution</span>
            <span className="font-mono text-[11px] text-text-muted">
              Auto: {autoCleared} &bull; Review: {humanReview} &bull; Blocked: {blocked}
            </span>
          </div>

          <div className="w-full bg-black/5 h-3 rounded-md overflow-hidden flex">
            <div 
              className="bg-status-verified transition-all duration-500 h-full"
              style={{ width: `${(autoCleared / Math.max(total, 1)) * 100}%` }}
              title={`Auto-Cleared: ${autoCleared}`}
            />
            <div 
              className="bg-accent transition-all duration-500 h-full"
              style={{ width: `${(resolved / Math.max(total, 1)) * 100}%` }}
              title={`Resolved: ${resolved}`}
            />
            <div 
              className="bg-status-review transition-all duration-500 h-full"
              style={{ width: `${(humanReview / Math.max(total, 1)) * 100}%` }}
              title={`Human Review: ${humanReview}`}
            />
            <div 
              className="bg-status-blocked transition-all duration-500 h-full"
              style={{ width: `${(blocked / Math.max(total, 1)) * 100}%` }}
              title={`Blocked: ${blocked}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-text-secondary pt-1 font-tabular">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-status-verified" />
              <span>Auto-Cleared ({autoCleared})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Resolved ({resolved})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-status-review" />
              <span>Human Review ({humanReview})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-status-blocked" />
              <span>Blocked ({blocked})</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. 5-Stage Close Execution Pipeline */}
      <div className="bg-bg-secondary p-6 rounded-2xl border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-text-primary">Close Execution Pipeline</h3>
          <span className="text-xs font-mono text-text-muted">4 of 5 Stages Completed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {timelineStages.map((stage, idx) => {
            const isCompleted = stage.status === 'COMPLETED';
            const isActive = stage.status === 'ACTIVE';
            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                  isCompleted
                    ? 'bg-bg-card border-status-verifiedBorder'
                    : isActive
                    ? 'bg-status-reviewBg/60 border-status-reviewBorder'
                    : 'bg-bg-card/50 border-border-subtle opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-muted uppercase">0{idx + 1}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-status-verifiedBg text-status-verified'
                      : isActive
                      ? 'bg-status-reviewBg text-status-review'
                      : 'bg-black/5 text-text-muted'
                  }`}>
                    {stage.status}
                  </span>
                </div>
                <div className="font-semibold text-text-primary text-xs truncate">{stage.label}</div>
                <div className="text-[11px] text-text-secondary leading-tight">{stage.desc}</div>
                <div className="font-mono text-[10px] text-text-muted pt-1">{stage.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Priority Exception Work Items */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-text-primary">Exception Priority Queue</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Items flagged by policy rules and Independent Verifier tests requiring controller action.
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center space-x-1.5 bg-bg-secondary p-1 rounded-md border border-border-subtle text-xs">
            <button
              onClick={() => setSelectedQueueFilter('ALL')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedQueueFilter === 'ALL' ? 'bg-white text-text-primary font-semibold shadow-subtle' : 'text-text-secondary'
              }`}
            >
              All ({activeExceptions.length})
            </button>
            <button
              onClick={() => setSelectedQueueFilter('TIER_C')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedQueueFilter === 'TIER_C' ? 'bg-white text-text-primary font-semibold shadow-subtle' : 'text-text-secondary'
              }`}
            >
              Sign-Off ({humanReview})
            </button>
            <button
              onClick={() => setSelectedQueueFilter('BLOCKED')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedQueueFilter === 'BLOCKED' ? 'bg-white text-text-primary font-semibold shadow-subtle' : 'text-text-secondary'
              }`}
            >
              Blocked ({blocked})
            </button>
          </div>
        </div>

        {/* Exception Cards (Real Finance Work Items) */}
        <div className="space-y-3">
          {displayedExceptions.length === 0 ? (
            <div className="p-8 rounded-xl bg-bg-secondary border border-border-subtle text-center text-xs text-text-secondary">
              No exceptions in this filter.
            </div>
          ) : (
            displayedExceptions.map((tx) => {
              const isBlocked = tx.status === 'BLOCKED';
              const isResolved = tx.status === 'RESOLVED' || tx.status === 'MANUALLY_APPROVED';
              const isReviewRequired = tx.risk_tier === 'TIER_C' && !isResolved;

              return (
                <div
                  key={tx.id}
                  className="p-5 rounded-xl bg-bg-secondary border border-border-subtle shadow-subtle hover:border-text-secondary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left info */}
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-text-muted font-semibold">{tx.id}</span>
                      <span className="text-border-medium">&bull;</span>
                      
                      {/* Risk Tier Badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.risk_tier === 'TIER_D'
                          ? 'bg-status-blockedBg text-status-blocked border border-status-blockedBorder'
                          : tx.risk_tier === 'TIER_C'
                          ? 'bg-status-reviewBg text-status-review border border-status-reviewBorder'
                          : 'bg-status-verifiedBg text-status-verified border border-status-verifiedBorder'
                      }`}>
                        {tx.risk_tier === 'TIER_D' ? 'HIGH RISK &bull; TIER D' : tx.risk_tier === 'TIER_C' ? 'MATERIAL &bull; TIER C' : 'TIER B'}
                      </span>

                      {/* Status indicator */}
                      <span className="text-[11px] font-medium text-text-secondary">
                        {isBlocked ? 'Blocked by Verifier' : isResolved ? 'Signed Off' : 'Awaiting Controller Review'}
                      </span>
                    </div>

                    <h4 className="font-medium text-base text-text-primary">
                      {tx.vendor}
                    </h4>

                    <p className="text-xs text-text-secondary line-clamp-1">
                      {tx.notes || tx.description}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-text-muted pt-0.5">
                      <span>GL: <span className="font-mono text-text-secondary font-medium">{tx.gl_account}</span></span>
                      {tx.po_ref && <span>PO: <span className="font-mono text-text-secondary">{tx.po_ref}</span></span>}
                      {tx.invoice_ref && <span>Invoice: <span className="font-mono text-text-secondary">{tx.invoice_ref}</span></span>}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle shrink-0">
                    <div className="text-left md:text-right font-tabular">
                      <span className="text-[11px] text-text-muted block">Exception Amount</span>
                      <span className="font-semibold text-lg text-text-primary">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOpenDecisionTrace(tx.id)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-text-primary bg-bg-card border border-border-subtle hover:bg-bg-subtle transition-colors"
                      >
                        Inspect Trace
                      </button>

                      {isReviewRequired && (
                        <button
                          onClick={() => onOpenReviewModal(tx)}
                          className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-colors shadow-subtle"
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

        {/* Footer link to Exceptions tab */}
        <div className="text-center pt-2">
          <button
            onClick={() => onNavigateToExceptions('ALL')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <span>Open Full Exception Inbox ({activeExceptions.length} items)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CSV & Excel Data Ingestion Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(count, total) => {
          onRunClose();
        }}
      />

    </div>
  );
};
