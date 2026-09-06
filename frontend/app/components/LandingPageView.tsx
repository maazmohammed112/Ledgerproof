'use client';

import React, { useState, useEffect } from 'react';
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
  Workflow,
  Github,
  Zap,
  Building2,
  FileSpreadsheet,
  Coins,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpRight
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
  // Hero interactive simulation step
  const [simulationStep, setSimulationStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationStep((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-pastel-mint selection:text-text-primary flex flex-col antialiased">
      
      {/* 1. STICKY CLEAN NAVIGATION (Matching Reference 4) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border-subtle h-16 shrink-0 flex items-center px-4 sm:px-8 transition-all">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          
          {/* Logo Brand Mark */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onLaunchCommandCenter}>
            <div className="w-8 h-8 rounded-lg bg-[#0E332E] p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                <path d="M12 14H30C32.2 14 34 15.8 34 18V18" stroke="#DDF7EE" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M14 14V34C14 35.1 14.9 36 16 36H36" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21V29C21 30.1 21.9 31 23 31H34" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28 16L32 20L40 12" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-serif text-xl tracking-tight text-text-primary font-semibold">LedgerProof</span>
              <span className="hidden sm:inline text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-pastel-mint text-text-primary border border-pastel-mintBorder">
                Autonomous Finance
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-text-secondary">
            <a href="#capabilities" className="hover:text-text-primary transition-colors">Platform</a>
            <a href="#adversarial" className="hover:text-text-primary transition-colors">Why LedgerProof</a>
            <a href="#workflow" className="hover:text-text-primary transition-colors">How It Works</a>
            <a href="#control-plane" className="hover:text-text-primary transition-colors">Agents</a>
            <a href="#integrations" className="hover:text-text-primary transition-colors">Integrations</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onLaunchCommandCenter}
              className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1.5"
            >
              Dashboard
            </button>
            <button
              onClick={onLaunchCommandCenter}
              className="inline-flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-full bg-[#0E332E] text-white text-xs font-semibold hover:bg-bg-darkHover active:scale-[0.98] transition-all shadow-subtle"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION — 45% Text / 55% Visual (Matching Reference 4) */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: 45% Typography & Actions */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-left">
            
            {/* Small Product Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-pastel-mint border border-pastel-mintBorder text-text-primary text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Track 2 &bull; Autonomous Office of the CFO</span>
            </div>

            {/* Giant Confident Display Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl xl:text-7xl tracking-tight text-text-primary font-normal leading-[1.05]">
              Finance agents should prove their work.
            </h1>

            {/* Large Readable Body Text */}
            <p className="text-base sm:text-lg text-text-secondary font-normal leading-relaxed max-w-xl">
              LedgerProof reconciles financial data, investigates exceptions, independently verifies autonomous decisions, and escalates only when human judgment is required.
            </p>

            {/* Two Distinct Pill Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onLaunchCommandCenter}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-full bg-[#0E332E] text-white text-sm font-semibold hover:bg-bg-darkHover active:scale-[0.98] transition-all shadow-subtle"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onStartGuidedTour}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-pastel-mint text-text-primary border border-pastel-mintBorder text-sm font-semibold hover:bg-pastel-mint/80 active:scale-[0.98] transition-all shadow-subtle"
              >
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Take a Tour</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-muted">
              <span className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Floating-Point Error</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Independent Verifier Gate</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>$0.00 External AI Cost</span>
              </span>
            </div>
          </div>

          {/* Right Column: 55% Atmospheric Gradient Container & Floating Live Preview */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl p-4 sm:p-7 bg-gradient-hero shadow-card border border-border-subtle relative overflow-hidden">
              
              {/* Inner Floating Clean White Product Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-modal border border-border-subtle/80 space-y-5">
                
                {/* Window Meta Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[11px] text-text-muted ml-2">app.ledgerproof.internal</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pastel-mint text-text-primary border border-pastel-mintBorder">
                    September Close &bull; Active
                  </span>
                </div>

                {/* Animated Pipeline Simulation Ticker */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Reconciliation Velocity
                      </div>
                      <div className="font-serif text-3xl sm:text-4xl text-text-primary mt-0.5 font-normal">
                        97.4% <span className="text-sm font-sans font-medium text-emerald-600">+2.4% vs last period</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-bg-primary border border-border-subtle">
                        {simulationStep === 0 && "Step 1/4: Ingesting 5,420 Records"}
                        {simulationStep === 1 && "Step 2/4: 5,301 Deterministic Matches"}
                        {simulationStep === 2 && "Step 3/4: Investigating 87 Exceptions"}
                        {simulationStep === 3 && "Step 4/4: Independent Verifier Active"}
                      </span>
                    </div>
                  </div>

                  {/* 4 Pastel Mini Cards inside Live Preview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    
                    <div className="p-3 rounded-xl bg-pastel-lime border border-pastel-limeBorder">
                      <span className="text-[10px] uppercase font-semibold text-text-secondary block">Total Processed</span>
                      <span className="font-serif text-lg font-normal text-text-primary block mt-0.5">$4.82M</span>
                      <span className="text-[10px] text-text-muted">5,420 Txns</span>
                    </div>

                    <div className="p-3 rounded-xl bg-pastel-mint border border-pastel-mintBorder">
                      <span className="text-[10px] uppercase font-semibold text-text-secondary block">Auto-Matched</span>
                      <span className="font-serif text-lg font-normal text-text-primary block mt-0.5">5,301</span>
                      <span className="text-[10px] text-emerald-700 font-medium">97.8% Clear</span>
                    </div>

                    <div className="p-3 rounded-xl bg-pastel-pink border border-pastel-pinkBorder">
                      <span className="text-[10px] uppercase font-semibold text-text-secondary block">Verifier Blocks</span>
                      <span className="font-serif text-lg font-normal text-status-blocked block mt-0.5">3</span>
                      <span className="text-[10px] text-red-700 font-medium">Zero Self-Approval</span>
                    </div>

                    <div className="p-3 rounded-xl bg-pastel-lavender border border-pastel-lavenderBorder">
                      <span className="text-[10px] uppercase font-semibold text-text-secondary block">Human Review</span>
                      <span className="font-serif text-lg font-normal text-text-primary block mt-0.5">7</span>
                      <span className="text-[10px] text-indigo-700 font-medium">Tier C Material</span>
                    </div>

                  </div>

                  {/* Dynamic Simulation Event Banner */}
                  <div className="p-3.5 rounded-xl bg-bg-primary border border-border-subtle flex items-center justify-between text-xs transition-all">
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate text-text-secondary">
                        {simulationStep === 0 && "Normalizing multi-currency values across USD, EUR, INR, GBP, CHF..."}
                        {simulationStep === 1 && "Deterministic 3-way match confirmed against bank feeds and general ledger."}
                        {simulationStep === 2 && "Duplicate scan: Invoice #INV-8829 matched to existing disbursement."}
                        {simulationStep === 3 && "Verifier vetoed Office Supplies proposal. Re-routed to Cloud Hosting."}
                      </span>
                    </div>
                    <span className="text-emerald-700 font-semibold font-mono text-[11px] shrink-0 ml-2">VERIFIED</span>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. CAPABILITIES & INTEGRATION LOGO STRIP (Matching Reference 3) */}
      <section className="py-8 border-y border-border-subtle bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted shrink-0">
              Built for Sovereign Finance Stacks
            </span>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-8 gap-y-3 text-xs font-semibold text-text-secondary">
              <span className="hover:text-text-primary transition-colors">SAP S/4HANA</span>
              <span className="hover:text-text-primary transition-colors">Oracle NetSuite</span>
              <span className="hover:text-text-primary transition-colors">QuickBooks Online</span>
              <span className="hover:text-text-primary transition-colors">Stripe Billing</span>
              <span className="hover:text-text-primary transition-colors">Snowflake Financials</span>
              <span className="hover:text-text-primary transition-colors">PostgreSQL</span>
              <span className="hover:text-text-primary transition-colors">Excel / CSV Multi-Currency</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURE GRID — 4 PASTEL CARDS (Matching Reference 2 & 3) */}
      <section id="capabilities" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-left space-y-3 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
            Platform Capabilities
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary leading-tight">
            Autonomous finance is built differently here.
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Every layer separates probabilistic AI reasoning from deterministic arithmetic, risk policies, and human controllers.
          </p>
        </div>

        {/* 4 Large Pastel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Reconciliation (Mint Pastel) */}
          <div className="p-7 rounded-3xl bg-pastel-mint border border-pastel-mintBorder space-y-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-text-primary shadow-subtle">
                  Reconciliation
                </span>
                <span className="font-mono text-xs text-text-muted font-medium">97.4% Velocity</span>
              </div>
              <h3 className="font-serif text-2xl text-text-primary font-normal">
                Deterministic 3-Way Reconciliation
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Matches transactions, purchase orders, invoices, and bank statements without floating-point anomalies. Integer minor units ensure absolute mathematical precision.
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-subtle border border-border-subtle/60 space-y-2 text-xs font-tabular">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-[11px] text-text-muted">
                <span>Invoice vs Bank Settlement</span>
                <span className="text-emerald-700 font-semibold font-mono">EXACT MATCH</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Datadog Cloud Monitoring</span>
                <span className="font-bold">$4,850.00</span>
              </div>
              <div className="flex items-center justify-between text-text-muted text-[11px]">
                <span>PO #PO-9821 &bull; Match Confidence 100%</span>
                <span className="text-emerald-600">Auto-Cleared</span>
              </div>
            </div>
          </div>

          {/* Card 2: Exception Investigation (Aqua Pastel) */}
          <div className="p-7 rounded-3xl bg-pastel-aqua border border-pastel-aquaBorder space-y-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-text-primary shadow-subtle">
                  Investigation
                </span>
                <span className="font-mono text-xs text-text-muted font-medium">Multi-Signal Scan</span>
              </div>
              <h3 className="font-serif text-2xl text-text-primary font-normal">
                Forensic Exception Investigation
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                When variances or duplicates occur, specialized reasoning agents inspect vendor contracts, temporal invoice proximity, and historical GL classifications.
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-subtle border border-border-subtle/60 space-y-2 text-xs font-tabular">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-[11px] text-text-muted">
                <span>Duplicate Detection Matrix</span>
                <span className="text-amber-700 font-semibold font-mono">98% SIMILARITY</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Starlight Logistics (#INV-4412)</span>
                <span className="font-bold text-status-blocked">$14,500.00</span>
              </div>
              <div className="flex items-center justify-between text-text-muted text-[11px]">
                <span>Disbursed 2 days prior under identical reference</span>
                <span className="text-status-blocked font-medium">Disbursement Blocked</span>
              </div>
            </div>
          </div>

          {/* Card 3: Independent Verification (Pink Pastel) */}
          <div className="p-7 rounded-3xl bg-pastel-pink border border-pastel-pinkBorder space-y-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-text-primary shadow-subtle">
                  Adversarial Gate
                </span>
                <span className="font-mono text-xs text-text-muted font-medium">Zero Self-Approval</span>
              </div>
              <h3 className="font-serif text-2xl text-text-primary font-normal">
                Independent Adversarial Verification
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Resolution agents formulate proposals; a completely separate adversarial verifier reviews them against compliance policies. Agents never approve their own entries.
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-subtle border border-border-subtle/60 space-y-2 text-xs font-tabular">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-[11px] text-text-muted">
                <span>Amazon Web Services &bull; GL Posting</span>
                <span className="text-status-blocked font-semibold font-mono">PROPOSAL VETOED</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="line-through text-text-muted">Proposed: Office Supplies (GL 6400)</span>
                <span className="text-emerald-700 font-bold">Cloud Infra (GL 6020)</span>
              </div>
              <div className="flex items-center justify-between text-text-muted text-[11px]">
                <span>Verifier corrected classification from 24mo history</span>
                <span className="text-emerald-600 font-medium">Corrected & Posted</span>
              </div>
            </div>
          </div>

          {/* Card 4: Human Review & Materiality (Lime Pastel) */}
          <div className="p-7 rounded-3xl bg-pastel-lime border border-pastel-limeBorder space-y-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-text-primary shadow-subtle">
                  Governance
                </span>
                <span className="font-mono text-xs text-text-muted font-medium">Tier C & D Limits</span>
              </div>
              <h3 className="font-serif text-2xl text-text-primary font-normal">
                Human-in-the-Loop Materiality
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Deterministic ceilings strictly mandate controller sign-off on transactions over $10,000 (or ₹10,00,000 equivalent). Every decision anchors to an immutable SHA-256 audit vault.
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-subtle border border-border-subtle/60 space-y-2 text-xs font-tabular">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-[11px] text-text-muted">
                <span>Materiality Ceiling Assessment</span>
                <span className="text-amber-700 font-semibold font-mono">TIER C ESCALATION</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>CloudWorks Server Migration</span>
                <span className="font-bold">$42,800.00</span>
              </div>
              <div className="flex items-center justify-between text-text-muted text-[11px]">
                <span>Requires CFO/Controller Digital Signature</span>
                <span className="text-amber-700 font-medium">Pending Sign-Off</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. "AI SHOULD NOT APPROVE ITSELF" — DUAL COMPARISON PANEL (Section 13) */}
      <section id="adversarial" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-white border border-border-subtle p-8 sm:p-12 shadow-card space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-status-blocked">
              Zero Self-Approval Invariant
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary">
              AI should not approve itself.
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              When an enterprise close relies on single-pass autonomous agents, misclassifications slip directly into the general ledger. LedgerProof introduces an adversarial checkpoint.
            </p>
          </div>

          {/* Side-by-side Resolution vs Verifier Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* Left Panel: Resolution Agent */}
            <div className="p-6 rounded-2xl bg-pastel-pink/50 border border-pastel-pinkBorder space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-text-secondary">Agent 1: Resolution Agent</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">PROPOSAL</span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-text-primary">Amazon Web Services EMEA</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Proposed posting invoice to <span className="font-semibold text-status-blocked">GL 6400 (Office Supplies)</span> based on surface keyword heuristics.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-border-subtle text-xs font-tabular flex items-center justify-between">
                <span>Proposed Amount: $8,420.00</span>
                <span className="font-mono text-text-muted">Confidence: 72%</span>
              </div>
            </div>

            {/* Right Panel: Independent Verifier */}
            <div className="p-6 rounded-2xl bg-pastel-mint/50 border border-pastel-mintBorder space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-text-secondary">Agent 2: Independent Verifier</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">VERIFIER VETO</span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-text-primary">Adversarial Evaluation</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  <span className="font-bold text-status-blocked">REJECTED PROPOSAL</span> &bull; Verified 24 months historical MSA contracts. AWS is strictly categorized as <span className="font-semibold text-emerald-700">GL 6020 (Cloud Infrastructure)</span>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-border-subtle text-xs font-tabular flex items-center justify-between">
                <span className="text-emerald-700 font-semibold">Corrected Posting Committed</span>
                <span className="font-mono text-emerald-700 font-bold">100% Policy Compliant</span>
              </div>
            </div>

          </div>

          {/* Outcome Strip */}
          <div className="p-4 rounded-xl bg-pastel-mint border border-pastel-mintBorder flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="font-semibold text-text-primary">
                Potential financial misstatement of $8,420.00 automatically intercepted and prevented.
              </span>
            </div>
            <button
              onClick={() => onOpenDecisionTrace('TX-EXC-003')}
              className="text-xs font-semibold text-text-primary hover:underline shrink-0"
            >
              Inspect Telemetry Trace &rarr;
            </button>
          </div>

        </div>
      </section>

      {/* 6. AGENT CONTROL PLANE SECTION (Section 14 & Reference 3) */}
      <section id="control-plane" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-lavender-pink border border-pastel-lavenderBorder space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-800">
                Multi-Agent Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary mt-1">
                Autonomous Finance Control Plane
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Six specialized worker sessions operating under deterministic policy boundaries.
              </p>
            </div>
            <button
              onClick={onLaunchCommandCenter}
              className="px-5 py-2.5 rounded-full bg-white text-text-primary text-xs font-semibold hover:bg-bg-subtle transition-all shadow-subtle shrink-0"
            >
              View Live Control Plane
            </button>
          </div>

          {/* 6 Agent Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-white shadow-subtle border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-text-muted">Agent 01</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">ACTIVE</span>
              </div>
              <h4 className="font-semibold text-sm text-text-primary">Reconciliation Engine</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Deterministic 3-way matching across bank feeds, ERP ledgers, and open invoices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white shadow-subtle border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-text-muted">Agent 02</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">ACTIVE</span>
              </div>
              <h4 className="font-semibold text-sm text-text-primary">Duplicate Investigator</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                4-signal weighted scoring for duplicate invoices, vendor aliases, and fuzzy references.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white shadow-subtle border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-text-muted">Agent 03</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">ACTIVE</span>
              </div>
              <h4 className="font-semibold text-sm text-text-primary">Variance Investigator</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Evaluates PO tolerances, line-item price deltas, and shipping surcharges.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white shadow-subtle border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-text-muted">Agent 04</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">PROPOSING</span>
              </div>
              <h4 className="font-semibold text-sm text-text-primary">Resolution Agent</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Synthesizes forensic evidence and formulates proposed journal adjustments.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white shadow-subtle border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-text-muted">Agent 05</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">VERIFYING</span>
              </div>
              <h4 className="font-semibold text-sm text-text-primary">Independent Verifier</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Zero-tolerance adversarial audit. Validates arithmetic, policies, and evidence integrity.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white shadow-subtle border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-text-muted">Agent 06</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">GOVERNOR</span>
              </div>
              <h4 className="font-semibold text-sm text-text-primary">Controller Sign-Off Gate</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Deterministic materiality checks. Routes Tier C/D items strictly to human controllers.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. REAL DATA WORKFLOW SECTION (Section 15) */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
            Real Data Pipeline
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary">
            From raw files to verified close.
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Create an isolated company workspace, import dirty CSV or Excel sheets, and let LedgerProof run the deterministic close cycle.
          </p>
        </div>

        {/* 4 Connected Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-full bg-pastel-mint text-text-primary font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-semibold text-base text-text-primary">Isolated Workspace</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Create unlimited isolated ledgers (e.g. Maaz Technologies INR or Horizon FinTech GBP). No cross-company contamination.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-full bg-pastel-aqua text-text-primary font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-semibold text-base text-text-primary">Smart Ingestion</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload multi-sheet Excel or CSV. Automatic column aliasing maps messy headers and preserves native currencies (₹, $, €, £, CHF).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-full bg-pastel-pink text-text-primary font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-semibold text-base text-text-primary">Reconcile & Verify</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Deterministic 3-way matching executes. Material exceptions queue for controller sign-off with multi-agent evidence.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-subtle space-y-3">
            <div className="w-8 h-8 rounded-full bg-pastel-lime text-text-primary font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="font-semibold text-base text-text-primary">Close & 8 Reports</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Seal the financial period. Generate official Close Summaries, Reconciliation, Audit Trail, and Verifier reports in CSV/JSON.
            </p>
          </div>

        </div>
      </section>

      {/* 8. INTEGRATIONS BANNER (Section 31 & Reference 1) */}
      <section id="integrations" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-banner text-white shadow-card text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
            <span>Connectors & File Ingestion</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal max-w-2xl mx-auto leading-tight">
            Connect your finance stack. Reconcile with proof.
          </h2>

          <p className="text-xs sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Connect ERPs, banking feeds, and data warehouses, or import standard CSV and Excel sheets directly inside your isolated workspace.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {["SAP", "Oracle", "NetSuite", "QuickBooks", "Snowflake", "PostgreSQL", "CSV/XLSX", "Stripe"].map((tool) => (
              <span key={tool} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-sm">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA SECTION (Section 32 & Reference 1) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl p-8 sm:p-16 bg-gradient-mint-cyan border border-pastel-mintBorder text-center space-y-6 shadow-card">
          
          <div className="bg-white rounded-2xl p-8 sm:p-12 max-w-2xl mx-auto shadow-modal border border-border-subtle/80 space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pastel-mint text-text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Offline-First &bull; 100% Local Intelligence</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary leading-tight">
              Finance automation without blind trust.
            </h2>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Experience the autonomous finance control layer built for enterprise controllers, internal audit teams, and the modern Office of the CFO.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onLaunchCommandCenter}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-full bg-[#0E332E] text-white text-sm font-semibold hover:bg-bg-darkHover active:scale-[0.98] transition-all shadow-subtle"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onStartGuidedTour}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-pastel-mint text-text-primary border border-pastel-mintBorder text-sm font-semibold hover:bg-pastel-mint/80 transition-all shadow-subtle"
              >
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Take a Tour</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 10. SUBSTANTIAL ENTERPRISE FOOTER (Section 33 & Reference 1) */}
      <footer className="bg-white border-t border-border-subtle py-14 px-4 sm:px-8 text-xs text-text-secondary mt-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <div className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                Product
              </div>
              <ul className="space-y-2 text-text-muted">
                <li><a href="#capabilities" className="hover:text-text-primary transition-colors">Overview</a></li>
                <li><a href="#workflow" className="hover:text-text-primary transition-colors">Real Data Pipeline</a></li>
                <li><a href="#control-plane" className="hover:text-text-primary transition-colors">Agent Lab</a></li>
                <li><a href="#adversarial" className="hover:text-text-primary transition-colors">Independent Verifier</a></li>
                <li><a href="#reports" className="hover:text-text-primary transition-colors">8 Close Reports</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                Platform
              </div>
              <ul className="space-y-2 text-text-muted">
                <li><a href="#capabilities" className="hover:text-text-primary transition-colors">Architecture</a></li>
                <li><a href="#capabilities" className="hover:text-text-primary transition-colors">Zero Self-Approval</a></li>
                <li><a href="#capabilities" className="hover:text-text-primary transition-colors">Decimal-Safe Money</a></li>
                <li><a href="#capabilities" className="hover:text-text-primary transition-colors">SHA-256 Audit Vault</a></li>
                <li><a href="#capabilities" className="hover:text-text-primary transition-colors">Local Intelligence</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                Resources
              </div>
              <ul className="space-y-2 text-text-muted">
                <li><a href="https://github.com/Untrivial-ai/agent-orchestrator" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors">AO GitHub Docs</a></li>
                <li><a href="/sample-data/transactions.csv" download className="hover:text-text-primary transition-colors">Sample Data CSV</a></li>
                <li><a href="#evaluations" className="hover:text-text-primary transition-colors">40 Benchmark Cases</a></li>
                <li><a href="#capabilities" className="hover:text-text-primary transition-colors">Neatlogs Telemetry</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                Project
              </div>
              <ul className="space-y-2 text-text-muted">
                <li><span>Track 2: Autonomous Office of the CFO</span></li>
                <li><span>Local Intelligence Runtime</span></li>
                <li><span>Zero Paid API Requirement</span></li>
                <li><span>Evaluations: V1 (72%) &rarr; V2.4 (96%)</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-muted">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-[#0E332E] p-0.5 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                  <path d="M14 14V34C14 35.1 14.9 36 16 36H36" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-semibold text-text-primary">LedgerProof</span>
              <span>&bull;</span>
              <span>Autonomous Finance Control Layer</span>
            </div>
            <div>
              &copy; 2026 LedgerProof. Local sovereign financial control. All rights reserved.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
