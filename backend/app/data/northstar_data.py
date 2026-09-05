"""
Northstar Labs - Ground-Truth Demo Company Dataset
Generates 75+ realistic transactions, matching invoices, purchase orders,
and intentional close exceptions for the September Close.
"""

from typing import Dict, Any, List


def get_northstar_dataset() -> Dict[str, Any]:
    # 1. Policies
    policies = [
        {
            "id": "POL-VAR-001",
            "name": "Standard PO Variance Tolerance",
            "category": "VARIANCE",
            "description": "Invoice variances up to 2.0% against approved Purchase Orders can be auto-cleared.",
            "rule_expression": "variance_pct <= 2.0",
            "threshold_value": 2.0,
            "is_active": True,
            "is_suggested": False,
            "source": "STANDARD",
            "version": 1,
        },
        {
            "id": "POL-DUP-001",
            "name": "Duplicate Invoice Prevention",
            "category": "DUPLICATE",
            "description": "Any transaction with duplicate score >= 0.85 must be blocked.",
            "rule_expression": "duplicate_score >= 0.85",
            "threshold_value": 0.85,
            "is_active": True,
            "is_suggested": False,
            "source": "STANDARD",
            "version": 1,
        },
        {
            "id": "POL-MAT-001",
            "name": "Materiality Escalation Threshold",
            "category": "MATERIALITY",
            "description": "Discrepancies equal to or exceeding $10,000.00 require Controller sign-off.",
            "rule_expression": "amount >= 10000.0",
            "threshold_value": 10000.0,
            "is_active": True,
            "is_suggested": False,
            "source": "STANDARD",
            "version": 1,
        },
        {
            "id": "POL-GL-001",
            "name": "Vendor Chart of Accounts Consistency",
            "category": "CLASSIFICATION",
            "description": "Transactions must match the master GL account specified in vendor master agreements.",
            "rule_expression": "gl_account == vendor_master_gl",
            "threshold_value": 1.0,
            "is_active": True,
            "is_suggested": False,
            "source": "STANDARD",
            "version": 1,
        },
        {
            "id": "POL-CW-SUGG",
            "name": "CloudWorks Usage Tolerance Exception (Suggested)",
            "category": "VARIANCE",
            "description": "For verified CloudWorks Infrastructure usage contracts, allow <= 5.0% variance (Learned from 5 past manual approvals).",
            "rule_expression": "vendor == 'CloudWorks Infrastructure' and variance_pct <= 5.0",
            "threshold_value": 5.0,
            "is_active": False,
            "is_suggested": True,
            "source": "LEARNED_PROPOSAL",
            "learned_from_cases": ["TX-EXC-002", "TX-HIST-881", "TX-HIST-882", "TX-HIST-883", "TX-HIST-884"],
            "version": 2,
        },
    ]

    # 2. Purchase Orders
    purchase_orders = [
        {
            "id": "PO-9001",
            "po_number": "PO-9001",
            "vendor": "Apex Consulting Group",
            "amount": 100000.0,
            "currency": "USD",
            "approved_by": "Sarah Jenkins (VP Finance)",
            "gl_account": "6120 - Professional Services & Legal",
            "variance_tolerance_pct": 2.0,
            "status": "OPEN",
        },
        {
            "id": "PO-9002",
            "po_number": "PO-9002",
            "vendor": "Starlight Logistics",
            "amount": 14500.0,
            "currency": "USD",
            "approved_by": "David Miller (Supply Chain Dir)",
            "gl_account": "6300 - Freight & Shipping",
            "variance_tolerance_pct": 2.0,
            "status": "OPEN",
        },
        {
            "id": "PO-9003",
            "po_number": "PO-9003",
            "vendor": "CloudWorks Infrastructure",
            "amount": 25000.0,
            "currency": "USD",
            "approved_by": "Alex Chen (CTO)",
            "gl_account": "6015 - Cloud Infrastructure & Hosting",
            "variance_tolerance_pct": 2.0,
            "status": "OPEN",
        },
        {
            "id": "PO-9004",
            "po_number": "PO-9004",
            "vendor": "WeWork Global Spaces",
            "amount": 12800.0,
            "currency": "USD",
            "approved_by": "Sarah Jenkins (VP Finance)",
            "gl_account": "6200 - Rent & Facilities",
            "variance_tolerance_pct": 1.0,
            "status": "OPEN",
        },
    ]

    # 3. Invoices
    invoices = [
        # Original invoice for Starlight Logistics
        {
            "id": "INV-STR-4401",
            "invoice_number": "INV-STR-4401",
            "vendor": "Starlight Logistics",
            "po_number": "PO-9002",
            "date": "2026-09-02",
            "due_date": "2026-10-02",
            "amount": 14500.0,
            "currency": "USD",
            "service_period": "2026-08-01 to 2026-08-31",
            "status": "PAID",
        },
        # Duplicate invoice received from Starlight Logistics (Intentional Exception 1)
        {
            "id": "INV-STR-4401-DUP",
            "invoice_number": "INV-STR-4401-A",
            "vendor": "Starlight Logistics",
            "po_number": "PO-9002",
            "date": "2026-09-12",
            "due_date": "2026-10-12",
            "amount": 14500.0,
            "currency": "USD",
            "service_period": "2026-08-01 to 2026-08-31",
            "status": "RECEIVED",
        },
        # Apex Consulting PO Variance Invoice (Intentional Exception 2: $103,000 vs $100,000 PO = 3% variance)
        {
            "id": "INV-APX-8802",
            "invoice_number": "INV-APX-8802",
            "vendor": "Apex Consulting Group",
            "po_number": "PO-9001",
            "date": "2026-09-14",
            "due_date": "2026-10-14",
            "amount": 103000.0,
            "currency": "USD",
            "service_period": "2026-08-15 to 2026-09-15",
            "status": "RECEIVED",
        },
        # Amazon Web Services invoice (Intentional Exception 3: Judge Wow Moment)
        {
            "id": "INV-AWS-9910",
            "invoice_number": "INV-AWS-9910",
            "vendor": "Amazon Web Services",
            "po_number": None,
            "date": "2026-09-03",
            "due_date": "2026-10-03",
            "amount": 8420.0,
            "currency": "USD",
            "service_period": "2026-08-01 to 2026-08-31",
            "status": "RECEIVED",
        },
        # CloudWorks invoice with 4% usage variance (For policy learning proposal)
        {
            "id": "INV-CW-7721",
            "invoice_number": "INV-CW-7721",
            "vendor": "CloudWorks Infrastructure",
            "po_number": "PO-9003",
            "date": "2026-09-05",
            "due_date": "2026-10-05",
            "amount": 26000.0,
            "currency": "USD",
            "service_period": "2026-08-01 to 2026-08-31",
            "status": "RECEIVED",
        },
    ]

    # 4. Transactions (75 records)
    transactions: List[Dict[str, Any]] = []

    # Intentional Exceptions (Top 7)
    exceptions = [
        # Exception 1: Duplicate Invoice (Starlight Logistics $14,500)
        {
            "id": "TX-EXC-001",
            "date": "2026-09-15",
            "vendor": "Starlight Logistics",
            "description": "Logistics invoice payment request - duplicate submission",
            "amount": 14500.0,
            "currency": "USD",
            "type": "DEBIT",
            "gl_account": "6300 - Freight & Shipping",
            "status": "BLOCKED",
            "invoice_ref": "INV-STR-4401-DUP",
            "po_ref": "PO-9002",
            "category": "DUPLICATE_INVOICE",
            "confidence": 0.98,
            "risk_tier": "TIER_D",
            "notes": "Exact match to invoice INV-STR-4401 already cleared on Sep 2.",
        },
        # Exception 2: PO Variance (Apex Consulting $103,000 vs $100,000 = 3% diff > 2% policy)
        {
            "id": "TX-EXC-002",
            "date": "2026-09-18",
            "vendor": "Apex Consulting Group",
            "description": "Enterprise ERP advisory milestone billing",
            "amount": 103000.0,
            "currency": "USD",
            "type": "DEBIT",
            "gl_account": "6120 - Professional Services & Legal",
            "status": "EXCEPTION",
            "invoice_ref": "INV-APX-8802",
            "po_ref": "PO-9001",
            "category": "PO_VARIANCE",
            "confidence": 0.92,
            "risk_tier": "TIER_C",
            "notes": "3% variance ($3,000) exceeds POL-VAR-001 2% threshold. Material amount requires Controller approval.",
        },
        # Exception 3: JUDGE WOW MOMENT - Wrong GL Classification (AWS Cloud billed as Office Supplies)
        {
            "id": "TX-EXC-003",
            "date": "2026-09-04",
            "vendor": "Amazon Web Services",
            "description": "Monthly us-east-1 compute cluster consumption",
            "amount": 8420.0,
            "currency": "USD",
            "type": "DEBIT",
            "gl_account": "6400 - Office Supplies & Administration",  # Intentionally erroneous GL
            "status": "EXCEPTION",
            "invoice_ref": "INV-AWS-9910",
            "po_ref": None,
            "category": "GL_MISCLASSIFICATION",
            "confidence": 0.94,
            "risk_tier": "TIER_D",
            "notes": "Resolution Agent proposed Office Supplies; Independent Verifier blocked execution and flagged Cloud Infrastructure.",
        },
        # Exception 4: Missing Invoice for recurring Datadog SaaS subscription ($4,200)
        {
            "id": "TX-EXC-004",
            "date": "2026-09-28",
            "vendor": "Datadog Operations",
            "description": "Monthly infrastructure monitoring AP balance",
            "amount": 4200.0,
            "currency": "USD",
            "type": "DEBIT",
            "gl_account": "6020 - Software & SaaS Subscriptions",
            "status": "EXCEPTION",
            "invoice_ref": None,  # Missing document
            "po_ref": None,
            "category": "MISSING_DOCUMENT",
            "confidence": 0.89,
            "risk_tier": "TIER_C",
            "notes": "Recurring SaaS with active contract, but invoice not yet uploaded. Propose accrual journal entry.",
        },
        # Exception 5: Unsupported Vendor (Unknown Global Ventures $18,500)
        {
            "id": "TX-EXC-005",
            "date": "2026-09-20",
            "vendor": "Unknown Global Ventures",
            "description": "International offshore data conversion service",
            "amount": 18500.0,
            "currency": "USD",
            "type": "DEBIT",
            "gl_account": "9999 - Suspense Clearing",
            "status": "EXCEPTION",
            "invoice_ref": "INV-UNK-009",
            "po_ref": None,
            "category": "UNSUPPORTED_VENDOR",
            "confidence": 0.93,
            "risk_tier": "TIER_C",
            "notes": "No master agreement or verified tax ID on file. Escalated for vendor compliance audit.",
        },
        # Exception 6: Foreign Currency Variance (Tokyo Hardware Ltd ¥1,980,000 / $14,210)
        {
            "id": "TX-EXC-006",
            "date": "2026-09-22",
            "vendor": "Tokyo Hardware Ltd",
            "description": "Laboratory test fixture imported from Japan",
            "amount": 14210.0,
            "currency": "USD",
            "type": "DEBIT",
            "gl_account": "1500 - Lab Equipment & Hardware",
            "status": "EXCEPTION",
            "invoice_ref": "INV-TYO-991",
            "po_ref": None,
            "category": "FX_VARIANCE",
            "confidence": 0.90,
            "risk_tier": "TIER_C",
            "notes": "JPY conversion exchange rate differential (+1.8%). Requires standard FX revaluation review.",
        },
        # Exception 7: Missing Receipt (Executive Travel Expense $1,250)
        {
            "id": "TX-EXC-007",
            "date": "2026-09-25",
            "vendor": "Delta Air Lines",
            "description": "Executive ticket SFO-JFK customer summit",
            "amount": 1250.0,
            "currency": "USD",
            "type": "DEBIT",
            "gl_account": "6500 - Travel & Entertainment",
            "status": "EXCEPTION",
            "invoice_ref": None,
            "po_ref": None,
            "category": "MISSING_RECEIPT",
            "confidence": 0.87,
            "risk_tier": "TIER_C",
            "notes": "Travel charge over $500 missing itemized tax receipt. Auto-request documentation.",
        },
    ]
    transactions.extend(exceptions)

    # 68 Standard Clean Reconciled Transactions
    standard_vendors = [
        ("Google Workspace", "Monthly enterprise email & office suite", 1250.0, "6020 - Software & SaaS Subscriptions"),
        ("Slack Technologies", "Enterprise communication platform", 980.0, "6020 - Software & SaaS Subscriptions"),
        ("Zoom Video Communications", "Video conferencing webinar licenses", 450.0, "6020 - Software & SaaS Subscriptions"),
        ("GitHub Enterprise", "Source code repositories & CI runners", 840.0, "6020 - Software & SaaS Subscriptions"),
        ("WeWork Global Spaces", "HQ office lease monthly rent", 12800.0, "6200 - Rent & Facilities"),
        ("Pacific Gas & Electric", "Building power & utility bill", 2140.0, "6210 - Utilities & Internet"),
        ("Comcast Business", "Dedicated gigabit fiber line", 650.0, "6210 - Utilities & Internet"),
        ("Gusto Payroll Services", "Bi-weekly payroll tax processing fees", 340.0, "6100 - Payroll Processing Fees"),
        ("FedEx Express", "Express overnight prototype shipment", 285.0, "6300 - Freight & Shipping"),
        ("Figma Enterprise", "Design team product licenses", 1800.0, "6020 - Software & SaaS Subscriptions"),
        ("Notion Labs", "Internal engineering wiki knowledge base", 600.0, "6020 - Software & SaaS Subscriptions"),
        ("Stripe Processing", "Payment gateway interchange merchant fee", 1920.0, "6110 - Merchant & Bank Fees"),
    ]

    for day in range(1, 29):
        v_idx = (day - 1) % len(standard_vendors)
        v_name, v_desc, base_amt, v_gl = standard_vendors[v_idx]
        tx_num = f"TX-REC-{day:03d}A"
        transactions.append({
            "id": tx_num,
            "date": f"2026-09-{day:02d}",
            "vendor": v_name,
            "description": v_desc,
            "amount": round(base_amt + (day * 3.5), 2),
            "currency": "USD",
            "type": "DEBIT",
            "gl_account": v_gl,
            "status": "RECONCILED",
            "invoice_ref": f"INV-{day:03d}",
            "po_ref": f"PO-{day:03d}" if base_amt > 2000 else None,
            "category": None,
            "confidence": 0.99,
            "risk_tier": "TIER_A",
            "notes": "Auto-matched 3-way reconciliation verified against bank and AP subledger.",
        })

        # Add a secondary payment/deposit
        if day % 2 == 0:
            tx_num_b = f"TX-REC-{day:03d}B"
            transactions.append({
                "id": tx_num_b,
                "date": f"2026-09-{day:02d}",
                "vendor": "Silicon Valley Bank",
                "description": "Customer accounts receivable wire deposit",
                "amount": round(8500.0 + (day * 150.0), 2),
                "currency": "USD",
                "type": "CREDIT",
                "gl_account": "1100 - Operating Cash",
                "status": "RECONCILED",
                "invoice_ref": None,
                "po_ref": None,
                "category": None,
                "confidence": 1.0,
                "risk_tier": "TIER_A",
                "notes": "Verified against incoming customer wire remittance advice.",
            })

    return {
        "company_name": "Northstar Labs Inc.",
        "period": "September 2026",
        "policies": policies,
        "purchase_orders": purchase_orders,
        "invoices": invoices,
        "transactions": transactions,
    }
