'use client';

import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  RotateCcw,
  Layers,
  Compass
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tabId: string) => void;
  onOpenDecisionTrace: (txId: string) => void;
  onRunClose: () => void;
  onResetDemo: () => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenDecisionTrace,
  onRunClose,
  onResetDemo,
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: "Start Month-End Close",
      tab: "command-center",
      description: "Welcome to LedgerProof. The Controller cockpit shows September close progress at 97.4% across 4,128 ingested transactions for Northstar Labs.",
      actionLabel: "View Command Center",
      action: () => onNavigateToTab('command-center'),
    },
    {
      step: 2,
      title: "Auto-Reconcile Ordinary Transactions",
      tab: "command-center",
      description: "4,082 ordinary recurring operating expenses (rent, utilities, standard SaaS) reconcile autonomously within deterministic tolerance limits.",
      actionLabel: "Inspect Auto-Cleared",
      action: () => onNavigateToTab('command-center'),
    },
    {
      step: 3,
      title: "Detect & Block Duplicate Invoice",
      tab: "exceptions",
      description: "A re-submitted vendor invoice from Starlight Logistics ($14,500) matches an already-cleared bill. LedgerProof’s composite duplicate scoring triggers an immediate hard block (Tier D).",
      actionLabel: "Inspect Blocked Duplicate",
      action: () => onOpenDecisionTrace('TX-EXC-001'),
    },
    {
      step: 4,
      title: "Investigate PO Variance",
      tab: "exceptions",
      description: "CloudWorks Ltd billed $103,000 against a $100,000 PO. Investigation calculates exact 3.0% variance, exceeding the 2.0% policy tolerance ceiling (POL-VAR-001).",
      actionLabel: "Inspect PO Variance",
      action: () => onOpenDecisionTrace('TX-EXC-002'),
    },
    {
      step: 5,
      title: "Catch Incorrect GL Classification",
      tab: "decision-trace",
      description: "Resolution Agent erroneously attempts to book an AWS cloud charge under 'Office Supplies' based on a naive memo keyword trigger.",
      actionLabel: "Open AWS Trace",
      action: () => onOpenDecisionTrace('TX-EXC-003'),
    },
    {
      step: 6,
      title: "Trigger Independent Verifier Disagreement",
      tab: "decision-trace",
      description: "The Independent Verifier cross-checks the Vendor Master Agreement and 48 historical months, detects the conflict, and BLOCKS the action with a prominent disagreement alert.",
      actionLabel: "Witness Disagreement Block",
      action: () => onOpenDecisionTrace('TX-EXC-003'),
    },
    {
      step: 7,
      title: "Request Human Controller Approval",
      tab: "command-center",
      description: "Due to material value ($103k) and policy ceiling overage, the Autonomy Gate routes the CloudWorks variance to the Controller review queue (Tier C).",
      actionLabel: "Open Review Queue",
      action: () => onNavigateToTab('exceptions'),
    },
    {
      step: 8,
      title: "Controller Review & Materiality Sign-Off",
      tab: "command-center",
      description: "Controllers can approve, reject, request additional evidence, or edit the GL classification with built-in dual-confirmation safeguards for high-dollar transactions.",
      actionLabel: "Go to Inbox",
      action: () => onNavigateToTab('exceptions'),
    },
    {
      step: 9,
      title: "Complete Reconciliation Velocity",
      tab: "command-center",
      description: "With exceptions reviewed and duplicate payments prevented, the close velocity updates to 100%, and books are sealed for the period.",
      actionLabel: "Check Close Status",
      action: () => onNavigateToTab('command-center'),
    },
    {
      step: 10,
      title: "Inspect Immutable Audit Trail",
      tab: "audit-vault",
      description: "Auditors can review and export the complete cryptographic decision history with tool call latencies, evidence IDs, and model versions.",
      actionLabel: "Open Audit Vault",
      action: () => onNavigateToTab('audit-vault'),
    },
    {
      step: 11,
      title: "Inspect Measured Evaluation Results",
      tab: "evaluations",
      description: "See real measured benchmarks across 40 ground-truth financial cases. Agent V2 achieves 95.0% accuracy and 0.0% false auto-approvals.",
      actionLabel: "Open Evaluation Lab",
      action: () => onNavigateToTab('evaluations'),
    },
    {
      step: 12,
      title: "Continuous Policy Optimization",
      tab: "policies",
      description: "LedgerProof proposes raising CloudWorks variance tolerance to 5.0% based on 5 consecutive approved exceptions, reducing annual manual close reviews by 18.5%.",
      actionLabel: "Review Policy Proposal",
      action: () => onNavigateToTab('policies'),
    },
  ];

  const current = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      steps[nextStep - 1].action();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      steps[prevStep - 1].action();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-2 animate-fade-in">
      <div className="bg-bg-secondary/95 backdrop-blur-md border border-border-subtle rounded-xl shadow-modal p-5 space-y-3.5">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded bg-accent text-white flex items-center justify-center font-bold text-[11px]">
              {current.step}
            </span>
            <span className="font-semibold uppercase tracking-wider text-accent text-[11px]">
              Controller Guided Tour &bull; Step {currentStep} of {steps.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1 text-xs">
          <h3 className="font-medium text-base text-text-primary">{current.title}</h3>
          <p className="text-text-secondary leading-relaxed">{current.description}</p>
        </div>

        {/* Action button inside tour */}
        <div className="pt-1">
          <button
            onClick={current.action}
            className="w-full py-1.5 rounded-md text-xs font-semibold bg-bg-card border border-border-subtle hover:border-accent text-accent transition-all flex items-center justify-center space-x-1.5 shadow-subtle"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center space-x-1 text-text-secondary hover:text-text-primary disabled:opacity-30 font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Prev</span>
          </button>

          <div className="flex items-center space-x-1 font-mono text-[10px] text-text-muted">
            {steps.map((s) => (
              <span
                key={s.step}
                className={`w-1.5 h-1.5 rounded-full ${s.step === currentStep ? 'bg-accent' : 'bg-black/15'}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-1 px-3 py-1 rounded-md font-semibold text-white bg-accent hover:bg-accent-hover shadow-subtle transition-colors"
          >
            <span>{currentStep === steps.length ? 'Finish' : 'Next'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
