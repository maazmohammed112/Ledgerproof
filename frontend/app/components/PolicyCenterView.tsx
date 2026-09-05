'use client';

import React, { useState } from 'react';
import { 
  ScrollText, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  AlertTriangle, 
  Lock, 
  TrendingUp, 
  History,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { Policy, PolicyProposal } from '../lib/types';
import { store } from '../lib/store';

export const PolicyCenterView: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>(store.getPolicies());
  const [proposals, setProposals] = useState<PolicyProposal[]>(store.getProposals());
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleApproveProposal = (proposalId: string) => {
    store.approveProposal(proposalId);
    setPolicies([...store.getPolicies()]);
    setProposals([...store.getProposals()]);
    setFeedbackMessage("Policy Proposal Approved: CloudWorks variance tolerance updated to <= 5.0% in active policy engine.");
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleRejectProposal = (proposalId: string) => {
    store.rejectProposal(proposalId);
    setProposals([...store.getProposals()]);
    setFeedbackMessage("Policy Proposal Rejected. Standard 2.0% tolerance remains in effect.");
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Deterministic Governance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
            Policy Center
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5 max-w-2xl">
            Statutory financial control policies enforced by the Autonomy Gate. Agents operate strictly within these bounds.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-lg bg-status-verifiedBg border border-status-verifiedBorder text-status-verified text-xs font-medium flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Human-Controlled Policy Learning Proposal */}
      <div className="bg-bg-secondary p-6 rounded-xl border border-border-subtle shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border-subtle gap-2">
          <div className="flex items-center space-x-2.5">
            <ScrollText className="w-5 h-5 text-accent" />
            <div>
              <span className="text-[11px] font-semibold text-accent uppercase tracking-wider block">
                Continuous Policy Optimization
              </span>
              <h2 className="font-serif text-xl text-text-primary mt-0.5">
                Policy Improvement Proposal
              </h2>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-bg-card border border-border-subtle text-text-secondary self-start sm:self-auto">
            Requires Controller Approval
          </span>
        </div>

        {proposals.map((prop) => (
          <div key={prop.proposal_id} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-bg-card border border-border-subtle text-xs">
                <span className="text-text-muted block text-[11px] font-semibold">CURRENT ACTIVE RULE</span>
                <span className="font-semibold text-text-primary mt-1 block font-mono">{prop.current_rule}</span>
              </div>

              <div className="p-4 rounded-lg bg-status-verifiedBg/40 border border-status-verifiedBorder text-xs">
                <span className="text-status-verified block text-[11px] font-bold">SUGGESTED OPTIMIZED RULE</span>
                <span className="font-semibold text-text-primary mt-1 block font-mono">{prop.suggested_rule}</span>
              </div>
            </div>

            <div className="text-xs text-text-secondary leading-relaxed bg-bg-card p-4 rounded-lg border border-border-subtle">
              <span className="font-semibold text-text-primary block mb-1">Empirical Justification:</span>
              {prop.reasoning}
            </div>

            {/* Historical Evidence Cases */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Observed Controller Approvals (Audit Evidence):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {prop.supporting_evidence.map((evd, i) => (
                  <div key={i} className="p-2.5 rounded-md bg-bg-card border border-border-subtle text-[11px] font-mono text-text-secondary">
                    {evd}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-xs text-status-verified font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>Projected routine review workload reduced by {prop.projected_manual_reviews_reduced_pct}%</span>
              </div>

              {prop.status === 'PENDING_HUMAN_APPROVAL' ? (
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleRejectProposal(prop.proposal_id)}
                    className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-status-blocked bg-status-blockedBg hover:bg-red-100 transition-colors border border-status-blockedBorder"
                  >
                    Reject Proposal
                  </button>

                  <button
                    onClick={() => handleApproveProposal(prop.proposal_id)}
                    className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-all shadow-subtle"
                  >
                    Approve Policy Change
                  </button>
                </div>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-status-verifiedBg text-status-verified border border-status-verifiedBorder">
                  {prop.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Policies List */}
      <div className="bg-bg-secondary p-6 rounded-xl border border-border-subtle shadow-subtle space-y-5">
        <div>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Operational Guardrails</span>
          <h3 className="font-serif text-2xl text-text-primary mt-0.5">Active Close Policies</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((pol) => (
            <div
              key={pol.id}
              className="p-4 rounded-lg bg-bg-card border border-border-subtle text-xs space-y-2.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="font-mono text-text-muted font-semibold">{pol.id} (v{pol.version})</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-status-verifiedBg text-status-verified border border-status-verifiedBorder">
                  ACTIVE
                </span>
              </div>

              <h4 className="font-medium text-base text-text-primary">{pol.name}</h4>
              <p className="text-text-secondary leading-relaxed">{pol.description}</p>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-text-muted font-tabular">
                <span>Rule: <span className="font-mono text-text-primary font-medium">{pol.rule_expression}</span></span>
                <span>Threshold: <span className="font-bold text-text-primary">{pol.threshold_value}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
