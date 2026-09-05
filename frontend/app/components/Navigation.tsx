'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  CircleAlert,
  Bot,
  BarChart2,
  ScrollText,
  FileSearch,
  Network,
  Upload,
  ShieldCheck,
  Search,
  RotateCcw,
  Play,
  Menu,
  X,
  ChevronDown,
  Compass,
  Command,
  ArrowRight
} from 'lucide-react';
import { Transaction } from '../lib/types';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onResetDemo: () => void;
  onRunClose: () => void;
  onStartGuidedDemo: () => void;
  isRunningClose: boolean;
  exceptionCount?: number;
  transactions?: Transaction[];
  onOpenDecisionTrace?: (txId: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onResetDemo,
  onRunClose,
  onStartGuidedDemo,
  isRunningClose,
  exceptionCount = 7,
  transactions = [],
  onOpenDecisionTrace,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut for Command+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setMobileMenuOpen(false);
        setMoreMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const primaryNavItems = [
    { id: 'command-center', label: 'Overview', icon: LayoutDashboard },
    { id: 'exceptions', label: 'Exceptions', icon: CircleAlert, badge: exceptionCount },
    { id: 'agent-lab', label: 'Agent Lab', icon: Bot },
    { id: 'evaluations', label: 'Evaluations', icon: BarChart2 },
    { id: 'policies', label: 'Policies', icon: ScrollText },
    { id: 'audit-vault', label: 'Audit', icon: FileSearch },
  ];

  const secondaryNavItems = [
    { id: 'architecture', label: 'Architecture & Verification', icon: Network, desc: 'Deterministic calculator & Risk Gate flow' },
    { id: 'try-data', label: 'Ingest Custom Data', icon: Upload, desc: 'CSV mapping & live multi-agent triage' },
    { id: 'built-with-ao', label: 'Autonomous Orchestration', icon: ShieldCheck, desc: 'Enterprise agent specs & telemetry' },
    { id: 'landing', label: 'Product Overview', icon: Compass, desc: 'Core rationale & storytelling' },
  ];

  // Search filtered results
  const searchResults = searchQuery.trim()
    ? [
        ...primaryNavItems
          .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item) => ({ type: 'view', id: item.id, title: item.label, subtitle: 'Navigation View' })),
        ...secondaryNavItems
          .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item) => ({ type: 'view', id: item.id, title: item.label, subtitle: item.desc })),
        ...transactions
          .filter((tx) => 
            tx.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .slice(0, 5)
          .map((tx) => ({
            type: 'transaction',
            id: tx.id,
            title: `${tx.vendor} — $${tx.amount.toLocaleString()}`,
            subtitle: `${tx.id} · ${tx.risk_tier || 'TIER_C'} · ${tx.status}`,
          })),
      ]
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 bg-bg-secondary/95 backdrop-blur-md border-b border-border-subtle select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 py-2.5 gap-4">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center space-x-6 shrink-0">
              <button
                onClick={() => setCurrentTab('command-center')}
                className="flex items-center space-x-2.5 group text-left focus-visible:outline-none"
                aria-label="LedgerProof Home"
              >
                {/* Geometric Monogram Mark */}
                <div className="w-8 h-8 rounded-md bg-text-primary text-white flex items-center justify-center font-serif text-base font-semibold tracking-tight transition-transform group-hover:scale-105">
                  L
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="font-serif text-xl tracking-tight text-text-primary font-semibold">
                    LedgerProof
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-text-muted">
                    v2.4
                  </span>
                </div>
              </button>

              {/* Workspace Badge (Desktop) */}
              <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-bg-primary border border-border-subtle text-[11px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-status-verified" />
                <span className="font-medium text-text-primary">Northstar Labs</span>
                <span className="text-border-medium">&bull;</span>
                <span className="text-text-muted">Sep Close</span>
              </div>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'text-text-primary bg-bg-subtle font-semibold shadow-subtle'
                        : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isActive 
                          ? 'bg-status-reviewBg text-status-review' 
                          : 'bg-black/5 text-text-secondary'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  onBlur={() => setTimeout(() => setMoreMenuOpen(false), 200)}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors ${
                    secondaryNavItems.some(item => item.id === currentTab) ? 'text-text-primary bg-bg-subtle font-semibold' : ''
                  }`}
                  aria-expanded={moreMenuOpen}
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreMenuOpen && (
                  <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white border border-border-subtle shadow-card py-1.5 z-50 animate-fade-in divide-y divide-border-subtle/50">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      System & Exploration
                    </div>
                    <div className="py-1">
                      {secondaryNavItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = currentTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setCurrentTab(item.id);
                              setMoreMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-start space-x-2.5 text-xs hover:bg-bg-subtle transition-colors ${
                              isCurrent ? 'bg-bg-primary text-text-primary font-semibold' : 'text-text-secondary'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                            <div>
                              <div className="text-text-primary font-medium">{item.label}</div>
                              <div className="text-[10px] text-text-muted leading-tight mt-0.5">{item.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Actions, Search & Close Run */}
            <div className="flex items-center space-x-2">
              
              {/* Global Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="hidden md:flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs text-text-muted bg-bg-primary border border-border-subtle hover:text-text-primary hover:border-text-secondary/30 transition-all"
                title="Search exceptions, telemetry, tools (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-[11px]">Search</span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 bg-white rounded border border-border-subtle text-text-muted">
                  ⌘K
                </kbd>
              </button>

              {/* Guided Tour CTA (Subtle, Clean) */}
              <button
                onClick={onStartGuidedDemo}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 border border-border-subtle transition-colors"
                title="12-Step Controller Walkthrough"
              >
                <Compass className="w-3.5 h-3.5 text-accent" />
                <span>Tour</span>
              </button>

              {/* Reset Demo Button */}
              <button
                onClick={onResetDemo}
                title="Reset to initial pristine Northstar Labs state"
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 border border-border-subtle transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {/* Primary Action: Run Close */}
              <button
                onClick={onRunClose}
                disabled={isRunningClose}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-accent text-white hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle disabled:opacity-50 shrink-0"
              >
                <Play className={`w-3.5 h-3.5 ${isRunningClose ? 'animate-spin' : ''}`} />
                <span>{isRunningClose ? 'Closing...' : 'Run Close'}</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-black/5 border border-border-subtle transition-colors"
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Slide-down Sheet */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-bg-secondary border-b border-border-subtle px-4 pt-3 pb-5 space-y-4 shadow-card animate-fade-in">
            
            {/* Mobile Workspace info */}
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-status-verified" />
                <span className="font-medium text-text-primary">Northstar Labs Inc.</span>
              </div>
              <span className="text-[11px] text-text-muted">FY26 Sep Close</span>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-bg-primary border border-border-subtle text-xs text-text-muted"
            >
              <span className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-text-secondary" />
                <span>Search transactions & tools...</span>
              </span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white rounded border border-border-subtle">⌘K</kbd>
            </button>

            {/* Primary Navigation Grid for Mobile */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-1">
                Core Modules
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-text-primary text-white font-semibold'
                          : 'bg-bg-primary text-text-secondary hover:bg-bg-subtle hover:text-text-primary border border-border-subtle'
                      }`}
                    >
                      <span className="flex items-center space-x-2 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-status-reviewBg text-status-review'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary System Items for Mobile */}
            <div className="space-y-1 pt-2 border-t border-border-subtle">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-1">
                Engineering & Exploration
              </div>
              <div className="space-y-1 pt-1">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-text-primary text-white font-semibold'
                          : 'text-text-secondary hover:bg-black/5 hover:text-text-primary'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Footer Actions */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartGuidedDemo();
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-md text-xs font-medium bg-bg-primary text-text-primary border border-border-subtle"
              >
                <Compass className="w-3.5 h-3.5 text-accent" />
                <span>Guided Tour</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onResetDemo();
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-md text-xs font-medium bg-bg-primary text-text-secondary border border-border-subtle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>

          </div>
        )}
      </header>

      {/* Global Command Palette / Search Dialog */}
      {searchModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in"
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
                placeholder="Search exceptions, accounts, agents, policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary rounded"
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
                  <div className="grid grid-cols-2 gap-1">
                    {primaryNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setSearchModalOpen(false);
                        }}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-bg-subtle text-left text-text-secondary hover:text-text-primary"
                      >
                        <item.icon className="w-4 h-4 text-accent" />
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
                        className="w-full flex items-center justify-between p-2 rounded-md hover:bg-bg-subtle text-left"
                      >
                        <div>
                          <span className="font-medium text-text-primary">{tx.vendor}</span>
                          <span className="text-[11px] text-text-muted ml-2 font-mono">{tx.id}</span>
                        </div>
                        <span className="font-mono font-semibold text-text-primary">${tx.amount.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-text-muted">
                  No matching views, exceptions, or tools found.
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
            <div className="px-4 py-2 bg-bg-primary border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
              <span>Navigate with arrows, <kbd className="font-mono">ESC</kbd> to close</span>
              <span>LedgerProof Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
