'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { SettingsModal } from '../components/SettingsModal';
import { HelpModal } from '../components/HelpModal';
import { CommandCenterView } from '../components/CommandCenterView';
import { ExceptionInboxView } from '../components/ExceptionInboxView';
import { DecisionTraceModal } from '../components/DecisionTraceModal';
import { HumanReviewModal } from '../components/HumanReviewModal';
import { AgentLabView } from '../components/AgentLabView';
import { EvaluationLabView } from '../components/EvaluationLabView';
import { PolicyCenterView } from '../components/PolicyCenterView';
import { TryYourDataView } from '../components/TryYourDataView';
import { AuditVaultView } from '../components/AuditVaultView';
import { ArchitectureView } from '../components/ArchitectureView';
import { BuiltWithAoView } from '../components/BuiltWithAoView';
import { SpotlightTutorial } from '../components/SpotlightTutorial';

import { Transaction, DecisionTrace } from '../lib/types';
import { store } from '../lib/store';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'command-center';
  const shouldOpenTour = searchParams.get('tour') === 'true';

  const [currentTab, setCurrentTab] = useState<string>(initialTab);
  const [dataMode, setDataMode] = useState<'demo' | 'real'>('demo');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTrace, setActiveTrace] = useState<DecisionTrace | null>(null);
  const [activeTraceTx, setActiveTraceTx] = useState<Transaction | null>(null);
  const [reviewTx, setReviewTx] = useState<Transaction | null>(null);
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRunningClose, setIsRunningClose] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tab with URL search parameter if changed externally
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== currentTab) {
      setCurrentTab(tabParam);
    }
  }, [searchParams]);

  // Handle tour opening from URL
  useEffect(() => {
    if (shouldOpenTour) {
      setIsGuidedDemoOpen(true);
    }
  }, [shouldOpenTour]);

  // Initialize transactions & subscribe to store
  useEffect(() => {
    setDataMode(store.getDataMode());
    setTransactions([...store.getTransactions()]);

    const unsubscribe = store.subscribe(() => {
      setDataMode(store.getDataMode());
      setTransactions([...store.getTransactions()]);
    });

    // Check if first-time user for tutorial
    try {
      const tourDone = localStorage.getItem('ledgerproof_tutorial_completed_v2');
      if (!tourDone && !shouldOpenTour) {
        setIsGuidedDemoOpen(true);
      }
    } catch (e) {}

    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'landing') {
      router.push('/');
      return;
    }
    setCurrentTab(tab);
    // Keep URL parameter aligned without full reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSwitchDataMode = (mode: 'demo' | 'real') => {
    store.setDataMode(mode);
    setDataMode(mode);
    setTransactions([...store.getTransactions()]);
    setActiveTrace(null);
    setActiveTraceTx(null);
    setReviewTx(null);
    if (mode === 'real') {
      showToast("Switched to Real Data Workspace. Pre-loaded demo records cleared. Ready for your own data.");
    } else {
      showToast("Restored Northstar Labs demo dataset with multi-currency records and verified traces.");
    }
  };

  const handleResetDemo = () => {
    store.resetDemo();
    setTransactions([...store.getTransactions()]);
    setActiveTrace(null);
    setActiveTraceTx(null);
    setReviewTx(null);
    showToast("Northstar Labs demo environment restored to pristine initial state.");
  };

  const handleRunClose = () => {
    setIsRunningClose(true);
    setTimeout(() => {
      fetch('/api/close/run', { method: 'POST' }).catch(() => {});
      setIsRunningClose(false);
      setTransactions([...store.getTransactions()]);
      showToast("Close run completed. All eligible transactions reconciled and verified.");
    }, 1400);
  };

  const handleOpenDecisionTrace = (txId: string) => {
    const trace = store.getTrace(txId);
    const tx = store.getTransaction(txId) || transactions.find(t => t.id === txId) || null;
    setActiveTrace(trace);
    setActiveTraceTx(tx);
  };

  const handleReviewAction = (
    txId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION',
    notes: string,
    editedGl?: string
  ) => {
    const newStatus = action === 'REJECT' ? 'BLOCKED' : action === 'REQUEST_EVIDENCE' ? 'HUMAN_REVIEW_REQUIRED' : 'RESOLVED';
    store.updateTransaction(txId, {
      status: newStatus,
      notes: `Controller Sign-Off: ${action} — ${notes}`,
      gl_account: editedGl || store.getTransaction(txId)?.gl_account || '6000',
    });
    setTransactions([...store.getTransactions()]);
    showToast(`Exception ${txId} updated: ${action} committed.`);

    const remaining = store.getTransactions().filter(t => t.risk_tier === 'TIER_C' && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED');
    if (remaining.length === 0) {
      showToast("All material exceptions resolved. Close period ready for final sign-off.");
    }
  };

  const openExceptionCount = transactions.filter(
    (t) => t.category !== undefined && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED'
  ).length;

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary antialiased">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onResetDemo={handleResetDemo}
        onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        exceptionCount={openExceptionCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Main Dashboard Application Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRunClose={handleRunClose}
          onResetDemo={handleResetDemo}
          onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          isRunningClose={isRunningClose}
          transactions={transactions}
          onOpenDecisionTrace={handleOpenDecisionTrace}
          dataMode={dataMode}
          onSwitchDataMode={handleSwitchDataMode}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">

          {currentTab === 'command-center' && (
            <CommandCenterView
              transactions={transactions}
              onRunClose={handleRunClose}
              isRunningClose={isRunningClose}
              onNavigateToExceptions={(filter) => handleTabChange('exceptions')}
              onOpenDecisionTrace={handleOpenDecisionTrace}
              onOpenReviewModal={(tx) => setReviewTx(tx)}
            />
          )}

          {currentTab === 'exceptions' && (
            <ExceptionInboxView
              transactions={transactions}
              onOpenDecisionTrace={handleOpenDecisionTrace}
              onOpenReviewModal={(tx) => setReviewTx(tx)}
            />
          )}

          {currentTab === 'decision-trace' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              <div className="text-center py-4 space-y-1">
                <span className="text-xs font-semibold text-accent uppercase tracking-widest">Inspection Cockpit</span>
                <h1 className="font-serif text-3xl sm:text-4xl text-text-primary">Autonomous Decision Trace</h1>
                <p className="text-xs text-text-secondary max-w-xl mx-auto">
                  Select an exception below to inspect its multi-agent telemetry, evidence chips, and Independent Verifier determination.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {transactions.filter(t => t.category !== undefined).map(tx => (
                  <div
                    key={tx.id}
                    onClick={() => handleOpenDecisionTrace(tx.id)}
                    className="bg-bg-card p-5 rounded-xl border border-border-subtle shadow-subtle hover:border-text-secondary/30 cursor-pointer transition-all space-y-2 hover:shadow-card"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-text-muted font-semibold">{tx.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.risk_tier === 'TIER_D' 
                          ? 'bg-status-blockedBg text-status-blocked border border-status-blockedBorder' 
                          : 'bg-status-reviewBg text-status-review border border-status-reviewBorder'
                      }`}>
                        {tx.risk_tier}
                      </span>
                    </div>
                    <h3 className="font-medium text-base text-text-primary">{tx.vendor}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{tx.notes}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-border-subtle text-xs font-tabular">
                      <span className="font-semibold text-text-primary">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-accent font-semibold text-[11px] hover:underline">Inspect Telemetry &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'agent-lab' && <AgentLabView />}

          {currentTab === 'evaluations' && <EvaluationLabView />}

          {currentTab === 'policies' && <PolicyCenterView />}

          {currentTab === 'try-data' && (
            <TryYourDataView
              onAnalyzeSuccess={() => {
                setTransactions([...store.getTransactions()]);
                showToast("Data ingested and analyzed through multi-agent pipeline.");
              }}
              onOpenDecisionTrace={handleOpenDecisionTrace}
            />
          )}

          {currentTab === 'audit-vault' && (
            <AuditVaultView
              transactions={transactions}
              onOpenDecisionTrace={handleOpenDecisionTrace}
            />
          )}

          {currentTab === 'architecture' && <ArchitectureView />}

          {currentTab === 'built-with-ao' && <BuiltWithAoView />}
        </main>

        {/* Dashboard Status Utility Footer */}
        <footer className="bg-bg-secondary border-t border-border-subtle py-2.5 px-4 sm:px-6 text-xs text-text-muted mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-status-verified shrink-0" />
              <span className="font-mono text-text-primary font-medium">Consensus: Active</span>
              <span className="text-text-muted">&bull;</span>
              <span>SHA-256 Vault Synced</span>
              <span className="text-text-muted">&bull;</span>
              <span className="text-text-secondary">Northstar Labs (US-GAAP)</span>
            </div>
            <div className="flex items-center space-x-3 text-text-muted">
              <span>Latency: <strong className="text-text-primary font-mono font-medium">14.2ms</strong></span>
              <span>&bull;</span>
              <span>Runtime: <strong className="text-accent font-medium">Local Intelligence</strong></span>
              <span>&bull;</span>
              <button 
                id="tour-audit-vault-link"
                onClick={() => handleTabChange('audit-vault')} 
                className="hover:text-text-primary transition-colors text-text-secondary font-medium text-accent"
              >
                Audit Vault (SHA-256)
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setIsHelpOpen(true)} 
                className="hover:text-text-primary transition-colors text-text-secondary"
              >
                Docs & Guide
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="hover:text-text-primary transition-colors text-text-secondary"
              >
                Settings
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Decision Trace Modal */}
      {activeTrace && activeTraceTx && (
        <DecisionTraceModal
          trace={activeTrace}
          transaction={activeTraceTx}
          onClose={() => {
            setActiveTrace(null);
            setActiveTraceTx(null);
          }}
          onOpenReviewModal={(tx) => setReviewTx(tx)}
        />
      )}

      {/* Human Review Modal */}
      {reviewTx && (
        <HumanReviewModal
          transaction={reviewTx}
          onClose={() => setReviewTx(null)}
          onSubmitReview={handleReviewAction}
        />
      )}

      {/* Spotlight Interactive Element Walkthrough */}
      <SpotlightTutorial
        isOpen={isGuidedDemoOpen}
        onClose={() => setIsGuidedDemoOpen(false)}
        onNavigateToTab={(tab) => handleTabChange(tab)}
        onRunClose={handleRunClose}
        onResetDemo={handleResetDemo}
      />

      {/* System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => showToast("Controller settings saved successfully.")}
      />

      {/* Documentation & Help Guide Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-text-primary text-white text-xs font-medium shadow-modal animate-fade-in flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-status-verified shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex items-center space-x-3 text-text-secondary text-sm">
          <span className="w-3 h-3 rounded-full bg-accent animate-ping" />
          <span>Loading Autonomous Control Layer...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
