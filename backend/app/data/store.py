"""
In-Memory Store with Reset Capability and Local State Management.
Houses current active transactions, invoices, POs, policies, traces, and audit logs.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from .northstar_data import get_northstar_dataset


class FinanceDataStore:
    """
    Central repository for company close state.
    Supports instant reset to pristine Northstar Labs state.
    """

    def __init__(self):
        self.reset_to_demo()

    def reset_to_demo(self):
        data = get_northstar_dataset()
        self.company_name = data["company_name"]
        self.period = data["period"]
        self.transactions: Dict[str, Dict[str, Any]] = {t["id"]: dict(t) for t in data["transactions"]}
        self.invoices: Dict[str, Dict[str, Any]] = {i["id"]: dict(i) for i in data["invoices"]}
        # Also index invoices by invoice_number
        for i in data["invoices"]:
            self.invoices[i["invoice_number"]] = dict(i)
        self.purchase_orders: Dict[str, Dict[str, Any]] = {p["po_number"]: dict(p) for p in data["purchase_orders"]}
        self.policies: Dict[str, Dict[str, Any]] = {p["id"]: dict(p) for p in data["policies"]}
        self.traces: Dict[str, Dict[str, Any]] = {}
        self.audit_records: Dict[str, Dict[str, Any]] = {}

    def get_transaction(self, tx_id: str) -> Optional[Dict[str, Any]]:
        return self.transactions.get(tx_id)

    def get_all_transactions(self) -> List[Dict[str, Any]]:
        return list(self.transactions.values())

    def update_transaction(self, tx_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if tx_id in self.transactions:
            self.transactions[tx_id].update(updates)
            return self.transactions[tx_id]
        return None

    def get_invoice(self, invoice_ref: str) -> Optional[Dict[str, Any]]:
        return self.invoices.get(invoice_ref)

    def get_all_invoices(self) -> List[Dict[str, Any]]:
        # deduplicate by id
        seen = set()
        res = []
        for inv in self.invoices.values():
            if inv["id"] not in seen:
                seen.add(inv["id"])
                res.append(inv)
        return res

    def get_purchase_order(self, po_ref: str) -> Optional[Dict[str, Any]]:
        return self.purchase_orders.get(po_ref)

    def get_policy(self, policy_id: str) -> Optional[Dict[str, Any]]:
        return self.policies.get(policy_id)

    def get_all_policies(self) -> List[Dict[str, Any]]:
        return list(self.policies.values())

    def update_policy(self, policy_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if policy_id in self.policies:
            self.policies[policy_id].update(updates)
            return self.policies[policy_id]
        return None

    def save_trace(self, trace_dict: Dict[str, Any]):
        t_id = trace_dict.get("trace_id")
        if t_id:
            self.traces[t_id] = trace_dict

    def get_trace(self, trace_id: str) -> Optional[Dict[str, Any]]:
        return self.traces.get(trace_id)

    def save_audit_record(self, record_dict: Dict[str, Any]):
        d_id = record_dict.get("decision_id")
        if d_id:
            self.audit_records[d_id] = record_dict

    def get_all_audit_records(self) -> List[Dict[str, Any]]:
        return list(self.audit_records.values())

    def add_user_transaction(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        tx_id = tx_data.get("id") or f"TX-USER-{len(self.transactions) + 1:04d}"
        new_tx = {
            "id": tx_id,
            "date": tx_data.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
            "vendor": tx_data.get("vendor", "Custom Vendor"),
            "description": tx_data.get("description", "User submitted transaction"),
            "amount": float(tx_data.get("amount", 0.0)),
            "currency": tx_data.get("currency", "USD"),
            "type": tx_data.get("type", "DEBIT"),
            "gl_account": tx_data.get("gl_account", "6000 - General Expenses"),
            "status": "PENDING",
            "invoice_ref": tx_data.get("invoice_ref") or tx_data.get("invoice_number"),
            "po_ref": tx_data.get("po_ref") or tx_data.get("po_number"),
            "category": None,
            "confidence": 0.0,
            "risk_tier": None,
            "notes": tx_data.get("notes", "User imported via Try Your Data"),
        }
        self.transactions[tx_id] = new_tx
        return new_tx


# Global active store singleton
db = FinanceDataStore()
