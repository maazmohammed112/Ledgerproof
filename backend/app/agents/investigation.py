"""
Agent 2 — Investigation Agent
Investigates financial exceptions across invoices, POs, bank statements,
vendor master agreements, policies, and prior transaction history.
Outputs: evidence gathered, missing evidence, likely cause, confidence, recommended next action.
"""

from typing import Dict, Any, List, Tuple
from ..models.schemas import (
    EvidenceItem,
    InvestigationResult,
    ResolutionAction,
    ToolCallRecord,
)
from .tools import tools


class InvestigationAgent:
    """
    Autonomous investigator specializing in multi-source financial forensic discovery.
    """

    def __init__(self, version: str = "V2"):
        self.name = "Investigation Agent"
        self.version = version

    def investigate(self, tx: Dict[str, Any], store: Any) -> Tuple[InvestigationResult, List[ToolCallRecord]]:
        tool_records: List[ToolCallRecord] = []
        evidence: List[EvidenceItem] = []
        missing_evidence: List[str] = []

        tx_id = tx.get("id", "TX-UNKNOWN")
        vendor = tx.get("vendor", "")
        amount = float(tx.get("amount", 0.0))
        invoice_ref = tx.get("invoice_ref")
        po_ref = tx.get("po_ref")
        gl_account = tx.get("gl_account", "")

        # 1. Retrieve Vendor History & Master Data
        vendor_data, t_v = tools.get_vendor_history(vendor)
        tool_records.append(t_v)
        if vendor_data:
            evidence.append(EvidenceItem(
                id=f"EVD-VEND-{tx_id}",
                source_type="VENDOR_CONTRACT",
                title=f"Vendor Master: {vendor}",
                details=f"Master GL: {vendor_data['master_gl_account']}. Status: {vendor_data['status']}. History: {vendor_data['historical_transactions_count']} past closes.",
                relevance_score=0.95,
                data=vendor_data,
            ))
        else:
            missing_evidence.append("Vendor not found in Master Vendor Registry")

        # 2. Retrieve Invoice details if available
        invoice_data = None
        if invoice_ref:
            invoice_data, t_i = tools.get_invoice(invoice_ref, store)
            tool_records.append(t_i)
            if invoice_data:
                evidence.append(EvidenceItem(
                    id=f"EVD-INV-{invoice_ref}",
                    source_type="INVOICE",
                    title=f"Invoice #{invoice_ref}",
                    details=f"Billed amount: ${invoice_data.get('amount', 0):,.2f} on {invoice_data.get('date')}. Due: {invoice_data.get('due_date')}.",
                    relevance_score=0.98,
                    data=invoice_data,
                ))
            else:
                missing_evidence.append(f"Invoice document #{invoice_ref} not located in repository")
        else:
            missing_evidence.append("No invoice reference attached to bank transaction")

        # 3. Retrieve Purchase Order if available
        po_data = None
        if po_ref:
            po_data, t_p = tools.get_purchase_order(po_ref, store)
            tool_records.append(t_p)
            if po_data:
                evidence.append(EvidenceItem(
                    id=f"EVD-PO-{po_ref}",
                    source_type="PURCHASE_ORDER",
                    title=f"Approved PO #{po_ref}",
                    details=f"Committed budget: ${po_data.get('amount', 0):,.2f}. Approved by: {po_data.get('approved_by')}.",
                    relevance_score=0.96,
                    data=po_data,
                ))
            else:
                missing_evidence.append(f"PO #{po_ref} could not be retrieved from ERP")

        # 4. Check for potential duplicate transactions / invoices
        all_invoices = store.get_all_invoices()
        candidate = invoice_data if invoice_data else tx
        dup_matches, t_d = tools.detect_possible_duplicate_tool(candidate, all_invoices)
        tool_records.append(t_d)
        if dup_matches:
            top_dup = dup_matches[0]
            evidence.append(EvidenceItem(
                id=f"EVD-DUP-{tx_id}",
                source_type="INVOICE",
                title=f"Potential Duplicate Match (Score: {top_dup['score']})",
                details=f"Matches {top_dup['matched_invoice']}: {top_dup['reasons']}",
                relevance_score=0.99,
                data=top_dup,
            ))

        # 5. Check Historical GL Classification
        hist_gl, t_h = tools.get_historical_classification(vendor)
        tool_records.append(t_h)
        if hist_gl:
            evidence.append(EvidenceItem(
                id=f"EVD-GL-{tx_id}",
                source_type="GL_HISTORY",
                title="Historical Chart of Accounts Mapping",
                details=f"Prior periods consistently classified under '{hist_gl}'. Current entry proposes '{gl_account}'.",
                relevance_score=0.94,
                data={"historical_gl": hist_gl, "current_gl": gl_account},
            ))

        # 6. Retrieve relevant policies
        pol_var, t_pv = tools.get_policy("POL-VAR-001")
        pol_dup, t_pd = tools.get_policy("POL-DUP-001")
        tool_records.extend([t_pv, t_pd])

        # Synthesize Root Cause & Recommendation
        root_cause = "General exception requiring review"
        recommended_action = ResolutionAction.REQUEST_EVIDENCE
        confidence = 0.80

        # Scenario A: Probable Duplicate
        if dup_matches and dup_matches[0]["score"] >= 0.85:
            root_cause = f"Duplicate invoice identified matching prior invoice #{dup_matches[0]['matched_invoice']}"
            recommended_action = ResolutionAction.MARK_DUPLICATE
            confidence = 0.96

        # Scenario B: GL Misclassification
        elif hist_gl and gl_account and hist_gl.lower() != gl_account.lower() and "office supplies" in gl_account.lower() and "aws" in vendor.lower():
            root_cause = f"GL misclassification: Vendor {vendor} belongs in '{hist_gl}', not '{gl_account}'"
            recommended_action = ResolutionAction.CORRECT_GL
            confidence = 0.94

        # Scenario C: PO Variance
        elif invoice_data and po_data:
            inv_amt = float(invoice_data.get("amount", 0))
            po_amt = float(po_data.get("amount", 0))
            diff, pct = tools.calculate_variance_tool(inv_amt, po_amt)[0].values()
            if pct > 0.0:
                root_cause = f"Invoice exceeds PO by ${diff:,.2f} ({pct}% variance). Policy allows {pol_var.get('threshold_value')}%."
                recommended_action = ResolutionAction.APPROVE_VARIANCE if pct <= pol_var.get('threshold_value', 2.0) else ResolutionAction.ESCALATE_POLICY
                confidence = 0.91

        # Scenario D: Missing Invoice for recurring vendor
        elif not invoice_ref and vendor_data and vendor_data.get("status") == "ACTIVE_VERIFIED":
            root_cause = f"Recurring subscription payment to {vendor} without matching vendor invoice in billing inbox."
            recommended_action = ResolutionAction.CREATE_ACCRUAL
            confidence = 0.88

        # Scenario E: Unverified Vendor
        elif vendor_data and vendor_data.get("status") == "UNVERIFIED_NEW_VENDOR":
            root_cause = f"Vendor '{vendor}' has no master agreement or approved tax documentation."
            recommended_action = ResolutionAction.ESCALATE_POLICY
            confidence = 0.92

        summary = f"Investigated transaction {tx_id} ({vendor}, ${amount:,.2f}). Root cause: {root_cause}."

        result = InvestigationResult(
            summary=summary,
            root_cause=root_cause,
            evidence_gathered=evidence,
            missing_evidence=missing_evidence,
            confidence=confidence,
            recommended_action=recommended_action,
            tools_used=tool_records,
        )
        return result, tool_records
