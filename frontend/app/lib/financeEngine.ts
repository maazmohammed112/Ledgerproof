/**
 * LedgerProof Deterministic Finance & Reconciliation Engine
 * 
 * Implements 3-way reconciliation, multi-signal duplicate scoring,
 * statistical anomaly detection, vendor normalization, variance policies,
 * and data quality scoring.
 */

import { detectCurrency, normalizeCurrency, SupportedCurrency } from './money';

export interface RawRow {
  [key: string]: any;
}

export interface InferredColumnMap {
  dateCol?: string;
  descCol?: string;
  amountCol?: string;
  debitCol?: string;
  creditCol?: string;
  currencyCol?: string;
  vendorCol?: string;
  invoiceCol?: string;
  poCol?: string;
  accountCol?: string;
  referenceCol?: string;
}

export interface ColumnInferenceResult {
  columnName: string;
  detectedField: string;
  confidence: number;
  sampleValues: string[];
}

export interface DataQualityIssue {
  rowIndex: number;
  field: string;
  value: any;
  severity: 'ERROR' | 'WARNING';
  message: string;
}

export interface DataQualityReport {
  totalRows: number;
  validRows: number;
  flaggedRows: number;
  qualityScorePct: number;
  detectedCurrencies: string[];
  detectedVendors: string[];
  issues: DataQualityIssue[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  score: number; // 0.0 to 1.0
  matchingTransactionId?: string;
  evidence: string[];
  recommendedAction: 'BLOCK_PENDING_REVIEW' | 'FLAG_FOR_AUDIT' | 'CLEAR';
}

export interface ReconMatchResult {
  category: 
    | 'EXACT_MATCH'
    | 'HIGH_CONFIDENCE_MATCH'
    | 'PARTIAL_MATCH'
    | 'UNMATCHED'
    | 'POSSIBLE_DUPLICATE'
    | 'POLICY_EXCEPTION'
    | 'REQUIRES_INVESTIGATION';
  confidence: number;
  matchedId?: string;
  varianceAmount?: number;
  variancePct?: number;
  rationale: string;
}

/**
 * Standard Vendor Normalization Canonical Map
 */
export const VENDOR_NORMALIZATION_MAP: Record<string, string> = {
  'AMAZON WEB SERVICES': 'AWS Cloud',
  'AMAZON AWS': 'AWS Cloud',
  'AWS EMEA': 'AWS Cloud',
  'AWS INFRASTRUCTURE': 'AWS Cloud',
  'GOOGLE CLOUD': 'Google Cloud',
  'GOOGLE IRELAND LTD': 'Google Cloud',
  'GCP SERVICES': 'Google Cloud',
  'MICROSOFT AZURE': 'Microsoft Azure',
  'MICROSOFT CORP': 'Microsoft Azure',
  'MSFT CLOUD': 'Microsoft Azure',
  'SALESFORCE.COM INC': 'Salesforce',
  'SALESFORCE': 'Salesforce',
  'SFDC EMEA': 'Salesforce',
  'SNOWFLAKE COMPUTING INC': 'Snowflake',
  'SNOWFLAKE INC': 'Snowflake',
  'DATADOG INC': 'Datadog',
  'DATADOG IRELAND': 'Datadog',
  'CLOUDWORKS LTD': 'CloudWorks Technologies',
  'CLOUDWORKS INFRASTRUCTURE': 'CloudWorks Technologies',
  'STRIPE PAYMENTS': 'Stripe Payments',
  'STRIPE INC': 'Stripe Payments',
};

/**
 * Normalizes dirty vendor strings to canonical vendor identities
 */
export function normalizeVendor(rawVendor: string): string {
  if (!rawVendor) return 'Unknown Vendor';
  const clean = rawVendor.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '');
  for (const [pattern, canonical] of Object.entries(VENDOR_NORMALIZATION_MAP)) {
    if (clean === pattern || clean.includes(pattern)) {
      return canonical;
    }
  }
  // Title-case fallback
  return rawVendor.trim().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Levenshtein Distance for fuzzy string matching
 */
export function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1.0;

  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[m][n];
  const maxLen = Math.max(m, n);
  return maxLen === 0 ? 1.0 : Math.max(0, 1 - distance / maxLen);
}

