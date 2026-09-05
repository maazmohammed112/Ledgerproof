import pytest
from backend.app.evals.engine import EvaluationEngine


def test_eval_engine_comparison():
    engine = EvaluationEngine()
    rep_v1 = engine.run_benchmark("V1")
    rep_v2 = engine.run_benchmark("V2")

    # Honest measured numbers
    assert rep_v1.total_cases == 40
    assert rep_v2.total_cases == 40

    # V1 has failures due to naive heuristics (e.g. 7 failures)
    assert rep_v1.passed_cases < rep_v2.passed_cases
    assert rep_v1.accuracy < rep_v2.accuracy

    # V2 has 0 false auto-approvals thanks to Independent Verifier
    assert rep_v2.false_auto_approval_rate == 0.0
    assert rep_v1.false_auto_approval_rate > 0.0

    # Failure taxonomy is properly recorded for V1
    assert rep_v1.failure_breakdown["reasoning_failure"] > 0
    assert rep_v1.failure_breakdown["retrieval_failure"] > 0
