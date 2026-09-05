import pytest
from backend.app.core.risk_gate import AutonomyGateEngine
from backend.app.models.schemas import RiskTier, VerifierStatus, ResolutionAction


def test_risk_gate_tier_a():
    # Low amount, high confidence, verified, complete evidence
    res = AutonomyGateEngine.evaluate(
        amount=1250.0,
        confidence=0.95,
        verifier_status=VerifierStatus.VERIFIED,
        proposed_action=ResolutionAction.AUTO_MATCH,
        is_duplicate=False,
        duplicate_score=0.0,
        policy_compliant=True,
        has_complete_evidence=True,
        has_disagreement=False,
    )
    assert res.tier == RiskTier.TIER_A
    assert res.can_auto_execute is True
    assert res.is_blocked is False


def test_risk_gate_tier_c_materiality():
    # High amount (>= $10,000) forces Tier C
    res = AutonomyGateEngine.evaluate(
        amount=103000.0,
        confidence=0.95,
        verifier_status=VerifierStatus.VERIFIED,
        proposed_action=ResolutionAction.APPROVE_VARIANCE,
        is_duplicate=False,
        duplicate_score=0.0,
        policy_compliant=True,
        has_complete_evidence=True,
        has_disagreement=False,
    )
    assert res.tier == RiskTier.TIER_C
    assert res.requires_human_approval is True
    assert res.can_auto_execute is False


def test_risk_gate_tier_d_disagreement():
    # Disagreement blocks execution
    res = AutonomyGateEngine.evaluate(
        amount=8420.0,
        confidence=0.90,
        verifier_status=VerifierStatus.REJECTED,
        proposed_action=ResolutionAction.CORRECT_GL,
        is_duplicate=False,
        duplicate_score=0.0,
        policy_compliant=False,
        has_complete_evidence=True,
        has_disagreement=True,
    )
    assert res.tier == RiskTier.TIER_D
    assert res.is_blocked is True
    assert res.can_auto_execute is False


def test_risk_gate_tier_d_duplicate():
    # Duplicate score >= 0.85 forces hard block
    res = AutonomyGateEngine.evaluate(
        amount=14500.0,
        confidence=0.98,
        verifier_status=VerifierStatus.VERIFIED,
        proposed_action=ResolutionAction.MARK_DUPLICATE,
        is_duplicate=True,
        duplicate_score=0.95,
        policy_compliant=True,
        has_complete_evidence=True,
        has_disagreement=False,
    )
    assert res.tier == RiskTier.TIER_D
    assert res.is_blocked is True
