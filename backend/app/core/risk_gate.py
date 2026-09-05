"""
Deterministic Autonomy Gate (Tiers A-D)
Principle: AI reasons. Code calculates. Humans judge exceptional risk.
Enforces non-negotiable risk boundaries before any ledger write.
"""

from typing import Dict, Any, List
from ..models.schemas import (
    RiskTier,
    VerifierStatus,
    ResolutionAction,
    AutonomyGateResult,
)


class AutonomyGateEngine:
    """
    Deterministic gatekeeper that maps verification results, confidence, materiality,
    and policy compliance into strict risk tiers.
    """

    LOW_MATERIALITY_THRESHOLD = 2500.00
    MATERIAL_THRESHOLD = 10000.00

    @classmethod
    def evaluate(
        cls,
        amount: float,
        confidence: float,
        verifier_status: VerifierStatus,
        proposed_action: ResolutionAction,
        is_duplicate: bool,
        duplicate_score: float,
        policy_compliant: bool,
        has_complete_evidence: bool,
        has_disagreement: bool,
        policy_permits_variance: bool = False,
    ) -> AutonomyGateResult:
        deterministic_checks = {
            "amount": amount,
            "confidence": confidence,
            "verifier_status": verifier_status.value,
            "proposed_action": proposed_action.value,
            "is_duplicate": is_duplicate,
            "duplicate_score": duplicate_score,
            "policy_compliant": policy_compliant,
            "has_complete_evidence": has_complete_evidence,
            "has_disagreement": has_disagreement,
            "policy_permits_variance": policy_permits_variance,
        }

        # 1. Tier D - HARD BLOCK
        if verifier_status == VerifierStatus.REJECTED:
            return AutonomyGateResult(
                tier=RiskTier.TIER_D,
                reason="Independent Verifier rejected the proposed resolution. Action blocked.",
                can_auto_execute=False,
                requires_human_approval=False,
                is_blocked=True,
                deterministic_checks=deterministic_checks,
            )

        if has_disagreement:
            return AutonomyGateResult(
                tier=RiskTier.TIER_D,
                reason="Disagreement between Resolution Agent and Verifier detected. Action blocked to prevent misposting.",
                can_auto_execute=False,
                requires_human_approval=False,
                is_blocked=True,
                deterministic_checks=deterministic_checks,
            )

        if is_duplicate or duplicate_score >= 0.85:
            return AutonomyGateResult(
                tier=RiskTier.TIER_D,
                reason=f"Probable duplicate invoice detected (score {duplicate_score:.2f}). Posting blocked.",
                can_auto_execute=False,
                requires_human_approval=False,
                is_blocked=True,
                deterministic_checks=deterministic_checks,
            )

        if not policy_compliant and proposed_action == ResolutionAction.APPROVE_VARIANCE:
            return AutonomyGateResult(
                tier=RiskTier.TIER_D,
                reason="Policy violation: Requested variance exceeds permissible threshold. Direct auto-approval blocked.",
                can_auto_execute=False,
                requires_human_approval=True,  # May escalate to human review
                is_blocked=True,
                deterministic_checks=deterministic_checks,
            )

        # 2. Tier C - HUMAN REVIEW REQUIRED
        if verifier_status in (VerifierStatus.HUMAN_REVIEW_REQUIRED, VerifierStatus.INSUFFICIENT_EVIDENCE):
            return AutonomyGateResult(
                tier=RiskTier.TIER_C,
                reason="Verifier marked resolution as requiring human review or having insufficient evidence.",
                can_auto_execute=False,
                requires_human_approval=True,
                is_blocked=False,
                deterministic_checks=deterministic_checks,
            )

        if amount >= cls.MATERIAL_THRESHOLD:
            return AutonomyGateResult(
                tier=RiskTier.TIER_C,
                reason=f"Materiality threshold exceeded (${amount:,.2f} >= ${cls.MATERIAL_THRESHOLD:,.2f}). Human sign-off mandatory.",
                can_auto_execute=False,
                requires_human_approval=True,
                is_blocked=False,
                deterministic_checks=deterministic_checks,
            )

        if not has_complete_evidence:
            return AutonomyGateResult(
                tier=RiskTier.TIER_C,
                reason="Incomplete supporting documentation. Escalated to human controller.",
                can_auto_execute=False,
                requires_human_approval=True,
                is_blocked=False,
                deterministic_checks=deterministic_checks,
            )

        if confidence < 0.85:
            return AutonomyGateResult(
                tier=RiskTier.TIER_C,
                reason=f"Agent confidence ({confidence:.2f}) below autonomous execution threshold (0.85). Human review required.",
                can_auto_execute=False,
                requires_human_approval=True,
                is_blocked=False,
                deterministic_checks=deterministic_checks,
            )

        if proposed_action in (ResolutionAction.ESCALATE_POLICY, ResolutionAction.REQUEST_EVIDENCE):
            return AutonomyGateResult(
                tier=RiskTier.TIER_C,
                reason="Action requires human accounting intervention or vendor outreach.",
                can_auto_execute=False,
                requires_human_approval=True,
                is_blocked=False,
                deterministic_checks=deterministic_checks,
            )

        # 3. Tier B - CONDITIONAL EXECUTION
        if amount <= cls.MATERIAL_THRESHOLD and policy_permits_variance and verifier_status == VerifierStatus.VERIFIED:
            return AutonomyGateResult(
                tier=RiskTier.TIER_B,
                reason=f"Moderate financial impact (${amount:,.2f}) with explicit policy allowance and passed verification.",
                can_auto_execute=True,
                requires_human_approval=False,
                is_blocked=False,
                deterministic_checks=deterministic_checks,
            )

        # 4. Tier A - AUTO EXECUTE
        if (
            amount < cls.LOW_MATERIALITY_THRESHOLD
            and confidence >= 0.90
            and verifier_status == VerifierStatus.VERIFIED
            and policy_compliant
            and has_complete_evidence
        ):
            return AutonomyGateResult(
                tier=RiskTier.TIER_A,
                reason="High confidence, verified arithmetic & policy, complete evidence, immaterial balance. Auto-executed.",
                can_auto_execute=True,
                requires_human_approval=False,
                is_blocked=False,
                deterministic_checks=deterministic_checks,
            )

        # Fallback to Tier C for any edge case
        return AutonomyGateResult(
            tier=RiskTier.TIER_C,
            reason="Prudent fallback: Exception does not meet all Tier A/B criteria. Routed to human review.",
            can_auto_execute=False,
            requires_human_approval=True,
            is_blocked=False,
            deterministic_checks=deterministic_checks,
        )