/**
 * Multi-Signal Weighted Duplicate Scoring Engine
 * 
 * Weights:
 * - Invoice Number Exact Match: 35%
 * - Vendor Similarity: 25%
 * - Amount Exact Match: 20%
 * - PO Exact Match: 10%
 * - Date Proximity (<= 5 days): 10%
 */
export function calculateDuplicateScore(
  tx: { invoice_ref?: string; vendor: string; amount: number; po_ref?: string; date: string; description?: string },
  candidate: { id: string; invoice_ref?: string; vendor: string; amount: number; po_ref?: string; date: string; description?: string }
): DuplicateCheckResult {
  let score = 0;
  const evidence: string[] = [];

  // 1. Invoice Number Match (35%)
  const invMatch = Boolean(tx.invoice_ref && candidate.invoice_ref && tx.invoice_ref.trim().toLowerCase() === candidate.invoice_ref.trim().toLowerCase());
  if (invMatch) {
    score += 0.35;
    evidence.push(`Invoice reference match: "${tx.invoice_ref}"`);
  }

  // 2. Vendor Similarity (25%)
  const vendorSim = stringSimilarity(normalizeVendor(tx.vendor), normalizeVendor(candidate.vendor));
  score += vendorSim * 0.25;
  if (vendorSim >= 0.85) {
    evidence.push(`Vendor normalized match (${Math.round(vendorSim * 100)}% similarity): "${candidate.vendor}"`);
  }

  // 3. Amount Exact Match (20%)
  const amtDiff = Math.abs(tx.amount - candidate.amount);
  if (amtDiff < 0.01) {
    score += 0.20;
    evidence.push(`Exact monetary amount match: ${tx.amount.toFixed(2)}`);
  } else if (tx.amount > 0 && amtDiff / tx.amount < 0.01) {
    score += 0.15;
    evidence.push(`Near-exact monetary amount (variance < 1%)`);
  }

  // 4. PO Reference Match (10%)
  const poMatch = Boolean(tx.po_ref && candidate.po_ref && tx.po_ref.trim().toLowerCase() === candidate.po_ref.trim().toLowerCase());
  if (poMatch) {
    score += 0.10;
    evidence.push(`Purchase Order reference match: "${tx.po_ref}"`);
  }

  // 5. Date Proximity (10%)
  const t1 = new Date(tx.date).getTime();
  const t2 = new Date(candidate.date).getTime();
  const daysDiff = Math.abs(t1 - t2) / (1000 * 60 * 60 * 24);
  if (!isNaN(daysDiff)) {
    if (daysDiff <= 3) {
      score += 0.10;
      evidence.push(`Date proximity within ${Math.round(daysDiff)} day(s)`);
    } else if (daysDiff <= 7) {
      score += 0.05;
      evidence.push(`Date proximity within ${Math.round(daysDiff)} days`);
    }
  }

  const roundedScore = Math.round(score * 100) / 100;
  const isDuplicate = roundedScore >= 0.85;

  let recommendedAction: DuplicateCheckResult['recommendedAction'] = 'CLEAR';
  if (roundedScore >= 0.85) {
    recommendedAction = 'BLOCK_PENDING_REVIEW';
  } else if (roundedScore >= 0.65) {
    recommendedAction = 'FLAG_FOR_AUDIT';
  }

  return {
    isDuplicate,
    score: roundedScore,
    matchingTransactionId: candidate.id,
    evidence,
    recommendedAction,
  };
}

/**
 * 3-Way Reconciliation Matching for Bank Feeds <-> General Ledger
 */
