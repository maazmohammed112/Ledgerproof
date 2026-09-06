'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  X, 
  AlertTriangle, 
  Globe2, 
  Coins, 
  Calendar, 
  Layers,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { Workspace } from '../lib/types';
import { store } from '../lib/store';
import { SupportedCurrency, CURRENCY_REGISTRY } from '../lib/money';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateSuccess?: (newWs: Workspace) => void;
}

const COUNTRIES = [
  { name: 'India', currency: 'INR' as SupportedCurrency, flag: '🇮🇳' },
  { name: 'United States', currency: 'USD' as SupportedCurrency, flag: '🇺🇸' },
  { name: 'United Kingdom', currency: 'GBP' as SupportedCurrency, flag: '🇬🇧' },
  { name: 'European Union / Germany', currency: 'EUR' as SupportedCurrency, flag: '🇪🇺' },
  { name: 'Switzerland', currency: 'CHF' as SupportedCurrency, flag: '🇨🇭' },
  { name: 'Japan', currency: 'JPY' as SupportedCurrency, flag: '🇯🇵' },
  { name: 'Canada', currency: 'CAD' as SupportedCurrency, flag: '🇨🇦' },
  { name: 'Australia', currency: 'AUD' as SupportedCurrency, flag: '🇦🇺' },
  { name: 'Singapore', currency: 'SGD' as SupportedCurrency, flag: '🇸🇬' },
  { name: 'United Arab Emirates', currency: 'AED' as SupportedCurrency, flag: '🇦🇪' },
];

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSelectWorkspace,
  onCreateSuccess,
}) => {
  const [view, setView] = useState<'list' | 'create' | 'delete-confirm'>('list');
  const [targetDeleteWs, setTargetDeleteWs] = useState<Workspace | null>(null);

  // Form State
  const [wsName, setWsName] = useState('');
  const [companyLegalName, setCompanyLegalName] = useState('');
  const [country, setCountry] = useState('India');
  const [reportingCurrency, setReportingCurrency] = useState<SupportedCurrency>('INR');
  const [fiscalYear, setFiscalYear] = useState('FY2026-27');
  const [closePeriod, setClosePeriod] = useState('September 2026');
  const [industry, setIndustry] = useState('Technology / SaaS');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const workspaces = store.getWorkspaces();
  const activeWsId = store.getActiveWorkspaceId();

  const handleCountryChange = (cName: string) => {
    setCountry(cName);
    const matched = COUNTRIES.find(c => c.name === cName);
    if (matched) {
      setReportingCurrency(matched.currency);
      if (cName === 'India') {
        setFiscalYear('FY2026-27');
      } else {
        setFiscalYear('FY2026');
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) {
      setErrorMsg('Workspace Name is required.');
      return;
    }

    try {
      const newWs = store.createWorkspace({
        name: wsName,
        companyLegalName: companyLegalName || wsName,
        country,
        reportingCurrency,
        fiscalYear,
        closePeriod,
        industry,
        description,
      });

      // Reset form
      setWsName('');
      setCompanyLegalName('');
      setDescription('');
      setErrorMsg(null);
      setView('list');

      if (onCreateSuccess) onCreateSuccess(newWs);
      onSelectWorkspace(newWs.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create workspace.');
    }
  };

  const handleDeleteConfirm = () => {
    if (!targetDeleteWs) return;
    store.deleteWorkspace(targetDeleteWs.id);
    setTargetDeleteWs(null);
    setView('list');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-border-subtle shadow-modal w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-secondary/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="workspace-modal-title" className="font-serif text-lg font-normal text-text-primary">
                {view === 'list' && 'Company Workspaces & Ledgers'}
                {view === 'create' && 'Create Company Workspace'}
                {view === 'delete-confirm' && 'Confirm Workspace Deletion'}
              </h2>
              <p className="text-[11px] text-text-muted">
                {view === 'list' && 'Select an isolated finance environment or provision a new company.'}
                {view === 'create' && 'Every workspace maintains strictly isolated ledgers, currencies, and audit logs.'}
                {view === 'delete-confirm' && 'This action permanently removes all scoped ledger records.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* VIEW: WORKSPACES LIST */}
          {view === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Active Environments ({workspaces.length})
                </span>
                <button
                  onClick={() => {
                    setErrorMsg(null);
                    setView('create');
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-subtle"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Workspace</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {workspaces.map((ws) => {
                  const isActive = ws.id === activeWsId;
                  const txCount = store.getTransactions(ws.id).length;
                  const repCount = store.getReports(ws.id).length;
                  const currencyMeta = CURRENCY_REGISTRY[ws.reportingCurrency] || CURRENCY_REGISTRY.USD;

                  return (
                    <div
                      key={ws.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-subtle'
                          : 'border-border-subtle bg-white hover:border-text-secondary/40 hover:shadow-card'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-semibold text-text-primary truncate">
                            {ws.name}
                          </span>
                          {ws.isDemo && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Demo Dataset
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ws.closeStatus === 'CLOSED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ws.closeStatus === 'READY_TO_CLOSE'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {ws.closeStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                          <span className="flex items-center space-x-1">
                            <span>{currencyMeta.flag}</span>
                            <span>{ws.country}</span>
                          </span>
                          <span>&bull;</span>
                          <span className="font-mono font-medium text-text-secondary">
                            {ws.reportingCurrency} ({currencyMeta.symbol})
                          </span>
                          <span>&bull;</span>
                          <span>{ws.closePeriod}</span>
                          <span>&bull;</span>
                          <span className="font-tabular font-medium text-text-primary">
                            {txCount} transaction{txCount !== 1 ? 's' : ''}
                          </span>
                          {repCount > 0 && (
                            <>
                              <span>&bull;</span>
                              <span className="text-accent font-medium">{repCount} report{repCount !== 1 ? 's' : ''}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        {isActive ? (
                          <span className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectWorkspace(ws.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg border border-border-subtle bg-white text-xs font-semibold text-text-primary hover:bg-bg-subtle transition-colors shadow-subtle flex items-center space-x-1"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!ws.isDemo && (
                          <button
                            onClick={() => {
                              setTargetDeleteWs(ws);
                              setView('delete-confirm');
                            }}
                            className="p-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-status-blocked hover:bg-status-blockedBg/30 hover:border-status-blockedBorder transition-colors"
                            title={`Delete ${ws.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: CREATE WORKSPACE FORM */}
          {view === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-status-blockedBg/50 border border-status-blockedBorder text-status-blocked text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maaz Technologies, Horizon FinTech UK"
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maaz Technologies Private Limited"
                    value={companyLegalName}
                    onChange={(e) => setCompanyLegalName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Base / Reporting Currency *
                  </label>
                  <select
                    value={reportingCurrency}
                    onChange={(e) => setReportingCurrency(e.target.value as SupportedCurrency)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono"
                  >
                    {Object.entries(CURRENCY_REGISTRY).map(([code, meta]) => (
                      <option key={code} value={code}>
                        {meta.flag} {code} — {meta.name} ({meta.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Financial Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FY2026-27 or FY2026"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Close Period *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. September 2026 or Q3 2026"
                    value={closePeriod}
                    onChange={(e) => setClosePeriod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="Technology / SaaS">Technology / SaaS</option>
                    <option value="FinTech / Banking">FinTech / Banking</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Consulting & Professional Services">Consulting & Services</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Optional Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the operating entity or closing scope..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border-subtle text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-semibold text-text-secondary hover:bg-bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-subtle"
                >
                  Create & Open Workspace
                </button>
              </div>
            </form>
          )}

          {/* VIEW: DELETE CONFIRMATION */}
          {view === 'delete-confirm' && targetDeleteWs && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-status-blockedBg/30 border border-status-blockedBorder space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-status-blocked text-white flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Delete &ldquo;{targetDeleteWs.name}&rdquo;?
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      This will permanently remove the workspace and all its isolated financial records:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-tabular">
                  <div className="p-2.5 rounded-lg bg-white border border-border-subtle">
                    <span className="text-text-muted block text-[10px]">Transactions</span>
                    <span className="font-semibold text-text-primary text-sm">
                      {store.getTransactions(targetDeleteWs.id).length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-border-subtle">
                    <span className="text-text-muted block text-[10px]">Invoices</span>
                    <span className="font-semibold text-text-primary text-sm">
                      {store.getInvoices(targetDeleteWs.id).length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-border-subtle">
                    <span className="text-text-muted block text-[10px]">Audit Events</span>
                    <span className="font-semibold text-text-primary text-sm">
                      {store.getAuditRecords(targetDeleteWs.id).length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-border-subtle">
                    <span className="text-text-muted block text-[10px]">Reports</span>
                    <span className="font-semibold text-text-primary text-sm">
                      {store.getReports(targetDeleteWs.id).length}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-status-blocked pt-1">
                  This action cannot be undone. All data will be wiped from local storage and IndexedDB.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setTargetDeleteWs(null);
                    setView('list');
                  }}
                  className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-semibold text-text-secondary hover:bg-bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 rounded-lg bg-status-blocked text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-subtle"
                >
                  Delete Workspace
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
