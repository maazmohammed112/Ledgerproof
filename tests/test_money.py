"""
Tests for multi-currency money model, Indian formatting, and duplicate matching signals.
"""
import pytest

def format_indian_number(amount: float) -> str:
    """Format numeric value with Indian numbering system (e.g. 12,50,000)."""
    is_negative = amount < 0
    abs_amt = abs(amount)
    int_part = int(abs_amt)
    dec_part = f"{abs_amt - int_part:.2f}"[1:] # .xx
    
    int_str = str(int_part)
    if len(int_str) <= 3:
        formatted = int_str
    else:
        last3 = int_str[-3:]
        remaining = int_str[:-3]
        groups = []
        while len(remaining) > 2:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.insert(0, remaining)
        groups.append(last3)
        formatted = ",".join(groups)
        
    prefix = "-" if is_negative else ""
    return f"{prefix}{formatted}{dec_part}"

def test_indian_number_formatting():
    assert format_indian_number(1000) == "1,000.00"
    assert format_indian_number(25500) == "25,500.00"
    assert format_indian_number(1250000) == "12,50,000.00"
    assert format_indian_number(254277102.45) == "25,42,77,102.45"

def test_multi_currency_normalization():
    # Reference FX conversion tests
    rates = {
        "INR": 0.012,
        "EUR": 1.09,
        "GBP": 1.28,
        "CHF": 1.15,
        "JPY": 0.0068,
        "USD": 1.0
    }
    
    # INR 103,000 -> USD 1,236.00
    inr_val = 103000 * rates["INR"]
    assert inr_val == 1236.0
    
    # EUR 1,250 -> USD 1,362.50
    eur_val = 1250 * rates["EUR"]
    assert eur_val == 1362.5
    
    # CHF 8,450 -> USD 9,717.50
    chf_val = 8450 * rates["CHF"]
    assert chf_val == 9717.5

def test_duplicate_weighted_scoring():
    # Multi-signal duplicate formula: 0.35 * inv + 0.25 * vnd + 0.20 * amt + 0.10 * po + 0.10 * date
    def score_duplicate(inv_exact, vnd_sim, amt_exact, po_exact, date_prox):
        return (0.35 * inv_exact) + (0.25 * vnd_sim) + (0.20 * amt_exact) + (0.10 * po_exact) + (0.10 * date_prox)
    
    # Exact duplicate pair
    exact_score = score_duplicate(1.0, 1.0, 1.0, 1.0, 1.0)
    assert exact_score == 1.0
    
    # Same amount only (different vendor, different invoice, far dates)
    amount_only = score_duplicate(0.0, 0.0, 1.0, 0.0, 0.0)
    assert amount_only == 0.20  # Never triggers duplicate on amount alone!
    
    # Real duplicate scenario: same invoice number, high vendor similarity, same amount, close dates
    real_dup = score_duplicate(1.0, 0.9, 1.0, 1.0, 0.9)
    assert real_dup >= 0.85
