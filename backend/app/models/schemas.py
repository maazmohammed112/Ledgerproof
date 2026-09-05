"""
LedgerProof - Pydantic Data Models & Schemas
Defines core accounting, exception, verification, autonomy tier, trace, and evaluation types.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class TransactionType(str, Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"


class MatchStatus(str, Enum):
    RECONCILED = "RECONCILED"
    EXCEPTION = "EXCEPTION"
    PENDING = "PENDING"
    BLOCKED = "BLOCKED"


class ExceptionCategory(str, Enum):
    DUPLICATE_INVOICE = "DUPLICATE_INVOICE"
    PO_VARIANCE = "PO_VARIANCE"
    GL_MISCLASSIFICATION = "GL_MISCLASSIFICATION"
    MISSING_DOCUMENT = "MISSING_DOCUMENT"
    UNSUPPORTED_VENDOR = "UNSUPPORTED_VENDOR"
    FX_VARIANCE = "FX_VARIANCE"
    MISSING_RECEIPT = "MISSING_RECEIPT"


class VerifierStatus(str, Enum):
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    HUMAN_REVIEW_REQUIRED = "HUMAN_REVIEW_REQUIRED"


class RiskTier(str, Enum):
    TIER_A = "TIER_A"  # Auto Execute (High conf, verified, within policy, low materiality)
    TIER_B = "TIER_B"  # Conditional Execute (Moderate amount, verified, policy explicitly permits)
    TIER_C = "TIER_C"  # Human Review (Material amount, policy exception, ambiguous)
    TIER_D = "TIER_D"  # Block (Probable duplicate, policy violation, verifier rejected)


class ResolutionAction(str, Enum):
    AUTO_MATCH = "AUTO_MATCH"
    CORRECT_GL = "CORRECT_GL"
    MARK_DUPLICATE = "MARK_DUPLICATE"
    CREATE_ACCRUAL = "CREATE_ACCRUAL"
    REQUEST_EVIDENCE = "REQUEST_EVIDENCE"
    APPROVE_VARIANCE = "APPROVE_VARIANCE"
    ESCALATE_POLICY = "ESCALATE_POLICY"
    SUGGEST_JOURNAL_ENTRY = "SUGGEST_JOURNAL_ENTRY"


class HumanDecisionStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EDITED = "EDITED"
    EVIDENCE_REQUESTED = "EVIDENCE_REQUESTED"


class EvidenceItem(BaseModel):
    id: str
    source_type: str  # INVOICE, PURCHASE_ORDER, BANK_STMT, VENDOR_CONTRACT, GL_HISTORY, POLICY
    title: str
    details: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    data: Dict[str, Any] = Field(default_factory=dict)


class ToolCallRecord(BaseModel):
    tool_name: str
    input_params: Dict[str, Any] = Field(default_factory=dict)
    output_summary: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    duration_ms: float = 0.0


class InvestigationResult(BaseModel):
    summary: str
    root_cause: str
    evidence_gathered: List[EvidenceItem] = Field(default_factory=list)
    missing_evidence: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    recommended_action: ResolutionAction
    tools_used: List[ToolCallRecord] = Field(default_factory=list)


class ResolutionResult(BaseModel):
    proposed_action: ResolutionAction
    explanation: str
    target_account: Optional[str] = None
    original_account: Optional[str] = None
    calculated_variance_pct: Optional[float] = None
    journal_entry_suggestion: Optional[Dict[str, Any]] = None
    confidence: float = Field(ge=0.0, le=1.0)
    tools_used: List[ToolCallRecord] = Field(default_factory=list)


class VerifierResult(BaseModel):
    status: VerifierStatus
    arithmetic_valid: bool
    policy_compliant: bool
    classification_valid: bool
    materiality_assessed: bool
    notes: str
    blocking_reasons: List[str] = Field(default_factory=list)
    disagreement_detected: bool = False
    disagreement_details: Optional[str] = None
    corrected_action: Optional[ResolutionAction] = None
    corrected_account: Optional[str] = None


class AutonomyGateResult(BaseModel):
    tier: RiskTier
    reason: str
    can_auto_execute: bool
    requires_human_approval: bool
    is_blocked: bool
    deterministic_checks: Dict[str, Any] = Field(default_factory=dict)


class DecisionTrace(BaseModel):
    trace_id: str
    transaction_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    investigation: InvestigationResult
    resolution: ResolutionResult
    verifier: VerifierResult
    autonomy_gate: AutonomyGateResult
    human_review: Optional[Dict[str, Any]] = None
    final_status: str
    all_tool_calls: List[ToolCallRecord] = Field(default_factory=list)


class Transaction(BaseModel):
    id: str
    date: str
    vendor: str
    description: str
    amount: float
    currency: str = "USD"
    type: TransactionType
    gl_account: str
    status: MatchStatus = MatchStatus.PENDING
    invoice_ref: Optional[str] = None
    po_ref: Optional[str] = None
    category: Optional[ExceptionCategory] = None
    confidence: float = 1.0
    risk_tier: Optional[RiskTier] = None
    trace_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Invoice(BaseModel):
    id: str
    invoice_number: str
    vendor: str
    po_number: Optional[str] = None
    date: str
    due_date: str
    amount: float
    currency: str = "USD"
    line_items: List[Dict[str, Any]] = Field(default_factory=list)
    status: str = "RECEIVED"  # RECEIVED, MATCHED, DISPUTED, PAID
    service_period: Optional[str] = None


class PurchaseOrder(BaseModel):
    id: str
    po_number: str
    vendor: str
    amount: float
    currency: str = "USD"
    approved_by: str
    gl_account: str
    variance_tolerance_pct: float = 2.0  # Default policy threshold
    status: str = "OPEN"


class Policy(BaseModel):
    id: str
    name: str
    category: str
    description: str
    rule_expression: str
    threshold_value: float
    is_active: bool = True
    is_suggested: bool = False
    source: str = "STANDARD"  # STANDARD, LEARNED_PROPOSAL
    learned_from_cases: List[str] = Field(default_factory=list)
    version: int = 1


class AuditRecord(BaseModel):
    decision_id: str
    trace_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    transaction_id: str
    vendor: str
    amount: float
    agent_name: str
    agent_version: str
    model: str
    tools_used: List[str]
    evidence_ids: List[str]
    policy_ids: List[str]
    proposed_action: str
    verifier_status: VerifierStatus
    confidence: float
    risk_level: str
    autonomy_tier: RiskTier
    human_required: bool
    human_decision: HumanDecisionStatus = HumanDecisionStatus.PENDING
    human_notes: Optional[str] = None
    final_action: str
    ledger_impact_summary: str


class EvaluationCase(BaseModel):
    id: str
    name: str
    category: ExceptionCategory
    description: str
    transaction_data: Dict[str, Any]
    supporting_docs: Dict[str, Any]
    ground_truth_action: ResolutionAction
    ground_truth_tier: RiskTier
    ground_truth_account: Optional[str] = None
    expected_verifier_status: VerifierStatus


class EvaluationRunReport(BaseModel):
    run_id: str
    agent_version: str  # "V1" or "V2"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_cases: int
    passed_cases: int
    accuracy: float
    false_auto_approval_rate: float
    escalation_precision: float
    completion_rate: float
    average_latency_ms: float
    estimated_cost_usd: float
    failure_breakdown: Dict[str, int]
    failed_case_ids: List[str] = Field(default_factory=list)
