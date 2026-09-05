'use client';

import React from 'react';
import { X, BookOpen, ShieldCheck, Cpu, Terminal, ExternalLink, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-bg-card rounded-xl border border-border-subtle shadow-modal overflow-hidden animate-fade-in flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-secondary shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">LedgerProof Documentation & Guide</h2>
              <p className="text-[11px] text-text-muted">Autonomous reconciliation protocols, risk gates, and operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-text-secondary leading-relaxed">
          
          {/* Core Architecture Philosophy */}
          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary text-sm flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-accent" />
              <span>Core Principle: AI Reasons, Code Calculates</span>
            </h3>
            <p>
              LedgerProof is engineered specifically for Controllers and Auditors. Traditional LLMs make arithmetic rounding errors and hallucinate balances. LedgerProof decouples reasoning from computation:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-bg-secondary border border-border-subtle space-y-1">
                <span className="font-semibold text-text-primary text-[11px]">1. Investigation Agent</span>
                <p className="text-[11px] text-text-muted">
                  Reads vendor contracts, invoices, and purchase orders to infer accounting intent and GAAP classification.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-bg-secondary border border-border-subtle space-y-1">
                <span className="font-semibold text-text-primary text-[11px]">2. Independent Verifier</span>
                <p className="text-[11px] text-text-muted">
                  Executes deterministic Python arithmetic to mathematically prove debits equal credits before any entry can touch the general ledger.
                </p>
              </div>
            </div>
          </div>

          {/* Risk Tier Governance */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-text-primary text-sm flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-status-verified" />
              <span>Autonomy Risk Gates (Tiers A – D)</span>
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-secondary flex items-start space-x-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-status-verifiedBg text-status-verified border border-status-verifiedBorder shrink-0">
                  TIER_A
                </span>
                <div>
                  <span className="font-medium text-text-primary">Autonomous Instant Close</span>
                  <p className="text-[11px] text-text-muted">
                    Exact 3-way matches (PO = Invoice = Receiving slip). Auto-reconciled with cryptographic SHA-256 event logged.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-secondary flex items-start space-x-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-status-verifiedBg text-status-verified border border-status-verifiedBorder shrink-0">
                  TIER_B
                </span>
                <div>
                  <span className="font-medium text-text-primary">Policy-Bounded Auto-Resolve</span>
                  <p className="text-[11px] text-text-muted">
                    Immaterial rounding differences (&lt; $50) or pre-approved recurring subscription variances within policy ceilings.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-secondary flex items-start space-x-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-status-reviewBg text-status-review border border-status-reviewBorder shrink-0">
                  TIER_C
                </span>
                <div>
                  <span className="font-medium text-text-primary">Human Controller Sign-Off Required</span>
                  <p className="text-[11px] text-text-muted">
                    Complex prepaid amortizations, ambiguous software capitalization, or multi-currency exchange adjustments.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-secondary flex items-start space-x-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-status-blockedBg text-status-blocked border border-status-blockedBorder shrink-0">
                  TIER_D
                </span>
                <div>
                  <span className="font-medium text-text-primary">Autonomous Risk Block</span>
                  <p className="text-[11px] text-text-muted">
                    Duplicate payments, unapproved vendor bank details, or statutory threshold violations. Requires executive controller override.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary text-sm flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-text-primary" />
              <span>Keyboard Navigation & Shortcuts</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-bg-secondary border border-border-subtle">
                <span className="text-text-muted">Global Command Palette</span>
                <kbd className="font-mono px-1.5 py-0.5 bg-white rounded border border-border-subtle text-text-primary">
                  ⌘K / Ctrl+K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-bg-secondary border border-border-subtle">
                <span className="text-text-muted">Dismiss Active Modal</span>
                <kbd className="font-mono px-1.5 py-0.5 bg-white rounded border border-border-subtle text-text-primary">
                  ESC
                </kbd>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-bg-secondary border-t border-border-subtle flex items-center justify-between shrink-0">
          <span className="text-[11px] text-text-muted">
            LedgerProof v2.4 &bull; Built for Autonomous Office of the CFO
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-text-primary text-white hover:bg-black transition-colors text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
