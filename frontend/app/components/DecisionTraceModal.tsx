'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  Bot, 
  Scale, 
  Lock, 
  Clock, 
  Layers, 
  FileSearch, 
  ChevronDown,
  ChevronRight,
  Database,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { DecisionTrace, Transaction } from '../lib/types';

interface DecisionTraceModalProps {
  trace: DecisionTrace | null;
  transaction: Transaction | null;
  onClose: () => void;
  onOpenReviewModal?: (tx: Transaction) => void;
}

export const DecisionTraceModal: React.FC<DecisionTraceModalProps> = ({
  trace,
  transaction,
  onClose,
  onOpenReviewModal,
}) => {
  const [toolsExpanded, setToolsExpanded] = useState(false);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!trace || !transaction) return null;

  const verifier = trace.verifier;
  const isDisagreement = verifier.disagreement_detected;
  const isBlocked = trace.final_status === 'BLOCKED' || verifier.status === 'REJECTED';
  const isReviewRequired = transaction.risk_tier === 'TIER_C' && transaction.status !== 'RESOLVED' && transaction.status !== 'MANUALLY_APPROVED';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-bg-secondary w-full max-w-4xl rounded-2xl border border-border-subtle shadow-modal overflow-hidden my-6 max-h-[92vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-card shrink-0">
          <div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-mono text-text-muted font-semibold">{trace.trace_id}</span>
              <span className="text-border-medium">&bull;</span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
                Autonomous Forensic Audit Trail
              </span>
            </div>
            <h2 className="font-serif text-2xl text-text-primary mt-0.5">
              Decision Trace: {transaction.vendor}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">

          {/* CRITICAL DISAGREEMENT BANNER (Forensic Proof Moment) */}
          {isDisagreement && (
            <div className="p-4 rounded-xl bg-status-blockedBg border border-status-blocked shadow-subtle">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-status-blocked shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-status-blocked uppercase tracking-wider">
                    POTENTIAL MISPOSTING PREVENTED &bull; INDEPENDENT VERIFIER OVERRULED RESOLUTION AGENT
                  </h4>
                  <p className="text-text-primary leading-relaxed font-medium">
                    {verifier.disagreement_details}
                  </p>
                  <div className="pt-1.5 flex items-center space-x-3 font-mono text-[11px]">
                    <span className="text-text-secondary">
                      Proposed: <span className="line-through text-status-blocked">{trace.resolution.target_account}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span className="font-bold text-status-verified">
                      Correct: {verifier.corrected_account}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Summary Bar */}
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-4 font-tabular">
            <div>
              <span className="text-text-muted block text-[11px]">Transaction ID</span>
              <span className="font-mono font-semibold text-text-primary mt-0.5 block">{transaction.id}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Material Amount</span>
              <span className="font-semibold text-text-primary mt-0.5 block text-sm">
                ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {transaction.currency}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Booking Date</span>
              <span className="font-medium text-text-primary mt-0.5 block">{transaction.date}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Current Subledger GL</span>
              <span className="font-mono font-semibold text-text-primary mt-0.5 block">{transaction.gl_account}</span>
            </div>
          </div>

          {/* Chronological Professional 7-Step Trace Flow */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-text-primary">Chronological Execution Trace</h3>
              <span className="text-[11px] font-mono text-text-muted">Deterministic Audit Chain</span>
            </div>

            <div className="space-y-3">
              
              {/* Step 1: Transaction Received */}
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-bg-subtle flex items-center justify-center font-mono font-bold text-text-muted text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">Transaction Received & Ingested</span>
                    <span className="font-mono text-text-muted text-[10px]">09:00:04 UTC</span>
                  </div>
                  <p className="text-text-secondary">
                    Transaction ingested from Northstar Labs AP subledger feed. Initial checksum verified against source payload.
                  </p>
                </div>
              </div>

              {/* Step 2: Policy Retrieved */}
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-bg-subtle flex items-center justify-center font-mono font-bold text-text-muted text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">Accounting Policy Retrieved</span>
                    <span className="font-mono text-text-muted text-[10px]">09:00:08 UTC</span>
                  </div>
                  <p className="text-text-secondary">
                    Retrieved active policy rule <span className="font-mono font-semibold text-text-primary">POL-PO-001</span>: Two-way invoice match with 1.0% / $500 materiality ceiling.
                  </p>
                </div>
              </div>

              {/* Step 3: Investigation Completed */}
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded bg-bg-subtle flex items-center justify-center font-mono font-bold text-accent text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary">Investigation Agent &bull; Evidence Gathered</span>
                      <span className="text-accent font-mono text-[10px] font-semibold">
                        Confidence: {Math.round(trace.investigation.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed">
                      {trace.investigation.summary}
                    </p>
                  </div>
                </div>

                {/* Evidence Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border-subtle/50">
                  {trace.investigation.evidence_gathered.map((evd) => (
                    <div key={evd.id} className="p-2.5 rounded-lg bg-bg-subtle border border-border-subtle text-[11px]">
                      <div className="flex items-center justify-between font-medium text-text-primary mb-0.5">
                        <span>{evd.title}</span>
                        <span className="font-mono text-[10px] text-text-muted">{evd.source_type}</span>
                      </div>
                      <p className="text-text-secondary text-[11px] leading-tight">{evd.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Resolution Proposed */}
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-bg-subtle flex items-center justify-center font-mono font-bold text-status-review text-[11px] shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">Resolution Agent &bull; Action Proposal</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-bg-subtle text-text-primary">
                      {trace.resolution.proposed_action}
                    </span>
                  </div>
                  <p className="text-text-secondary">
                    {trace.resolution.explanation}
                  </p>
                  {trace.resolution.target_account && (
                    <div className="text-[11px] text-text-muted pt-0.5">
                      Proposed Target GL: <span className="font-mono font-semibold text-text-primary">{trace.resolution.target_account}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-text-muted italic pt-0.5">
                    Note: Resolution Agent proposals cannot self-approve. Enforced by Independent Verifier.
                  </div>
                </div>
              </div>

              {/* Step 5: Independent Verifier Checked */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                verifier.status === 'REJECTED'
                  ? 'bg-status-blockedBg/40 border-status-blockedBorder'
                  : 'bg-status-verifiedBg/40 border-status-verifiedBorder'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5 ${
                    verifier.status === 'REJECTED' ? 'bg-status-blocked text-white' : 'bg-status-verified text-white'
                  }`}>
                    5
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary">Independent Verifier &bull; Adversarial Audit</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        verifier.status === 'REJECTED' ? 'bg-status-blockedBg text-status-blocked' : 'bg-status-verifiedBg text-status-verified'
                      }`}>
                        VERDICT: {verifier.status}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed">
                      {verifier.notes}
                    </p>
                  </div>
                </div>

                {/* Sub-Checks Checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-subtle/50 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-status-verified">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Arithmetic Valid</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${verifier.policy_compliant ? 'text-status-verified' : 'text-status-blocked'}`}>
                    {verifier.policy_compliant ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Policy Compliant</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${verifier.classification_valid ? 'text-status-verified' : 'text-status-blocked'}`}>
                    {verifier.classification_valid ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>GL Classification</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-status-verified">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Materiality Bounds</span>
                  </div>
                </div>
              </div>

              {/* Step 6: Autonomy Gate Ruling */}
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-bg-subtle flex items-center justify-center font-mono font-bold text-text-primary text-[11px] shrink-0 mt-0.5">
                  6
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">Autonomy Gate &bull; Deterministic Classification</span>
                    <span className="font-mono font-bold text-xs px-2 py-0.2 rounded bg-text-primary text-white">
                      {trace.autonomy_gate.tier}
                    </span>
                  </div>
                  <p className="text-text-secondary">
                    {trace.autonomy_gate.reason}
                  </p>
                </div>
              </div>

              {/* Step 7: Final Execution Status */}
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-bg-subtle flex items-center justify-center font-mono font-bold text-text-primary text-[11px] shrink-0 mt-0.5">
                  7
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">Ledger Action & Execution Status</span>
                    <span className="font-mono text-text-muted text-[10px]">
                      {trace.timestamp || 'Current State'}
                    </span>
                  </div>
                  <p className="text-text-secondary font-medium">
                    Status: <span className="font-bold text-text-primary">{trace.final_status}</span> &bull; {
                      trace.final_status === 'BLOCKED' 
                        ? 'Hard block enforced. Action suspended pending fraud/duplicate clearance.'
                        : trace.final_status === 'HUMAN_REVIEW_REQUIRED'
                        ? 'Queued in Controller Inbox with pre-compiled evidence pack.'
                        : 'Action reconciled and verified.'
                    }
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Collapsible Tool Telemetry Section */}
          <div className="border border-border-subtle rounded-xl overflow-hidden bg-bg-card">
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-text-primary bg-bg-subtle/50 hover:bg-bg-subtle transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-accent" />
                <span>Deterministic Tool Execution Logs ({trace.all_tool_calls.length} Invocations)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${toolsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {toolsExpanded && (
              <div className="divide-y divide-border-subtle font-mono text-[11px]">
                {trace.all_tool_calls.map((call, i) => (
                  <div key={i} className="p-3 flex items-center justify-between hover:bg-bg-subtle/30">
                    <div className="flex items-center space-x-2 truncate max-w-lg">
                      <span className="text-accent font-semibold">{call.tool_name}()</span>
                      <span className="text-border-medium">&bull;</span>
                      <span className="text-text-secondary font-sans truncate">{call.output_summary}</span>
                    </div>
                    <span className="text-text-muted shrink-0 font-tabular ml-4">{call.duration_ms}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border-subtle bg-bg-card flex items-center justify-between shrink-0">
          <div className="text-xs text-text-muted">
            Determination: <span className="font-mono font-semibold text-text-primary">{trace.final_status}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:bg-bg-subtle transition-colors"
            >
              Close
            </button>

            {isReviewRequired && onOpenReviewModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReviewModal(transaction);
                }}
                className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-colors shadow-subtle"
              >
                Sign-Off Action
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
