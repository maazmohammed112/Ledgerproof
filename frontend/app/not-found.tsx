import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary px-4 text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">404</span>
      <h1 className="font-serif text-3xl mt-2 mb-3">Page Not Found</h1>
      <p className="text-xs text-text-secondary max-w-md mb-6">
        The requested ledger route or audit report could not be found.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-text-primary text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
      >
        Return to Command Center
      </Link>
    </div>
  );
}
