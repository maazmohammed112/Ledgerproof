"""
Agent Tool Layer
Provides concrete financial tools invoked by Orchestrator, Investigation Agent,
Resolution Agent, and Verifier Agent. Every tool call generates structured telemetry.
"""

from typing import Dict, Any, List, Optional, Tuple
import time
from datetime import datetime
from ..models.schemas import ToolCallRecord
from ..core.calculator import calculate_variance, compute_duplicate_score


class FinanceToolRegistry:
    """
    In-memory knowledge store and tool execution registry for the finance agents.
    Holds reference tables for vendors, contracts, policies, invoices, POs, and GL mappings.
    """

    def __init__(self):
        # Default policies
        self.policies: Dict[str, Dict[str, Any]] = {
            "POL-VAR-001": {
                "id": "POL-VAR-001",
                "name": "Standard PO Variance Tolerance",
                "category": "VARIANCE",
                "threshold_value": 2.0,  # 2.0%
                "description": "Invoice variances up to 2.0% against approved Purchase Orders can be auto-reconciled.",
                "rule_expression": "variance_pct <= 2.0",
                "is_active": True,
            },
            "POL-DUP-001": {
                "id": "POL-DUP-001",
                "name": "Duplicate Invoice Detection",
                "category": "DUPLICATE",
                "threshold_value": 0.85,
                "description": "Any transaction with duplicate match score >= 0.85 must be immediately blocked.",
                "rule_expression": "duplicate_score >= 0.85",
                "is_active": True,
            },
            "POL-MAT-001": {
                "id": "POL-MAT-001",
                "name": "Materiality Escalation Threshold",
                "category": "MATERIALITY",
                "threshold_value": 10000.0,
                "description": "Discrepancies equal to or exceeding $10,000.00 require Controller sign-off.",
                "rule_expression": "amount >= 10000.0",
                "is_active": True,
            },
            "POL-GL-001": {
                "id": "POL-GL-001",
                "name": "Vendor Chart of Accounts Consistency",
                "category": "CLASSIFICATION",
                "threshold_value": 1.0,
                "description": "Transactions must match the master GL account specified in vendor master agreements.",
                "rule_expression": "gl_account == vendor_master_gl",
                "is_active": True,
            },
        }

        # Master Vendor Registry & Contracts
        self.vendors: Dict[str, Dict[str, Any]] = {
            "Amazon Web Services": {
                "name": "Amazon Web Services",
                "vendor_id": "VEND-AWS-01",
                "tax_id": "US-94-1340523",
                "master_gl_account": "6010 - Cloud Infrastructure & Hosting",
                "contract_terms": "Net 30, monthly recurring cloud consumption",
                "approved_categories": ["Cloud Infrastructure & Hosting"],
                "disallowed_categories": ["Office Supplies", "General Expenses"],
                "historical_transactions_count": 48,
                "status": "ACTIVE_VERIFIED",
            },
            "CloudWorks Infrastructure": {
                "name": "CloudWorks Infrastructure",
                "vendor_id": "VEND-CW-02",
                "tax_id": "US-82-9912041",
                "master_gl_account": "6015 - Cloud Infrastructure & Hosting",
                "contract_terms": "Net 30, usage-based compute",
                "approved_categories": ["Cloud Infrastructure & Hosting"],
                "disallowed_categories": ["Office Supplies"],
                "historical_transactions_count": 14,
                "status": "ACTIVE_VERIFIED",
            },
            "Apex Consulting Group": {
                "name": "Apex Consulting Group",
                "vendor_id": "VEND-APX-03",
                "tax_id": "US-36-8821990",
                "master_gl_account": "6120 - Professional Services & Legal",
                "contract_terms": "Milestone-based PO, 2% tolerance maximum",
                "approved_categories": ["Professional Services & Legal"],
                "disallowed_categories": [],
                "historical_transactions_count": 9,
                "status": "ACTIVE_VERIFIED",
            },
            "Starlight Logistics": {
                "name": "Starlight Logistics",
                "vendor_id": "VEND-STR-04",
                "tax_id": "US-45-7712390",
                "master_gl_account": "6300 - Freight & Shipping",
                "contract_terms": "Per shipment bill of lading",
                "approved_categories": ["Freight & Shipping"],
                "disallowed_categories": [],
                "historical_transactions_count": 22,
                "status": "ACTIVE_VERIFIED",
            },
            "Datadog Operations": {
                "name": "Datadog Operations",
                "vendor_id": "VEND-DD-05",
                "tax_id": "US-13-4491028",
                "master_gl_account": "6020 - Software & SaaS Subscriptions",
                "contract_terms": "Annual subscription billed monthly $4,200",
                "approved_categories": ["Software & SaaS Subscriptions"],
                "disallowed_categories": [],
                "historical_transactions_count": 18,
                "status": "ACTIVE_VERIFIED",
            },
            "Unknown Global Ventures": {
                "name": "Unknown Global Ventures",
                "vendor_id": "VEND-UNK-99",
                "tax_id": "PENDING-VERIFICATION",
                "master_gl_account": "9999 - Suspense Clearing",
                "contract_terms": "No master agreement on file",
                "approved_categories": [],
                "disallowed_categories": [],
                "historical_transactions_count": 0,
                "status": "UNVERIFIED_NEW_VENDOR",
            },
        }

        # Historical GL Mapping Dictionary
        self.gl_mappings: Dict[str, str] = {
            "aws": "6010 - Cloud Infrastructure & Hosting",
            "amazon web services": "6010 - Cloud Infrastructure & Hosting",
            "cloudworks": "6015 - Cloud Infrastructure & Hosting",
            "apex consulting": "6120 - Professional Services & Legal",
            "starlight logistics": "6300 - Freight & Shipping",
            "datadog": "6020 - Software & SaaS Subscriptions",
            "figma": "6020 - Software & SaaS Subscriptions",
            "slack technologies": "6020 - Software & SaaS Subscriptions",
            "google cloud": "6010 - Cloud Infrastructure & Hosting",
            "microsoft azure": "6010 - Cloud Infrastructure & Hosting",
        }

    # Tool Implementations

    def get_transaction(self, tx_id: str, store: Any) -> Tuple[Optional[Dict[str, Any]], ToolCallRecord]:
        t0 = time.time()
        tx = store.get_transaction(tx_id)
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Retrieved transaction {tx_id}: amount=${tx.get('amount', 0):,.2f}, vendor={tx.get('vendor')}" if tx else f"Transaction {tx_id} not found"
        record = ToolCallRecord(
            tool_name="get_transaction",
            input_params={"tx_id": tx_id},
            output_summary=summary,
            duration_ms=duration,
        )
        return tx, record

    def get_invoice(self, invoice_ref: str, store: Any) -> Tuple[Optional[Dict[str, Any]], ToolCallRecord]:
        t0 = time.time()
        inv = store.get_invoice(invoice_ref)
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Retrieved invoice {invoice_ref}: amount=${inv.get('amount', 0):,.2f}, vendor={inv.get('vendor')}" if inv else f"Invoice {invoice_ref} not found"
        record = ToolCallRecord(
            tool_name="get_invoice",
            input_params={"invoice_ref": invoice_ref},
            output_summary=summary,
            duration_ms=duration,
        )
        return inv, record

    def get_purchase_order(self, po_ref: str, store: Any) -> Tuple[Optional[Dict[str, Any]], ToolCallRecord]:
        t0 = time.time()
        po = store.get_purchase_order(po_ref)
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Retrieved PO {po_ref}: amount=${po.get('amount', 0):,.2f}, vendor={po.get('vendor')}" if po else f"PO {po_ref} not found"
        record = ToolCallRecord(
            tool_name="get_purchase_order",
            input_params={"po_ref": po_ref},
            output_summary=summary,
            duration_ms=duration,
        )
        return po, record

    def get_vendor_history(self, vendor_name: str) -> Tuple[Optional[Dict[str, Any]], ToolCallRecord]:
        t0 = time.time()
        vendor_data = None
        for k, v in self.vendors.items():
            if k.lower() in vendor_name.lower() or vendor_name.lower() in k.lower():
                vendor_data = v
                break
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Vendor '{vendor_name}' found: Status={vendor_data['status']}, MasterGL={vendor_data['master_gl_account']}" if vendor_data else f"Vendor '{vendor_name}' not found in master database"
        record = ToolCallRecord(
            tool_name="get_vendor_history",
            input_params={"vendor_name": vendor_name},
            output_summary=summary,
            duration_ms=duration,
        )
        return vendor_data, record

    def get_contract(self, vendor_name: str) -> Tuple[Optional[str], ToolCallRecord]:
        t0 = time.time()
        vendor_data, _ = self.get_vendor_history(vendor_name)
        contract = vendor_data.get("contract_terms") if vendor_data else None
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Contract terms for '{vendor_name}': {contract}" if contract else f"No master contract found for '{vendor_name}'"
        record = ToolCallRecord(
            tool_name="get_contract",
            input_params={"vendor_name": vendor_name},
            output_summary=summary,
            duration_ms=duration,
        )
        return contract, record

    def get_policy(self, policy_id: str) -> Tuple[Optional[Dict[str, Any]], ToolCallRecord]:
        t0 = time.time()
        policy = self.policies.get(policy_id)
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Policy {policy_id} ('{policy.get('name')}'): threshold={policy.get('threshold_value')}" if policy else f"Policy {policy_id} not found"
        record = ToolCallRecord(
            tool_name="get_policy",
            input_params={"policy_id": policy_id},
            output_summary=summary,
            duration_ms=duration,
        )
        return policy, record

    def calculate_variance_tool(self, actual: float, baseline: float) -> Tuple[Dict[str, float], ToolCallRecord]:
        t0 = time.time()
        diff, pct = calculate_variance(actual, baseline)
        duration = round((time.time() - t0) * 1000, 2)
        res = {"absolute_difference": diff, "percentage_difference": pct}
        summary = f"Calculated variance: diff=${diff:,.2f} ({pct}%) between actual=${actual:,.2f} and baseline=${baseline:,.2f}"
        record = ToolCallRecord(
            tool_name="calculate_variance",
            input_params={"actual": actual, "baseline": baseline},
            output_summary=summary,
            duration_ms=duration,
        )
        return res, record

    def detect_possible_duplicate_tool(self, inv_a: Dict[str, Any], candidate_list: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], ToolCallRecord]:
        t0 = time.time()
        matches = []
        for cand in candidate_list:
            if cand.get("id") == inv_a.get("id"):
                continue
            score, reasons = compute_duplicate_score(inv_a, cand)
            if score >= 0.5:
                matches.append({
                    "matched_id": cand.get("id"),
                    "matched_invoice": cand.get("invoice_number") or cand.get("invoice_ref"),
                    "score": round(score, 2),
                    "reasons": reasons,
                })
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Duplicate search: found {len(matches)} potential duplicate matches"
        record = ToolCallRecord(
            tool_name="detect_possible_duplicate",
            input_params={"invoice_id": inv_a.get("id"), "candidates_count": len(candidate_list)},
            output_summary=summary,
            duration_ms=duration,
        )
        return matches, record

    def get_historical_classification(self, vendor_name: str) -> Tuple[Optional[str], ToolCallRecord]:
        t0 = time.time()
        v_low = vendor_name.lower().strip()
        matched_gl = None
        for key, gl in self.gl_mappings.items():
            if key in v_low or v_low in key:
                matched_gl = gl
                break
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Historical GL lookup for '{vendor_name}': mapped to '{matched_gl}'" if matched_gl else f"No historical GL mapping for '{vendor_name}'"
        record = ToolCallRecord(
            tool_name="get_historical_classification",
            input_params={"vendor_name": vendor_name},
            output_summary=summary,
            duration_ms=duration,
        )
        return matched_gl, record

    def propose_journal_entry(
        self,
        debit_account: str,
        credit_account: str,
        amount: float,
        memo: str,
    ) -> Tuple[Dict[str, Any], ToolCallRecord]:
        t0 = time.time()
        entry = {
            "entry_id": f"JE-{int(time.time()*1000) % 100000:05d}",
            "debit_account": debit_account,
            "credit_account": credit_account,
            "amount": amount,
            "memo": memo,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "PROPOSED",
        }
        duration = round((time.time() - t0) * 1000, 2)
        summary = f"Proposed Journal Entry {entry['entry_id']}: Debit {debit_account} ${amount:,.2f}, Credit {credit_account} ${amount:,.2f}"
        record = ToolCallRecord(
            tool_name="propose_journal_entry",
            input_params={"debit": debit_account, "credit": credit_account, "amount": amount},
            output_summary=summary,
            duration_ms=duration,
        )
        return entry, record


# Global tool registry singleton
tools = FinanceToolRegistry()