export function reconcileBankToLedger(
  bankTx: { id: string; amount: number; date: string; description: string; reference?: string },
  ledgerEntries: Array<{ id: string; amount: number; date: string; description: string; reference?: string }>
): ReconMatchResult {
  let bestMatch: (typeof ledgerEntries)[0] | null = null;
  let highestScore = 0;
  let bestRationale = 'No matching general ledger entry found';

  for (const entry of ledgerEntries) {
    let score = 0;
    const notes: string[] = [];

    // Exact amount match
    const diff = Math.abs(bankTx.amount - entry.amount);
    if (diff < 0.01) {
      score += 0.60;
      notes.push('Exact amount match');
    } else if (bankTx.amount > 0 && diff / bankTx.amount < 0.01) {
      score += 0.35;
      notes.push(`Minor amount variance ($${diff.toFixed(2)})`);
    }

    // Reference match
    if (bankTx.reference && entry.reference && bankTx.reference.trim().toLowerCase() === entry.reference.trim().toLowerCase()) {
      score += 0.30;
      notes.push(`Matching reference "${bankTx.reference}"`);
    }

    // Description fuzzy similarity
    const sim = stringSimilarity(bankTx.description, entry.description);
    if (sim > 0.6) {
      score += sim * 0.15;
      notes.push(`Description similarity ${(sim * 100).toFixed(0)}%`);
    }

    // Date proximity (<= 4 days)
    const t1 = new Date(bankTx.date).getTime();
    const t2 = new Date(entry.date).getTime();
    const days = Math.abs(t1 - t2) / (1000 * 60 * 60 * 24);
    if (!isNaN(days) && days <= 4) {
      score += 0.10;
      notes.push(`Timing aligned within ${Math.round(days)} days`);
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
      bestRationale = notes.join(', ');
    }
  }

  if (highestScore >= 0.90 && bestMatch) {
    return {
      category: 'EXACT_MATCH',
      confidence: Math.round(highestScore * 100) / 100,
      matchedId: bestMatch.id,
      varianceAmount: Math.abs(bankTx.amount - bestMatch.amount),
      rationale: bestRationale,
    };
  } else if (highestScore >= 0.70 && bestMatch) {
    return {
      category: 'HIGH_CONFIDENCE_MATCH',
      confidence: Math.round(highestScore * 100) / 100,
      matchedId: bestMatch.id,
      varianceAmount: Math.abs(bankTx.amount - bestMatch.amount),
      rationale: bestRationale,
    };
  } else if (highestScore >= 0.50 && bestMatch) {
    return {
      category: 'PARTIAL_MATCH',
      confidence: Math.round(highestScore * 100) / 100,
      matchedId: bestMatch.id,
      varianceAmount: Math.abs(bankTx.amount - bestMatch.amount),
      rationale: bestRationale,
    };
  }

  return {
    category: 'UNMATCHED',
    confidence: 0,
    rationale: 'No qualifying GL match identified within tolerance bands.',
  };
}

/**
 * Intelligent Schema & Column Mapper with Confidence Scoring
 */
export function inferColumnMapping(headers: string[], sampleRows: RawRow[]): ColumnInferenceResult[] {
  const results: ColumnInferenceResult[] = [];

  const patterns: Record<string, { regex: RegExp; field: string }> = {
    date: { regex: /(?:txn|trx|trans|posting|effective)?_?date|dt\b/i, field: 'date' },
    desc: { regex: /desc(?:ription)?|narr(?:ation)?|memo|details|particulars/i, field: 'description' },
    amount: { regex: /^(?:net_?)?amount|amt|total|value|sum/i, field: 'amount' },
    debit: { regex: /^dr(?:_amount)?|debit/i, field: 'debit' },
    credit: { regex: /^cr(?:_amount)?|credit/i, field: 'credit' },
    currency: { regex: /curr(?:ency)?|ccy|iso/i, field: 'currency' },
    vendor: { regex: /vendor|supplier|payee|merchant|beneficiary|party/i, field: 'vendor' },
    invoice: { regex: /inv(?:oice)?(?:_?no|_?num|_?ref)?/i, field: 'invoice_ref' },
    po: { regex: /po(?:_?no|_?num|_?ref)?|purchase_?order/i, field: 'po_ref' },
    account: { regex: /gl(?:_?acct|_?code)?|account(?:_?code)?|chart/i, field: 'gl_account' },
    reference: { regex: /ref(?:erence)?|cheque|utr|chq/i, field: 'reference' },
  };

  for (const h of headers) {
    const cleanHeader = h.trim();
    let detectedField = 'unmapped';
    let confidence = 0.2;

    for (const [key, { regex, field }] of Object.entries(patterns)) {
      if (regex.test(cleanHeader)) {
        detectedField = field;
        confidence = 0.92;
        break;
      }
    }

    // Inspect sample values if header wasn't conclusive
    const sampleValues = sampleRows.slice(0, 5).map((r) => String(r[h] ?? '')).filter(Boolean);
    if (detectedField === 'unmapped' && sampleValues.length > 0) {
      // Date pattern detection
      if (sampleValues.some((v) => !isNaN(Date.parse(v)) && /\d{4}|\d{2}[-/.]\d{2}/.test(v))) {
        detectedField = 'date';
        confidence = 0.75;
      } else if (sampleValues.some((v) => /[₹$€£]|\b(?:USD|INR|EUR|GBP)\b/i.test(v))) {
        detectedField = 'amount';
        confidence = 0.78;
      } else if (sampleValues.some((v) => /^\d{4,5}$/.test(v))) {
        detectedField = 'gl_account';
        confidence = 0.70;
      }
    }

    results.push({
      columnName: cleanHeader,
      detectedField,
      confidence,
      sampleValues: sampleValues.slice(0, 3),
    });
  }

  return results;
}

