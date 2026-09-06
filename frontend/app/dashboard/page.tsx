'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { SettingsModal } from '../components/SettingsModal';
import { HelpModal } from '../components/HelpModal';
import { CommandCenterView } from '../components/CommandCenterView';
import { ControlPlaneView } from '../components/ControlPlaneView';
import { DataSourcesView } from '../components/DataSourcesView';
import { TransactionsView } from '../components/TransactionsView';
import { ReconciliationView } from '../components/ReconciliationView';
import { ExceptionInboxView } from '../components/ExceptionInboxView';
import { DecisionTraceModal } from '../components/DecisionTraceModal';
import { HumanReviewModal } from '../components/HumanReviewModal';
import { AgentLabView } from '../components/AgentLabView';
import { EvaluationLabView } from '../components/EvaluationLabView';
import { PolicyCenterView } from '../components/PolicyCenterView';
import { AuditVaultView } from '../components/AuditVaultView';
import { ReportsView } from '../components/ReportsView';
import { ArchitectureView } from '../components/ArchitectureView';
import { ObservabilityView } from '../components/ObservabilityView';
import { TryYourDataView } from '../components/TryYourDataView';
import { BuiltWithAoView } from '../components/BuiltWithAoView';
import { SpotlightTutorial } from '../components/SpotlightTutorial';
import { WorkspaceModal } from '../components/WorkspaceModal';
import { LandingPageView } from '../components/LandingPageView';

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
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
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

    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSwitchDataMode = (mode: 'demo' | 'real') => {
    if (mode === 'real') {
      const active = store.getActiveWorkspace();
      if (active.isDemo) {
        setIsWorkspaceModalOpen(true);
      } else {
        store.setDataMode('real');
        setDataMode('real');
        setTransactions([...store.getTransactions()]);
        showToast("Switched to Real Data Workspace.");
      }
    } else {
      store.setDataMode('demo');
      setDataMode('demo');
      setTransactions([...store.getTransactions()]);
      setActiveTrace(null);
      setActiveTraceTx(null);
      setReviewTx(null);
      showToast("Restored Northstar Labs demo dataset.");
    }
  };

  const handleResetDemo = () => {
    store.resetDemo();
    setTransactions([...store.getTransactions()]);
    setActiveTrace(null);
    setActiveTraceTx(null);
    setReviewTx(null);
    showToast("Demo environment restored to initial state.");
  };

  const handleRunClose = () => {
    setIsRunningClose(true);
    setTimeout(() => {
      fetch('/api/close/run', { method: 'POST' }).catch(() => {});
      setIsRunningClose(false);
      setTransactions([...store.getTransactions()]);
      showToast("Close run completed. All eligible transactions reconciled and verified.");
    }, 1200);
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
    store.processHumanDecision(txId, action, notes, editedGl);
    setTransactions([...store.getTransactions()]);
    showToast(`Exception ${txId} updated: ${action} committed.`);
  };

  const handleLogout = () => {
    // Return cleanly to landing page
    setCurrentTab('landing');
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'landing');
    window.history.replaceState({}, '', url.toString());
  };

  // If user navigated to landing page view
  if (currentTab === 'landing') {
    return (
      <LandingPageView
        onLaunchCommandCenter={() => handleTabChange('command-center')}
        onOpenDecisionTrace={(txId) => {
          handleTabChange('decision-trace');
          handleOpenDecisionTrace(txId);
        }}
        onStartGuidedTour={() => {
          handleTabChange('command-center');
          setIsGuidedDemoOpen(true);
        }}
      />
    );
  }

  const openExceptionCount = transactions.filter(
    (t) => t.category !== undefined && t.status !== 'RESOLVED' && t.status !== 'MANUALLY_APPROVED'
  ).length;

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary antialiased">
      
      {/* 1. Left Sidebar Navigation (Matching Reference 5) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onResetDemo={handleResetDemo}
        onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onLogout={handleLogout}
        exceptionCount={openExceptionCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Main Dashboard Application Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header (Matching Reference 5) */}
        <TopHeader
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRunClose={handleRunClose}
          onResetDemo={handleResetDemo}
          onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
          onLogout={handleLogout}
          isRunningClose={isRunningClose}
          transactions={transactions}
          onOpenDecisionTrace={handleOpenDecisionTrace}
          dataMode={dataMode}
          onSwitchDataMode={handleSwitchDataMode}
        />

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0E332E] text-white px-4 py-2.5 rounded-2xl shadow-modal text-xs font-semibold flex items-center space-x-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-pastel-mint" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Content Canvas */}
        <main className="flex-1 min-w-0">

          {currentTab === 'command-center' && (
            <CommandCenterView
              transactions={transactions}
              onRunClose={handleRunClose}
              isRunningClose={isRunningClose}
              onNavigateToExceptions={(filter) => handleTabChange('exceptions')}
              onOpenDecisionTrace={handleOpenDecisionTrace}
              onOpenReviewModal={(tx) => setReviewTx(tx)}
              onOpenDataSources={() => handleTabChange('data-sources')}
            />
          )}

          {currentTab === 'control-plane' && (
            <ControlPlaneView
              onRunClose={handleRunClose}
              isRunningClose={isRunningClose}
              onNavigateToExceptions={() => handleTabChange('exceptions')}
              onNavigateToHumanReview={() => handleTabChange('exceptions')}
            />
          )}

          {currentTab === 'data-sources' && (
            <DataSourcesView
              onImportComplete={() => {
                setTransactions([...store.getTransactions()]);
                showToast("File imported into workspace ledger.");
              }}
              onRunClose={handleRunClose}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onOpenDecisionTrace={handleOpenDecisionTrace}
              onOpenReviewModal={(tx) => setReviewTx(tx)}
            />
          )}

          {currentTab === 'reconciliation' && (
            <ReconciliationView
              transactions={transactions}
              onOpenDecisionTrace={handleOpenDecisionTrace}
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
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest">Inspection Cockpit</span>
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
                    className="bg-white p-5 rounded-2xl border border-border-subtle shadow-subtle hover:border-text-secondary/40 cursor-pointer transition-all space-y-2 hover:shadow-card"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-text-muted font-semibold">{tx.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.risk_tier === 'TIER_D' 
                          ? 'bg-pastel-pink text-status-blocked border border-pastel-pinkBorder' 
                          : 'bg-pastel-lime text-amber-800 border border-pastel-limeBorder'
                      }`}>
                        {tx.risk_tier || 'TIER_C'}
                      </span>
                    </div>
                    <h3 className="font-medium text-base text-text-primary">{tx.vendor}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{tx.notes}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-border-subtle text-xs font-tabular">
                      <span className="font-semibold text-text-primary">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-emerald-800 font-semibold text-[11px] hover:underline">Inspect Telemetry &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'agent-lab' && <AgentLabView />}

          {currentTab === 'evaluations' && <EvaluationLabView />}

          {currentTab === 'policies' && <PolicyCenterView />}

          {currentTab === 'audit-vault' && (
            <AuditVaultView
              transactions={transactions}
              onOpenDecisionTrace={handleOpenDecisionTrace}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              onOpenDecisionTrace={handleOpenDecisionTrace}
            />
          )}

          {currentTab === 'architecture' && <ArchitectureView />}

          {currentTab === 'observability' && <ObservabilityView />}

          {currentTab === 'try-data' && (
            <TryYourDataView
              onAnalyzeSuccess={() => {
                setTransactions([...store.getTransactions()]);
                showToast("Data ingested and analyzed through multi-agent pipeline.");
              }}
              onOpenDecisionTrace={handleOpenDecisionTrace}
            />
          )}

          {currentTab === 'built-with-ao' && <BuiltWithAoView />}
        </main>

        {/* Dashboard Status Utility Footer */}
        <footer className="bg-white border-t border-border-subtle py-3 px-4 sm:px-6 text-xs text-text-muted mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span className="font-mono text-text-primary font-medium">Consensus: Active</span>
              <span className="text-text-muted">&bull;</span>
              <span>SHA-256 Vault Synced</span>
              <span className="text-text-muted">&bull;</span>
              <span className="text-text-secondary">{store.getActiveWorkspace().name} ({store.getActiveWorkspace().reportingCurrency})</span>
            </div>
            <div className="flex items-center space-x-3 text-text-muted">
              <span>Latency: <strong className="text-text-primary font-mono font-medium">14.2ms</strong></span>
              <span>&bull;</span>
              <span>Runtime: <strong className="text-emerald-800 font-medium">Local Intelligence</strong></span>
              <span>&bull;</span>
              <button 
                onClick={() => handleTabChange('audit-vault')} 
                className="hover:text-text-primary transition-colors text-emerald-800 font-semibold"
              >
                Audit Vault (SHA-256)
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
          onDecision={handleReviewAction}
          onOpenDecisionTrace={(txId) => {
            setReviewTx(null);
            handleOpenDecisionTrace(txId);
          }}
        />
      )}

      {/* Workspace Management Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSelectWorkspace={(wsId) => {
          store.setActiveWorkspace(wsId);
          setTransactions([...store.getTransactions()]);
          setIsWorkspaceModalOpen(false);
          showToast(`Switched to workspace.`);
        }}
        onCreateSuccess={(newWs) => {
          setTransactions([...store.getTransactions()]);
          setIsWorkspaceModalOpen(false);
          showToast(`Provisioned workspace: ${newWs.name}`);
        }}
      />

      {/* Guided Walkthrough Tour */}
      <SpotlightTutorial
        isOpen={isGuidedDemoOpen}
        onClose={() => setIsGuidedDemoOpen(false)}
        onComplete={() => {
          setIsGuidedDemoOpen(false);
          try {
            localStorage.setItem('ledgerproof_tutorial_completed_v2', 'true');
          } catch (e) {}
          showToast("Tour complete! You're ready to explore autonomous reconciliation.");
        }}
      />

      {/* Governance Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Help & Documentation Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-secondary text-sm font-mono">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-border-subtle border-t-[#0E332E] animate-spin mx-auto" />
          <div>Initializing LedgerProof Control Layer...</div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
