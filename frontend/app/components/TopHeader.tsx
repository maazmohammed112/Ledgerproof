'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Play, 
  RotateCcw, 
  Compass, 
  Bell, 
  ArrowRight,
  X,
  CheckCircle2,
  ChevronRight,
  Sliders,
  BookOpen,
  User,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Building2,
  LogOut
} from 'lucide-react';
import { Transaction } from '../lib/types';
import { store } from '../lib/store';
import { CURRENCY_REGISTRY, formatMoney } from '../lib/money';

interface TopHeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMobileSidebar: () => void;
  onRunClose: () => void;
  onResetDemo: () => void;
  onStartGuidedDemo: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenWorkspaceModal?: () => void;
  onLogout?: () => void;
  isRunningClose: boolean;
  transactions?: Transaction[];
  onOpenDecisionTrace?: (txId: string) => void;
  dataMode?: 'demo' | 'real';
  onSwitchDataMode?: (mode: 'demo' | 'real') => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenMobileSidebar,
  onRunClose,
  onResetDemo,
  onStartGuidedDemo,
  onOpenSettings,
  onOpenHelp,
  onOpenWorkspaceModal,
  onLogout,
  isRunningClose,
  transactions = [],
  onOpenDecisionTrace,
  dataMode = 'demo',
  onSwitchDataMode,
}) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const activeWs = store.getActiveWorkspace();
  const metrics = store.getCloseSummaryMetrics(activeWs.id);
  const currencyMeta = CURRENCY_REGISTRY[activeWs.reportingCurrency] || CURRENCY_REGISTRY.USD;

  // Keyboard shortcut for Command+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pageMeta: Record<string, { title: string; category: string; description: string }> = {
    'command-center': {
      title: 'Command Center',
      category: 'Workspace',
      description: `${activeWs.closePeriod} Pipeline & Velocity`,
    },
    'control-plane': {
      title: 'Control Plane',
      category: 'Workspace',
      description: 'Multi-Agent Autonomous Worker Sessions',
    },
    'data-sources': {
      title: 'Data Sources & Connectors',
      category: 'Workspace',
      description: 'Multi-Sheet File Ingestion & ERP Connectors',
    },
    'transactions': {
      title: 'Transactions Ledger',
      category: 'Workspace',
      description: 'Scoped Transaction Records & Decimal Accounting',
    },
    'reconciliation': {
      title: '3-Way Reconciliation',
      category: 'Workspace',
      description: 'Bank feeds vs General Ledger & PO matching',
    },
    'exceptions': {
      title: 'Exception Inbox',
      category: 'Workspace',
      description: 'Policy Discrepancies & Adversarial Flags',
    },
    'decision-trace': {
      title: 'Decision Trace',
      category: 'Intelligence',
      description: 'Chronological Multi-Agent Verification Chains',
    },
    'agent-lab': {
      title: 'Agent Lab',
      category: 'Intelligence',
      description: 'Finance Worker Simulation Playground',
    },
    'evaluations': {
      title: 'Evaluation Lab',
      category: 'Intelligence',
      description: '40 Ground-Truth Benchmark Cases & Accuracy Gains',
    },
    'policies': {
      title: 'Policy Center',
      category: 'Intelligence',
      description: 'Statutory Control Bounds & Empirical Rule Learning',
    },
    'audit-vault': {
      title: 'Audit Vault',
      category: 'Governance',
      description: 'Immutable Cryptographic Event Stream (SHA-256)',
    },
    'reports': {
      title: 'Close Reports',
      category: 'Governance',
      description: '8 Audited Financial Statements & Verification Exports',
    },
    'architecture': {
      title: 'System Architecture',
      category: 'System',
      description: 'Deterministic Python Tools & Dual-Agent Consensus',
    },
    'observability': {
      title: 'Neatlogs Telemetry',
      category: 'System',
      description: 'OpenTelemetry Trace Spans & $0.00 Inference Cost',
    },
  };

  const currentMeta = pageMeta[currentTab] || {
    title: 'Dashboard',
    category: 'LedgerProof',
    description: 'Autonomous Office of the CFO',
  };

  const notifications = [
    {
      id: '1',
      title: 'Independent Verifier Veto',
      desc: 'Intercepted AWS GL 6400 misclassification proposal',
      time: '2m ago',
      icon: ShieldCheck,
      iconColor: 'text-status-blocked',
    },
    {
      id: '2',
      title: 'Deterministic Match Complete',
      desc: `${metrics.autoReconciledCount} transactions cleared within tolerance`,
      time: '12m ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
    },
    {
      id: '3',
      title: 'SHA-256 Block Anchored',
      desc: `Ledger block for ${activeWs.name} synchronized`,
      time: '35m ago',
      icon: FileCheck,
      iconColor: 'text-text-primary',
    },
  ];

  const searchResults = searchQuery.trim()
    ? [
        ...transactions
          .filter(
            (tx) =>
              tx.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (tx.gl_account && tx.gl_account.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .slice(0, 5)
          .map((tx) => ({
            type: 'transaction',
            id: tx.id,
            title: `${tx.vendor} · ${formatMoney(tx.amount, tx.currency, activeWs.locale)}`,
            subtitle: `${tx.id} · ${tx.risk_tier || 'TIER_C'} · ${tx.status}`,
          })),
        { type: 'view', id: 'command-center', title: 'Command Center', subtitle: 'Pipeline metrics & velocity' },
        { type: 'view', id: 'reports', title: 'Close Reports', subtitle: 'Export 8 audited statements' },
        { type: 'view', id: 'exceptions', title: 'Exception Inbox', subtitle: 'Review active discrepancies & flags' },
        { type: 'view', id: 'data-sources', title: 'Data Sources', subtitle: 'Upload CSV/XLSX or configure connectors' },
        { type: 'view', id: 'observability', title: 'Neatlogs Telemetry', subtitle: 'Span tracking & $0.00 inference' },
      ].filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border-subtle h-16 shrink-0 flex items-center px-4 sm:px-6 select-none">
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Left Side: Mobile Menu Button & Breadcrumb */}
          <div className="flex items-center space-x-3 truncate">
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center space-x-2 text-xs truncate">
              <span className="text-text-muted hidden sm:inline truncate font-medium">{currentMeta.category}</span>
              <span className="text-border-medium hidden sm:inline">&bull;</span>
              <span className="font-semibold text-text-primary truncate text-sm">{currentMeta.title}</span>
            </div>
          </div>

          {/* Center: Dynamic Active Workspace Status Badge (No hardcoded values!) */}
          <div className="hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-pastel-mint border border-pastel-mintBorder text-xs font-tabular shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
            <span className="font-semibold text-text-primary">
              {currencyMeta.flag} {activeWs.name} &bull; {activeWs.closePeriod}
            </span>
            <span className="text-border-medium">|</span>
            <span className="text-emerald-900 font-bold">
              {metrics.totalTransactions > 0 ? `${metrics.reconciliationRatePct}% Reconciled` : 'Ready for Ingestion'}
            </span>
          </div>

          {/* Right Side: High-Value Actions & Tools */}
          <div className="flex items-center space-x-2.5 shrink-0">
            
            {/* Data Mode Switcher (Demo Data vs Use Real Data with Workspace Modal) */}
            <div 
              id="tour-data-mode-toggle" 
              className="flex items-center bg-bg-primary p-0.5 rounded-full border border-border-subtle text-xs shadow-subtle"
            >
              <button
                onClick={() => onSwitchDataMode?.('demo')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  dataMode === 'demo'
                    ? 'bg-[#0E332E] text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Northstar Labs pre-configured multi-currency closing dataset"
              >
                Demo Data
              </button>
              <button
                onClick={() => {
                  if (activeWs.isDemo) {
                    onOpenWorkspaceModal?.();
                  } else {
                    onSwitchDataMode?.('real');
                  }
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  dataMode === 'real'
                    ? 'bg-[#0E332E] text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Isolated workspace for your own company data"
              >
                Use Real Data
              </button>
            </div>

            {/* Global Search Pill Bar (Reference 5 style) */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs text-text-muted bg-bg-primary border border-border-subtle hover:text-text-primary hover:border-text-secondary/40 transition-all shadow-subtle"
              title="Search transactions, views (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-text-secondary" />
              <span className="hidden sm:inline text-[11px] font-medium">Search...</span>
              <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.2 bg-white rounded-full border border-border-subtle text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Guided Tour Trigger */}
            <button
              id="tour-tutorial-btn"
              onClick={onStartGuidedDemo}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-text-secondary hover:text-text-primary border border-border-subtle bg-white hover:bg-bg-primary transition-colors shadow-subtle"
              title="Interactive Controller Walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tour</span>
            </button>

            {/* Run Close Action Button */}
            <button
              id="tour-run-close-btn"
              onClick={onRunClose}
              disabled={isRunningClose}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#0E332E] hover:bg-bg-darkHover text-white text-xs font-semibold transition-all shadow-subtle active:scale-[0.98] disabled:opacity-50"
              title="Execute full autonomous reconciliation and verification cycle"
            >
              <Play className={`w-3 h-3 ${isRunningClose ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRunningClose ? 'Closing...' : 'Run Close'}</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
                className={`p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors border border-border-subtle bg-white shadow-subtle relative ${
                  notificationsOpen ? 'bg-bg-primary text-text-primary' : ''
                }`}
                title="Recent Autonomous Close Events"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-review animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-review" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-border-subtle shadow-modal z-50 p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                    <span className="text-xs font-semibold text-text-primary">Autonomous Close Events</span>
                    <span className="text-[10px] text-text-muted font-mono">Live Telemetry</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-bg-primary border border-border-subtle flex items-start space-x-2.5 text-xs">
                        <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-text-primary truncate">{item.title}</div>
                          <p className="text-[11px] text-text-secondary leading-tight mt-0.5">{item.desc}</p>
                          <span className="text-[10px] text-text-muted font-mono block mt-1">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Logout Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-pastel-mint text-text-primary font-bold text-xs flex items-center justify-center border border-pastel-mintBorder shadow-subtle hover:ring-2 hover:ring-emerald-700/30 transition-all"
                title="Account & Settings"
              >
                BS
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-border-subtle shadow-modal z-50 py-2 divide-y divide-border-subtle/50 animate-fade-in text-xs">
                  <div className="px-4 py-2">
                    <div className="font-semibold text-text-primary">Budiono Siregar</div>
                    <div className="text-[10px] text-text-muted">budiono@ledgerproof.internal</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenWorkspaceModal?.();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-bg-primary text-text-secondary flex items-center space-x-2"
                    >
                      <Building2 className="w-3.5 h-3.5 text-text-muted" />
                      <span>Switch Company Workspace</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-bg-primary text-text-secondary flex items-center space-x-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-text-muted" />
                      <span>Governance Settings</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onLogout) onLogout();
                        else setCurrentTab('landing');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-pastel-pink/40 text-status-blocked flex items-center space-x-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Global Search Modal (⌘K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-border-subtle shadow-modal w-full max-w-xl overflow-hidden space-y-3 p-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-border-subtle">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Search transactions, vendors, reports, views..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-text-primary bg-transparent focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((item: any) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      setSearchModalOpen(false);
                      if (item.type === 'transaction') {
                        onOpenDecisionTrace?.(item.id);
                      } else {
                        setCurrentTab(item.id);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-bg-primary text-left text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-text-primary">{item.title}</div>
                      <div className="text-[11px] text-text-muted">{item.subtitle}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                ))
              ) : searchQuery ? (
                <div className="p-4 text-center text-xs text-text-muted">
                  No matches found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div className="p-3 text-xs text-text-muted space-y-1">
                  <div className="font-semibold text-text-secondary">Quick Navigation:</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['command-center', 'exceptions', 'reports', 'data-sources', 'observability'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setCurrentTab(t);
                          setSearchModalOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-full bg-bg-primary border border-border-subtle text-[11px] hover:bg-bg-subtle text-text-secondary"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
