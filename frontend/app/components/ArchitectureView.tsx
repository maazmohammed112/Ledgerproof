'use client';

import React from 'react';
import { 
  Database, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  Network, 
  CheckCircle2, 
  ArrowDown, 
  ArrowRight,
  BarChart2,
  Layers,
  FileSearch,
  Scale
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Autonomous Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal">
          Autonomous Control Graph
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          LedgerProof combines deterministic calculation with autonomous reasoning, adversarial verification, and continuous benchmark evaluation.
        </p>
      </div>

      {/* Interactive Architecture Visual */}
      <div className="bg-bg-secondary p-6 sm:p-10 rounded-xl border border-border-subtle shadow-card space-y-8">
        
        {/* Layer 1: Ingestion & Deterministic Match */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <Database className="w-4 h-4 text-accent" />
            <span>Layer 01 &bull; Ingestion & Deterministic Normalization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle">
              <span className="font-semibold text-text-primary block">Bank Feeds & Wires</span>
              <span className="text-text-secondary text-[11px] mt-0.5 block">Cleared credits & debits</span>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle">
              <span className="font-semibold text-text-primary block">General Ledger Subledger</span>
              <span className="text-text-secondary text-[11px] mt-0.5 block">Chart of accounts & historical logs</span>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle">
              <span className="font-semibold text-text-primary block">AP Vendor Invoices</span>
              <span className="text-text-secondary text-[11px] mt-0.5 block">Line item billing data</span>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle">
              <span className="font-semibold text-text-primary block">Purchase Orders</span>
              <span className="text-text-secondary text-[11px] mt-0.5 block">Approved budgets & line ceilings</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center text-text-muted">
          <ArrowDown className="w-4 h-4 text-accent" />
        </div>

        {/* Layer 2: Multi-Agent Ensemble */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-accent" />
            <span>Layer 02 &bull; Multi-Agent Reasoning & Independent Verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* Agent 1 */}
            <div className="p-4 rounded-lg bg-bg-card border border-border-subtle space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-bg-subtle flex items-center justify-center font-mono font-bold text-accent text-[10px]">1</span>
                <span className="font-semibold text-text-primary">Investigation Agent</span>
              </div>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Queries vendor master agreements, contracts, and historical reconciliations via deterministic tools.
              </p>
              <div className="pt-1 text-[10px] font-mono text-accent font-semibold">Structured Tools: 8 Bound</div>
            </div>

            {/* Agent 2 */}
            <div className="p-4 rounded-lg bg-bg-card border border-border-subtle space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-bg-subtle flex items-center justify-center font-mono font-bold text-status-review text-[10px]">2</span>
                <span className="font-semibold text-text-primary">Resolution Agent (No Self-Approval)</span>
              </div>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Formulates accounting adjustments and GL mappings. Enforced prohibition against self-committing.
              </p>
              <div className="pt-1 text-[10px] font-mono text-text-muted">Non-Self-Approving Architecture</div>
            </div>

            {/* Agent 3 */}
            <div className="p-4 rounded-lg bg-bg-card border border-status-verifiedBorder bg-status-verifiedBg/20 space-y-1.5">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-status-verified" />
                <span className="font-semibold text-status-verified">Independent Verifier</span>
              </div>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Adversarial check on arithmetic, corporate policy ceilings, and GL mapping. Overrules on discrepancy.
              </p>
              <div className="pt-1 text-[10px] font-mono font-bold text-status-verified">Adversarial Gatekeeper</div>
            </div>

          </div>
        </div>

        <div className="flex justify-center text-text-muted">
          <ArrowDown className="w-4 h-4 text-accent" />
        </div>

        {/* Layer 3: Deterministic Autonomy Gate */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <Lock className="w-4 h-4 text-accent" />
            <span>Layer 03 &bull; Deterministic Autonomy Gate (Tiers A-D)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tabular">
            <div className="p-3.5 rounded-lg bg-status-verifiedBg/40 border border-status-verifiedBorder">
              <span className="font-bold text-status-verified font-mono block">Tier A: Auto-Execute</span>
              <span className="text-[11px] text-text-secondary mt-0.5 block">&lt;$2,500, verified, routine</span>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle">
              <span className="font-bold text-text-primary font-mono block">Tier B: Conditional</span>
              <span className="text-[11px] text-text-secondary mt-0.5 block">Moderate value, policy bound</span>
            </div>
            <div className="p-3.5 rounded-lg bg-status-reviewBg/40 border border-status-reviewBorder">
              <span className="font-bold text-status-review font-mono block">Tier C: Human Review</span>
              <span className="text-[11px] text-text-secondary mt-0.5 block">&gt;=$10k or variance &gt;1%</span>
            </div>
            <div className="p-3.5 rounded-lg bg-status-blockedBg/40 border border-status-blockedBorder">
              <span className="font-bold text-status-blocked font-mono block">Tier D: Hard Block</span>
              <span className="text-[11px] text-text-secondary mt-0.5 block">Duplicate, verifier rejected</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center text-text-muted">
          <ArrowDown className="w-4 h-4 text-accent" />
        </div>

        {/* Layer 4: Audit Vault & Self-Improvement Loop */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <Network className="w-4 h-4 text-accent" />
            <span>Layer 04 &bull; Audit Vault & Continuous Benchmark Loop</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle space-y-1">
              <span className="font-semibold text-text-primary block">Immutable Audit Vault</span>
              <p className="text-[11px] text-text-secondary">Cryptographic log of all tool calls, evidence IDs, and timestamps.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle space-y-1">
              <span className="font-semibold text-text-primary block">Policy Optimization</span>
              <p className="text-[11px] text-text-secondary">Empirical rule adjustments driven by observed manual controller sign-offs.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle space-y-1">
              <span className="font-semibold text-text-primary block">40-Case Benchmark Suite</span>
              <p className="text-[11px] text-text-secondary">Automated edge case evaluation measuring precision and zero-hallucination bounds.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
