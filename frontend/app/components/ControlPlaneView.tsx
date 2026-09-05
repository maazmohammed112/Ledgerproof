'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  UserCheck, 
  X, 
  ChevronRight, 
  Layers, 
  Terminal, 
  ExternalLink,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { ControlPlaneAgentRun, AgentControlStatus } from '../lib/types';
import { store } from '../lib/store';

interface ControlPlaneViewProps {
  onNavigateToHumanReview?: () => void;
  onNavigateToExceptions?: () => void;
  onRunClose?: () => void;
  isRunningClose?: boolean;
}

export const ControlPlaneView: React.FC<ControlPlaneViewProps> = ({
  onNavigateToHumanReview,
  onNavigateToExceptions,
  onRunClose,
  isRunningClose = false,
}) => {
  const [runs, setRuns] = useState<ControlPlaneAgentRun[]>(store.getControlPlaneRuns());
  const [selectedRun, setSelectedRun] = useState<ControlPlaneAgentRun | null>(runs[0] || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getStatusBadge = (status: AgentControlStatus) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>RUNNING</span>
          </span>
        );
      case 'COMPLETED':
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span>VERIFYING</span>
          </span>
        );
      case 'WAITING_FOR_HUMAN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <UserCheck className="w-3 h-3 text-amber-600" />
            <span>WAITING FOR HUMAN</span>
          </span>
        );
      case 'FAILED_VERIFICATION':
      case 'BLOCKED_BY_POLICY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>{status.replace(/_/g, ' ')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-bg-subtle text-text-muted border border-border-subtle">
            {status}
          </span>
        );
    }
  };

  const handleOpenDrawer = (run: ControlPlaneAgentRun) => {
    setSelectedRun(run);
    setIsDrawerOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header & Active Close Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-subtle gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Autonomous Orchestration Fabric</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary">
            Finance Control Plane
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1 max-w-xl">
            Live telemetry of autonomous agents executing the September 2026 Close under strict deterministic governance bounds.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRunClose}
            disabled={isRunningClose}
            className="px-4 py-2 bg-accent text-white rounded-md text-xs font-semibold hover:bg-accent-hover transition-all flex items-center space-x-1.5 shadow-subtle active:scale-[0.98] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunningClose ? 'Executing Pipeline...' : 'Trigger Pipeline Close'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-subtle space-y-1">
          <span className="text-[11px] font-medium text-text-muted">Active Agents</span>
          <div className="text-xl font-semibold text-text-primary font-tabular">5 Orchestrated</div>
          <span className="text-[10px] text-text-secondary">4 Running · 1 Human-Gated</span>
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-subtle space-y-1">
          <span className="text-[11px] font-medium text-text-muted">Lines Reconciled</span>
          <div className="text-xl font-semibold text-status-verified font-tabular">4,882 / 5,420</div>
          <span className="text-[10px] text-text-secondary">90.1% Autonomous Execution</span>
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-subtle space-y-1">
          <span className="text-[11px] font-medium text-text-muted">Verified Blocks</span>
          <div className="text-xl font-semibold text-rose-700 font-tabular">2 Blocked</div>
          <span className="text-[10px] text-text-secondary">Duplicate & GL Veto Enforced</span>
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-subtle space-y-1">
          <span className="text-[11px] font-medium text-text-muted">Human Escalation</span>
          <div className="text-xl font-semibold text-amber-600 font-tabular">3 Pending</div>
          <span className="text-[10px] text-text-secondary">Material Variance Sign-off</span>
        </div>
      </div>

      {/* 3. Live Agent Execution Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-text-primary">Active Multi-Agent Pipeline</h2>
          <span className="text-xs text-text-muted">Click any agent run to inspect execution drawer</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {runs.map((run) => (
            <div
              key={run.id}
              onClick={() => handleOpenDrawer(run)}
              className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-subtle hover:border-text-secondary/40 cursor-pointer transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center font-bold text-xs text-accent">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary">{run.agent_name}</h3>
                    <p className="text-xs text-text-secondary">{run.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(run.status)}
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </div>

              {/* Progress Bar & Current Task */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-text-secondary truncate max-w-md">
                    {run.current_task}
                  </span>
                  <span className="font-semibold text-text-primary font-tabular">
                    {run.progress_pct}%
                  </span>
                </div>
                <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${run.progress_pct}%` }}
                  />
                </div>
              </div>

              {/* Telemetry Stats Bar */}
              <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between text-xs text-text-muted gap-2 font-mono">
                <div className="flex items-center space-x-4">
                  <span>Processed: <strong className="text-text-primary font-tabular">{run.items_processed.toLocaleString()}</strong></span>
                  <span>Exceptions: <strong className="text-amber-600 font-tabular">{run.exceptions_found}</strong></span>
                  <span>Evidence: <strong className="text-text-primary font-tabular">{run.evidence_count}</strong></span>
                </div>

                <div className="flex items-center space-x-3">
                  <span>Tools: <strong className="text-text-primary">{run.tools_invoked.length}</strong></span>
                  <span>Duration: <strong className="text-text-primary font-tabular">{run.duration_ms}ms</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. WORKFLOW DETAIL DRAWER */}
      {isDrawerOpen && selectedRun && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-bg-card h-full shadow-2xl border-l border-border-subtle flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-bg-secondary/40">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-text-muted uppercase">{selectedRun.id}</span>
                  {getStatusBadge(selectedRun.status)}
                </div>
                <h3 className="font-serif text-xl text-text-primary">{selectedRun.agent_name}</h3>
                <p className="text-xs text-text-secondary">{selectedRun.role}</p>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              
              {/* Task Parameters */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-text-primary uppercase tracking-wider">Current Execution Objective</h4>
                <div className="p-3 bg-bg-secondary rounded-lg border border-border-subtle text-xs text-text-secondary leading-relaxed">
                  {selectedRun.current_task}
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                  <span className="text-[11px] text-text-muted">Started At</span>
                  <div className="font-mono text-text-primary font-medium mt-0.5">
                    {new Date(selectedRun.started_at).toLocaleTimeString()}
                  </div>
                </div>

                <div className="p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                  <span className="text-[11px] text-text-muted">Processing Latency</span>
                  <div className="font-mono text-text-primary font-medium mt-0.5">
                    {selectedRun.duration_ms} ms
                  </div>
                </div>

                <div className="p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                  <span className="text-[11px] text-text-muted">Items Handled</span>
                  <div className="font-mono text-text-primary font-medium mt-0.5">
                    {selectedRun.items_processed} / {selectedRun.total_items}
                  </div>
                </div>

                <div className="p-3 bg-bg-secondary rounded-lg border border-border-subtle">
                  <span className="text-[11px] text-text-muted">Verifier Determination</span>
                  <div className="font-mono text-accent font-semibold mt-0.5">
                    {selectedRun.verifier_result || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Tools Invoked */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-text-primary uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  <span>Tools & Heuristics Dispatched</span>
                </h4>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {selectedRun.tools_invoked.map((tool, i) => (
                    <div key={i} className="p-2.5 rounded bg-bg-secondary border border-border-subtle flex items-center justify-between text-text-primary">
                      <span>{tool}()</span>
                      <span className="text-status-verified font-medium text-[10px]">OK (200)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Safety Note */}
              <div className="p-3.5 rounded-lg bg-accent/5 border border-accent/20 space-y-1 text-text-secondary text-[11px]">
                <span className="font-semibold text-text-primary">Independent Verifier Invariant: </span>
                This agent has zero permission to directly commit accounting entries to the General Ledger. All proposals are independently audited by the adversarial verifier layer before the Autonomy Gate evaluates execution vs human escalation.
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border-subtle bg-bg-secondary/40 flex justify-end space-x-2">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-bg-card border border-border-subtle text-text-primary rounded-md hover:bg-bg-subtle"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
