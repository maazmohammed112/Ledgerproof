'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileSearch, 
  Scale, 
  Lock, 
  Layers,
  ChevronRight,
  Database,
  Cpu,
  Bot,
  Compass,
  FileCheck,
  TrendingUp,
  BarChart2,
  Workflow
} from 'lucide-react';

interface LandingPageViewProps {
  onLaunchCommandCenter: () => void;
  onOpenDecisionTrace: (txId: string) => void;
  onStartGuidedTour: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLaunchCommandCenter,
  onOpenDecisionTrace,
  onStartGuidedTour,
}) => {
  const [activeTabPreview, setActiveTabPreview] = useState<'cockpit' | 'trace' | 'audit'>('cockpit');

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-light selection:text-accent">
      
      {/* 1. HERO SECTION */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Product label */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-bg-subtle border border-border-subtle text-text-secondary text-xs font-medium tracking-wide mb-8">
          <span className="w-2 h-2 rounded-full bg-status-verified" />
          <span>Track 2 &bull; Autonomous Office of the CFO</span>
        </div>

        {/* Strong serif display headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-text-primary font-normal leading-[1.08] max-w-4xl mx-auto">
          Finance agents should <span className="italic text-accent">prove</span> their work.
        </h1>

        {/* Supporting text */}
        <p className="mt-8 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed">
          LedgerProof investigates, resolves, and independently verifies financial exceptions before they ever touch your general ledger.
        </p>

        {/* Primary CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onLaunchCommandCenter}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3 rounded-md bg-accent text-white font-medium text-sm hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle"
          >
            <span>Launch Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onStartGuidedTour}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-md bg-white text-text-primary border border-border-subtle font-medium text-sm hover:bg-bg-subtle active:scale-[0.98] transition-all shadow-subtle"
          >
            <Compass className="w-4 h-4 text-accent" />
            <span>See How It Works</span>
          </button>
        </div>

      </section>

      {/* 2. REAL PRODUCT PREVIEW (Interactive Cockpit) */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl shadow-card overflow-hidden">
          
          {/* Cockpit Window Header */}
          <div className="px-6 py-3.5 bg-bg-card border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-border-medium" />
                <span className="w-2.5 h-2.5 rounded-full bg-border-medium" />
                <span className="w-2.5 h-2.5 rounded-full bg-border-medium" />
              </div>
              <span className="font-mono text-xs text-text-muted">app.ledgerproof.internal &bull; Northstar Labs FY26 Sep Close</span>
            </div>

            {/* Toggle Preview View */}
            <div className="flex items-center space-x-1 bg-bg-subtle p-1 rounded-md text-xs">
              <button
                onClick={() => setActiveTabPreview('cockpit')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTabPreview === 'cockpit' ? 'bg-white text-text-primary shadow-subtle font-semibold' : 'text-text-secondary'
                }`}
              >
                Close Cockpit
              </button>
              <button
                onClick={() => setActiveTabPreview('trace')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTabPreview === 'trace' ? 'bg-white text-text-primary shadow-subtle font-semibold' : 'text-text-secondary'
                }`}
              >
                Verifier Telemetry
              </button>
              <button
                onClick={() => setActiveTabPreview('audit')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTabPreview === 'audit' ? 'bg-white text-text-primary shadow-subtle font-semibold' : 'text-text-secondary'
                }`}
              >
                Immutable Vault
              </button>
            </div>
          </div>

          {/* Preview Tab 1: Live Close Cockpit */}
          {activeTabPreview === 'cockpit' && (
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Velocity Summary Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-bg-card border border-border-subtle">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-text-secondary">
                    <span className="w-2 h-2 rounded-full bg-status-verified" />
                    <span className="font-semibold uppercase tracking-wider">Automated Month-End Close</span>
                  </div>
                  <h3 className="font-serif text-2xl text-text-primary mt-1">September 2026 Close Pipeline</h3>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs text-text-muted block">Reconciliation Velocity</span>
                    <span className="font-tabular font-semibold text-lg text-status-verified">97.4% Complete</span>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-status-verifiedBg border border-status-verifiedBorder font-tabular font-bold text-status-verified text-sm">
                    4,082 / 4,128 Tx
                  </div>
                </div>
              </div>

              {/* Sophisticated Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
                  <span className="text-xs text-text-muted block">Total Volume</span>
                  <span className="font-tabular text-2xl font-semibold text-text-primary mt-1 block">$2,845,920.00</span>
                  <span className="text-[11px] text-text-secondary mt-1 block">4,128 transactions</span>
                </div>

                <div className="p-4 rounded-xl bg-bg-card border border-status-verifiedBorder bg-status-verifiedBg/30">
                  <span className="text-xs text-status-verified font-medium block">Auto-Reconciled</span>
                  <span className="font-tabular text-2xl font-semibold text-status-verified mt-1 block">$2,742,470.00</span>
                  <span className="text-[11px] text-status-verified/80 mt-1 block">4,082 immaterial (Tier A/B)</span>
                </div>

                <div className="p-4 rounded-xl bg-bg-card border border-status-reviewBorder bg-status-reviewBg/30">
                  <span className="text-xs text-status-review font-medium block">Human Review Required</span>
                  <span className="font-tabular text-2xl font-semibold text-status-review mt-1 block">3 Exceptions</span>
                  <span className="text-[11px] text-status-review/80 mt-1 block">Material variance (Tier C)</span>
                </div>

                <div className="p-4 rounded-xl bg-bg-card border border-status-blockedBorder bg-status-blockedBg/30">
                  <span className="text-xs text-status-blocked font-medium block">Blocked by Verifier</span>
                  <span className="font-tabular text-2xl font-semibold text-status-blocked mt-1 block">2 Exceptions</span>
                  <span className="text-[11px] text-status-blocked/80 mt-1 block">Hard stop (Tier D)</span>
                </div>
              </div>

              {/* Sample High-Priority Exception Card */}
              <div className="p-5 rounded-xl bg-bg-card border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-semibold text-text-muted">TX-EXC-003</span>
                    <span className="text-border-medium">&bull;</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-blockedBg text-status-blocked border border-status-blockedBorder">
                      TIER D: HARD BLOCK
                    </span>
                    <span className="text-xs text-text-muted">AWS Monthly Cluster</span>
                  </div>
                  <h4 className="font-medium text-base text-text-primary">Amazon Web Services &bull; Cloud Hosting Variance</h4>
                  <p className="text-xs text-text-secondary">
                    Investigation suggested 6400 (Office Supplies); Independent Verifier rejected and corrected to 6010 (Hosting).
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right font-tabular">
                    <span className="text-xs text-text-muted block">Materiality</span>
                    <span className="font-semibold text-lg text-text-primary">$8,420.00</span>
                  </div>
                  <button
                    onClick={() => onOpenDecisionTrace('TX-EXC-003')}
                    className="px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
                  >
                    Inspect Telemetry
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Preview Tab 2: Verifier Telemetry */}
          {activeTabPreview === 'trace' && (
            <div className="p-6 sm:p-8 space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-status-blockedBg border border-status-blocked text-status-blocked flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span className="font-bold">INDEPENDENT VERIFIER &bull; REJECTED PROPOSED RESOLUTION</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-status-blocked text-white text-[10px] font-bold">BLOCK COMMITTED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
                  <span className="text-text-muted block text-[10px] uppercase font-bold">Agent 2: Resolution Agent</span>
                  <div className="p-2.5 rounded bg-bg-subtle text-text-primary">
                    Proposal: GL 6400 (Office Supplies) &bull; Confidence: 0.88
                  </div>
                  <p className="text-text-secondary text-[11px] font-sans">
                    Extracted keyword "Supplies" from internal department notes. Proposed auto-approval without secondary verification.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-bg-card border border-status-verifiedBorder space-y-2">
                  <span className="text-status-verified block text-[10px] uppercase font-bold">Agent 3: Independent Verifier</span>
                  <div className="p-2.5 rounded bg-status-verifiedBg text-status-verified font-bold">
                    Corrected: GL 6010 (Cloud Infrastructure & Hosting)
                  </div>
                  <p className="text-text-secondary text-[11px] font-sans">
                    Checked 48 historical matches and Master Vendor Service Agreement. AWS is contractually classified as 6010. Misposting averted.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-bg-subtle rounded-lg text-text-muted flex justify-between">
                <span>Deterministic Check: policy_vendor_rule_v2.py passed in 4.2ms</span>
                <span>Cryptographic Proof: e3b0c44298fc1c...</span>
              </div>
            </div>
          )}

          {/* Preview Tab 3: Immutable Vault */}
          {activeTabPreview === 'audit' && (
            <div className="p-6 sm:p-8 space-y-3 font-mono text-xs">
              <div className="text-xs font-sans text-text-secondary mb-2">
                Every verified decision is sealed into an append-only cryptographic event log.
              </div>
              <div className="divide-y divide-border-subtle bg-bg-card rounded-xl border border-border-subtle overflow-hidden">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-text-primary font-bold">AUD-REC-0001</span> &bull; CloudWorks Ltd ($103,000.00)
                  </div>
                  <span className="text-status-review font-semibold">Tier C Escalation</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-text-primary font-bold">AUD-REC-0002</span> &bull; Starlight Logistics ($14,500.00)
                  </div>
                  <span className="text-status-blocked font-semibold">Duplicate Blocked</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-text-primary font-bold">AUD-REC-0003</span> &bull; Amazon Web Services ($8,420.00)
                  </div>
                  <span className="text-status-verified font-semibold">Verifier Overruled</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 3. PROBLEM STATEMENT */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-border-subtle">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">The Core Risk in Autonomous Finance</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-2 leading-tight">
            Single-agent LLMs cannot be trusted with your general ledger.
          </h2>
          <p className="text-text-secondary mt-4 text-base leading-relaxed">
            Standard AI agents rubber-stamp invoices, hallucinate tax formulas, and fail silent policy boundaries. In accounting, an unverified autonomous action is not an efficiency gain—it is an audit failure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="text-xs font-mono font-bold text-status-blocked uppercase block mb-2">Failure Mode 01</span>
            <h3 className="font-serif text-xl text-text-primary">Arithmetic Hallucinations</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Language models struggle with floating-point variance tolerances and statutory withholding formulas. LedgerProof replaces prompt math with deterministic Python calculators.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="text-xs font-mono font-bold text-status-blocked uppercase block mb-2">Failure Mode 02</span>
            <h3 className="font-serif text-xl text-text-primary">Self-Verification Bias</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              When the agent that invents a resolution also verifies it, confirmation bias ensures errors pass undetected. LedgerProof enforces strict separation of duties.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="text-xs font-mono font-bold text-status-blocked uppercase block mb-2">Failure Mode 03</span>
            <h3 className="font-serif text-xl text-text-primary">Unwarranted Autonomy</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Without hard deterministic materiality gates, agents auto-approve six-figure exceptions. LedgerProof enforces statutory human-in-the-loop triggers.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW LEDGERPROOF WORKS: INVESTIGATE -> VERIFY -> ACT */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-border-subtle">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Architecture Pipeline</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-text-primary font-normal mt-2">
            Investigate. Verify. Act.
          </h2>
          <p className="text-text-secondary mt-4 text-sm sm:text-base">
            A three-stage governance model that balances speed for immaterial items with mathematical certainty for material exceptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stage 1 */}
          <div className="bg-bg-secondary p-6 sm:p-8 rounded-2xl border border-border-subtle flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center text-accent mb-6">
                <FileSearch className="w-5 h-5 text-accent" />
              </div>
              <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">Stage 01</span>
              <h3 className="font-serif text-2xl text-text-primary mt-1 mb-2">Investigate</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Deterministic ingestion across vendor master agreements, purchase orders, subledgers, and historical posting logs. All context is structured into validated schemas.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] font-mono text-text-muted">
              Pydantic Evidence Schemas
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-bg-secondary p-6 sm:p-8 rounded-2xl border border-border-subtle flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center text-accent mb-6">
                <Scale className="w-5 h-5 text-accent" />
              </div>
              <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">Stage 02</span>
              <h3 className="font-serif text-2xl text-text-primary mt-1 mb-2">Verify</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                An adversarial Independent Verifier tests the proposed resolution against corporate accounting policies, arithmetic formulas, and historical variance distributions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] font-mono text-text-muted">
              Adversarial Dual-Agent Consensus
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-bg-secondary p-6 sm:p-8 rounded-2xl border border-border-subtle flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center text-accent mb-6">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">Stage 03</span>
              <h3 className="font-serif text-2xl text-text-primary mt-1 mb-2">Act</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Deterministic code computes Autonomy Tiers A through D. Routine items commit automatically; material variances route directly into the controller's sign-off inbox.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] font-mono text-text-muted">
              Deterministic Autonomy Tiers A-D
            </div>
          </div>

        </div>
      </section>

      {/* 5. AGENT DISAGREEMENT DEMO (Hero Product Moment) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-border-subtle">
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-card">
          
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-status-blocked">Forensic Proof</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
              Watch two agents disagree.
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2">
              When an agent proposes a plausible misclassification, LedgerProof’s Independent Verifier halts execution before the general ledger is impacted.
            </p>
          </div>

          {/* Forensic Comparison Card */}
          <div className="bg-bg-card rounded-xl p-5 sm:p-6 border border-border-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-2">
              <div>
                <span className="text-xs font-mono text-text-muted">TX-EXC-003</span>
                <h4 className="font-medium text-text-primary">Amazon Web Services &bull; Monthly compute infrastructure</h4>
              </div>
              <div className="text-right font-tabular">
                <span className="font-semibold text-lg text-text-primary">$8,420.00</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Resolution Agent */}
              <div className="p-4 rounded-lg bg-bg-subtle border border-border-subtle space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-text-secondary">
                  <Bot className="w-4 h-4 text-text-secondary" />
                  <span>Resolution Agent (Generative Proposal)</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-border-subtle">
                  <span className="text-[10px] text-text-muted block uppercase font-bold">Proposed GL Account</span>
                  <span className="text-xs font-semibold text-text-primary block mt-0.5">
                    6400 &bull; Office Supplies & Administration
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  "Classified as 6400 based on keyword match 'Supplies' in internal departmental memo."
                </p>
                <div className="text-[11px] font-mono text-text-muted">Confidence: 88% &bull; Proposed Action: AUTO_POST</div>
              </div>

              {/* Independent Verifier */}
              <div className="p-4 rounded-lg bg-status-blockedBg border border-status-blockedBorder space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-status-blocked">
                  <ShieldCheck className="w-4 h-4 text-status-blocked" />
                  <span>Independent Verifier (Adversarial Check)</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-status-blockedBorder">
                  <span className="text-[10px] text-status-blocked block uppercase font-bold">Verdict: REJECTED & OVERRULED</span>
                  <span className="text-xs font-semibold text-status-verified block mt-0.5">
                    Correct GL: 6010 &bull; Cloud Infrastructure & Hosting
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  "Cross-checked 48 historical reconciliations. Vendor contract mandates 6010. Prevented misposting."
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-status-blocked uppercase">Tier D Hard Block</span>
                  <button
                    onClick={() => onOpenDecisionTrace('TX-EXC-003')}
                    className="text-accent hover:underline font-semibold"
                  >
                    View Trace &rarr;
                  </button>
                </div>
              </div>

            </div>

            {/* Banner outcome */}
            <div className="p-3.5 rounded-lg bg-status-verifiedBg border border-status-verifiedBorder flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-text-primary font-medium">
                <CheckCircle2 className="w-4 h-4 text-status-verified shrink-0" />
                <span>Misposting averted. General Ledger protected by deterministic verification.</span>
              </div>
              <button
                onClick={() => onOpenDecisionTrace('TX-EXC-003')}
                className="hidden sm:inline-block text-[11px] font-semibold text-status-verified hover:underline"
              >
                Inspect Telemetry
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 6. AUTONOMOUS CLOSE WORKFLOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-border-subtle">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Operational Cadence</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-text-primary font-normal mt-2">
            Close the books in hours, not weeks.
          </h2>
          <p className="text-text-secondary mt-4 text-sm sm:text-base">
            Autonomous velocity with human controllers focused only where financial materiality demands judgment.
          </p>
        </div>

        {/* Segmented Close Progression Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="font-mono text-xs text-text-muted font-bold block mb-1">STEP 01</span>
            <h4 className="font-serif text-lg text-text-primary">Subledger Ingestion</h4>
            <p className="text-xs text-text-secondary mt-2">
              AP, AR, and bank wire feeds parsed and normalized with deterministic checks.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="font-mono text-xs text-text-muted font-bold block mb-1">STEP 02</span>
            <h4 className="font-serif text-lg text-text-primary">2-Way & 3-Way Match</h4>
            <p className="text-xs text-text-secondary mt-2">
              97.4% immaterial transactions cleared automatically under strict $500/1% tolerances.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="font-mono text-xs text-text-muted font-bold block mb-1">STEP 03</span>
            <h4 className="font-serif text-lg text-text-primary">Adversarial Triage</h4>
            <p className="text-xs text-text-secondary mt-2">
              Exceptions investigated with multi-source evidence and adversarial verifier checks.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-bg-secondary border border-border-subtle">
            <span className="font-mono text-xs text-text-muted font-bold block mb-1">STEP 04</span>
            <h4 className="font-serif text-lg text-text-primary">Controller Sign-Off</h4>
            <p className="text-xs text-text-secondary mt-2">
              Material variances queued for 1-click human sign-off with audit-ready evidence packs.
            </p>
          </div>
        </div>
      </section>

      {/* 7. EVALUATION / BENCHMARK LAB */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-border-subtle">
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Evaluation & Rigor</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal leading-tight">
              Evaluated on 40 real-world edge cases.
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              LedgerProof is benchmarked continuously against duplicate billing, FX rounding, missing purchase orders, and tax mismatches.
            </p>
            
            <div className="flex items-center space-x-6 pt-2 font-tabular">
              <div>
                <span className="text-[11px] text-text-muted block">Agent V1 (Single LLM)</span>
                <span className="text-2xl font-serif text-text-secondary font-semibold">75.0%</span>
              </div>
              <ArrowRight className="w-4 h-4 text-accent" />
              <div>
                <span className="text-[11px] text-status-verified font-bold block">LedgerProof V2 (Ensemble)</span>
                <span className="text-2xl font-serif text-status-verified font-semibold">95.0%</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 p-5 rounded-xl bg-bg-card border border-border-subtle shadow-subtle space-y-3 text-xs font-tabular">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="font-semibold text-text-primary">Benchmark Improvements</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-status-verifiedBg text-status-verified font-bold">+20.0% Accuracy</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary">False Auto-Approvals</span>
              <span className="font-semibold text-status-verified font-mono">5.0% &rarr; 0.0%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary">Tax Calculation Errors</span>
              <span className="font-semibold text-status-verified font-mono">12.5% &rarr; 0.0%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary">Escalation Precision</span>
              <span className="font-semibold text-status-verified font-mono">82.0% &rarr; 97.4%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. AUDITABILITY & CRYPTOGRAPHIC PROOF */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-border-subtle">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Auditor Ready</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
            Built for Controllers. Proven to Auditors.
          </h2>
          <p className="text-text-secondary mt-3 text-sm leading-relaxed">
            Every step—from data extraction to arithmetic verification and controller sign-off—is hashed and exportable for Big-4 audit inspection.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="font-mono font-bold text-text-primary block">Immutable SHA-256 Hashes</span>
            <p className="text-text-secondary">
              Every decision trace records cryptographic input/output hashes, preventing post-facto tampering.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-mono font-bold text-text-primary block">Deterministic Math Engine</span>
            <p className="text-text-secondary">
              All invoice tolerances, amortizations, and FX differences use pure Python algorithms, not generative guesses.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-mono font-bold text-text-primary block">1-Click JSON Audit Export</span>
            <p className="text-text-secondary">
              Download the entire month-end reconciliation packet formatted directly for external audit review.
            </p>
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto border-t border-border-subtle">
        <h2 className="font-serif text-4xl sm:text-5xl text-text-primary font-normal">
          Close your books with mathematical proof.
        </h2>
        <p className="mt-4 text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
          Experience the autonomous finance control system designed for controllers, verified for auditors, and built for trustworthy autonomy.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onLaunchCommandCenter}
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-accent text-white font-semibold text-sm hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle"
          >
            Launch Command Center
          </button>
          <button
            onClick={onStartGuidedTour}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-white text-text-primary border border-border-subtle font-medium text-sm hover:bg-bg-subtle active:scale-[0.98] transition-all"
          >
            Run Guided Tour
          </button>
        </div>
      </section>

    </div>
  );
};
