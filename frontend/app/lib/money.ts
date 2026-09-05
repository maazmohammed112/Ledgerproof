/**
 * LedgerProof Financial Money & Multi-Currency Engine
 * 
 * Provides decimal-safe representation, ISO 4217 currency detection,
 * reference FX conversion, and dual International / Indian numbering systems.
 */

export type SupportedCurrency = 
  | 'USD' 
  | 'INR' 
  | 'EUR' 
  | 'GBP' 
  | 'CHF' 
  | 'JPY' 
  | 'CAD' 
  | 'AUD' 
  | 'SGD' 
  | 'AED';

export type NumberingLocale = 'intl' | 'indian';

export interface CurrencyMeta {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  decimals: number;
  flag: string;
}

export const CURRENCY_REGISTRY: Record<SupportedCurrency, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, flag: '🇺🇸' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2, flag: '🇮🇳' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, flag: '🇬🇧' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2, flag: '🇨🇭' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, flag: '🇯🇵' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimals: 2, flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', decimals: 2, flag: '🇦🇺' },
  SGD: { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar', decimals: 2, flag: '🇸🇬' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', decimals: 2, flag: '🇦🇪' },
};

/**
 * Deterministic Reference FX Table (base: USD)
 * Explicitly labeled 'Reference FX rate' for offline audit integrity.
 */
export const REFERENCE_FX_TABLE: Record<SupportedCurrency, number> = {
  USD: 1.0000,
  INR: 83.5200,
  EUR: 0.9215,
  GBP: 0.7840,
  CHF: 0.8845,
  JPY: 155.2000,
  CAD: 1.3650,
  AUD: 1.5180,
  SGD: 1.3420,
  AED: 3.6725,
};

export interface MoneyRecord {
  amount_original: number;
  currency_original: SupportedCurrency;
  normalized_amount: number;       // in reporting currency (default USD)
  reporting_currency: SupportedCurrency;
  fx_rate: number;
  fx_rate_source: string;          // e.g. "Reference FX rate (ECB/RBI benchmark)"
  fx_rate_date: string;
}

/**
 * Normalizes an original amount to the reporting currency using deterministic reference rates.
 */
export function normalizeCurrency(
  amount: number, 
  sourceCurrency: SupportedCurrency, 
  targetCurrency: SupportedCurrency = 'USD'
): MoneyRecord {
  const rateToUsd = 1 / (REFERENCE_FX_TABLE[sourceCurrency] || 1.0);
  const rateFromUsd = REFERENCE_FX_TABLE[targetCurrency] || 1.0;
  const combinedRate = rateToUsd * rateFromUsd;
  
  // Decimal-safe rounding to target currency decimal precision
  const decimals = CURRENCY_REGISTRY[targetCurrency]?.decimals ?? 2;
  const factor = Math.pow(10, decimals);
  const normalized = Math.round(amount * combinedRate * factor) / factor;

  return {
    amount_original: amount,
    currency_original: sourceCurrency,
    normalized_amount: normalized,
    reporting_currency: targetCurrency,
    fx_rate: Math.round(combinedRate * 10000) / 10000,
    fx_rate_source: 'Reference FX rate (bundled offline benchmark)',
    fx_rate_date: '2026-09-01',
  };
}

/**
 * Intelligent currency detector from raw string, cell formats, symbols, or headers
 */
