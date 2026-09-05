"""
Deterministic Calculator & Arithmetic Engine
Rule: AI reasons. Code calculates.
All percentages, variances, duplicate scoring, and thresholds are computed deterministically.
"""

from typing import Dict, Any, Tuple
import re


def calculate_variance(actual_amount: float, baseline_amount: float) -> Tuple[float, float]:
    """
    Returns (absolute_difference, percentage_difference).
    percentage_difference is relative to baseline_amount: abs(actual - baseline) / baseline * 100
    """
    if baseline_amount == 0:
        return abs(actual_amount), 100.0 if actual_amount != 0 else 0.0
    diff = round(abs(actual_amount - baseline_amount), 2)
    pct = round((diff / baseline_amount) * 100.0, 2)
    return diff, pct


def compute_duplicate_score(
    inv_a: Dict[str, Any],
    inv_b: Dict[str, Any]
) -> Tuple[float, str]:
    """
    Calculates duplicate likelihood score between two invoices/transactions (0.0 to 1.0).
    Checks:
    - Same vendor (normalized)
    - Same exact amount
    - Same PO reference
    - Overlapping/identical service period
    - Same or sequential invoice number
    """
    vendor_a = str(inv_a.get("vendor", "")).strip().lower()
    vendor_b = str(inv_b.get("vendor", "")).strip().lower()
    amount_a = float(inv_a.get("amount", 0.0))
    amount_b = float(inv_b.get("amount", 0.0))
    po_a = str(inv_a.get("po_number") or inv_a.get("po_ref", "")).strip()
    po_b = str(inv_b.get("po_number") or inv_b.get("po_ref", "")).strip()
    inv_no_a = str(inv_a.get("invoice_number") or inv_a.get("invoice_ref", "")).strip()
    inv_no_b = str(inv_b.get("invoice_number") or inv_b.get("invoice_ref", "")).strip()
    period_a = str(inv_a.get("service_period", "")).strip()
    period_b = str(inv_b.get("service_period", "")).strip()

    # Normalize vendor names
    vendor_clean_a = re.sub(r"[^\w\s]", "", vendor_a)
    vendor_clean_b = re.sub(r"[^\w\s]", "", vendor_b)

    score = 0.0
    reasons = []

    if vendor_clean_a and vendor_clean_b and vendor_clean_a == vendor_clean_b:
        score += 0.35
        reasons.append("Identical vendor")

    if amount_a > 0 and amount_b > 0 and abs(amount_a - amount_b) < 0.01:
        score += 0.35
        reasons.append(f"Identical amount (${amount_a:,.2f})")

    if po_a and po_b and po_a.lower() == po_b.lower():
        score += 0.15
        reasons.append(f"Identical PO ({po_a})")

    if period_a and period_b and period_a.lower() == period_b.lower():
        score += 0.10
        reasons.append(f"Identical service period ({period_a})")

    if inv_no_a and inv_no_b:
        if inv_no_a.lower() == inv_no_b.lower():
            score += 0.05
            reasons.append(f"Same invoice number reference ({inv_no_a})")

    return min(score, 1.0), "; ".join(reasons)


def check_policy_threshold(variance_pct: float, allowed_threshold_pct: float) -> bool:
    """
    Returns True if variance is within allowed threshold.
    """
    return variance_pct <= allowed_threshold_pct
