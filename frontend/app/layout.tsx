import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LedgerProof — Self-Verifying Autonomous Finance System',
  description:
    'Track 2 Autonomous Office of the CFO. Investigates, resolves, and independently verifies financial exceptions before they touch your books.',
  keywords: [
    'Autonomous Finance',
    'AI Agents',
    'Financial Reconciliation',
    'Month-End Close',
    'Office of the CFO',
    'Independent Verification',
    'Audit Trail',
  ],
  authors: [{ name: 'LedgerProof Core Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-bg-primary">
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
