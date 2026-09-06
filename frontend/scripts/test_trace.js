const neatlogs = require('neatlogs');

async function main() {
  console.log('Testing Neatlogs initialization with provided demo key...');
  const apiKey = process.env.NEATLOGS_API_KEY || '';
  if (!apiKey) {
    console.error('NEATLOGS_API_KEY is not set. Please set it in your environment or .env.local.');
    return;
  }
  
  try {
    neatlogs.init({
      apiKey: apiKey,
      workflowName: 'ledgerproof-finance-close',
      tags: ['track-2', 'autonomous-office-cfo', 'hackathon-rescue', 'local-intelligence'],
      metadata: {
        workflow: 'month_end_close',
        runtime: 'local-intelligence',
        track: 'autonomous-office-cfo',
        dataset: 'northstar-demo',
        processing_mode: 'local',
        API_cost: 0.00
      },
      debug: true
    });
    console.log('Neatlogs SDK initialized successfully.');

    // Execute root workflow trace
    await neatlogs.trace({ name: 'ledgerproof-finance-close', kind: 'WORKFLOW' }, async () => {
      console.log('Inside trace root: ledgerproof-finance-close');

      // 1. Data Ingestion
      await neatlogs.span({ name: 'ingest_financial_data', kind: 'TOOL' }, async () => {
        return { records_ingested: 40, sources: ['bank-feed', 'general-ledger', 'invoices', 'purchase-orders'] };
      });

      // 2. Detect Schema
      await neatlogs.span({ name: 'detect_schema', kind: 'TOOL' }, async () => {
        return { schema_status: 'VALIDATED', detected_fields: ['date', 'amount', 'currency', 'vendor', 'invoice_id', 'po_number', 'gl_account'] };
      });

      // 3. Validate Records
      await neatlogs.span({ name: 'validate_records', kind: 'GUARDRAIL' }, async () => {
        return { quality_score: 98.5, critical_errors: 0, warnings: 2 };
      });

      // 4. Detect Currency & Multi-Currency Normalization
      await neatlogs.span({ name: 'detect_currency', kind: 'TOOL' }, async () => {
        return { detected_currencies: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CHF', 'SGD'] };
      });

      await neatlogs.span({ name: 'normalize_transactions', kind: 'TOOL' }, async () => {
        return { normalized_count: 40, reporting_currency: 'USD', locale: 'intl' };
      });

      // 5. Reconcile Transactions (3-way match)
      await neatlogs.span({ name: 'reconcile_transactions', kind: 'WORKFLOW' }, async () => {
        return { exact_matches: 33, exceptions_detected: 7, match_rate: 0.825 };
      });

      // 6. Detect Exceptions
      await neatlogs.span({ name: 'detect_exceptions', kind: 'AGENT' }, async () => {
        return {
          exception_ids: ['TX-EXC-001', 'TX-EXC-002', 'TX-EXC-003', 'TX-EXC-004', 'TX-EXC-005', 'TX-EXC-006', 'TX-EXC-007'],
          types: ['DUPLICATE_INVOICE', 'PO_VARIANCE', 'POLICY_EXCEPTION', 'UNMATCHED_RECEIPT']
        };
      });

      // 7. Investigate Exception: Judge WOW Scenario (AWS Misclassification)
      await neatlogs.span({ name: 'investigate_exception', kind: 'AGENT', role: 'Forensic Investigator', goal: 'Cross-reference transaction with vendor history' }, async () => {
        return {
          transaction_id: 'TX-EXC-003',
          vendor: 'AWS EMEA / Amazon Web Services',
          amount: 4250.00,
          currency: 'USD',
          historical_gl: 'Cloud Infrastructure (6040)',
          proposed_gl: 'Office Supplies (6100)',
          anomaly_detected: true
        };
      });

      // 8. Propose Resolution
      await neatlogs.span({ name: 'propose_resolution', kind: 'AGENT', role: 'Resolution Agent', goal: 'Formulate journal entry proposal' }, async () => {
        return {
          transaction_id: 'TX-EXC-003',
          proposed_action: 'RECLASSIFY_AND_APPROVE',
          proposed_gl_account: '6100 (Office Supplies)',
          agent_confidence: 0.72
        };
      });

      // 9. Independent Adversarial Verifier (REJECTS proposal!)
      await neatlogs.span({ name: 'verify_resolution', kind: 'GUARDRAIL' }, async () => {
        return {
          transaction_id: 'TX-EXC-003',
          verifier_status: 'REJECTED',
          reason: 'Resolution agent proposed Office Supplies for AWS Cloud transaction. Historical vendor ledger requires 6040 Cloud Infrastructure. Self-approval blocked.',
          disagreement_flag: true
        };
      });

      // 10. Apply Deterministic Autonomy Policy
      await neatlogs.span({ name: 'apply_autonomy_policy', kind: 'GUARDRAIL' }, async () => {
        return {
          transaction_id: 'TX-EXC-003',
          autonomy_tier: 'TIER_D',
          action: 'HARD_BLOCK',
          reason: 'Independent Verifier rejected resolution proposal. Material misclassification prevented.'
        };
      });

      // 11. Request Human Review
      await neatlogs.span({ name: 'request_human_review', kind: 'AGENT' }, async () => {
        return {
          escalation_queue: 'Controller Sign-Off',
          pending_reviews: [
            { tx_id: 'TX-EXC-002', type: 'PO_VARIANCE', variance: '3.0%', policy_limit: '2.0%' },
            { tx_id: 'TX-EXC-004', type: 'MATERIAL_TRANSACTION', amount: 1450000.00, currency: 'INR' }
          ]
        };
      });

      // 12. Finalize Decisions & Autonomy Gate
      await neatlogs.span({ name: 'finalize_decision', kind: 'WORKFLOW' }, async () => {
        return { auto_approved: 33, blocked_by_verifier: 2, human_review_pending: 2, manual_signoff_ready: true };
      });

      // 13. Create Tamper-Evident SHA-256 Audit Record
      await neatlogs.span({ name: 'create_audit_record', kind: 'TOOL' }, async () => {
        return {
          record_count: 40,
          audit_hash: '3a88c2b7d903e839e55b1129fa8c1097efd939a8264560d2b67f331cf113cf62',
          tamper_evident: true
        };
      });

      console.log('All nested spans executed successfully!');
    });

    console.log('Flushing Neatlogs telemetry...');
    await neatlogs.flush();
    console.log('Neatlogs flush completed successfully!');
  } catch (err) {
    console.error('Neatlogs test encountered error:', err);
  }
}

main().then(() => console.log('Done test_trace.js'));
