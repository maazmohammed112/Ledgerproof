const path = require('path');
const XLSX = require(path.resolve(__dirname, '../frontend/node_modules/xlsx'));

// Target file
const targetPath = path.resolve(__dirname, '../sample-data/multi-currency.xlsx');

// 1. Bank Transactions Sheet
const bankTransactions = [
  { "Txn Date": "2026-08-01", "Narration": "Cloud Infrastructure Monthly - AWS EMEA", "Debit": 103000, "Credit": 0, "Curr": "INR", "Reference": "TXN-IN-8821", "Account": "HDFC Bank Operating" },
  { "Txn Date": "2026-08-03", "Narration": "AWS Cloud Services - EMEA Dublin", "Debit": 1250, "Credit": 0, "Curr": "EUR", "Reference": "TXN-EU-4029", "Account": "Barclays EUR Treasury" },
  { "Txn Date": "2026-08-05", "Narration": "Global Datadog Observability", "Debit": 4200, "Credit": 0, "Curr": "USD", "Reference": "TXN-US-1092", "Account": "Silicon Valley Bank Checking" },
  { "Txn Date": "2026-08-08", "Narration": "Customer Wire Payment - Acme Global Corp", "Debit": 0, "Credit": 52000, "Curr": "USD", "Reference": "WIRE-REV-9011", "Account": "Silicon Valley Bank Checking" },
  { "Txn Date": "2026-08-10", "Narration": "Geneva Colocation Facility - Swisscom AG", "Debit": 8450, "Credit": 0, "Curr": "CHF", "Reference": "TXN-CH-5510", "Account": "UBS Zurich Operating" },
  { "Txn Date": "2026-08-12", "Narration": "London Legal Advisory Retainer - Herbert Smith", "Debit": 3500, "Credit": 0, "Curr": "GBP", "Reference": "TXN-UK-3318", "Account": "HSBC London Sterling" },
  { "Txn Date": "2026-08-15", "Narration": "Vendor Payment - Infosys Technologies", "Debit": 2540000, "Credit": 0, "Curr": "INR", "Reference": "NEFT-INF-0912", "Account": "HDFC Bank Operating" },
  { "Txn Date": "2026-08-18", "Narration": "Tokyo Data Relay Hub - NTT Communications", "Debit": 1650000, "Credit": 0, "Curr": "JPY", "Reference": "TXN-JP-7712", "Account": "MUFG Tokyo Operating" },
  { "Txn Date": "2026-08-20", "Narration": "Singapore Regional Hub - SingTel Ltd", "Debit": 7800, "Credit": 0, "Curr": "SGD", "Reference": "TXN-SG-4419", "Account": "DBS Singapore Operating" },
  { "Txn Date": "2026-08-22", "Narration": "Sydney Edge Servers - Telstra Corp", "Debit": 9200, "Credit": 0, "Curr": "AUD", "Reference": "TXN-AU-2291", "Account": "CBA Sydney Operating" },
  { "Txn Date": "2026-08-25", "Narration": "Duplicate Transfer Test - Cloud Infrastructure AWS", "Debit": 103000, "Credit": 0, "Curr": "INR", "Reference": "TXN-IN-8822", "Account": "HDFC Bank Operating" },
  { "Txn Date": "2026-08-28", "Narration": "Dubai Regional Cloud Transit - Du Telecom", "Debit": 18500, "Credit": 0, "Curr": "AED", "Reference": "TXN-AE-1099", "Account": "Emirates NBD Treasury" }
];

// 2. General Ledger Sheet
const generalLedger = [
  { "Posting Date": "2026-08-01", "Account Code": "6100", "Account Name": "Cloud & Hosting Infrastructure", "Debit": 103000, "Credit": 0, "Currency": "INR", "Voucher ID": "JV-2026-0801", "Vendor": "Amazon Web Services Inc." },
  { "Posting Date": "2026-08-03", "Account Code": "6100", "Account Name": "Cloud & Hosting Infrastructure", "Debit": 1250, "Credit": 0, "Currency": "EUR", "Voucher ID": "JV-2026-0803", "Vendor": "AWS EMEA SARL" },
  { "Posting Date": "2026-08-05", "Account Code": "6200", "Account Name": "SaaS Software & Subscriptions", "Debit": 4200, "Credit": 0, "Currency": "USD", "Voucher ID": "JV-2026-0805", "Vendor": "Datadog Inc." },
  { "Posting Date": "2026-08-08", "Account Code": "4000", "Account Name": "Enterprise SaaS Revenue", "Debit": 0, "Credit": 52000, "Currency": "USD", "Voucher ID": "JV-2026-0808", "Vendor": "Acme Global Corp" },
  { "Posting Date": "2026-08-10", "Account Code": "6150", "Account Name": "Data Center Colocation", "Debit": 8450, "Credit": 0, "Currency": "CHF", "Voucher ID": "JV-2026-0810", "Vendor": "Swisscom AG" },
  { "Posting Date": "2026-08-12", "Account Code": "6500", "Account Name": "Legal & Professional Services", "Debit": 3500, "Credit": 0, "Currency": "GBP", "Voucher ID": "JV-2026-0812", "Vendor": "Herbert Smith Freehills" },
  { "Posting Date": "2026-08-15", "Account Code": "6300", "Account Name": "Contract Engineering & Outsourcing", "Debit": 2540000, "Credit": 0, "Currency": "INR", "Voucher ID": "JV-2026-0815", "Vendor": "Infosys Technologies Ltd" },
  { "Posting Date": "2026-08-18", "Account Code": "6100", "Account Name": "Cloud & Hosting Infrastructure", "Debit": 1650000, "Credit": 0, "Currency": "JPY", "Voucher ID": "JV-2026-0818", "Vendor": "NTT Communications" }
];

