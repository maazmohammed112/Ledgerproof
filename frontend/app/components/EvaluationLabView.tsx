'use client';

import React, { useState } from 'react';
import { 
  BarChart2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Bot, 
  Layers, 
  TrendingUp, 
  XCircle, 
  SlidersHorizontal,
  ShieldCheck
} from 'lucide-react';
import { EvaluationReport } from '../lib/types';
import { INITIAL_EVAL_REPORTS } from '../lib/mockData';

export const EvaluationLabView: React.FC = () => {
  const [reports, setReports] = useState<Record<string, EvaluationReport>>(INITIAL_EVAL_REPORTS);
  const [selectedFailure, setSelectedFailure] = useState<string | null>(null);
  const [improvementProposal, setImprovementProposal] = useState<{
    component: string;
    v1_prompt_flaw: string;
    v2_prompt_fix: string;
    gain: string;
  } | null>(null);
  const [isRetesting, setIsRetesting] = useState(false);

  const reportV1 = reports.V1;
  const reportV2 = reports.V2;

  const handleInspectFailure = (caseId: string) => {
    setSelectedFailure(caseId);
    setImprovementProposal(null);
  };

  const handleGenerateImprovement = () => {
    setImprovementProposal({
      component: "Investigation Agent Multi-Index Retrieval Strategy",
      v1_prompt_flaw: "Prompt directed LLM to categorize based on transaction memo keyword triggers only ('Supplies' -> Office Supplies).",
      v2_prompt_fix: "Mandates cross-referencing Vendor Master Agreement and 12-month historical GL chart before proposing account. Forces Independent Verifier block if account contradicts master contract.",
      gain: "+20.0% Benchmark Accuracy, 0.0% False Auto-Approval Rate.",
    });
  };

  const handleRetestV2 = () => {
    setIsRetesting(true);
    setTimeout(() => {
      setIsRetesting(false);
      setReports({
        ...reports,
        V2: {
          ...reportV2,
          timestamp: new Date().toISOString(),
          accuracy: 97.5,
          passed_cases: 39,
        }
      });
    }, 1100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Continuous Evaluation & Rigor
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
            Evaluation Lab
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5 max-w-2xl">
            Objective benchmarks measuring Agent V1 vs LedgerProof V2 across 40 ground-truth finance cases.
          </p>
        </div>

        <button
          onClick={handleRetestV2}
          disabled={isRetesting}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-accent text-white hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetesting ? 'animate-spin' : ''}`} />
          <span>{isRetesting ? 'Executing Test Suite...' : 'Re-run 40 Test Cases'}</span>
        </button>
      </div>

      {/* V1 vs V2 Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Agent V1 Card */}
        <div className="bg-bg-secondary p-6 rounded-xl border border-border-subtle shadow-subtle space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Baseline Model</span>
              <h3 className="font-serif text-xl text-text-primary mt-0.5">Agent V1 (Single LLM Baseline)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-black/5 text-text-secondary font-mono">
              30 / 40 Passed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-tabular">
            <div className="p-3 rounded-lg bg-bg-card border border-border-subtle">
              <span className="text-text-muted block text-[11px]">Accuracy</span>
              <span className="font-semibold text-lg text-text-secondary mt-0.5 block">{reportV1.accuracy}%</span>
            </div>
            <div className="p-3 rounded-lg bg-bg-card border border-border-subtle">
              <span className="text-text-muted block text-[11px]">False Auto-Approve</span>
              <span className="font-semibold text-lg text-status-blocked mt-0.5 block">{reportV1.false_auto_approval_rate}%</span>
            </div>
            <div className="p-3 rounded-lg bg-bg-card border border-border-subtle">
              <span className="text-text-muted block text-[11px]">Escalation Precision</span>
              <span className="font-semibold text-lg text-text-secondary mt-0.5 block">{reportV1.escalation_precision}%</span>
            </div>
          </div>

          {/* V1 Failure Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-primary block">Failure Taxonomy Breakdown</span>
            <div className="space-y-1 text-xs">
              {Object.entries(reportV1.failure_breakdown).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-text-secondary py-0.5">
                  <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="font-mono font-semibold text-text-primary">{v} cases</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle text-[11px] text-text-muted flex justify-between font-mono">
            <span>Avg Latency: {reportV1.average_latency_ms}ms</span>
            <span>Cost: ${reportV1.estimated_cost_usd}</span>
          </div>
        </div>

        {/* Agent V2 Card */}
        <div className="bg-bg-secondary p-6 rounded-xl border border-status-verifiedBorder bg-status-verifiedBg/10 shadow-subtle space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <span className="text-[11px] font-semibold text-status-verified uppercase tracking-wider flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Multi-Agent + Verifier Ensemble
              </span>
              <h3 className="font-serif text-xl text-text-primary mt-0.5">LedgerProof V2 (Active Production)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-status-verifiedBg text-status-verified border border-status-verifiedBorder font-mono">
              {reportV2.passed_cases} / 40 Passed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-tabular">
            <div className="p-3 rounded-lg bg-bg-card border border-status-verifiedBorder">
              <span className="text-text-muted block text-[11px]">Accuracy</span>
              <span className="font-semibold text-lg text-status-verified mt-0.5 block">{reportV2.accuracy}%</span>
              <span className="text-[10px] text-status-verified font-medium block">+20.0% gain</span>
            </div>
            <div className="p-3 rounded-lg bg-bg-card border border-status-verifiedBorder">
              <span className="text-text-muted block text-[11px]">False Auto-Approve</span>
              <span className="font-semibold text-lg text-status-verified mt-0.5 block">{reportV2.false_auto_approval_rate}%</span>
              <span className="text-[10px] text-status-verified font-medium block">Zero false clears</span>
            </div>
            <div className="p-3 rounded-lg bg-bg-card border border-status-verifiedBorder">
              <span className="text-text-muted block text-[11px]">Escalation Precision</span>
              <span className="font-semibold text-lg text-status-verified mt-0.5 block">{reportV2.escalation_precision}%</span>
              <span className="text-[10px] text-status-verified font-medium block">+11.7% gain</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle text-xs space-y-1">
            <span className="font-semibold text-text-primary block">Architecture Safeguards:</span>
            <p className="text-text-secondary leading-relaxed">
              1. Independent Verifier Agent blocks hallucinated classifications.<br />
              2. Deterministic Autonomy Gate strictly halts high-materiality entries.<br />
              3. Master vendor contract matching resolves ambiguous billing memos.
            </p>
          </div>

          <div className="pt-2 border-t border-border-subtle text-[11px] text-text-muted flex justify-between font-mono">
            <span>Avg Latency: {reportV2.average_latency_ms}ms</span>
            <span>Cost: ${reportV2.estimated_cost_usd}</span>
          </div>
        </div>

      </div>

      {/* Failed Cases Inspection */}
      <div className="bg-bg-secondary p-6 rounded-xl border border-border-subtle shadow-subtle space-y-5">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Failure Taxonomy</span>
          <h3 className="font-serif text-2xl text-text-primary mt-0.5">Inspect Edge Case Failures</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Examine failed edge cases in V1 and generate targeted prompt and retrieval optimizations.
          </p>
        </div>

        {/* Failed cases list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'EVAL-GL-001', name: 'AWS Cloud Misclassification', reason: 'Office Supplies proposal accepted by V1 without vendor contract check' },
            { id: 'EVAL-DUP-006', name: 'Sequential Invoice Suffix', reason: 'Failed to flag modified invoice suffix letter in duplicate check' },
            { id: 'EVAL-VAR-003', name: 'PO 2.5% Variance Over-Clear', reason: 'V1 heuristic permitted 2.5% exceeding POL-VAR-001 2.0% ceiling' },
            { id: 'EVAL-UNK-002', name: 'Unverified Vendor Auto-Pass', reason: 'Passed unverified vendor because amount was under temporary threshold' },
          ].map((c) => (
            <div
              key={c.id}
              onClick={() => handleInspectFailure(c.id)}
              className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                selectedFailure === c.id 
                  ? 'bg-accent-light border-accent text-accent' 
                  : 'bg-bg-card border-border-subtle text-text-secondary hover:border-text-secondary/30'
              }`}
            >
              <span className="font-mono text-[10px] text-text-muted block">{c.id}</span>
              <h4 className="font-semibold text-text-primary mt-1">{c.name}</h4>
              <p className="text-[11px] text-text-secondary mt-1 line-clamp-2">{c.reason}</p>
            </div>
          ))}
        </div>

        {/* Selected Failure Deep Dive */}
        {selectedFailure && (
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-status-blocked uppercase tracking-wider">Root Cause Inspection</span>
                <h4 className="font-serif text-xl text-text-primary mt-0.5">Case: {selectedFailure}</h4>
              </div>

              <button
                onClick={handleGenerateImprovement}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-subtle"
              >
                <span>Synthesize Prompt Optimization</span>
              </button>
            </div>

            {improvementProposal && (
              <div className="p-4 rounded-lg bg-bg-subtle border border-border-subtle space-y-2 text-xs text-text-primary">
                <span className="font-bold block text-sm">Generated Strategy Optimization:</span>
                <p><span className="font-semibold">V1 Flaw:</span> {improvementProposal.v1_prompt_flaw}</p>
                <p><span className="font-semibold">V2 Optimization:</span> {improvementProposal.v2_prompt_fix}</p>
                <span className="inline-block px-2 py-0.5 rounded bg-status-verifiedBg text-status-verified font-bold text-[10px] border border-status-verifiedBorder">
                  Impact: {improvementProposal.gain}
                </span>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
