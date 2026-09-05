'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  ArrowRight,
  SlidersHorizontal,
  Layers,
  Check,
  Cpu,
  FileSearch,
  Database,
  Activity,
  Terminal,
  Play
} from 'lucide-react';

export const AgentLabView: React.FC = () => {
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [builderStep, setBuilderStep] = useState(1);
  const [agentGoal, setAgentGoal] = useState('Detect potentially duplicated vendor invoices across overlapping service cycles');
  const [selectedTools, setSelectedTools] = useState<string[]>([
    'get_invoice',
    'detect_possible_duplicate',
    'get_vendor_history',
    'calculate_variance'
  ]);
  const [agentCreated, setAgentCreated] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'playground'>('agents');
  const [playgroundPrompt, setPlaygroundPrompt] = useState(
    'Analyze Invoice INV-9902 from CloudWorks Ltd for $103,000.00 against PO-CW-881 ($100,000.00).'
  );
  const [isExecutingPlayground, setIsExecutingPlayground] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<string | null>(null);

  const specializedAgents = [
    {
      id: 'investigation-agent',
      name: 'Investigation Agent',
      role: 'Deterministic evidence retrieval across vendor master agreements, purchase orders & subledgers',
      version: 'v2.4',
      status: 'Verified',
      accuracy: '98.8%',
      avgLatency: '142ms',
      lastEvaluated: 'Sep 05, 2026',
      tools: ['get_transaction', 'get_invoice', 'get_purchase_order', 'get_vendor_history'],
    },
    {
      id: 'resolution-agent',
      name: 'Resolution Agent',
      role: 'Proposes accounting adjustments and GL mappings under strict non-self-approval constraints',
      version: 'v2.4',
      status: 'Verified',
      accuracy: '96.2%',
      avgLatency: '210ms',
      lastEvaluated: 'Sep 05, 2026',
      tools: ['propose_resolution', 'calculate_variance', 'get_policy'],
    },
    {
      id: 'independent-verifier',
      name: 'Independent Verifier Agent',
      role: 'Adversarial auditor validating arithmetic, contract terms, statutory tax rules & policy bounds',
      version: 'v2.4',
      status: 'Verified',
      accuracy: '99.8%',
      avgLatency: '185ms',
      lastEvaluated: 'Sep 05, 2026',
      tools: ['run_verification', 'get_policy', 'get_historical_classification'],
    },
    {
      id: 'dup-detector',
      name: 'Duplicate Scoring Agent',
      role: 'Composite fuzzy duplicate scoring across vendor ID, invoice date, amount & hash fingerprint',
      version: 'v2.3',
      status: 'Verified',
      accuracy: '99.4%',
      avgLatency: '98ms',
      lastEvaluated: 'Sep 05, 2026',
      tools: ['detect_possible_duplicate', 'get_invoice', 'get_vendor_history'],
    },
    {
      id: 'variance-resolver',
      name: 'PO Variance Auditor',
      role: 'Deterministic 3-way matching against approved PO ceilings and line-item schedules',
      version: 'v2.3',
      status: 'Verified',
      accuracy: '97.2%',
      avgLatency: '115ms',
      lastEvaluated: 'Sep 05, 2026',
      tools: ['calculate_variance', 'get_purchase_order', 'get_policy'],
    },
    {
      id: 'accrual-agent',
      name: 'Accrual Estimation Agent',
      role: 'Formulates recurring unbilled subscription balances and drafts double-entry journals',
      version: 'v2.1',
      status: 'Idle',
      accuracy: '95.8%',
      avgLatency: '230ms',
      lastEvaluated: 'Sep 05, 2026',
      tools: ['get_contract', 'propose_journal_entry', 'get_policy'],
    },
  ];

  const availableToolsList = [
    { id: 'get_transaction', name: 'get_transaction()', desc: 'Retrieve raw subledger entry by TX ID' },
    { id: 'get_invoice', name: 'get_invoice()', desc: 'Fetch vendor invoice line items & terms' },
    { id: 'get_purchase_order', name: 'get_purchase_order()', desc: 'Retrieve ERP approved PO ceiling' },
    { id: 'get_vendor_history', name: 'get_vendor_history()', desc: 'Lookup 12-month vendor master records' },
    { id: 'detect_possible_duplicate', name: 'detect_possible_duplicate()', desc: 'Run composite fuzzy duplicate model' },
    { id: 'calculate_variance', name: 'calculate_variance()', desc: 'Deterministic decimal percentage math' },
    { id: 'get_historical_classification', name: 'get_historical_classification()', desc: 'Historical 12-month GL chart' },
    { id: 'propose_journal_entry', name: 'propose_journal_entry()', desc: 'Draft double-entry debit/credit ledger' },
  ];

  const toggleTool = (id: string) => {
    if (selectedTools.includes(id)) {
      setSelectedTools(selectedTools.filter((t) => t !== id));
    } else {
      setSelectedTools([...selectedTools, id]);
    }
  };

  const handleBuildAgent = () => {
    setAgentCreated(true);
    setTimeout(() => {
      setShowBuilderModal(false);
      setAgentCreated(false);
      setBuilderStep(1);
    }, 1200);
  };

  const handleRunPlayground = () => {
    setIsExecutingPlayground(true);
    setPlaygroundResult(null);
    setTimeout(() => {
      setIsExecutingPlayground(false);
      setPlaygroundResult(
        JSON.stringify(
          {
            investigation: {
              vendor: 'CloudWorks Ltd',
              invoice_ref: 'INV-9902',
              invoice_amount: 103000.0,
              po_ref: 'PO-CW-881',
              po_amount: 100000.0,
              variance_amount: 3000.0,
              variance_pct: 3.0,
              historical_match: true,
            },
            resolution_proposal: {
              recommended_action: 'REQUEST_CONTROLLER_APPROVAL',
              rationale: 'PO variance of 3.0% ($3,000.00) exceeds standard 1.0% / $500.00 ceiling.',
              target_gl: '6020 - Software Engineering Services',
            },
            independent_verifier: {
              status: 'FLAGGED_FOR_HUMAN_REVIEW',
              arithmetic_check: 'PASSED (103000 - 100000 == 3000.00)',
              policy_compliant: false,
              breach_rule: 'POL-PO-001 (Tolerance 1.0% exceeded by 2.0%)',
              autonomy_tier: 'TIER_C',
              action_enforced: 'QUEUED_FOR_SIGN_OFF',
            },
            telemetry: {
              tools_invoked: ['calculate_variance()', 'get_purchase_order()', 'get_policy()'],
              duration_ms: 284,
              cryptographic_hash: '8f92a1c098e4d3f...',
            },
          },
          null,
          2
        )
      );
    }, 950);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Autonomous Agent Engineering
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
            Agent Lab
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5 max-w-2xl">
            Configure specialized finance agents, inspect tool attachments, and execute adversarial test suites.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab Selector */}
          <div className="flex items-center bg-bg-secondary p-1 rounded-md border border-border-subtle text-xs">
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'agents' ? 'bg-white text-text-primary font-semibold shadow-subtle' : 'text-text-secondary'
              }`}
            >
              Registered Agents
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'playground' ? 'bg-white text-text-primary font-semibold shadow-subtle' : 'text-text-secondary'
              }`}
            >
              Execution Playground
            </button>
          </div>

          <button
            onClick={() => setShowBuilderModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-accent text-white hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Configure Agent</span>
          </button>
        </div>
      </div>

      {activeTab === 'agents' && (
        <>
          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {specializedAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-bg-secondary p-5 rounded-xl border border-border-subtle shadow-subtle hover:border-text-secondary/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle text-xs">
                    <span className="font-mono text-text-muted font-semibold">{agent.version}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      agent.status === 'Verified'
                        ? 'bg-status-verifiedBg text-status-verified border border-status-verifiedBorder'
                        : 'bg-bg-subtle text-text-muted'
                    }`}>
                      {agent.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    <Bot className="w-4 h-4 text-accent shrink-0" />
                    <h3 className="font-medium text-base text-text-primary">{agent.name}</h3>
                  </div>

                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                    {agent.role}
                  </p>

                  {/* Tools Chips */}
                  <div className="mt-4 pt-3 border-t border-border-subtle">
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block mb-1.5">
                      Attached Python Tools
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.map((t) => (
                        <span 
                          key={t} 
                          className="px-2 py-0.5 rounded bg-bg-card border border-border-subtle font-mono text-[10px] text-text-secondary"
                        >
                          {t}()
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-tabular">
                  <div>
                    <span className="text-[10px] text-text-muted block">Benchmark Precision</span>
                    <span className="font-bold text-status-verified">{agent.accuracy}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted block">Latency</span>
                    <span className="font-mono text-text-secondary font-medium">{agent.avgLatency}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </>
      )}

      {/* Execution Playground Tab */}
      {activeTab === 'playground' && (
        <div className="bg-bg-secondary p-6 rounded-2xl border border-border-subtle shadow-subtle space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Multi-Agent Sandbox
            </span>
            <h3 className="font-serif text-2xl text-text-primary mt-0.5">
              Live Pipeline Triage Test
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-xl">
              Simulate an invoice exception through the Investigation Agent, Resolution Agent, and Independent Verifier with live telemetry.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-primary block">
              Simulation Scenario Payload
            </label>
            <textarea
              rows={3}
              value={playgroundPrompt}
              onChange={(e) => setPlaygroundPrompt(e.target.value)}
              className="w-full p-3 rounded-md text-xs bg-bg-card border border-border-subtle focus:outline-none focus:border-accent text-text-primary font-mono leading-relaxed"
            />
            <button
              onClick={handleRunPlayground}
              disabled={isExecutingPlayground}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-all shadow-subtle"
            >
              <Play className={`w-3.5 h-3.5 ${isExecutingPlayground ? 'animate-spin' : ''}`} />
              <span>{isExecutingPlayground ? 'Executing Multi-Agent Pipeline...' : 'Run Pipeline Triage'}</span>
            </button>
          </div>

          {playgroundResult && (
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Pipeline Telemetry Output</span>
                <span className="font-mono text-[11px] text-status-verified font-bold">Consensus Reached &bull; 284ms</span>
              </div>
              <pre className="p-4 rounded-xl bg-bg-card border border-border-subtle font-mono text-xs text-text-primary overflow-x-auto leading-relaxed max-h-96">
                {playgroundResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Interactive Agent Builder Modal */}
      {showBuilderModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowBuilderModal(false)}
        >
          <div 
            className="bg-bg-secondary w-full max-w-lg rounded-2xl border border-border-subtle shadow-modal overflow-hidden p-6 space-y-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Agent Registry
                </span>
                <h3 className="font-serif text-2xl text-text-primary mt-0.5">
                  Configure Finance Agent
                </h3>
              </div>
              <span className="text-xs font-mono text-text-muted">Step {builderStep} of 3</span>
            </div>

            {builderStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">
                    Accounting Objective
                  </label>
                  <textarea
                    rows={3}
                    value={agentGoal}
                    onChange={(e) => setAgentGoal(e.target.value)}
                    className="w-full p-3 rounded-md text-xs bg-bg-card border border-border-subtle focus:outline-none focus:border-accent text-text-primary leading-relaxed"
                  />
                </div>
                <div className="p-3.5 rounded-xl bg-bg-card border border-border-subtle text-text-secondary leading-relaxed space-y-1">
                  <span className="font-semibold text-text-primary block">Separation of Duties Mandate:</span>
                  <span>
                    The agent will generate structured proposals. Independent verification will be automatically bound as an adversarial gatekeeper.
                  </span>
                </div>
              </div>
            )}

            {builderStep === 2 && (
              <div className="space-y-3 text-xs">
                <label className="font-semibold text-text-primary block">
                  Select Permitted Deterministic Tools
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {availableToolsList.map((t) => {
                    const isSelected = selectedTools.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleTool(t.id)}
                        className={`p-2.5 rounded-md border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-accent-light border-accent text-accent' 
                            : 'bg-bg-card border-border-subtle text-text-secondary hover:border-text-secondary/30'
                        }`}
                      >
                        <div>
                          <span className="font-mono font-semibold block text-[11px]">{t.name}</span>
                          <span className="text-[10px] text-text-muted">{t.desc}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-accent shrink-0 ml-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {builderStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Synthesized Role:</span>
                    <span className="font-semibold text-text-primary">Forensic Exception Specialist</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Attached Python Tools:</span>
                    <span className="font-mono text-accent font-semibold">{selectedTools.length} tools bound</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Adversarial Verifier:</span>
                    <span className="font-semibold text-status-verified">Active & Mandatory</span>
                  </div>
                </div>

                {agentCreated ? (
                  <div className="p-3.5 rounded-xl bg-status-verifiedBg border border-status-verifiedBorder text-center text-status-verified font-medium flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Agent Registered in Active Reconciliation Cluster!</span>
                  </div>
                ) : (
                  <p className="text-text-secondary leading-relaxed">
                    Ready to compile and deploy agent into Northstar Labs reconciliation cluster.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
              <button
                onClick={() => setShowBuilderModal(false)}
                className="px-3.5 py-1.5 rounded-md font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2">
                {builderStep > 1 && (
                  <button
                    onClick={() => setBuilderStep(builderStep - 1)}
                    className="px-3.5 py-1.5 rounded-md font-medium text-text-secondary border border-border-subtle hover:bg-bg-subtle"
                  >
                    Back
                  </button>
                )}

                {builderStep < 3 ? (
                  <button
                    onClick={() => setBuilderStep(builderStep + 1)}
                    className="px-4 py-1.5 rounded-md font-semibold bg-accent text-white hover:bg-accent-hover"
                  >
                    Continue &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleBuildAgent}
                    disabled={agentCreated}
                    className="px-4 py-1.5 rounded-md font-semibold bg-accent text-white hover:bg-accent-hover disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <span>Register Agent</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
