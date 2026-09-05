'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemSummary?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  itemSummary,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-card rounded-2xl border border-border-subtle shadow-modal max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isDestructive ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              {isDestructive ? <Trash2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-primary leading-tight">{title}</h3>
              {itemSummary && (
                <p className="text-xs font-mono font-medium text-text-secondary mt-0.5">{itemSummary}</p>
              )}
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-subtle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-text-secondary leading-relaxed bg-bg-secondary p-3 rounded-lg border border-border-subtle">
          {description}
        </div>

        <div className="pt-2 flex justify-end space-x-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-text-secondary bg-bg-card border border-border-subtle rounded-md hover:bg-bg-subtle transition-colors"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-md shadow-subtle transition-colors ${
              isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
