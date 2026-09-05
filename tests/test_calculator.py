import pytest
from backend.app.core.calculator import calculate_variance, compute_duplicate_score, check_policy_threshold


def test_variance_calculation():
    # Exactly $103,000 vs $100,000 baseline
    diff, pct = calculate_variance(103000.0, 100000.0)
    assert diff == 3000.0
    assert pct == 3.0


def test_variance_zero_baseline():
    diff, pct = calculate_variance(500.0, 0.0)
    assert diff == 500.0
    assert pct == 100.0


def test_duplicate_score_exact_match():
    inv_a = {
        "id": "INV-1",
        "vendor": "Starlight Logistics",
        "amount": 14500.0,
        "po_number": "PO-9002",
        "service_period": "2026-08-01 to 2026-08-31",
        "invoice_number": "INV-STR-4401",
    }
    inv_b = {
        "id": "INV-2",
        "vendor": "Starlight Logistics",
        "amount": 14500.0,
        "po_number": "PO-9002",
        "service_period": "2026-08-01 to 2026-08-31",
        "invoice_number": "INV-STR-4401-A",
    }
    score, reasons = compute_duplicate_score(inv_a, inv_b)
    # Identical vendor (0.35) + identical amount (0.35) + identical PO (0.15) + period (0.10) = 0.95
    assert score >= 0.85
    assert "Identical vendor" in reasons
    assert "Identical amount" in reasons


def test_policy_threshold():
    assert check_policy_threshold(1.8, 2.0) is True
    assert check_policy_threshold(2.0, 2.0) is True
    assert check_policy_threshold(2.1, 2.0) is False
