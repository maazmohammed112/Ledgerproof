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
  FileCheck
} from 'lucide-react';
import { Transaction } from '../lib/types';

interface TopHeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMobileSidebar: () => void;
  onRunClose: () => void;
  onResetDemo: () => void;
  onStartGuidedDemo: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
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
      category: 'Financial Operations',
      description: 'September 2026 Close Pipeline & Autonomous Velocity',
    },
    'exceptions': {
      title: 'Exception Inbox',
      category: 'Financial Operations',
      description: 'Policy Discrepancies & Adversarial Verifier Flags',
    },
    'decision-trace': {
      title: 'Decision Trace',
      category: 'Forensic Telemetry',
      description: 'Chronological Multi-Agent Verification Chains',
    },
    'agent-lab': {
      title: 'Agent Lab',
      category: 'Autonomous Governance',
      description: 'Specialized Finance Agents & Simulation Playground',
    },
    'evaluations': {
      title: 'Evaluation Lab',
      category: 'Autonomous Governance',
      description: '40 Ground-Truth Benchmark Cases & Accuracy Gains',
    },
    'policies': {
      title: 'Policy Center',
      category: 'Autonomous Governance',
      description: 'Statutory Control Bounds & Empirical Rule Learning',
    },
    'audit-vault': {
      title: 'Audit Vault',
      category: 'Compliance & Audit',
      description: 'Immutable Cryptographic Event Stream (SHA-256)',
    },
    'architecture': {
      title: 'System Architecture',
      category: 'System & Tools',
      description: 'Deterministic Python Tools & Dual-Agent Consensus',
    },
    'try-data': {
      title: 'Try Your Data',
      category: 'System & Tools',
      description: 'CSV Column Mapping & Single Transaction Ingestion',
    },
    'built-with-ao': {
      title: 'AO Engine',
      category: 'System & Tools',
      description: 'Autonomous Orchestration Transparency & 10 Workstreams',
    },
    'landing': {
      title: 'Product Story',
      category: 'LedgerProof Core',
      description: 'Finance agents should prove their work',
    },
  };

  const currentMeta = pageMeta[currentTab] || {
    title: 'Dashboard',
    category: 'LedgerProof',
    description: 'Autonomous Office of the CFO',
  };

  // Recent system notifications
  const notifications = [
    {
      id: '1',
      title: 'Dual-Consensus Reached',
      desc: 'Verifier and Generator matched on 12 journal entries',
      time: '2m ago',
      icon: ShieldCheck,
      iconColor: 'text-status-verified',
    },
    {
      id: '2',
      title: 'Tier C Flag Raised',
      desc: 'AWS EMEA $14,200.00 exceeds standard software threshold',
      time: '14m ago',
      icon: AlertTriangle,
      iconColor: 'text-status-review',
    },
    {
      id: '3',
      title: 'Audit Block SHA-256 Anchored',
      desc: 'Block #4082 finalized with deterministic proof',
      time: '45m ago',
      icon: FileCheck,
      iconColor: 'text-accent',
    },
  ];

  // Quick search results
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
            title: `${tx.vendor} · $${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            subtitle: `${tx.id} · ${tx.risk_tier || 'TIER_C'} · ${tx.status}`,
          })),
        { type: 'view', id: 'command-center', title: 'Overview / Command Center', subtitle: 'Pipeline metrics & velocity' },
        { type: 'view', id: 'exceptions', title: 'Exception Inbox', subtitle: 'Review active discrepancies & flags' },
        { type: 'view', id: 'agent-lab', title: 'Agent Lab', subtitle: 'Inspect agent reasoning & prompt tools' },
        { type: 'view', id: 'evaluations', title: 'Evaluation Lab', subtitle: '40 Ground-Truth benchmark tests' },
        { type: 'view', id: 'policies', title: 'Policy Center', subtitle: 'Manage statutory rules & thresholds' },
        { type: 'view', id: 'audit-vault', title: 'Audit Vault', subtitle: 'Cryptographic JSON event log' },
        { type: 'view', id: 'architecture', title: 'System Architecture', subtitle: 'Dual-Agent verification flow' },
        { type: 'view', id: 'try-data', title: 'Try Your Data', subtitle: 'Upload CSV or test transaction' },
      ].filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className="sticky top-0 z-20 bg-bg-secondary/90 backdrop-blur-md border-b border-border-subtle h-14 shrink-0 flex items-center px-4 sm:px-6 select-none">
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Left Side: Mobile Menu Button & Breadcrumb */}
          <div className="flex items-center space-x-3 truncate">
            {/* Mobile Hamburger Button */}
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors"
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

          {/* Center: Close Cycle Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-bg-card border border-border-subtle text-xs font-tabular shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-status-verified" />
            <span className="font-medium text-text-primary">Northstar Labs &bull; Sep Close</span>
            <span className="text-border-medium">|</span>
            <span className="text-status-verified font-semibold">97.4% Reconciled</span>
          </div>

          {/* Right Side: High-Value Actions & Tools */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Data Mode Switcher (Demo Data vs Own Real Data) */}
            <div 
              id="tour-data-mode-toggle" 
              className="flex items-center bg-bg-card p-0.5 rounded-lg border border-border-subtle shadow-subtle text-xs"
            >
              <button
                onClick={() => onSwitchDataMode?.('demo')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  dataMode === 'demo'
                    ? 'bg-accent text-white font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Northstar Labs pre-configured multi-currency closing dataset"
              >
                Demo Data
              </button>
              <button
                onClick={() => onSwitchDataMode?.('real')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  dataMode === 'real'
                    ? 'bg-accent text-white font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Clean workspace to import and test your own CSV/Excel data"
              >
                Use Real Data
              </button>
            </div>

            {/* Global Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs text-text-muted bg-bg-card border border-border-subtle hover:text-text-primary hover:border-text-secondary/30 transition-all shadow-subtle"
              title="Search transactions, exceptions, views (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-text-secondary" />
              <span className="hidden sm:inline text-[11px]">Search</span>
              <kbd className="hidden sm:inline text-[10px] font-mono px-1 py-0.2 bg-bg-secondary rounded border border-border-subtle text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Guided Tour Trigger */}
            <button
              id="tour-tutorial-btn"
              onClick={onStartGuidedDemo}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary border border-border-subtle bg-bg-card hover:bg-black/[0.02] transition-colors shadow-subtle"
              title="Interactive Controller Walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-accent" />
              <span>Tour</span>
            </button>

            {/* Notifications Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
                className={`p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors border border-border-subtle bg-bg-card shadow-subtle relative ${
                  notificationsOpen ? 'bg-bg-subtle text-text-primary' : ''
                }`}
                title="Recent Autonomous Close Events"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-border-subtle shadow-modal z-50 overflow-hidden animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2.5 border-b border-border-subtle flex items-center justify-between bg-bg-secondary">
                    <span className="font-semibold text-xs text-text-primary">Recent Close Events</span>
                    <span className="text-[10px] text-text-muted font-mono">3 new</span>
                  </div>
                  <div className="divide-y divide-border-subtle/50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div key={n.id} className="p-3 hover:bg-bg-subtle transition-colors text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 font-medium text-text-primary">
                              <Icon className={`w-3.5 h-3.5 ${n.iconColor}`} />
                              <span>{n.title}</span>
                            </div>
                            <span className="text-[10px] text-text-muted">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-text-secondary pl-5">{n.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-2 bg-bg-secondary border-t border-border-subtle text-center">
                    <button
                      onClick={() => {
                        setCurrentTab('audit-vault');
                        setNotificationsOpen(false);
                      }}
                      className="text-[11px] text-accent font-medium hover:underline"
                    >
                      View Immutable Audit Vault &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Demo Button */}
            {dataMode === 'demo' && (
              <button
                onClick={onResetDemo}
                title="Reset Demo Dataset"
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary border border-border-subtle bg-bg-card hover:bg-black/[0.02] transition-colors shadow-subtle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Primary Action: Run Close */}
            <button
              id="tour-run-close-btn"
              onClick={onRunClose}
              disabled={isRunningClose}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-accent text-white hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningClose ? 'animate-spin' : ''}`} />
              <span>{isRunningClose ? 'Closing...' : 'Run Close'}</span>
            </button>

            {/* User Profile Quick Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="w-7 h-7 rounded bg-text-primary text-white flex items-center justify-center font-mono font-bold text-[10px] shadow-subtle hover:ring-2 hover:ring-accent/30 transition-all"
                title="Marcus Vance (Controller)"
              >
                MV
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border-subtle shadow-modal z-50 py-1.5 divide-y divide-border-subtle/50 text-xs animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2">
                    <div className="font-semibold text-text-primary">Marcus Vance</div>
                    <div className="text-[10px] text-text-muted">marcus.vance@northstarlabs.com</div>
                    <div className="mt-1 flex items-center space-x-1 text-[10px] text-status-verified font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-verified" />
                      <span>Controller Sign-Off Authority</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left flex items-center space-x-2 text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-text-muted" />
                      <span>System Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenHelp();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left flex items-center space-x-2 text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-text-muted" />
                      <span>Help & Documentation</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onResetDemo();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left flex items-center space-x-2 text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-text-muted" />
                      <span>Reset Sandbox State</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Global Command Palette / Search Dialog */}
      {searchModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in"
          onClick={() => setSearchModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-xl border border-border-subtle shadow-modal overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-border-subtle">
              <Search className="w-4 h-4 text-text-muted shrink-0 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search exceptions, telemetry, policies, accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary rounded hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results or Quick Nav */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border-subtle/40 text-xs">
              {searchQuery.trim() === '' ? (
                <div className="p-2 space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Quick Navigation
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'command-center', label: 'Command Center' },
                      { id: 'exceptions', label: 'Exception Inbox' },
                      { id: 'agent-lab', label: 'Agent Lab' },
                      { id: 'evaluations', label: 'Evaluation Lab' },
                      { id: 'policies', label: 'Policy Center' },
                      { id: 'audit-vault', label: 'Audit Vault' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setSearchModalOpen(false);
                        }}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-bg-subtle text-left text-text-secondary hover:text-text-primary transition-colors border border-border-subtle/40"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-accent" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted pt-2">
                    Key Exceptions
                  </div>
                  <div className="space-y-1">
                    {transactions.filter(t => t.category !== undefined).slice(0, 3).map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => {
                          if (onOpenDecisionTrace) {
                            onOpenDecisionTrace(tx.id);
                          } else {
                            setCurrentTab('exceptions');
                          }
                          setSearchModalOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-md hover:bg-bg-subtle text-left transition-colors border border-border-subtle/40"
                      >
                        <div>
                          <span className="font-medium text-text-primary">{tx.vendor}</span>
                          <span className="text-[11px] text-text-muted ml-2 font-mono">{tx.id}</span>
                        </div>
                        <span className="font-mono font-semibold text-text-primary">
                          ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-text-muted">
                  No matching views, transactions, or policies found.
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (res.type === 'view') {
                          setCurrentTab(res.id);
                        } else if (res.type === 'transaction' && onOpenDecisionTrace) {
                          onOpenDecisionTrace(res.id);
                        } else {
                          setCurrentTab('exceptions');
                        }
                        setSearchModalOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-md hover:bg-bg-subtle text-left transition-colors"
                    >
                      <div>
                        <div className="font-medium text-text-primary">{res.title}</div>
                        <div className="text-[11px] text-text-muted">{res.subtitle}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-bg-secondary border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
              <span>Press <kbd className="font-mono px-1 py-0.5 bg-white rounded border border-border-subtle">ESC</kbd> to close</span>
              <span>LedgerProof Fast Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
