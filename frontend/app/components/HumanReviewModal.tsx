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
  Lock 
} from 'lucide-react';
import { Transaction } from '../lib/types';

interface HumanReviewModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSubmitReview: (
    txId: string, 
    action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION', 
    notes: string, 
    editedGl?: string
  ) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  transaction,
  onClose,
  onSubmitReview,
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

  const [notes, setNotes] = useState('');
  const [editedGl, setEditedGl] = useState(transaction.gl_account);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmMaterialApprove, setConfirmMaterialApprove] = useState(false);

  const isMaterial = transaction.amount >= 10000.0;

  const handleAction = (action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION') => {
    if (action === 'APPROVE' && isMaterial && !confirmMaterialApprove) {
      setConfirmMaterialApprove(true);
      return;
    }
    onSubmitReview(transaction.id, action, notes || 'Approved by Controller', isEditing ? editedGl : undefined);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-bg-secondary w-full max-w-2xl rounded-2xl border border-border-subtle shadow-modal overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-card">
          <div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-status-review uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Tier C &bull; Controller Sign-Off Required
              </span>
            </div>
            <h2 className="font-serif text-2xl text-text-primary mt-0.5">
              Controller Review: {transaction.vendor}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">

          {/* Transaction Summary Card */}
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3">
            <div className="flex items-center justify-between font-tabular">
              <span className="font-mono text-text-muted font-semibold">{transaction.id}</span>
              <span className="font-bold text-xl text-text-primary">
                ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {transaction.currency}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle text-text-secondary font-tabular">
              <div>Issue: <span className="font-semibold text-text-primary">{transaction.category?.replace(/_/g, ' ')}</span></div>
              <div>Booking Date: <span className="font-medium text-text-primary">{transaction.date}</span></div>
            </div>

            <p className="text-text-secondary pt-1 leading-relaxed">
              <span className="font-semibold text-text-primary">Forensic Investigation:</span> {transaction.notes}
            </p>
          </div>

          {/* Materiality Safeguard Warning */}
          {isMaterial && (
            <div className="p-3.5 rounded-xl bg-status-reviewBg border border-status-reviewBorder text-status-review flex items-start space-x-2.5">
              <Lock className="w-4 h-4 text-status-review shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Materiality Safeguard Active</span>
                <span className="text-text-primary mt-0.5 block leading-relaxed">
                  Amount exceeds the $10,000.00 materiality ceiling (${transaction.amount.toLocaleString()}). Explicit sign-off notes are permanently hashed to the Audit Vault.
                </span>
              </div>
            </div>
          )}

          {/* Optional GL Edit Form */}
          {isEditing && (
            <div className="p-3.5 rounded-xl bg-bg-card border border-border-subtle space-y-1.5">
              <label className="text-xs font-semibold text-text-primary block">
                Target General Ledger Account
              </label>
              <input
                type="text"
                value={editedGl}
                onChange={(e) => setEditedGl(e.target.value)}
                className="w-full px-3 py-2 rounded-md text-xs bg-bg-subtle border border-border-subtle focus:outline-none focus:border-accent text-text-primary font-mono"
              />
            </div>
          )}

          {/* Sign-off Notes Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary block">
              Audit Justification & Sign-Off Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Approved 3% variance based on signed SOW amendment dated Sep 12..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-md text-xs bg-bg-card border border-border-subtle focus:outline-none focus:border-accent text-text-primary placeholder:text-text-muted leading-relaxed"
            />
          </div>

          {/* Double Confirmation Box */}
          {confirmMaterialApprove && (
            <div className="p-4 rounded-xl bg-status-verifiedBg border border-status-verified text-status-verified space-y-1.5">
              <span className="font-bold block flex items-center text-xs">
                <CheckCircle2 className="w-4 h-4 mr-1 text-status-verified" /> Confirm Material Ledger Approval
              </span>
              <p className="text-text-primary text-xs">
                You are about to commit <span className="font-bold font-tabular">${transaction.amount.toLocaleString()}</span> for {transaction.vendor} into Northstar Labs' verified general ledger. Click below to execute.
              </p>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 border-t border-border-subtle bg-bg-card flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary border border-border-subtle hover:bg-bg-subtle transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit GL'}</span>
            </button>

            <button
              onClick={() => handleAction('REQUEST_EVIDENCE')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary border border-border-subtle hover:bg-bg-subtle transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Request Evidence</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAction('REJECT')}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-status-blocked bg-status-blockedBg hover:bg-red-100 transition-colors border border-status-blockedBorder"
            >
              Reject Item
            </button>

            <button
              onClick={() => handleAction(isEditing ? 'EDIT_RESOLUTION' : 'APPROVE')}
              className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-status-verified hover:bg-emerald-700 transition-all shadow-subtle"
            >
              {confirmMaterialApprove ? 'Confirm & Post to Books' : isEditing ? 'Save & Approve' : 'Approve Exception'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
