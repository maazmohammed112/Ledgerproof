'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft, X, Check } from 'lucide-react';

export interface TutorialStep {
  targetId: string; // DOM element ID
  title: string;
  category: string;
  description: string;
  whyItMatters: string;
  financialExample: string;
  placement?: 'bottom' | 'top' | 'left' | 'right';
}

interface SpotlightTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tabId: string) => void;
  onResetDemo?: () => void;
  onRunClose?: () => void;
}

export const SpotlightTutorial: React.FC<SpotlightTutorialProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onResetDemo,
  onRunClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 = Welcome Modal
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TutorialStep[] = [
    {
      targetId: 'tour-data-mode-toggle',
      title: 'Data Mode Switcher: Demo Data vs. Your Own Real Data',
      category: 'Workspace Governance',
      description: 'Allows instantaneous switching between the pre-configured Northstar Labs GAAP demo environment and a pristine, empty workspace for testing your own corporate files.',
      whyItMatters: 'Financial controllers need the ability to test real AP/AR files without demo data contaminating production ledgers. When switched to Real Data, all demo records clear immediately, and your uploaded CSVs and Excel files are stored locally.',
      financialExample: 'Clicking "Use Real Data" clears pre-loaded demo records so you can drop your own trial balance or bank statement. Clicking "Demo Data" restores the complete 4,128-transaction testing suite.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-workflow-pipeline',
      title: 'Autonomous Multi-Agent Execution Pipeline',
      category: 'Architecture & Verification',
      description: 'An interactive n8n-style graph mapping the eight sequential stages of financial closing: Ingestion, Schema Normalization, Deterministic 3-Way Match, Forensic Investigation, Resolution Proposal, Independent Verification, Autonomy Gate, and Immutable Audit Vault.',
      whyItMatters: 'Unlike black-box language model implementations, this pipeline guarantees that no agent ever approves its own work. Deterministic arithmetic code executes before any journal entry reaches your general ledger.',
      financialExample: 'When an AWS $8,420 invoice is investigated, the Resolution Agent proposes a GL account, but the Independent Verifier inspects the Master Vendor Agreement and enforces the correct statutory classification.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-run-close-btn',
      title: 'Run Month-End Close Execution',
      category: 'Financial Operations',
      description: 'Triggers automated deterministic 3-way matching across all ingested ERP ledger postings, bank cash withdrawals, and vendor invoices for the current fiscal close period.',
      whyItMatters: 'Replaces hundreds of hours of manual Excel VLOOKUPs and ticking-and-tying. Immaterial variances (<= 2.0%) and recurring subscriptions auto-clear, while material anomalies route to the controller sign-off queue.',
      financialExample: 'Clicking "Run Close" evaluates 4,128 lines in 1.2 seconds, automatically verifying 97.4% of ordinary operating items and highlighting the remaining exceptions for human review.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-review-queue-btn',
      title: 'Material Exceptions & Controller Sign-Off Queue',
      category: 'Internal Controls',
      description: 'The primary human-in-the-loop review station for Tier C material discrepancies (>= $10,000.00) and Tier D statutory policy blocks.',
      whyItMatters: 'Sarbanes-Oxley (SOX) Section 404 mandates documented human authorization for material financial transactions. Autonomous systems must never auto-execute multi-thousand-dollar variances without controller sign-off.',
      financialExample: 'A $103,000 billing from CloudWorks Ltd exceeds the purchase order by 3.0%. The system freezes disbursement and requires your explicit controller approval before recording the expense.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-audit-vault-link',
      title: 'Immutable Cryptographic Audit Vault (SHA-256)',
      category: 'Regulatory Compliance',
      description: 'An append-only cryptographic event stream where every agent decision, tool execution, and controller signature is sealed with a SHA-256 hash.',
      whyItMatters: 'External auditors (PwC, EY, Deloitte, KPMG) require mathematical proof of internal controls. Every entry in the vault is cryptographically linked and cannot be tampered with or retroactively altered.',
      financialExample: 'Every auto-reconciled line and human sign-off generates a tamper-evident audit record complete with millisecond timestamps, tools used, and exact policy rules tested.',
      placement: 'top',
    },
  ];

  const updateTargetPosition = useCallback(() => {
    if (currentStepIndex < 0 || currentStepIndex >= steps.length) {
      setTargetRect(null);
      return;
    }

    const step = steps[currentStepIndex];
    const element = document.getElementById(step.targetId);

    if (element) {
      // Scroll element smoothly into view if not visible
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // If element not in DOM, fallback gracefully
      setTargetRect(null);
    }
  }, [currentStepIndex]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(-1);
      setTargetRect(null);
      return;
    }

    updateTargetPosition();

    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  if (!isOpen) return null;

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      setCurrentStepIndex(-1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('ledgerproof_tutorial_completed_v2', 'true');
    } catch (e) {}
    onClose();
  };

  // 1. Initial Welcome Prompt Modal (Start Tutorial or Skip)
  if (currentStepIndex === -1) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
        <div className="bg-white rounded-2xl max-w-lg w-full border border-border-subtle shadow-modal p-6 sm:p-8 space-y-6 animate-scale-up">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block">
              Northstar Labs &bull; Controller Onboarding
            </span>
            <h2 className="font-serif text-3xl text-text-primary">
              Welcome to LedgerProof
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Explore the autonomous financial close platform. This interactive walkthrough highlights key controls, explains how deterministic verification works, and demonstrates how to test with your own financial data.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg-secondary border border-border-subtle space-y-2 text-xs">
            <div className="font-semibold text-text-primary flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-status-verified" />
              <span>What you will learn in this 5-step tour:</span>
            </div>
            <ul className="space-y-1.5 text-text-secondary pl-4 list-disc text-[11px] leading-relaxed">
              <li>How to switch between demo data and your own real data workspace.</li>
              <li>How the n8n-style autonomous multi-agent pipeline reconciles accounts.</li>
              <li>How the Independent Verifier prevents financial misclassifications.</li>
              <li>How the Tier C Autonomy Gate routes material transactions to controllers.</li>
              <li>How decisions are sealed into an immutable SHA-256 audit vault.</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={handleComplete}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            >
              Skip Tutorial
            </button>
            <button
              onClick={() => setCurrentStepIndex(0)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle"
            >
              <span>Start Interactive Tutorial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Element Spotlight Mode (Highlights target button/element with card attached)
  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      
      {/* Semi-transparent dark overlay */}
      <div className="absolute inset-0 bg-black/45 pointer-events-auto transition-opacity duration-300" />

      {/* Spotlight cutout rectangle around target element */}
      {targetRect && (
        <div
          className="absolute pointer-events-none transition-all duration-300 rounded-xl ring-4 ring-accent ring-offset-4 ring-offset-black/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            zIndex: 51,
          }}
        />
      )}

      {/* Interactive Tooltip Card positioned near the highlighted element */}
      <div 
        className="absolute pointer-events-auto z-52 max-w-md w-[92vw] sm:w-[420px] transition-all duration-300"
        style={{
          top: targetRect 
            ? `${Math.min(window.innerHeight - 340, Math.max(20, targetRect.bottom + 16))}px` 
            : '50%',
          left: targetRect 
            ? `${Math.min(window.innerWidth - 440, Math.max(16, targetRect.left))}px` 
            : '50%',
          transform: !targetRect ? 'translate(-50%, -50%)' : 'none',
        }}
      >
        <div className="bg-white rounded-2xl border border-border-subtle shadow-modal p-5 sm:p-6 space-y-4 animate-scale-up">
          
          {/* Card Header: Step count & Category */}
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-accent text-white font-mono text-[10px] font-bold">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-[11px] font-mono text-text-muted uppercase font-semibold">
                {currentStep?.category}
              </span>
            </div>
            <button
              onClick={handleComplete}
              className="text-text-muted hover:text-text-primary p-1 rounded-md"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Core Description */}
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg text-text-primary leading-snug">
              {currentStep?.title}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {currentStep?.description}
            </p>
          </div>

          {/* Why It Matters Callout */}
          <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle space-y-1 text-xs">
            <span className="font-mono text-[10px] text-accent uppercase font-bold tracking-wider block">
              Why This Safeguard Exists:
            </span>
            <p className="text-[11px] text-text-primary leading-relaxed">
              {currentStep?.whyItMatters}
            </p>
          </div>

          {/* Real Financial Example */}
          <div className="text-[11px] text-text-secondary leading-relaxed bg-bg-subtle p-2.5 rounded-lg border border-border-subtle">
            <strong className="text-text-primary font-medium">Real-World Case:</strong> {currentStep?.financialExample}
          </div>

          {/* Footer Controls: Back, Next/Finish, Skip */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-border-subtle">
            <button
              onClick={handleComplete}
              className="text-[11px] font-medium text-text-muted hover:text-text-primary underline"
            >
              Skip Walkthrough
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-semibold text-text-secondary hover:bg-bg-subtle transition-colors flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-subtle flex items-center space-x-1"
              >
                <span>{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
