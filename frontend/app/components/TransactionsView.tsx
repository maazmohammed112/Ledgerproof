'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  X
} from 'lucide-react';
import { Transaction, MatchStatus, RiskTier } from '../lib/types';
import { store } from '../lib/store';
import { formatMoney, formatIndianGrouping } from '../lib/money';
import { ConfirmModal } from './ConfirmModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenDecisionTrace: (txId: string) => void;
  onOpenReviewModal?: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenDecisionTrace,
  onOpenReviewModal,
}) => {
  const activeWs = store.getActiveWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New/Edit Form State
  const [formVendor, setFormVendor] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formGl, setFormGl] = useState('6020 - Software & SaaS Subscriptions');
  const [formDesc, setFormDesc] = useState('');
  const [formInvoice, setFormInvoice] = useState('');
  const [formPo, setFormPo] = useState('');

  // Filtering
  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.invoice_ref && tx.invoice_ref.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchesCurrency = currencyFilter === 'ALL' || (tx.currency_original || tx.currency) === currencyFilter;

    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormVendor(tx.vendor);
    setFormAmount(String(tx.amount_original || tx.amount));
    setFormCurrency(tx.currency_original || tx.currency);
    setFormGl(tx.gl_account);
    setFormDesc(tx.description);
    setFormInvoice(tx.invoice_ref || '');
    setFormPo(tx.po_ref || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    store.updateTransaction(editingTx.id, {
      vendor: formVendor,
      amount: parseFloat(formAmount) || editingTx.amount,
      currency: formCurrency as any,
      gl_account: formGl,
      description: formDesc,
      invoice_ref: formInvoice || undefined,
      po_ref: formPo || undefined,
    });

    setIsEditModalOpen(false);
    setEditingTx(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      id: `TX-USR-${Date.now().toString().slice(-4)}`,
      workspaceId: activeWs.id,
      date: new Date().toISOString().split('T')[0],
      vendor: formVendor || 'New Vendor',
      description: formDesc || 'User created ledger entry',
      amount: parseFloat(formAmount) || 100.0,
      currency: formCurrency as any,
      type: 'DEBIT',
      gl_account: formGl,
      status: 'PENDING',
      invoice_ref: formInvoice || undefined,
      po_ref: formPo || undefined,
      confidence: 1.0,
      notes: 'Manually entered in workspace ledger.',
    };

    store.addTransaction(newTx);
    setIsCreateModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    store.deleteTransaction(deleteTarget.id);
    setDeleteTarget(null);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Vendor', 'Description', 'Amount', 'Currency', 'GL Account', 'Status'];
    const rows = filtered.map(t => [
      t.id, t.date, `"${t.vendor}"`, `"${t.description}"`, t.amount, t.currency, `"${t.gl_account}"`, t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledgerproof_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Subledger Master</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary">Transactions</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">
            General Ledger and AP transaction feed with multi-currency conversion and tabular precision.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-bg-card border border-border-subtle text-text-primary rounded-md hover:bg-bg-subtle flex items-center space-x-1.5 shadow-subtle"
          >
            <Download className="w-3.5 h-3.5 text-text-secondary" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setFormVendor('');
              setFormAmount('');
              setFormDesc('');
              setFormInvoice('');
              setFormPo('');
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold bg-accent text-white rounded-md hover:bg-accent-hover flex items-center space-x-1.5 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-secondary p-3 rounded-xl border border-border-subtle text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search vendor, memo, ID, or invoice..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECONCILED">Reconciled</option>
            <option value="EXCEPTION">Open Exception</option>
            <option value="BLOCKED">Blocked</option>
            <option value="RESOLVED">Resolved</option>
            <option value="PENDING">Pending</option>
          </select>

          <select
            value={currencyFilter}
            onChange={(e) => {
              setCurrencyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none font-medium font-mono"
          >
            <option value="ALL">All Currencies</option>
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CHF">CHF (CHF)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
      </div>

      {/* Enterprise Financial Data Table */}
      <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-bg-secondary border-b border-border-subtle font-semibold text-text-secondary uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Counterparty Vendor</th>
                <th className="py-3 px-4">GL Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Original Amount</th>
                <th className="py-3 px-4 text-right">Reporting ({activeWs.reportingCurrency || 'USD'})</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {displayed.map((tx) => (
                <tr key={tx.id} className="hover:bg-bg-subtle/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-text-muted">
                    <button
                      onClick={() => onOpenDecisionTrace(tx.id)}
                      className="hover:text-accent hover:underline flex items-center space-x-1"
                    >
                      <span>{tx.id}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  </td>
                  <td className="py-3 px-4 font-mono text-text-secondary whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-4 font-medium text-text-primary">
                    <div>{tx.vendor}</div>
                    <div className="text-[11px] text-text-muted truncate max-w-xs">{tx.description}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-text-secondary whitespace-nowrap">
                    {tx.gl_account.split(' - ')[0]}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status === 'RECONCILED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      tx.status === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      tx.status === 'EXCEPTION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-tabular whitespace-nowrap text-text-secondary">
                    {tx.currency_original && tx.currency_original !== (activeWs.reportingCurrency || 'USD') ? (
                      formatMoney(tx.amount_original || tx.amount, tx.currency_original, activeWs.locale)
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-tabular whitespace-nowrap font-semibold text-text-primary">
                    {formatMoney(tx.amount, tx.currency || activeWs.reportingCurrency || 'USD', activeWs.locale)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => openEdit(tx)}
                        className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-subtle"
                        title="Edit transaction"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(tx)}
                        className="p-1 rounded text-text-muted hover:text-status-blocked hover:bg-rose-50"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {displayed.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted text-xs">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-bg-secondary border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
          <span>Showing {displayed.length} of {filtered.length} entries</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-border-subtle bg-bg-card disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-border-subtle bg-bg-card disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl border border-border-subtle shadow-modal max-w-lg w-full p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-serif text-lg text-text-primary">Edit Transaction {editingTx?.id}</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-text-secondary font-medium">Vendor</label>
                <input
                  type="text"
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-bg-secondary border border-border-subtle text-text-primary mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-secondary font-medium">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-bg-secondary border border-border-subtle text-text-primary mt-1 font-tabular"
                  />
                </div>
                <div>
                  <label className="text-text-secondary font-medium">Currency</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-bg-secondary border border-border-subtle text-text-primary mt-1 font-mono"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CHF">CHF (CHF)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-secondary font-medium">GL Account</label>
                <input
                  type="text"
                  value={formGl}
                  onChange={(e) => setFormGl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-bg-secondary border border-border-subtle text-text-primary mt-1 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-border-subtle text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-accent text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl border border-border-subtle shadow-modal max-w-lg w-full p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-serif text-lg text-text-primary">Create New Transaction</h3>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-text-secondary font-medium">Counterparty Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud, Infosys, Stripe"
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-bg-secondary border border-border-subtle text-text-primary mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-secondary font-medium">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10000.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-bg-secondary border border-border-subtle text-text-primary mt-1 font-tabular"
                  />
                </div>
                <div>
                  <label className="text-text-secondary font-medium">Currency</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-bg-secondary border border-border-subtle text-text-primary mt-1 font-mono"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CHF">CHF (CHF)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-secondary font-medium">Description</label>
                <input
                  type="text"
                  placeholder="Memo details"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-bg-secondary border border-border-subtle text-text-primary mt-1"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-border-subtle text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-accent text-white font-semibold"
                >
                  Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Transaction?"
        itemSummary={deleteTarget ? `${deleteTarget.id} · ${deleteTarget.vendor} · ${formatMoney(deleteTarget.amount, 'USD')}` : ''}
        description="This will remove the transaction and its associated autonomous analysis from the active subledger. This action cannot be undone."
        confirmLabel="Delete Transaction"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
