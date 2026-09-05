'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileText, 
  Plus, 
  Play, 
  CheckCircle2, 
  Download, 
  ArrowRight,
  Database,
  Check,
  X,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { Transaction } from '../lib/types';
import { store } from '../lib/store';

interface TryYourDataViewProps {
  onAnalyzeSuccess: () => void;
  onOpenDecisionTrace: (txId: string) => void;
}

export const TryYourDataView: React.FC<TryYourDataViewProps> = ({
  onAnalyzeSuccess,
  onOpenDecisionTrace,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('csv');
  
  // Manual form state
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-09-28');
  const [glAccount, setGlAccount] = useState('6020 - Software & SaaS Subscriptions');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTx, setProcessedTx] = useState<Transaction | null>(null);

  // File & Ingestion State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRowsCount, setCsvRowsCount] = useState<number>(0);
  const [parsedRawRows, setParsedRawRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    date: '',
    vendor: '',
    amount: '',
    gl_account: '',
    invoice_number: '',
    po_number: '',
    description: '',
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !amount) return;

    setIsProcessing(true);
    setTimeout(() => {
      const amtVal = parseFloat(amount);
      const isAwsLike = vendor.toLowerCase().includes('aws') || vendor.toLowerCase().includes('amazon');
      const isDupLike = invoiceNumber.includes('DUP');

      const newTx: Transaction = {
        id: `TX-USER-${Math.floor(Math.random() * 9000) + 1000}`,
        date,
        vendor,
        description: description || `User transaction: ${vendor}`,
        amount: amtVal,
        currency: 'USD',
        type: 'DEBIT',
        gl_account: glAccount,
        status: isDupLike ? 'BLOCKED' : amtVal >= 10000.0 ? 'HUMAN_REVIEW_REQUIRED' : 'AUTO_RECONCILED',
        invoice_ref: invoiceNumber || undefined,
        po_ref: poNumber || undefined,
        category: isDupLike ? 'DUPLICATE_INVOICE' : isAwsLike ? 'GL_MISCLASSIFICATION' : amtVal >= 10000 ? 'PO_VARIANCE' : undefined,
        confidence: 0.94,
        risk_tier: isDupLike ? 'TIER_D' : amtVal >= 10000.0 ? 'TIER_C' : 'TIER_A',
        notes: isDupLike 
          ? 'Marked duplicate and blocked by Independent Verifier.' 
          : isAwsLike 
          ? 'Resolution proposed Office Supplies; Verifier corrected to Cloud Infrastructure.'
          : 'Processed via LedgerProof Autonomous Multi-Agent Pipeline.',
      };

      store.addTransaction(newTx);
      setProcessedTx(newTx);
      setIsProcessing(false);
      onAnalyzeSuccess();
    }, 900);
  };

  const inferMapping = (headers: string[]) => {
    const guessMap: Record<string, string> = {};
    headers.forEach(h => {
      const lower = h.toLowerCase();
      if (lower.includes('date') || lower.includes('dt') || lower.includes('posted')) guessMap['date'] = h;
      else if (lower.includes('vendor') || lower.includes('payee') || lower.includes('merchant') || lower.includes('counterparty') || lower.includes('supplier')) guessMap['vendor'] = h;
      else if (lower.includes('amount') || lower.includes('total') || lower.includes('cost') || lower.includes('net') || lower.includes('val')) guessMap['amount'] = h;
      else if (lower.includes('gl') || lower.includes('account') || lower.includes('category') || lower.includes('code')) guessMap['gl_account'] = h;
      else if (lower.includes('inv') || lower.includes('bill') || lower.includes('ref')) guessMap['invoice_number'] = h;
      else if (lower.includes('po') || lower.includes('order')) guessMap['po_number'] = h;
      else if (lower.includes('desc') || lower.includes('memo') || lower.includes('line') || lower.includes('narration')) guessMap['description'] = h;
    });
    setColumnMapping(guessMap);
  };

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const firstSheet = wb.SheetNames[0];
          const sheet = wb.Sheets[firstSheet];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            setCsvHeaders(headers);
            setCsvRowsCount(rows.length);
            setParsedRawRows(rows);
            inferMapping(headers);
          }
        } catch (err) {
          console.error("Excel parse error:", err);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target?.result as string);
          const rows = Array.isArray(json) ? json : [json];
          if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            setCsvHeaders(headers);
            setCsvRowsCount(rows.length);
            setParsedRawRows(rows);
            inferMapping(headers);
          }
        } catch (err) {
          console.error("JSON parse error:", err);
        }
      };
      reader.readAsText(file);
    } else {
      // Default CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const wb = XLSX.read(text, { type: 'string' });
          const firstSheet = wb.SheetNames[0];
          const sheet = wb.Sheets[firstSheet];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            setCsvHeaders(headers);
            setCsvRowsCount(rows.length);
            setParsedRawRows(rows);
            inferMapping(headers);
          }
        } catch (err) {
          console.error("CSV parse error:", err);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleProcessCsv = () => {
    if (parsedRawRows.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const existingTxs = store.getTransactions();
      const existingInvoices = new Set(existingTxs.map(t => t.invoice_ref).filter(Boolean));
      const seenInBatch = new Set<string>();

      const newItems: Transaction[] = parsedRawRows.map((row, idx) => {
        const rawAmt = row[columnMapping.amount] ?? row['amount'] ?? row['Amount'] ?? 0;
        const cleanAmtStr = String(rawAmt).replace(/[$,€£₹\s]/g, '');
        const amt = parseFloat(cleanAmtStr) || 0;

        const dateVal = String(row[columnMapping.date] ?? row['date'] ?? row['Date'] ?? new Date().toISOString().split('T')[0]);
        const vendorVal = String(row[columnMapping.vendor] ?? row['vendor'] ?? row['Vendor'] ?? `Vendor ${idx + 1}`);
        const invRef = row[columnMapping.invoice_number] ?? row['invoice_number'] ?? row['Invoice'] ?? undefined;
        const poRef = row[columnMapping.po_number] ?? row['po_number'] ?? row['PO'] ?? undefined;
        const glVal = String(row[columnMapping.gl_account] ?? row['gl_account'] ?? row['GL'] ?? '6000 - General Operating Expense');
        const descVal = String(row[columnMapping.description] ?? row['description'] ?? `Transaction for ${vendorVal}`);

        const invStr = invRef ? String(invRef).trim() : '';
        const isDuplicate = invStr && (existingInvoices.has(invStr) || seenInBatch.has(invStr));
        if (invStr) seenInBatch.add(invStr);

        const isMisclassified = vendorVal.toLowerCase().includes('aws') && glVal.includes('6400');
        const isMaterialOverage = Math.abs(amt) >= 10000.0;

        let riskTier: 'TIER_A' | 'TIER_B' | 'TIER_C' | 'TIER_D' = 'TIER_A';
        let status: Transaction['status'] = 'AUTO_RECONCILED';
        let category: Transaction['category'] | undefined = undefined;
        let notes = `Verified via Autonomous Ingestion pipeline (${csvFile?.name || 'Uploaded file'}).`;

        if (isDuplicate) {
          riskTier = 'TIER_D';
          status = 'BLOCKED';
          category = 'DUPLICATE_INVOICE';
          notes = `Independent Verifier hard block: Duplicate invoice ${invStr} detected. Disbursement rejected.`;
        } else if (isMaterialOverage) {
          riskTier = 'TIER_C';
          status = 'HUMAN_REVIEW_REQUIRED';
          category = 'PO_VARIANCE';
          notes = `Transaction amount $${Math.abs(amt).toLocaleString()} exceeds $10,000 threshold. Queued for Human Controller review.`;
        } else if (isMisclassified) {
          riskTier = 'TIER_B';
          status = 'RESOLVED';
          category = 'GL_MISCLASSIFICATION';
          notes = `Resolution proposal corrected by Independent Verifier to Cloud Hosting (GL 6010).`;
        }

        const txId = `TX-USER-${String(idx + 1).padStart(4, '0')}`;
        return {
          id: txId,
          date: dateVal,
          vendor: vendorVal,
          description: descVal,
          amount: Math.abs(amt),
          currency: 'USD',
          type: 'DEBIT',
          gl_account: glVal,
          status,
          invoice_ref: invStr || undefined,
          po_ref: poRef ? String(poRef) : undefined,
          category,
          confidence: isDuplicate ? 0.98 : 0.95,
          risk_tier: riskTier,
          notes,
        };
      });

      // Switch to real data workspace so uploaded records are front and center
      store.setDataMode('real');
      newItems.forEach(t => store.addTransaction(t));
      setIsProcessing(false);
      setProcessedTx(newItems[0]);
      onAnalyzeSuccess();
    }, 1100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Custom Data Ingestion
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal mt-1">
            Try Your Data
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5 max-w-2xl">
            Upload custom CSVs or manually input transactions to test how LedgerProof investigates, verifies, and categorizes your own records.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/sample-data/transactions.csv"
            download="transactions.csv"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-primary bg-bg-secondary border border-border-subtle hover:bg-bg-subtle transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-text-secondary" />
            <span>Sample Transactions CSV</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1.5 border-b border-border-subtle pb-2 text-xs">
        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'csv'
              ? 'bg-text-primary text-white font-semibold shadow-subtle'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>CSV Upload & Column Mapper</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'manual'
              ? 'bg-text-primary text-white font-semibold shadow-subtle'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Single Transaction Simulator</span>
        </button>
      </div>

      {/* Mode 1: CSV Upload */}
      {activeTab === 'csv' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-bg-secondary p-6 rounded-xl border border-border-subtle shadow-subtle space-y-5">
            <div>
              <h3 className="font-serif text-xl text-text-primary">Upload Bank or Subledger File</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Upload CSV exports from QuickBooks, NetSuite, SAP, or raw bank wire feeds.
              </p>
            </div>

            {/* Dropzone */}
            <label className="border border-dashed border-border-medium hover:border-accent rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-bg-card text-center">
              <Upload className="w-7 h-7 text-accent mb-2" />
              <span className="text-xs font-semibold text-text-primary">Click to select or drag &amp; drop CSV, Excel, or JSON</span>
              <span className="text-[11px] text-text-muted mt-0.5">Supports .csv, .xlsx, .xls, and .json</span>
              <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleCsvSelect} className="hidden" />
            </label>

            {csvFile && (
              <div className="p-3.5 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-between text-xs font-medium">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-text-primary font-semibold truncate">{csvFile.name}</span>
                  <span className="text-text-muted shrink-0">({csvRowsCount} rows)</span>
                </div>
                <span className="text-status-verified font-bold text-[10px] px-2 py-0.2 rounded bg-status-verifiedBg border border-status-verifiedBorder shrink-0">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* Mapping & Run Box */}
          <div className="bg-bg-secondary p-6 rounded-xl border border-border-subtle shadow-subtle space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-xl text-text-primary">Intelligent Column Mapping</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  LedgerProof auto-detects column semantics. Verify or adjust headers:
                </p>
              </div>

              {csvHeaders.length > 0 ? (
                <div className="space-y-2.5 text-xs max-h-56 overflow-y-auto pr-1">
                  {['vendor', 'amount', 'date', 'gl_account', 'invoice_number', 'po_number'].map((field) => (
                    <div key={field} className="flex items-center justify-between">
                      <span className="text-text-secondary capitalize font-semibold">{field.replace('_', ' ')}:</span>
                      <select
                        value={columnMapping[field] || ''}
                        onChange={(e) => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                        className="px-3 py-1.5 rounded-md bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
                      >
                        <option value="">-- Select Column --</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-text-muted border border-border-subtle rounded-lg bg-bg-card">
                  Select a CSV file to preview automated schema mapping.
                </div>
              )}
            </div>

            <button
              onClick={handleProcessCsv}
              disabled={!csvFile || isProcessing}
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-md bg-accent text-white font-semibold text-xs hover:bg-accent-hover disabled:opacity-50 shadow-subtle transition-colors"
            >
              <Play className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Agents Ingesting & Analyzing Records...' : 'Analyze With LedgerProof Multi-Agent'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Mode 2: Manual Entry Form */}
      {activeTab === 'manual' && (
        <div className="bg-bg-secondary p-6 rounded-xl border border-border-subtle shadow-subtle max-w-2xl">
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div>
              <h3 className="font-serif text-xl text-text-primary">Create Single Transaction Test</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Simulate an invoice or bank wire and watch LedgerProof’s multi-agent ensemble resolve and independently verify it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-text-primary block mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services or Apex Consulting"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="font-semibold text-text-primary block mb-1">Amount (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 103000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none focus:border-accent font-tabular"
                />
              </div>

              <div>
                <label className="font-semibold text-text-primary block mb-1">Booking Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-text-primary block mb-1">Proposed GL Account</label>
                <input
                  type="text"
                  value={glAccount}
                  onChange={(e) => setGlAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-text-primary block mb-1">Invoice Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. INV-TEST-99"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-text-primary block mb-1">PO Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. PO-9001"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-card border border-border-subtle text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-text-primary text-xs block mb-1">Transaction Description</label>
              <textarea
                rows={2}
                placeholder="Details of expense..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-md bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-text-muted font-mono">Live Demo Ingestion</span>
              
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 rounded-md font-semibold bg-accent text-white hover:bg-accent-hover transition-all shadow-subtle disabled:opacity-50 flex items-center space-x-1.5"
              >
                <span>{isProcessing ? 'Analyzing Transaction...' : 'Process Through Pipeline'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Processed Result Banner */}
      {processedTx && (
        <div className="p-5 rounded-xl bg-bg-secondary border border-border-subtle shadow-card space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-status-verified" />
              <h4 className="font-serif text-lg text-text-primary">Autonomous Analysis Result</h4>
            </div>
            <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
              processedTx.status === 'BLOCKED' 
                ? 'bg-status-blockedBg text-status-blocked border border-status-blockedBorder' 
                : 'bg-status-verifiedBg text-status-verified border border-status-verifiedBorder'
            }`}>
              {processedTx.status} ({processedTx.risk_tier})
            </span>
          </div>

          <div className="space-y-1 font-tabular">
            <p className="text-text-primary font-medium">
              {processedTx.vendor} &bull; ${processedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} &bull; {processedTx.gl_account}
            </p>
            <p className="text-text-secondary">{processedTx.notes}</p>
          </div>

          <div className="pt-1">
            <button
              onClick={() => onOpenDecisionTrace(processedTx.id)}
              className="inline-flex items-center space-x-1 text-accent hover:underline font-semibold"
            >
              <span>Inspect Autonomous Decision Trace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
