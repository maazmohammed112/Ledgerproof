'use client';

import React, { useState } from 'react';
import { X, Sliders, Shield, Scale, Hash, Check, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [autonomyTier, setAutonomyTier] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [verifierEngine, setVerifierEngine] = useState<'strict' | 'standard'>('strict');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [shaAuditEnabled, setShaAuditEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaved(true);
    if (onSave) {
      onSave({ autonomyTier, verifierEngine, currency, shaAuditEnabled });
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-bg-card rounded-xl border border-border-subtle shadow-modal overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-secondary">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">System & Controller Settings</h2>
              <p className="text-[11px] text-text-muted">Configure autonomous verification bounds and risk gates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Autonomy Risk Gate Level */}
          <div className="space-y-2">
            <label className="flex items-center space-x-1.5 font-medium text-text-primary">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Autonomy Risk Gate Threshold</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'conservative', label: 'Conservative', desc: 'Tier A only auto-close' },
                { id: 'balanced', label: 'Balanced (Standard)', desc: 'Tier A & B auto-close' },
                { id: 'aggressive', label: 'Autonomous', desc: 'Tier A, B, C auto-close' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setAutonomyTier(tier.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    autonomyTier === tier.id
                      ? 'border-accent bg-accent-light/50 shadow-subtle ring-1 ring-accent'
                      : 'border-border-subtle hover:border-text-secondary/30 bg-bg-secondary'
                  }`}
                >
                  <div className={`font-semibold text-[11px] ${autonomyTier === tier.id ? 'text-accent' : 'text-text-primary'}`}>
                    {tier.label}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5 leading-tight">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Independent Verifier Mode */}
          <div className="space-y-2">
            <label className="flex items-center space-x-1.5 font-medium text-text-primary">
              <Scale className="w-3.5 h-3.5 text-accent" />
              <span>Independent Verifier Consensus Protocol</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVerifierEngine('strict')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  verifierEngine === 'strict'
                    ? 'border-accent bg-accent-light/50 shadow-subtle ring-1 ring-accent'
                    : 'border-border-subtle hover:border-text-secondary/30 bg-bg-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-[11px] ${verifierEngine === 'strict' ? 'text-accent' : 'text-text-primary'}`}>
                    Strict Dual-Consensus
                  </span>
                  {verifierEngine === 'strict' && <Check className="w-3 h-3 text-accent" />}
                </div>
                <p className="text-[10px] text-text-muted mt-0.5">
                  100% deterministic code calculation required before ledger write.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVerifierEngine('standard')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  verifierEngine === 'standard'
                    ? 'border-accent bg-accent-light/50 shadow-subtle ring-1 ring-accent'
                    : 'border-border-subtle hover:border-text-secondary/30 bg-bg-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-[11px] ${verifierEngine === 'standard' ? 'text-accent' : 'text-text-primary'}`}>
                    Single Pass Review
                  </span>
                  {verifierEngine === 'standard' && <Check className="w-3 h-3 text-accent" />}
                </div>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Autonomous resolution with async background reconciliation.
                </p>
              </button>
            </div>
          </div>

          {/* SHA-256 Audit Stream */}
          <div className="p-3 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5 font-medium text-text-primary">
                <Hash className="w-3.5 h-3.5 text-accent" />
                <span>Cryptographic SHA-256 Event Chain</span>
              </div>
              <p className="text-[10px] text-text-muted">
                Hashes each agent determination sequentially for statutory compliance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShaAuditEnabled(!shaAuditEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                shaAuditEnabled ? 'bg-accent' : 'bg-border-medium'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  shaAuditEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Currency Display */}
          <div className="flex items-center justify-between py-1">
            <span className="font-medium text-text-primary">Reporting Currency</span>
            <div className="flex items-center space-x-1 bg-bg-secondary p-0.5 rounded-md border border-border-subtle">
              {(['USD', 'EUR', 'GBP'] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                    currency === cur
                      ? 'bg-white text-text-primary shadow-subtle font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-bg-secondary border-t border-border-subtle flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setAutonomyTier('balanced');
              setVerifierEngine('strict');
              setCurrency('USD');
              setShaAuditEnabled(true);
            }}
            className="flex items-center space-x-1 text-text-muted hover:text-text-primary text-[11px] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-border-subtle text-text-secondary hover:bg-black/5 transition-colors text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-md bg-accent text-white hover:bg-accent-hover active:scale-[0.98] transition-all text-xs font-semibold shadow-subtle flex items-center space-x-1.5"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{isSaved ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
