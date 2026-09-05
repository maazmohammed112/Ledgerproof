'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary px-4 text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-status-blocked">System Exception</span>
      <h1 className="font-serif text-3xl mt-2 mb-3">Reconciliation Engine Error</h1>
      <p className="text-xs text-text-secondary max-w-md mb-6">
        An unexpected pipeline exception occurred: {error?.message || 'Processing fault'}. All transaction states remain safely committed.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-text-primary text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
      >
        Retry Action
      </button>
    </div>
  );
}
