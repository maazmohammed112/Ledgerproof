import pytest
from backend.app.agents.orchestrator import FinanceOrchestrator
from backend.app.data.store import FinanceDataStore
from backend.app.models.schemas import RiskTier, VerifierStatus, ResolutionAction


def test_judge_wow_moment_aws_disagreement():
    """
    Validates Section 29 Judge Wow Moment:
    Resolution Agent attempts to propose 'Office Supplies' for Amazon Web Services.
    Independent Verifier detects Vendor Master Contract and historical 48-period mapping 'Cloud Infrastructure'.
    Execution is BLOCKED (Tier D) and flagged as disagreement preventing misposting.
    """
    store = FinanceDataStore()
    orchestrator = FinanceOrchestrator(agent_version="V2")

    aws_tx = store.get_transaction("TX-EXC-003")
    assert aws_tx is not None

    res = orchestrator.process_transaction(aws_tx, store, force_disagreement=True)
    trace = res["trace"]
    verifier = trace.verifier
    autonomy = trace.autonomy_gate

    # Verifier must catch the disagreement and REJECT
    assert verifier.disagreement_detected is True
    assert verifier.status == VerifierStatus.REJECTED
    assert "Office Supplies" in verifier.disagreement_details
    assert "Cloud Infrastructure" in verifier.disagreement_details

    # Autonomy Gate must BLOCK execution
    assert autonomy.tier == RiskTier.TIER_D
    assert autonomy.is_blocked is True
    assert res["final_status"] == "BLOCKED"


def test_duplicate_invoice_blocked():
    store = FinanceDataStore()
    orchestrator = FinanceOrchestrator(agent_version="V2")

    dup_tx = store.get_transaction("TX-EXC-001")
    assert dup_tx is not None

    res = orchestrator.process_transaction(dup_tx, store)
    assert res["autonomy_result"].tier == RiskTier.TIER_D
    assert res["final_status"] == "BLOCKED"


def test_po_variance_escalated_to_human():
    store = FinanceDataStore()
    orchestrator = FinanceOrchestrator(agent_version="V2")

    po_var_tx = store.get_transaction("TX-EXC-002")
    assert po_var_tx is not None

    res = orchestrator.process_transaction(po_var_tx, store)
    # Exceeds 2% policy and is $103,000 (material) -> Tier C
    assert res["autonomy_result"].tier == RiskTier.TIER_C
    assert res["autonomy_result"].requires_human_approval is True
    assert res["final_status"] == "HUMAN_REVIEW_REQUIRED"
