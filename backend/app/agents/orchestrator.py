"""
Agent 1 — Finance Orchestrator
Master coordinator for month-end close and reconciliation objectives.
Sequences: Investigation -> Resolution -> Independent Verification -> Autonomy Gate -> Execution / Review -> Audit Trail.
"""

from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone

from ..models.schemas import (
    Transaction,
    MatchStatus,
    RiskTier,
    DecisionTrace,
    AuditRecord,
    HumanDecisionStatus,
    ToolCallRecord,
)
from .investigation import InvestigationAgent
from .resolution import ResolutionAgent
from .verifier import IndependentVerifierAgent
from ..core.risk_gate import AutonomyGateEngine


class FinanceOrchestrator:
    """
    Coordinates the autonomous month-end close workflow, ensures strict agent handoffs,
    and guarantees audit logging of all decisions.
    """

    def __init__(self, agent_version: str = "V2"):
        self.version = agent_version
        self.investigator = InvestigationAgent(version=agent_version)
        self.resolver = ResolutionAgent(version=agent_version)
        self.verifier = IndependentVerifierAgent(version=agent_version)

    def process_transaction(
        self,
        tx: Dict[str, Any],
        store: Any,
        force_disagreement: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes the full LedgerProof pipeline for a single transaction or exception.
        """
        trace_id = f"TRC-{uuid.uuid4().hex[:8].upper()}"
        all_tool_calls: List[ToolCallRecord] = []

        # 1. Investigation Phase
        investigation_result, inv_tools = self.investigator.investigate(tx, store)
        all_tool_calls.extend(inv_tools)

        # 2. Resolution Phase
        resolution_result, res_tools = self.resolver.resolve(
            tx,
            investigation_result,
            store,
            force_wow_disagreement=force_disagreement,
        )
        all_tool_calls.extend(res_tools)

        # 3. Independent Verification Phase
        verifier_result, ver_tools = self.verifier.verify(
            tx,
            investigation_result,
            resolution_result,
            store,
        )
        all_tool_calls.extend(ver_tools)

        # 4. Deterministic Autonomy Gate
        amount = float(tx.get("amount", 0.0))
        is_dup = (investigation_result.recommended_action.value == "MARK_DUPLICATE")
        dup_score = 0.95 if is_dup else 0.0
        policy_compliant = verifier_result.policy_compliant
        has_complete_evidence = len(investigation_result.missing_evidence) == 0
        has_disagreement = verifier_result.disagreement_detected

        autonomy_result = AutonomyGateEngine.evaluate(
            amount=amount,
            confidence=resolution_result.confidence,
            verifier_status=verifier_result.status,
            proposed_action=resolution_result.proposed_action,
            is_duplicate=is_dup,
            duplicate_score=dup_score,
            policy_compliant=policy_compliant,
            has_complete_evidence=has_complete_evidence,
            has_disagreement=has_disagreement,
            policy_permits_variance=(resolution_result.calculated_variance_pct is not None and resolution_result.calculated_variance_pct <= 2.0),
        )

        # 5. Execution / Escalation State
        final_status = "PENDING"
        if autonomy_result.is_blocked:
            final_status = "BLOCKED"
        elif autonomy_result.can_auto_execute:
            final_status = "AUTO_RECONCILED"
        elif autonomy_result.requires_human_approval:
            final_status = "HUMAN_REVIEW_REQUIRED"

        # 6. Assemble Trace
        decision_trace = DecisionTrace(
            trace_id=trace_id,
            transaction_id=tx.get("id", "TX-UNKNOWN"),
            timestamp=datetime.now(timezone.utc),
            investigation=investigation_result,
            resolution=resolution_result,
            verifier=verifier_result,
            autonomy_gate=autonomy_result,
            final_status=final_status,
            all_tool_calls=all_tool_calls,
        )

        # 7. Create Audit Vault Record
        audit_record = AuditRecord(
            decision_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            trace_id=trace_id,
            timestamp=datetime.now(timezone.utc),
            transaction_id=tx.get("id", "TX-UNKNOWN"),
            vendor=tx.get("vendor", "Unknown Vendor"),
            amount=amount,
            agent_name="LedgerProof Core Ensemble",
            agent_version=self.version,
            model="gemini-1.5-pro / structured-ensemble",
            tools_used=[t.tool_name for t in all_tool_calls],
            evidence_ids=[e.id for e in investigation_result.evidence_gathered],
            policy_ids=["POL-VAR-001", "POL-DUP-001", "POL-MAT-001", "POL-GL-001"],
            proposed_action=resolution_result.proposed_action.value,
            verifier_status=verifier_result.status,
            confidence=resolution_result.confidence,
            risk_level="HIGH" if autonomy_result.tier in (RiskTier.TIER_C, RiskTier.TIER_D) else "LOW",
            autonomy_tier=autonomy_result.tier,
            human_required=autonomy_result.requires_human_approval,
            human_decision=HumanDecisionStatus.PENDING if autonomy_result.requires_human_approval else HumanDecisionStatus.APPROVED,
            final_action=final_status,
            ledger_impact_summary=f"Action: {final_status} | Account: {resolution_result.target_account or tx.get('gl_account')}",
        )

        return {
            "trace": decision_trace,
            "audit_record": audit_record,
            "autonomy_result": autonomy_result,
            "final_status": final_status,
        }