// 3. Vendor Master Sheet
const vendorMaster = [
  { "Vendor ID": "VND-001", "Legal Name": "Amazon Web Services Inc.", "Normalized Name": "Amazon Web Services", "Tax ID": "US-47-1092831", "Default GL": "6100", "Default Currency": "USD", "Payment Terms": "Net 30", "Risk Tier": "Low" },
  { "Vendor ID": "VND-002", "Legal Name": "Datadog Inc.", "Normalized Name": "Datadog", "Tax ID": "US-13-4920194", "Default GL": "6200", "Default Currency": "USD", "Payment Terms": "Net 30", "Risk Tier": "Low" },
  { "Vendor ID": "VND-003", "Legal Name": "Swisscom AG", "Normalized Name": "Swisscom", "Tax ID": "CHE-105.834.721", "Default GL": "6150", "Default Currency": "CHF", "Payment Terms": "Net 30", "Risk Tier": "Medium" },
  { "Vendor ID": "VND-004", "Legal Name": "Herbert Smith Freehills LLP", "Normalized Name": "Herbert Smith", "Tax ID": "GB-882-9011-22", "Default GL": "6500", "Default Currency": "GBP", "Payment Terms": "Net 15", "Risk Tier": "Medium" },
  { "Vendor ID": "VND-005", "Legal Name": "Infosys Technologies Limited", "Normalized Name": "Infosys", "Tax ID": "07AAACI1234A1Z1", "Default GL": "6300", "Default Currency": "INR", "Payment Terms": "Net 45", "Risk Tier": "Low" }
];

// 4. Open Invoices Sheet
const openInvoices = [
  { "Invoice Number": "INV-2026-AWS-01", "Vendor": "Amazon Web Services Inc.", "Invoice Date": "2026-08-01", "Due Date": "2026-08-31", "Total Amount": 103000, "Currency": "INR", "PO Number": "PO-2026-092", "Status": "APPROVED" },
  { "Invoice Number": "INV-2026-AWS-01-DUP", "Vendor": "Amazon Web Services Inc.", "Invoice Date": "2026-08-03", "Due Date": "2026-08-31", "Total Amount": 103000, "Currency": "INR", "PO Number": "PO-2026-092", "Status": "FLAGGED_DUPLICATE" },
  { "Invoice Number": "INV-DDOG-8819", "Vendor": "Datadog Inc.", "Invoice Date": "2026-08-05", "Due Date": "2026-09-04", "Total Amount": 4200, "Currency": "USD", "PO Number": "PO-2026-088", "Status": "RECONCILED" },
  { "Invoice Number": "INV-SWISS-1092", "Vendor": "Swisscom AG", "Invoice Date": "2026-08-10", "Due Date": "2026-09-09", "Total Amount": 8450, "Currency": "CHF", "PO Number": "PO-2026-104", "Status": "RECONCILED" },
  { "Invoice Number": "INV-HSF-4412", "Vendor": "Herbert Smith Freehills LLP", "Invoice Date": "2026-08-12", "Due Date": "2026-08-27", "Total Amount": 3500, "Currency": "GBP", "PO Number": "PO-2026-077", "Status": "UNDER_REVIEW" }
];

const wb = XLSX.utils.book_new();

const wsBank = XLSX.utils.json_to_sheet(bankTransactions);
const wsGL = XLSX.utils.json_to_sheet(generalLedger);
const wsVendor = XLSX.utils.json_to_sheet(vendorMaster);
const wsInvoices = XLSX.utils.json_to_sheet(openInvoices);

XLSX.utils.book_append_sheet(wb, wsBank, "Bank Transactions");
XLSX.utils.book_append_sheet(wb, wsGL, "General Ledger");
XLSX.utils.book_append_sheet(wb, wsVendor, "Vendor Master");
XLSX.utils.book_append_sheet(wb, wsInvoices, "Open Invoices");

XLSX.writeFile(wb, targetPath);
console.log('Successfully created multi-currency.xlsx at: ' + targetPath);