export function detectCurrency(input: string | number, fallback: SupportedCurrency = 'USD'): {
  currency: SupportedCurrency;
  cleanedAmount: number;
  confidence: number;
} {
  if (typeof input === 'number') {
    return { currency: fallback, cleanedAmount: input, confidence: 0.5 };
  }

  const str = String(input).trim();
  let detected: SupportedCurrency = fallback;
  let confidence = 0.5;

  // 1. Check explicit currency tokens
  if (/\bINR\b/i.test(str) || str.includes('₹') || /Rs\.?/i.test(str)) {
    detected = 'INR';
    confidence = 0.98;
  } else if (/\bEUR\b/i.test(str) || str.includes('€')) {
    detected = 'EUR';
    confidence = 0.98;
  } else if (/\bGBP\b/i.test(str) || str.includes('£')) {
    detected = 'GBP';
    confidence = 0.98;
  } else if (/\bCHF\b/i.test(str)) {
    detected = 'CHF';
    confidence = 0.98;
  } else if (/\bJPY\b/i.test(str) || str.includes('¥')) {
    detected = 'JPY';
    confidence = 0.98;
  } else if (/\bCAD\b/i.test(str) || /C\$/i.test(str)) {
    detected = 'CAD';
    confidence = 0.95;
  } else if (/\bAUD\b/i.test(str) || /A\$/i.test(str)) {
    detected = 'AUD';
    confidence = 0.95;
  } else if (/\bSGD\b/i.test(str) || /S\$/i.test(str)) {
    detected = 'SGD';
    confidence = 0.95;
  } else if (/\bAED\b/i.test(str) || /Dhs/i.test(str)) {
    detected = 'AED';
    confidence = 0.95;
  } else if (str.includes('$')) {
    detected = 'USD';
    confidence = 0.90;
  }

  // 2. Parse clean numeric value
  // Remove currency signs, letters, and handle comma/dot separation
  let numStr = str.replace(/[^0-9.-]/g, '');
  // Handle Indian Lakh/Crore words if present in text
  let multiplier = 1;
  if (/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b/i.test(str)) {
    const match = str.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b/i);
    if (match) {
      numStr = match[1];
      multiplier = 100000;
    }
  } else if (/(\d+(?:\.\d+)?)\s*(?:crore|cr)\b/i.test(str)) {
    const match = str.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr)\b/i);
    if (match) {
      numStr = match[1];
      multiplier = 10000000;
    }
  }

  const parsed = parseFloat(numStr);
  const finalAmount = isNaN(parsed) ? 0 : parsed * multiplier;

  return {
    currency: detected,
    cleanedAmount: finalAmount,
    confidence,
  };
}

/**
 * Formats a financial amount in Indian grouping:
 * e.g. 1250000.50 -> "12,50,000.50"
 */
export function formatIndianGrouping(amount: number, decimals: number = 2): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  if (integerPart.length <= 3) {
    const formatted = integerPart + (decimalPart ? `.${decimalPart}` : '');
    return isNegative ? `-${formatted}` : formatted;
  }

  // Last 3 digits
  const lastThree = integerPart.substring(integerPart.length - 3);
  const remaining = integerPart.substring(0, integerPart.length - 3);
  
  // Group in pairs of 2 from right to left
  const groupedPairs = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const formatted = `${groupedPairs},${lastThree}${decimalPart ? `.${decimalPart}` : ''}`;

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Human-readable abbreviation for large values (e.g. ₹12.5 L, ₹1.2 Cr, $4.5M)
 */
export function formatHumanReadableScale(
  amount: number, 
  currency: SupportedCurrency = 'USD', 
  locale: NumberingLocale = 'intl'
): string {
  const meta = CURRENCY_REGISTRY[currency] || CURRENCY_REGISTRY.USD;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (locale === 'indian' || currency === 'INR') {
    if (abs >= 10000000) { // 1 Crore
      const cr = (abs / 10000000).toFixed(2);
      return `${sign}${meta.symbol}${cr} Cr`;
    }
    if (abs >= 100000) { // 1 Lakh
      const lk = (abs / 100000).toFixed(2);
      return `${sign}${meta.symbol}${lk} L`;
    }
    return formatMoney(amount, currency, 'indian');
  }

  // International M/B scale
  if (abs >= 1000000000) {
    return `${sign}${meta.symbol}${(abs / 1000000000).toFixed(2)}B`;
  }
  if (abs >= 1000000) {
    return `${sign}${meta.symbol}${(abs / 1000000).toFixed(2)}M`;
  }
  if (abs >= 1000) {
    return `${sign}${meta.symbol}${(abs / 1000).toFixed(1)}K`;
  }

  return formatMoney(amount, currency, 'intl');
}

/**
 * Universal Currency & Money Formatter
 */
export function formatMoney(
  amount: number,
  currency: SupportedCurrency = 'USD',
  locale: NumberingLocale = 'intl'
): string {
  const meta = CURRENCY_REGISTRY[currency] || CURRENCY_REGISTRY.USD;
  const decimals = meta.decimals;

  if (locale === 'indian' || (currency === 'INR' && locale !== 'intl')) {
    const grouped = formatIndianGrouping(amount, decimals);
    return `${meta.symbol}${grouped}`;
  }

  // Standard International formatting
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const sign = amount < 0 ? '-' : '';
  return `${sign}${meta.symbol}${formatted}`;
}
