'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  FileSearch, 
  Scale, 
  Lock, 
  ArrowRight,
  Database,
  Layers,
  Cpu,
  UserCheck,
  Zap,
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export interface WorkflowNode {
  id: string;
  stepNumber: number;
  label: string;
  role: string;
  agentName: string;
  status: 'IDLE' | 'ACTIVE' | 'COMPLETED' | 'WAITING_HUMAN' | 'VETOED';
  latencyMs: number;
  tags: string[];
  summary: string;
  telemetry: {
    input: string;
    deterministicRule: string;
    agentOutput: string;
    cfoExplanation: string;
    confidence: number;
  };
}

interface WorkflowCanvasProps {
  onOpenDecisionTrace?: (txId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  isCompact?: boolean;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  onOpenDecisionTrace,
  onNavigateToTab,
  isCompact = false,
}) => {
  // Scenario selector
  const [activeScenario, setActiveScenario] = useState<'AWS_MISPOST' | 'STARLIGHT_DUP' | 'CLOUDWORKS_PO'>('AWS_MISPOST');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(5); // Default at Independent Verifier
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // Define scenarios
  const scenarios = {
    AWS_MISPOST: {
      id: 'TX-EXC-003',
      name: 'AWS Cloud Hosting ($8,420.00)',
      category: 'GL Account Misclassification',
      description: 'Resolution agent proposes Office Supplies (GL 6400). Independent Verifier vetoes and routes to Cloud Infrastructure (GL 6010).',
    },
    STARLIGHT_DUP: {
      id: 'TX-EXC-001',
      name: 'Starlight Logistics ($14,500.00)',
      category: 'Duplicate Invoice Detection',
      description: 'Re-submitted invoice detected with identical invoice number and 48hr date proximity. Tier D Hard Block enforced.',
    },
    CLOUDWORKS_PO: {
      id: 'TX-EXC-002',
      name: 'CloudWorks Infrastructure ($103,000.00)',
      category: 'Material PO Variance (3%)',
      description: 'Billed $103,000 against $100,000 PO. Exceeds 2% variance limit. Routed to Human Controller Sign-Off queue (Tier C).',
    },
  };

  // Node definitions based on scenario
  const getNodes = (): WorkflowNode[] => {
    const isAws = activeScenario === 'AWS_MISPOST';
    const isDup = activeScenario === 'STARLIGHT_DUP';

    return [
      {
        id: 'node-ingest',
        stepNumber: 1,
        label: 'Multi-Source Ingestion',
        role: 'Data Connectors',
        agentName: 'Ingestion Pipeline',
        status: activeStepIndex >= 0 ? 'COMPLETED' : 'IDLE',
        latencyMs: 4.2,
        tags: ['Bank Feed', 'ERP Journal', 'Invoice OCR'],
        summary: isAws 
          ? 'Ingested AWS invoice INV-AWS-88192 & ERP transaction TX-EXC-003.' 
          : isDup 
          ? 'Received vendor invoice INV-STR-9941 via AP email connector.' 
          : 'Ingested vendor invoice CW-2026-092 ($103k) and NetSuite PO-1002.',
        telemetry: {
          input: 'Raw CSV, PDF & REST webhook payload (84 fields)',
          deterministicRule: 'data_ingest_validator.py · strict ISO 4217 & RFC 3339 validation',
          agentOutput: 'Structured immutable transaction record stored in memory',
          cfoExplanation: 'Consolidates all bank statements, invoices, and accounting journals into a single validated schema with zero missing fields.',
          confidence: 1.0,
        },
      },
      {
        id: 'node-normalize',
        stepNumber: 2,
        label: 'Schema & Currency Normalization',
        role: 'Data Quality Engine',
        agentName: 'Normalization Engine',
        status: activeStepIndex >= 1 ? 'COMPLETED' : activeStepIndex === 0 ? 'ACTIVE' : 'IDLE',
        latencyMs: 3.8,
        tags: ['Decimal-Safe', 'ISO-4217', 'UTC Stamping'],
        summary: 'Parsed amount into exact integer cents ($8,420.00 = 842000 cents). Normalized UTC timestamp.',
        telemetry: {
          input: 'Disparate raw currency tags & localized decimal separators',
          deterministicRule: 'decimal_minor_unit_converter.ts · Zero floating-point rounding',
          agentOutput: 'Normalized minor unit representation (cents/paise) with explicit ISO 4217 tag',
          cfoExplanation: 'Eliminates floating-point calculation errors in financial balances and prevents multi-currency conversion mismatches.',
          confidence: 1.0,
        },
      },
      {
        id: 'node-reconcile',
        stepNumber: 3,
        label: 'Deterministic 3-Way Match',
        role: 'Arithmetic Matcher',
        agentName: 'Reconciliation Core',
        status: activeStepIndex >= 2 ? 'COMPLETED' : activeStepIndex === 1 ? 'ACTIVE' : 'IDLE',
        latencyMs: 8.5,
        tags: ['PO Match', 'Invoice Match', 'Bank Rec'],
        summary: isAws 
          ? 'PO and bank match confirmed. Internal memo discrepancy flagged on GL Account assignment.'
          : isDup 
          ? 'Exact invoice # match found with cleared payment from 2 days ago. Hard duplicate flag set.' 
          : 'Invoice billed $103,000.00 vs PO $100,000.00. 3.0% variance exceeds statutory 2.0% limit.',
        telemetry: {
          input: 'Purchase Order #, Vendor Invoice, Bank Disbursement statement',
          deterministicRule: 'three_way_match_calculator.py · Tolerance threshold <= 2.0%',
          agentOutput: isAws ? 'FLAG_GL_DISCREPANCY' : isDup ? 'FLAG_DUPLICATE_INVOICE' : 'FLAG_PO_VARIANCE',
          cfoExplanation: 'Performs 100% deterministic arithmetic matching between the purchase order, the vendor invoice, and actual bank cash withdrawals.',
          confidence: 0.99,
        },
      },
      {
        id: 'node-forensic',
        stepNumber: 4,
        label: 'Forensic Investigation Agent',
        role: 'Forensic Reasoning',
        agentName: 'Forensic Investigator',
        status: activeStepIndex >= 3 ? 'COMPLETED' : activeStepIndex === 2 ? 'ACTIVE' : 'IDLE',
        latencyMs: 18.2,
        tags: ['Multi-Source', 'Historical Scan', 'Pydantic'],
        summary: isAws 
          ? 'Analyzed 48 historical months of AWS bills and Master Vendor Agreement #MVA-881.' 
          : isDup 
          ? 'Discovered identical hash, vendor tax ID, and bank account routing number.' 
          : 'Cross-checked CloudWorks contractual SLA terms regarding quarterly overages.',
        telemetry: {
          input: 'Historical GL postings (48 months), Vendor Master Agreement, Bank records',
          deterministicRule: 'temporal_proximity_and_content_hash.py',
          agentOutput: 'Structured evidence packet: EVD-AWS-001, EVD-AWS-002',
          cfoExplanation: 'Gathers multi-source evidence like a senior forensic accountant before proposing any journal entry or variance write-off.',
          confidence: 0.96,
        },
      },
      {
        id: 'node-resolution',
        stepNumber: 5,
        label: 'Resolution Formulation Agent',
        role: 'Proposal Formulation',
        agentName: 'Resolution Agent',
        status: activeStepIndex >= 4 ? 'COMPLETED' : activeStepIndex === 3 ? 'ACTIVE' : 'IDLE',
        latencyMs: 14.5,
        tags: ['Journal Entry', 'Draft Proposal', 'Non-Executing'],
        summary: isAws 
          ? 'Proposed reclassifying AWS to GL 6400 (Office Supplies) due to naive keyword "supplies".' 
          : isDup 
          ? 'Formulated action: Reject duplicate voucher and void unexecuted disbursement.' 
          : 'Formulated action: Request Tier C Controller Sign-Off for $3,000 variance.',
        telemetry: {
          input: 'Forensic evidence packet & accounting chart of accounts',
          deterministicRule: 'Strict isolation: Resolution Agent has ZERO write-access to General Ledger',
          agentOutput: isAws ? 'PROPOSAL: BOOK_GL_6400' : isDup ? 'PROPOSAL: BLOCK_DUPLICATE' : 'PROPOSAL: APPROVE_WITH_OVERAGE',
          cfoExplanation: 'Drafts the accounting resolution. Crucially, this agent is never permitted to approve or execute its own recommendation.',
          confidence: isAws ? 0.88 : 0.98,
        },
      },
      {
        id: 'node-verifier',
        stepNumber: 6,
        label: 'Independent Adversarial Verifier',
        role: 'Dual-Agent Separation',
        agentName: 'Independent Verifier',
        status: isAws 
          ? (activeStepIndex >= 5 ? 'VETOED' : activeStepIndex === 4 ? 'ACTIVE' : 'IDLE')
          : (activeStepIndex >= 5 ? 'COMPLETED' : activeStepIndex === 4 ? 'ACTIVE' : 'IDLE'),
        latencyMs: 12.1,
        tags: ['Zero Self-Approval', 'Policy Check', 'Adversarial Veto'],
        summary: isAws 
          ? 'VETOED Resolution Agent proposal: AWS is contractually classified as Cloud Hosting (GL 6010).' 
          : isDup 
          ? 'VERIFIED duplicate detection with 98% confidence. Endorsed Tier D Hard Block.' 
          : 'VERIFIED calculation: $3,000 overage exceeds 2% policy threshold. Confirmed Tier C escalation.',
        telemetry: {
          input: 'Proposed Resolution + Statutory Corporate Policies (POL-GL-001, POL-MAT-001)',
          deterministicRule: 'policy_invariance_verifier.py · Conflict & Hallucination Detector',
          agentOutput: isAws ? 'DETERMINATION: REJECTED_AND_CORRECTED' : 'DETERMINATION: VERIFIED',
          cfoExplanation: 'The non-negotiable safety invariant: an independent reviewer agent audits the proposed accounting entry against corporate policy before any action can occur.',
          confidence: 0.99,
        },
      },
      {
        id: 'node-autonomy',
        stepNumber: 7,
        label: 'Deterministic Autonomy Gate',
        role: 'Autonomy Governor',
        agentName: 'Autonomy Controller',
        status: activeScenario === 'CLOUDWORKS_PO'
          ? (activeStepIndex >= 6 ? 'WAITING_HUMAN' : activeStepIndex === 5 ? 'ACTIVE' : 'IDLE')
          : isAws 
          ? (activeStepIndex >= 6 ? 'COMPLETED' : activeStepIndex === 5 ? 'ACTIVE' : 'IDLE')
          : (activeStepIndex >= 6 ? 'COMPLETED' : activeStepIndex === 5 ? 'ACTIVE' : 'IDLE'),
        latencyMs: 2.1,
        tags: ['Tiers A-D', 'Materiality Bound', 'Human Review'],
        summary: activeScenario === 'CLOUDWORKS_PO' 
          ? 'PAUSED: Material variance ($103k >= $10k limit). Waiting for Controller Sign-Off in Review Queue.' 
          : isAws 
          ? 'Tier D Hard Block averted; corrected GL 6010 committed under Tier B Policy Rules.' 
          : 'Tier D Hard Block strictly enforced. Disbursement permanently prevented.',
        telemetry: {
          input: 'Transaction Amount, Verifier Determination, Materiality Threshold ($10,000.00)',
          deterministicRule: 'autonomy_tier_gate.py · Code-level policy gate (no LLM in the loop)',
          agentOutput: activeScenario === 'CLOUDWORKS_PO' ? 'TIER_C_HUMAN_SIGN_OFF_REQUIRED' : isDup ? 'TIER_D_HARD_BLOCK' : 'TIER_B_AUTONOMOUS_POST',
          cfoExplanation: 'Calculates whether an action can execute automatically (Tiers A/B) or strictly requires human controller signature (Tier C) or hard block (Tier D).',
          confidence: 1.0,
        },
      },
      {
        id: 'node-vault',
        stepNumber: 8,
        label: 'Immutable SHA-256 Audit Vault',
        role: 'Cryptographic Ledger',
        agentName: 'Audit Vault',
        status: activeStepIndex >= 7 ? 'COMPLETED' : activeStepIndex === 6 ? 'ACTIVE' : 'IDLE',
        latencyMs: 1.4,
        tags: ['SHA-256 Proof', 'SOX Compliant', 'Replayable'],
        summary: 'Anchored decision record, forensic evidence hashes, and verifier determination into cryptographic audit block #4083.',
        telemetry: {
          input: 'Complete multi-agent decision trace, timestamps, tool calls, and model outputs',
          deterministicRule: 'sha256_cryptographic_anchor.ts · Append-only verification log',
          agentOutput: 'Block Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          cfoExplanation: 'Seals every decision with a SHA-256 cryptographic hash so internal and external auditors (PwC, EY, Deloitte) can verify full proof of work.',
          confidence: 1.0,
        },
      },
    ];
  };

  const nodes = getNodes();

  // Auto simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev >= 7 ? 0 : prev + 1));
    }, 2800);

    return () => clearInterval(timer);
  }, [isSimulating]);

  const activeNode = nodes[activeStepIndex] || nodes[0];

  return (
    <div className={`w-full bg-bg-card border border-border-subtle rounded-2xl shadow-card overflow-hidden ${isCompact ? 'p-4' : 'p-6'}`}>
      
      {/* Top Controller Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-border-subtle gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span>Real-Time Autonomous Agent Pipeline</span>
            <span className="text-border-medium">&bull;</span>
            <span className="text-text-muted font-normal">n8n Execution Architecture</span>
          </div>
          <h2 className="font-serif text-2xl text-text-primary">
            Autonomous Close Flow &amp; Telemetry
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Watch live financial packets flow through deterministic matching, forensic agents, and independent verification.
          </p>
        </div>

        {/* Simulation Controls & Scenario Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Selector */}
          <div className="flex items-center bg-bg-subtle p-1 rounded-lg border border-border-subtle text-xs">
            <button
              onClick={() => {
                setActiveScenario('AWS_MISPOST');
                setActiveStepIndex(5);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeScenario === 'AWS_MISPOST' ? 'bg-white text-text-primary shadow-subtle font-semibold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              AWS GL Veto
            </button>
            <button
              onClick={() => {
                setActiveScenario('STARLIGHT_DUP');
                setActiveStepIndex(5);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeScenario === 'STARLIGHT_DUP' ? 'bg-white text-text-primary shadow-subtle font-semibold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Duplicate Block
            </button>
            <button
              onClick={() => {
                setActiveScenario('CLOUDWORKS_PO');
                setActiveStepIndex(6);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeScenario === 'CLOUDWORKS_PO' ? 'bg-white text-text-primary shadow-subtle font-semibold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              PO Variance Escalation
            </button>
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-secondary hover:bg-bg-subtle text-xs font-semibold text-text-primary transition-all shadow-subtle"
            title={isSimulating ? 'Pause live flow' : 'Play live flow'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5 text-accent" /> : <Play className="w-3.5 h-3.5 text-status-verified" />}
            <span>{isSimulating ? 'Pause Flow' : 'Resume Flow'}</span>
          </button>

          {/* Reset Flow */}
          <button
            onClick={() => setActiveStepIndex(0)}
            className="p-1.5 rounded-lg border border-border-subtle bg-bg-secondary hover:bg-bg-subtle text-text-secondary hover:text-text-primary transition-all shadow-subtle"
            title="Reset to Ingestion Step"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Active Status Banner */}
      <div className="my-4 p-3 rounded-xl bg-bg-subtle border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent relative" />
          </div>
          <div>
            <span className="font-semibold text-text-primary">Current Execution Step:</span>{' '}
            <span className="font-mono text-accent font-medium">Node {activeNode.stepNumber}: {activeNode.label}</span>
            <span className="text-text-muted mx-2">&bull;</span>
            <span className="text-text-secondary text-[11px]">Active Persona: <strong>{activeNode.agentName}</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="text-text-muted">Payload: <strong className="text-text-primary">{scenarios[activeScenario].name}</strong></span>
          <span className="text-border-medium">|</span>
          <span className="text-text-muted">Step Latency: <strong className="text-text-primary">{activeNode.latencyMs}ms</strong></span>
        </div>
      </div>

      {/* 2. n8n-STYLE NODE WORKFLOW CANVAS */}
      <div className="relative w-full overflow-x-auto py-6 px-2 bg-gradient-to-b from-bg-primary/50 to-bg-card rounded-xl border border-border-subtle/80">
        
        {/* Subtle grid pattern for n8n look */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40" 
          style={{
            backgroundImage: 'radial-gradient(#94A3B8 0.75px, transparent 0.75px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Nodes Grid Container */}
        <div className="relative min-w-[980px] grid grid-cols-8 gap-3 z-10">
          {nodes.map((node, idx) => {
            const isCurrent = activeStepIndex === idx;
            const isPassed = activeStepIndex > idx;
            const isVetoed = node.status === 'VETOED';
            const isWaiting = node.status === 'WAITING_HUMAN';

            return (
              <div key={node.id} className="relative flex flex-col">
                
                {/* Connecting Line to next node (SVG arrow with flowing animated pulse) */}
                {idx < nodes.length - 1 && (
                  <div className="absolute top-7 left-full w-3 h-0.5 z-0 pointer-events-none">
                    <svg className="w-full h-4 -top-2 relative overflow-visible">
                      <line 
                        x1="0" 
                        y1="2" 
                        x2="12" 
                        y2="2" 
                        stroke="#CBD5E1" 
                        strokeWidth="2" 
                      />
                      {isCurrent && (
                        <circle cx="6" cy="2" r="3" fill="#4F46E5" className="animate-pulse" />
                      )}
                    </svg>
                  </div>
                )}

                {/* The Node Card */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`relative p-3 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between select-none ${
                    isCurrent
                      ? 'bg-white border-accent ring-2 ring-accent/20 shadow-modal scale-[1.03] z-20'
                      : isPassed
                      ? 'bg-bg-card border-status-verifiedBorder hover:border-accent/40 shadow-subtle'
                      : isVetoed
                      ? 'bg-status-blockedBg border-status-blocked shadow-subtle'
                      : isWaiting
                      ? 'bg-status-reviewBg border-status-review shadow-subtle'
                      : 'bg-bg-card/70 border-border-subtle hover:border-border-medium shadow-subtle opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Node Header */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-bg-subtle text-text-secondary">
                      0{node.stepNumber}
                    </span>

                    {isVetoed ? (
                      <span className="text-[8px] font-bold px-1 rounded bg-status-blocked text-white uppercase tracking-tight">
                        Veto
                      </span>
                    ) : isWaiting ? (
                      <span className="text-[8px] font-bold px-1 rounded bg-status-review text-white uppercase tracking-tight">
                        Hold
                      </span>
                    ) : isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-verified shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-accent animate-ping shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-border-medium shrink-0" />
                    )}
                  </div>

                  {/* Node Title */}
                  <div className="min-h-[38px]">
                    <h4 className={`text-[11px] font-bold leading-snug line-clamp-2 ${
                      isCurrent ? 'text-accent' : isVetoed ? 'text-status-blocked' : 'text-text-primary'
                    }`}>
                      {node.label}
                    </h4>
                  </div>

                  {/* Role Tag */}
                  <div className="mt-1">
                    <span className="text-[9px] text-text-muted line-clamp-1">
                      {node.role}
                    </span>
                  </div>

                  {/* Ports visual (n8n input/output pegs) */}
                  <div className="mt-2 pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[8px] text-text-muted font-mono">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-border-medium" />
                    <span>{node.latencyMs}ms</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-border-medium" />
                  </div>
                </div>

                {/* Under-node step action status */}
                <div className="mt-1.5 text-center">
                  <span className={`text-[9px] font-medium ${
                    isCurrent 
                      ? 'text-accent font-bold' 
                      : isVetoed 
                      ? 'text-status-blocked font-bold' 
                      : isWaiting 
                      ? 'text-status-review font-bold' 
                      : 'text-text-muted'
                  }`}>
                    {isCurrent ? 'Processing...' : isVetoed ? 'Veto Enforced' : isWaiting ? 'Sign-Off Req' : isPassed ? 'Passed' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LIVE STEP FORENSIC INSPECTION DRAWER / DETAILS CARD */}
      <div className="mt-5 p-5 rounded-xl bg-bg-secondary border border-border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <div className="flex items-center space-x-2.5">
            <span className="p-1 rounded bg-bg-card border border-border-subtle font-mono text-xs font-bold text-accent">
              Node 0{activeNode.stepNumber}
            </span>
            <h3 className="font-serif text-lg text-text-primary">
              {activeNode.label} &bull; <span className="font-normal text-sm text-text-secondary">{activeNode.agentName}</span>
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-muted">Click any node above for instant inspection</span>
            {onOpenDecisionTrace && (
              <button
                onClick={() => onOpenDecisionTrace(scenarios[activeScenario].id)}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-accent hover:underline ml-2"
              >
                <span>Full Telemetry Trace</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 3 Columns: Real Input, Deterministic Rule / Agent Logic, CFO Plain English */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Column 1: Financial Input Payload */}
          <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle space-y-1.5">
            <span className="font-mono text-[10px] text-text-muted uppercase font-bold tracking-wider block">
              1. Ingested Payload &amp; Evidence
            </span>
            <div className="p-2 rounded bg-bg-subtle font-mono text-[11px] text-text-primary leading-relaxed">
              {activeNode.telemetry.input}
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {activeNode.summary}
            </p>
          </div>

          {/* Column 2: Deterministic Rule & Machine Output */}
          <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle space-y-1.5">
            <span className="font-mono text-[10px] text-text-muted uppercase font-bold tracking-wider block">
              2. Deterministic Code / Guardrail
            </span>
            <div className="p-2 rounded bg-bg-subtle font-mono text-[11px] text-accent font-semibold leading-relaxed">
              {activeNode.telemetry.deterministicRule}
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 text-text-secondary">
              <span>Machine Confidence:</span>
              <strong className="text-status-verified font-mono">{(activeNode.telemetry.confidence * 100).toFixed(0)}%</strong>
            </div>
          </div>

          {/* Column 3: Plain-English CFO Impact */}
          <div className="p-3.5 rounded-lg bg-bg-card border border-accent/20 bg-accent/[0.01] space-y-1.5">
            <span className="font-mono text-[10px] text-accent uppercase font-bold tracking-wider block">
              3. Controller &amp; Audit Safeguard
            </span>
            <p className="text-xs text-text-primary leading-relaxed">
              {activeNode.telemetry.cfoExplanation}
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px] text-text-muted">
              <span>Zero-hallucination guarantee</span>
              <span className="font-mono text-status-verified font-bold">SOX Compliant</span>
            </div>
          </div>

        </div>

      </div>

      {/* Selected Node Modal Dialog if User Clicked a Specific Node */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-border-subtle shadow-modal p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-accent-light text-accent text-xs font-mono font-bold">
                  Node 0{selectedNode.stepNumber}
                </span>
                <h3 className="font-serif text-xl text-text-primary">{selectedNode.label}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-md"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-text-muted uppercase text-[10px]">Assigned Agent / Engine:</span>
                <p className="font-medium text-text-primary text-sm mt-0.5">{selectedNode.agentName} ({selectedNode.role})</p>
              </div>

              <div>
                <span className="font-semibold text-text-muted uppercase text-[10px]">Summary of Operation:</span>
                <p className="text-text-secondary leading-relaxed mt-0.5">{selectedNode.summary}</p>
              </div>

              <div className="p-3 rounded-lg bg-bg-secondary border border-border-subtle space-y-2 font-mono text-[11px]">
                <div>
                  <span className="text-text-muted block">Deterministic Invariant:</span>
                  <span className="text-accent font-semibold">{selectedNode.telemetry.deterministicRule}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Output Artifact:</span>
                  <span className="text-text-primary">{selectedNode.telemetry.agentOutput}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-text-muted uppercase text-[10px]">Why This Protects Your Ledger:</span>
                <p className="text-text-secondary leading-relaxed mt-0.5">{selectedNode.telemetry.cfoExplanation}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-semibold text-text-secondary hover:bg-bg-subtle transition-colors"
              >
                Close Inspector
              </button>
              {onOpenDecisionTrace && (
                <button
                  onClick={() => {
                    const txId = scenarios[activeScenario].id;
                    setSelectedNode(null);
                    onOpenDecisionTrace(txId);
                  }}
                  className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-subtle"
                >
                  View Full Trace Telemetry &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
