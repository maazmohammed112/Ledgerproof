"""
Agent Lab - 40 Ground-Truth Benchmark Evaluation Cases
Used to objectively evaluate and compare Agent V1 vs Agent V2 across:
- Duplicate Invoice Detection
- PO Variance Resolution
- GL Account Classification
- Missing Document Accruals
- Unsupported / High-Risk Vendors
- Foreign Currency & Bank Tolerance
"""

from typing import List, Dict, Any
from ..models.schemas import (
    ExceptionCategory,
    ResolutionAction,
    RiskTier,
    VerifierStatus,
)


def get_ground_truth_cases() -> List[Dict[str, Any]]:
    cases = []

    # Category 1: Duplicate Invoices (8 cases)
    for i in range(1, 9):
        is_exact = (i <= 5)
        cases.append({
            "id": f"EVAL-DUP-{i:03d}",
            "name": f"Duplicate Invoice Case {i}",
            "category": ExceptionCategory.DUPLICATE_INVOICE.value,
            "description": f"Vendor submitted invoice identical in amount and PO to prior billing cycle (Variation {i}).",
            "transaction_data": {
                "id": f"TX-TEST-DUP-{i}",
                "vendor": "Starlight Logistics" if i % 2 == 0 else "Apex Freight Partners",
                "amount": 14500.0 if is_exact else 14500.0 + (i * 10),
                "gl_account": "6300 - Freight & Shipping",
                "invoice_ref": f"INV-DUP-TEST-{i}",
                "po_ref": "PO-9002",
                "type": "DEBIT",
            },
            "supporting_docs": {
                "prior_invoice_id": "INV-STR-4401",
                "prior_cleared_date": "2026-09-02",
                "similarity_score": 0.98 if is_exact else 0.82,
            },
            "ground_truth_action": ResolutionAction.MARK_DUPLICATE.value,
            "ground_truth_tier": RiskTier.TIER_D.value,
            "expected_verifier_status": VerifierStatus.VERIFIED.value if is_exact else VerifierStatus.HUMAN_REVIEW_REQUIRED.value,
            "failure_in_v1_reason": "V1 heuristic failed to catch non-exact sequential invoice suffix and marked as fresh charge" if not is_exact else None,
        })

    # Category 2: PO Variance Calculations (8 cases)
    for i in range(1, 9):
        pct = 1.0 + (i * 0.5)  # 1.5%, 2.0%, 2.5%, 3.0%, 3.5%, 4.0%, 4.5%, 5.0%
        base = 100000.0
        actual = base * (1.0 + (pct / 100.0))
        is_within_policy = (pct <= 2.0)
        cases.append({
            "id": f"EVAL-VAR-{i:03d}",
            "name": f"PO Variance {pct}% ({'$' + f'{actual:,.2f}'})",
            "category": ExceptionCategory.PO_VARIANCE.value,
            "description": f"Vendor billed ${actual:,.2f} against approved PO of $100,000.00 ({pct}% variance).",
            "transaction_data": {
                "id": f"TX-TEST-VAR-{i}",
                "vendor": "Apex Consulting Group",
                "amount": actual,
                "gl_account": "6120 - Professional Services & Legal",
                "invoice_ref": f"INV-VAR-TEST-{i}",
                "po_ref": "PO-9001",
                "type": "DEBIT",
            },
            "supporting_docs": {
                "po_amount": base,
                "variance_pct": pct,
                "policy_limit_pct": 2.0,
            },
            "ground_truth_action": ResolutionAction.APPROVE_VARIANCE.value if is_within_policy else ResolutionAction.ESCALATE_POLICY.value,
            "ground_truth_tier": RiskTier.TIER_A.value if is_within_policy else RiskTier.TIER_C.value,
            "expected_verifier_status": VerifierStatus.VERIFIED.value if is_within_policy else VerifierStatus.HUMAN_REVIEW_REQUIRED.value,
            "failure_in_v1_reason": "V1 prompt allowed 3% without checking POL-VAR-001 ceiling of 2%" if (pct > 2.0 and pct <= 3.0) else None,
        })

    # Category 3: GL Misclassification & Catching Bad Postings (8 cases)
    gl_tests = [
        ("Amazon Web Services", 8420.0, "Office Supplies", "6010 - Cloud Infrastructure & Hosting", True),
        ("CloudWorks Infrastructure", 15200.0, "Consulting", "6015 - Cloud Infrastructure & Hosting", True),
        ("Figma Inc", 1800.0, "Advertising", "6020 - Software & SaaS Subscriptions", True),
        ("Datadog", 4200.0, "Hardware Asset", "6020 - Software & SaaS Subscriptions", True),
        ("Google Cloud Platform", 6300.0, "Legal Fees", "6010 - Cloud Infrastructure & Hosting", True),
        ("WeWork Spaces", 12800.0, "Software Subscription", "6200 - Rent & Facilities", True),
        ("Comcast Business", 650.0, "Office Supplies", "6210 - Utilities & Internet", False),
        ("Pacific Gas & Electric", 2140.0, "Travel", "6210 - Utilities & Internet", False),
    ]
    for i, (v, amt, wrong_gl, correct_gl, is_v1_failure) in enumerate(gl_tests, 1):
        cases.append({
            "id": f"EVAL-GL-{i:03d}",
            "name": f"GL Misclassification: {v}",
            "category": ExceptionCategory.GL_MISCLASSIFICATION.value,
            "description": f"Vendor {v} transaction submitted as '{wrong_gl}', correct mapping is '{correct_gl}'.",
            "transaction_data": {
                "id": f"TX-TEST-GL-{i}",
                "vendor": v,
                "amount": amt,
                "gl_account": wrong_gl,
                "invoice_ref": f"INV-GL-{i}",
                "type": "DEBIT",
            },
            "supporting_docs": {
                "vendor_master_gl": correct_gl,
                "proposed_wrong_gl": wrong_gl,
            },
            "ground_truth_action": ResolutionAction.CORRECT_GL.value,
            "ground_truth_tier": RiskTier.TIER_D.value if "Office Supplies" in wrong_gl and "AWS" in v else RiskTier.TIER_C.value,
            "ground_truth_account": correct_gl,
            "expected_verifier_status": VerifierStatus.REJECTED.value,  # Verifier must catch the wrong proposed GL
            "failure_in_v1_reason": "V1 accepted naive keyword mapping from transaction memo instead of cross-referencing vendor master agreement" if is_v1_failure else None,
        })

    # Category 4: Missing Invoices / Accruals (6 cases)
    accrual_vendors = [
        ("Datadog Operations", 4200.0, "6020 - Software & SaaS Subscriptions"),
        ("Slack Technologies", 980.0, "6020 - Software & SaaS Subscriptions"),
        ("GitHub Enterprise", 840.0, "6020 - Software & SaaS Subscriptions"),
        ("Zoom Video", 450.0, "6020 - Software & SaaS Subscriptions"),
        ("Notion Labs", 600.0, "6020 - Software & SaaS Subscriptions"),
        ("Snowflake Data", 5500.0, "6010 - Cloud Infrastructure & Hosting"),
    ]
    for i, (v, amt, gl) in enumerate(accrual_vendors, 1):
        cases.append({
            "id": f"EVAL-ACC-{i:03d}",
            "name": f"Missing Invoice Accrual: {v}",
            "category": ExceptionCategory.MISSING_DOCUMENT.value,
            "description": f"Recurring monthly vendor {v} active contract on file, but billing document missing at cut-off.",
            "transaction_data": {
                "id": f"TX-TEST-ACC-{i}",
                "vendor": v,
                "amount": amt,
                "gl_account": gl,
                "invoice_ref": None,
                "type": "DEBIT",
            },
            "supporting_docs": {
                "contract_status": "ACTIVE_VERIFIED",
                "monthly_baseline": amt,
            },
            "ground_truth_action": ResolutionAction.CREATE_ACCRUAL.value,
            "ground_truth_tier": RiskTier.TIER_C.value,
            "expected_verifier_status": VerifierStatus.VERIFIED.value,
            "failure_in_v1_reason": "V1 blocked transaction instead of recognizing contract allows automated accrual entry" if i == 6 else None,
        })

    # Category 5: Unsupported / Suspicious Vendors (5 cases)
    unsupported_tests = [
        ("Unknown Global Ventures", 18500.0, "No tax ID or vendor contract"),
        ("Shadow IT Software Ltd", 2400.0, "Unapproved employee credit card tool"),
        ("Offshore Cyber Ops", 15000.0, "Sanction list screening match"),
        ("Generic Hardware Reseller", 4300.0, "Inactive vendor account"),
        ("Rapid Growth Media", 12000.0, "No signed master service agreement"),
    ]
    for i, (v, amt, desc) in enumerate(unsupported_tests, 1):
        cases.append({
            "id": f"EVAL-UNK-{i:03d}",
            "name": f"Unsupported Vendor: {v}",
            "category": ExceptionCategory.UNSUPPORTED_VENDOR.value,
            "description": f"Transaction from {v} (${amt:,.2f}). Risk: {desc}.",
            "transaction_data": {
                "id": f"TX-TEST-UNK-{i}",
                "vendor": v,
                "amount": amt,
                "gl_account": "9999 - Suspense Clearing",
                "invoice_ref": f"INV-UNK-{i}",
                "type": "DEBIT",
            },
            "supporting_docs": {
                "vendor_status": "UNVERIFIED_NEW_VENDOR",
                "risk_reason": desc,
            },
            "ground_truth_action": ResolutionAction.ESCALATE_POLICY.value,
            "ground_truth_tier": RiskTier.TIER_C.value,
            "expected_verifier_status": VerifierStatus.HUMAN_REVIEW_REQUIRED.value,
            "failure_in_v1_reason": "V1 attempted auto-clearance because amount was under temporary threshold" if i == 2 else None,
        })

    # Category 6: FX / Currency & Missing Receipts (5 cases)
    misc_tests = [
        ("Tokyo Hardware Ltd", 14210.0, ExceptionCategory.FX_VARIANCE, ResolutionAction.ESCALATE_POLICY, RiskTier.TIER_C),
        ("London Telemetry Ltd", 4800.0, ExceptionCategory.FX_VARIANCE, ResolutionAction.ESCALATE_POLICY, RiskTier.TIER_C),
        ("Delta Air Lines", 1250.0, ExceptionCategory.MISSING_RECEIPT, ResolutionAction.REQUEST_EVIDENCE, RiskTier.TIER_C),
        ("Uber For Business", 185.0, ExceptionCategory.MISSING_RECEIPT, ResolutionAction.REQUEST_EVIDENCE, RiskTier.TIER_C),
        ("Hyatt Regency San Francisco", 890.0, ExceptionCategory.MISSING_RECEIPT, ResolutionAction.REQUEST_EVIDENCE, RiskTier.TIER_C),
    ]
    for i, (v, amt, cat, act, tier) in enumerate(misc_tests, 1):
        cases.append({
            "id": f"EVAL-MSC-{i:03d}",
            "name": f"{cat.value}: {v}",
            "category": cat.value,
            "description": f"Transaction for {v} (${amt:,.2f}).",
            "transaction_data": {
                "id": f"TX-TEST-MSC-{i}",
                "vendor": v,
                "amount": amt,
                "gl_account": "6500 - Travel & Entertainment" if "RECEIPT" in cat.value else "1500 - Lab Equipment",
                "invoice_ref": None,
                "type": "DEBIT",
            },
            "supporting_docs": {},
            "ground_truth_action": act.value,
            "ground_truth_tier": tier.value,
            "expected_verifier_status": VerifierStatus.HUMAN_REVIEW_REQUIRED.value,
            "failure_in_v1_reason": None,
        })

    return cases
