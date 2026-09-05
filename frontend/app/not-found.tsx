'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="max-w-md w-full bg-bg-card p-8 rounded-2xl border border-border-subtle shadow-card space-y-6">
        
        {/* Logo Mark */}
        <div className="w-12 h-12 rounded-xl bg-[#0F172A] p-2 mx-auto flex items-center justify-center shadow-subtle border border-slate-800">
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <path d="M12 14H30C32.2 14 34 15.8 34 18V18" stroke="#4F46E5" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M14 14V34C14 35.1 14.9 36 16 36H36" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21V29C21 30.1 21.9 31 23 31H34" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M28 16L32 20L40 12" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-accent font-semibold uppercase tracking-wider">Error 404 &bull; Page Not Found</span>
          <h1 className="font-serif text-3xl text-text-primary font-medium">Out of Audit Scope</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            The requested resource is not part of the active LedgerProof enterprise ledger or session routes.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover active:scale-[0.98] transition-all shadow-subtle"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-bg-subtle text-text-primary border border-border-subtle text-xs font-medium hover:bg-white active:scale-[0.98] transition-all"
          >
            <Home className="w-4 h-4 text-text-muted" />
            <span>Home</span>
          </Link>
        </div>

        <div className="border-t border-border-subtle pt-4 text-[11px] text-text-muted">
          <span>LedgerProof Autonomous Finance Control Layer &bull; Zero Fabricated Data</span>
        </div>
      </div>
    </div>
  );
}
