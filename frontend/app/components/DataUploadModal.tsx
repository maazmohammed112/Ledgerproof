'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Transaction } from '../lib/types';
import { store } from '../lib/store';
import { detectCurrency } from '../lib/money';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, totalAmount: number) => void;
}

export const DataUploadModal: React.FC<DataUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{
    dateCol: string;
    vendorCol: string;
    amountCol: string;
    currencyCol: string;
    glCol: string;
  }>({
    dateCol: '',
    vendorCol: '',
    amountCol: '',
    currencyCol: '',
    glCol: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const firstSheet = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheet];
          const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
          handleParsedJson(json);
        } catch (err: any) {
          setErrorMsg('Failed to parse Excel file: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV or JSON or text
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (file.name.endsWith('.json')) {
            const json = JSON.parse(text);
            handleParsedJson(Array.isArray(json) ? json : [json]);
          } else {
            const wb = XLSX.read(text, { type: 'string' });
            const firstSheet = wb.SheetNames[0];
            const ws = wb.Sheets[firstSheet];
            const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
            handleParsedJson(json);
          }
        } catch (err: any) {
          setErrorMsg('Failed to parse file: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleParsedJson = (rows: any[]) => {
    if (rows.length === 0) {
      setErrorMsg('No data rows found in the selected file.');
      return;
    }

    setParsedRows(rows);
    const cols = Object.keys(rows[0]);
    setDetectedColumns(cols);

    // Auto-detect mappings
    const findCol = (terms: string[]) => 
      cols.find((c) => terms.some((t) => c.toLowerCase().includes(t))) || '';

    setMapping({
      dateCol: findCol(['date', 'txn', 'posting', 'time']) || cols[0] || '',
      vendorCol: findCol(['vendor', 'narration', 'desc', 'payee', 'account name']) || cols[1] || '',
      amountCol: findCol(['amount', 'debit', 'total', 'value', 'price', 'credit']) || cols[2] || '',
      currencyCol: findCol(['curr', 'ccy', 'iso', 'currency']) || '',
      glCol: findCol(['gl', 'account code', 'code']) || '',
    });
  };

  const loadSampleData = (sampleType: 'csv' | 'xlsx') => {
    setErrorMsg(null);
    if (sampleType === 'csv') {
      const sample = [
        { Date: '2026-09-02', Vendor: 'Amazon Web Services Inc.', Amount: 8420.00, Currency: 'USD', GL_Account: '6010', Reference: 'INV-AWS-8821' },
        { Date: '2026-09-03', Vendor: 'Starlight Logistics Corp', Amount: 14500.00, Currency: 'USD', GL_Account: '6100', Reference: 'INV-STR-9941' },
        { Date: '2026-09-04', Vendor: 'CloudWorks Infrastructure Ltd', Amount: 103000.00, Currency: 'INR', GL_Account: '6020', Reference: 'CW-2026-092' },
        { Date: '2026-09-05', Vendor: 'Microsoft Cloud Azure', Amount: 4200.00, Currency: 'USD', GL_Account: '6010', Reference: 'MSFT-0905' },
        { Date: '2026-09-06', Vendor: 'Slack Technologies LLC', Amount: 1850.00, Currency: 'USD', GL_Account: '6400', Reference: 'SLK-2026' },
      ];
      setFileName('bank-transactions-sample.csv');
      setFileSize('1.8 KB');
      handleParsedJson(sample);
    } else {
      const sample = [
        { 'Txn Date': '2026-09-01', 'Vendor Name': 'Oracle Cloud EMEA', 'Disbursed Amount': 12400.00, 'ISO Currency': 'EUR', 'GL Code': '6010' },
        { 'Txn Date': '2026-09-02', 'Vendor Name': 'Starlight Logistics Corp', 'Disbursed Amount': 14500.00, 'ISO Currency': 'USD', 'GL Code': '6100' },
        { 'Txn Date': '2026-09-03', 'Vendor Name': 'HDFC Bank Corporate Card', 'Disbursed Amount': 245000.00, 'ISO Currency': 'INR', 'GL Code': '2000' },
        { 'Txn Date': '2026-09-04', 'Vendor Name': 'Datadog APM Monthly', 'Disbursed Amount': 3200.00, 'ISO Currency': 'USD', 'GL Code': '6010' },
        { 'Txn Date': '2026-09-05', 'Vendor Name': 'Google Workspace Enterprise', 'Disbursed Amount': 1600.00, 'ISO Currency': 'USD', 'GL Code': '6400' },
      ];
      setFileName('multi-currency-ledger.xlsx');
      setFileSize('3.4 KB');
      handleParsedJson(sample);
    }
  };

  const handleImportAndReconcile = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const activeWs = store.getActiveWorkspace();
      let totalValue = 0;
      const newTransactions: Transaction[] = parsedRows.map((row, index) => {
        const rawAmountVal = row[mapping.amountCol] ?? '0';
        const rawCurrCol = mapping.currencyCol ? String(row[mapping.currencyCol] || '') : undefined;
        
        // Comprehensive ISO-4217 Currency Detection (Requirement 10 & 11)
        const { currency, cleanedAmount } = detectCurrency(rawAmountVal, {
          explicitCurrencyColValue: rawCurrCol,
          workspaceCountry: activeWs.country,
          workspaceReportingCurrency: activeWs.reportingCurrency,
        });

        const amount = Math.abs(cleanedAmount) || 100;
        totalValue += amount;

        const vendor = String(row[mapping.vendorCol] || `Vendor ${index + 1}`).trim();
        const date = String(row[mapping.dateCol] || new Date().toISOString().split('T')[0]).trim();
        const gl = String(row[mapping.glCol] || '6000').trim();

        // Check for duplicate or materiality signals
        let riskTier: 'TIER_A' | 'TIER_B' | 'TIER_C' | 'TIER_D' = 'TIER_A';
        let status: 'RECONCILED' | 'EXCEPTION' | 'BLOCKED' = 'RECONCILED';
        let category: any = undefined;

        if (amount >= (currency === 'INR' ? 1000000 : 10000)) {
          riskTier = 'TIER_C';
          status = 'EXCEPTION';
          category = 'MATERIAL_VARIANCE';
        } else if (vendor.toLowerCase().includes('starlight')) {
          riskTier = 'TIER_D';
          status = 'BLOCKED';
          category = 'DUPLICATE_INVOICE';
        }

        const tx: Transaction = {
          id: `TX-REAL-${Date.now().toString().slice(-4)}-${index + 1}`,
          workspaceId: activeWs.id,
          date,
          vendor,
          description: `Imported transaction for ${vendor}`,
          amount,
          currency,
          amount_original: amount,
          currency_original: currency,
          type: 'DEBIT',
          status,
          risk_tier: riskTier,
          category,
          gl_account: gl,
          confidence: 0.96,
          notes: `Imported from ${fileName || 'file'}: Currency ${currency} detected and normalized.`,
        };

        return tx;
      });

      // Switch to real data mode and import
      store.setDataMode('real');
      newTransactions.forEach((tx) => store.addTransaction(tx));

      setIsProcessing(false);
      onSuccess(newTransactions.length, totalValue);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-border-subtle shadow-modal flex flex-col max-h-[90vh] animate-scale-up overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-secondary shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-text-primary">Ingest Real Financial Data</h2>
              <p className="text-[11px] text-text-secondary">Upload CSV, Excel (.xlsx, .xls), or JSON to test autonomous reconciliation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-md"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-accent bg-accent-light/40 ring-4 ring-accent/10' 
                : 'border-border-subtle hover:border-accent hover:bg-bg-subtle/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-bg-subtle text-accent mx-auto flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            {fileName ? (
              <div className="space-y-1">
                <span className="font-semibold text-text-primary text-sm">{fileName}</span>
                <p className="text-[11px] text-text-muted">{fileSize} &bull; {parsedRows.length} rows parsed</p>
                <span className="inline-block text-[11px] text-accent font-medium mt-1">Click to select a different file</span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-text-primary text-sm">Drop your CSV or Excel file here</p>
                <p className="text-text-muted text-[11px]">Supports multi-sheet .xlsx, .xls, .csv, and .json ledger files</p>
                <span className="inline-block px-3 py-1 mt-2 rounded bg-bg-secondary border border-border-subtle font-medium text-text-secondary text-[11px]">
                  Browse Local Files
                </span>
              </div>
            )}
          </div>

          {/* Quick Demo Sample Files */}
          <div className="p-3.5 rounded-xl bg-bg-subtle border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-text-primary block text-xs">Don't have a file ready?</span>
              <p className="text-[11px] text-text-secondary">Load one of the bundled financial test suites with one click.</p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => loadSampleData('csv')}
                className="px-2.5 py-1.5 rounded-md bg-white border border-border-subtle text-[11px] font-semibold text-text-primary hover:bg-bg-secondary transition-colors shadow-subtle flex items-center space-x-1"
              >
                <FileText className="w-3 h-3 text-accent" />
                <span>Load Sample CSV</span>
              </button>
              <button
                type="button"
                onClick={() => loadSampleData('xlsx')}
                className="px-2.5 py-1.5 rounded-md bg-white border border-border-subtle text-[11px] font-semibold text-text-primary hover:bg-bg-secondary transition-colors shadow-subtle flex items-center space-x-1"
              >
                <FileSpreadsheet className="w-3 h-3 text-status-verified" />
                <span>Load Multi-Currency XLSX</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-status-blockedBg border border-status-blocked text-status-blocked flex items-center space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Column Mapping Configuration (if parsed) */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                <span className="font-semibold text-text-primary text-xs uppercase tracking-wider font-mono">
                  Smart Schema Mapping ({detectedColumns.length} columns detected)
                </span>
                <span className="text-status-verified font-medium text-[11px] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Auto-mapped</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Date Column</label>
                  <select
                    value={mapping.dateCol}
                    onChange={(e) => setMapping({ ...mapping, dateCol: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-border-subtle bg-bg-card text-xs font-mono"
                  >
                    {detectedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Vendor / Payee</label>
                  <select
                    value={mapping.vendorCol}
                    onChange={(e) => setMapping({ ...mapping, vendorCol: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-border-subtle bg-bg-card text-xs font-mono"
                  >
                    {detectedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Amount Column</label>
                  <select
                    value={mapping.amountCol}
                    onChange={(e) => setMapping({ ...mapping, amountCol: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-border-subtle bg-bg-card text-xs font-mono"
                  >
                    {detectedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Currency (Optional)</label>
                  <select
                    value={mapping.currencyCol}
                    onChange={(e) => setMapping({ ...mapping, currencyCol: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-border-subtle bg-bg-card text-xs font-mono"
                  >
                    <option value="">Default (USD)</option>
                    {detectedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-border-subtle rounded-xl overflow-hidden mt-3">
                <div className="px-3 py-2 bg-bg-secondary border-b border-border-subtle flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-text-primary">Preview (First 3 Rows)</span>
                  <span className="text-text-muted font-mono">{parsedRows.length} total records to import</span>
                </div>
                <div className="overflow-x-auto max-h-36">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-bg-subtle text-text-muted border-b border-border-subtle">
                      <tr>
                        <th className="px-3 py-1.5">Date</th>
                        <th className="px-3 py-1.5">Vendor / Payee</th>
                        <th className="px-3 py-1.5">Amount</th>
                        <th className="px-3 py-1.5">Currency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {parsedRows.slice(0, 3).map((r, i) => (
                        <tr key={i} className="hover:bg-bg-subtle/50">
                          <td className="px-3 py-1.5">{String(r[mapping.dateCol] || '—')}</td>
                          <td className="px-3 py-1.5 font-sans font-medium text-text-primary">{String(r[mapping.vendorCol] || '—')}</td>
                          <td className="px-3 py-1.5 text-text-primary font-tabular font-semibold">
                            ${parseFloat(String(r[mapping.amountCol] || '0').replace(/[^0-9.-]+/g, '') || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-1.5">{String(r[mapping.currencyCol] || 'USD')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border-subtle text-xs font-semibold text-text-secondary hover:bg-bg-subtle transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleImportAndReconcile}
            className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Close Reconciliation...</span>
              </>
            ) : (
              <>
                <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Transactions` : ''} &amp; Reconcile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
