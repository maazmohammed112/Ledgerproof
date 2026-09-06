'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Edit3, 
  ShieldCheck, 
  Lock,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { Transaction } from '../lib/types';
import { store } from '../lib/store';
import { formatMoney } from '../lib/money';

interface HumanReviewModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSubmitReview?: (
    txId: string, 
    action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION', 
    notes: string, 
    editedGl?: string
  ) => void;
  onDecision?: (
    txId: string, 
    action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION', 
    notes: string, 
    editedGl?: string
  ) => void;
  onOpenDecisionTrace?: (txId: string) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  transaction,
  onClose,
  onSubmitReview,
  onDecision,
  onOpenDecisionTrace,
}) => {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!transaction) return null;

  const activeWs = store.getActiveWorkspace();
  const materialityCeiling = activeWs.reportingCurrency === 'INR' ? 1000000 : 10000;
  const currency = transaction.currency || activeWs.reportingCurrency || 'USD';
  const isMaterial = transaction.amount >= materialityCeiling;
  const formattedAmount = formatMoney(transaction.amount, currency, activeWs.locale);
  const formattedCeiling = formatMoney(materialityCeiling, currency, activeWs.locale);

  const [notes, setNotes] = useState('');
  const [editedGl, setEditedGl] = useState(transaction.gl_account);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmMaterialApprove, setConfirmMaterialApprove] = useState(false);

  const handleAction = (action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION') => {
    if (action === 'APPROVE' && isMaterial && !confirmMaterialApprove) {
      setConfirmMaterialApprove(true);
      return;
    }
    const callback = onSubmitReview || onDecision;
    if (callback) {
      callback(transaction.id, action, notes || 'Approved by Financial Controller', isEditing ? editedGl : undefined);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="bg-bg-secondary w-full max-w-2xl rounded-2xl border border-border-subtle shadow-modal overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-[#B45309] uppercase tracking-wider flex items-center bg-pastel-cream px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Tier C &bull; Dual Controller Sign-Off Required
              </span>
              <span className="text-border-medium">&bull;</span>
              <span className="font-mono text-text-muted text-[11px]">{activeWs.name}</span>
            </div>
            <h2 className="font-serif text-2xl text-text-primary mt-1">
              Controller Review: {transaction.vendor}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">

          {/* Transaction Summary Card */}
          <div className="p-4 rounded-xl bg-white border border-border-subtle space-y-3">
            <div className="flex items-center justify-between font-tabular">
              <span className="font-mono text-text-muted font-semibold">{transaction.id}</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xs text-text-muted">Booking Amount:</span>
                <span className="font-serif font-bold text-2xl text-text-primary">
                  {formattedAmount}
                </span>
                <span className="font-mono text-xs text-text-muted uppercase">{currency}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle text-text-secondary font-tabular">
              <div>Issue Flag: <span className="font-semibold text-text-primary">{transaction.category?.replace(/_/g, ' ') || 'EXCEPTION'}</span></div>
              <div>Booking Date: <span className="font-medium text-text-primary">{transaction.date}</span></div>
            </div>

            <p className="text-text-secondary pt-1 leading-relaxed">
              <span className="font-semibold text-text-primary">Forensic Investigation:</span> {transaction.notes || transaction.description}
            </p>
          </div>

          {/* Agent Tier Assignment Rationale Callout */}
          <div className="p-4 rounded-xl bg-pastel-cream border border-[#FDE68A] text-[#92400E] space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#B45309] shrink-0" />
              <span className="font-bold text-xs">
                Why the Agent Escalated this to Tier C (Human Review)
              </span>
            </div>
            <p className="text-text-primary leading-relaxed text-xs">
              {isMaterial ? (
                <>
                  Under deterministic risk gate <strong>Rule POL-MAT-001</strong>, transactions equal to or exceeding the company materiality threshold of <strong>{formattedCeiling}</strong> cannot be committed autonomously. The Resolution Agent proposed classification, but the Autonomous Gate intercepted the action to require explicit controller authorization.
                </>
              ) : (
                <>
                  Under deterministic risk gate <strong>Rule POL-VAR-001</strong>, purchase order variance exceeds standard automated tolerance limits. Human judgment is required to verify vendor contractual scope before subledger commitment.
                </>
              )}
            </p>
          </div>

          {/* Optional GL Edit Form */}
          {isEditing && (
            <div className="p-4 rounded-xl bg-white border border-border-subtle space-y-2">
              <label className="text-xs font-semibold text-text-primary block">
                Target General Ledger Account
              </label>
              <input
                type="text"
                value={editedGl}
                onChange={(e) => setEditedGl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-bg-secondary border border-border-subtle focus:outline-none focus:border-accent text-text-primary font-mono"
              />
              <span className="text-[11px] text-text-muted block">
                Original GL: {transaction.gl_account}
              </span>
            </div>
          )}

          {/* Sign-off Notes Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary block">
              Audit Justification & Sign-Off Notes (Hashed to SHA-256 Vault)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Approved variance based on signed SOW addendum dated Sep 14..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl text-xs bg-white border border-border-subtle focus:outline-none focus:border-accent text-text-primary placeholder:text-text-muted leading-relaxed"
            />
          </div>

          {/* Double Confirmation Box for Materiality */}
          {confirmMaterialApprove && (
            <div className="p-4 rounded-xl bg-pastel-mint border border-pastel-mintBorder text-status-verified space-y-1.5">
              <span className="font-bold flex items-center text-xs">
                <CheckCircle2 className="w-4 h-4 mr-1 text-status-verified" /> Confirm Material Balance Sheet Posting
              </span>
              <p className="text-text-primary text-xs leading-relaxed">
                You are about to commit <span className="font-bold font-tabular">{formattedAmount}</span> for {transaction.vendor} into {activeWs.name}'s verified general ledger. This action is irreversible and recorded in the audit trail.
              </p>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-border-subtle bg-white flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary border border-border-subtle hover:bg-bg-subtle transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit GL Code'}</span>
            </button>

            <button
              onClick={() => handleAction('REQUEST_EVIDENCE')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary border border-border-subtle hover:bg-bg-subtle transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Request Evidence</span>
            </button>

            {onOpenDecisionTrace && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDecisionTrace(transaction.id);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Inspect Trace</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAction('REJECT')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-status-blocked bg-pastel-pink hover:opacity-90 transition-colors border border-pastel-pinkBorder"
            >
              Reject Item
            </button>

            <button
              onClick={() => handleAction(isEditing ? 'EDIT_RESOLUTION' : 'APPROVE')}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0E332E] hover:opacity-90 transition-all shadow-card"
            >
              {confirmMaterialApprove ? 'Confirm & Post to Books' : isEditing ? 'Save & Approve' : 'Approve Exception'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