/**
 * Data Quality Engine: Inspects parsed rows and generates quality report
 */
export function evaluateDataQuality(
  rows: RawRow[], 
  fieldMap: InferredColumnMap,
  currencyContext?: { workspaceCountry?: string; workspaceReportingCurrency?: SupportedCurrency }
): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  const currenciesSet = new Set<string>();
  const vendorsSet = new Set<string>();
  let validRowsCount = 0;

  rows.forEach((row, idx) => {
    let rowHasError = false;

    // Check date
    const dateVal = fieldMap.dateCol ? row[fieldMap.dateCol] : undefined;
    if (!dateVal || isNaN(Date.parse(String(dateVal)))) {
      issues.push({
        rowIndex: idx + 1,
        field: 'date',
        value: dateVal,
        severity: 'ERROR',
        message: 'Invalid or missing posting date',
      });
      rowHasError = true;
    }

    // Check amount
    const amtVal = fieldMap.amountCol ? row[fieldMap.amountCol] : undefined;
    const drVal = fieldMap.debitCol ? row[fieldMap.debitCol] : undefined;
    const crVal = fieldMap.creditCol ? row[fieldMap.creditCol] : undefined;
    const currColVal = fieldMap.currencyCol ? row[fieldMap.currencyCol] : undefined;

    const rawAmt = amtVal ?? drVal ?? crVal;
    if (rawAmt === undefined || rawAmt === null || String(rawAmt).trim() === '') {
      issues.push({
        rowIndex: idx + 1,
        field: 'amount',
        value: rawAmt,
        severity: 'ERROR',
        message: 'Missing transaction amount',
      });
      rowHasError = true;
    } else {
      const { currency, cleanedAmount } = detectCurrency(rawAmt, {
        ...currencyContext,
        explicitCurrencyColValue: currColVal ? String(currColVal) : undefined,
      });
      currenciesSet.add(currency);
      if (isNaN(cleanedAmount)) {
        issues.push({
          rowIndex: idx + 1,
          field: 'amount',
          value: rawAmt,
          severity: 'ERROR',
          message: 'Malformed non-numeric monetary value',
        });
        rowHasError = true;
      }
    }

    // Check vendor
    const vendorVal = fieldMap.vendorCol ? row[fieldMap.vendorCol] : undefined;
    if (vendorVal) {
      vendorsSet.add(normalizeVendor(String(vendorVal)));
    } else if (!fieldMap.descCol || !row[fieldMap.descCol]) {
      issues.push({
        rowIndex: idx + 1,
        field: 'vendor',
        value: null,
        severity: 'WARNING',
        message: 'Unspecified counterparty vendor or description',
      });
    }

    if (!rowHasError) {
      validRowsCount++;
    }
  });

  const total = rows.length || 1;
  const qualityScorePct = Math.round((validRowsCount / total) * 1000) / 10;

  return {
    totalRows: rows.length,
    validRows: validRowsCount,
    flaggedRows: rows.length - validRowsCount,
    qualityScorePct,
    detectedCurrencies: Array.from(currenciesSet),
    detectedVendors: Array.from(vendorsSet),
    issues,
  };
}
