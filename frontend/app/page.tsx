'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LandingPageView } from './components/LandingPageView';
import { DecisionTraceModal } from './components/DecisionTraceModal';
import { HumanReviewModal } from './components/HumanReviewModal';
import { Transaction, DecisionTrace } from './lib/types';
import { store } from './lib/store';

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTrace, setActiveTrace] = useState<DecisionTrace | null>(null);
  const [activeTraceTx, setActiveTraceTx] = useState<Transaction | null>(null);
  const [reviewTx, setReviewTx] = useState<Transaction | null>(null);

  // If someone navigated to /?tab=... or /?tour=true, redirect cleanly to /dashboard
  useEffect(() => {
    const tab = searchParams.get('tab');
    const tour = searchParams.get('tour');
    if (tab || tour) {
      const target = tour ? `/dashboard?tab=${tab || 'command-center'}&tour=true` : `/dashboard?tab=${tab}`;
      router.replace(target);
    }
  }, [searchParams, router]);

  const handleOpenDecisionTrace = (txId: string) => {
    const trace = store.getTrace(txId);
    const tx = store.getTransaction(txId);
    setActiveTrace(trace);
    setActiveTraceTx(tx || null);
  };

  const handleReviewAction = (
    txId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'EDIT_RESOLUTION',
    notes: string,
    editedGl?: string
  ) => {
    const newStatus = action === 'REJECT' ? 'BLOCKED' : action === 'REQUEST_EVIDENCE' ? 'HUMAN_REVIEW_REQUIRED' : 'RESOLVED';
    store.updateTransaction(txId, {
      status: newStatus,
      notes: `Controller Sign-Off: ${action} — ${notes}`,
      gl_account: editedGl || store.getTransaction(txId)?.gl_account || '6000',
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary antialiased selection:bg-accent-light selection:text-accent flex flex-col">
      <LandingPageView
        onLaunchCommandCenter={() => router.push('/dashboard')}
        onOpenDecisionTrace={handleOpenDecisionTrace}
        onStartGuidedTour={() => router.push('/dashboard?tour=true')}
      />

      {/* Decision Trace Modal */}
      {activeTrace && activeTraceTx && (
        <DecisionTraceModal
          trace={activeTrace}
          transaction={activeTraceTx}
          onClose={() => {
            setActiveTrace(null);
            setActiveTraceTx(null);
          }}
          onOpenReviewModal={(tx) => setReviewTx(tx)}
        />
      )}

      {/* Human Review Modal */}
      {reviewTx && (
        <HumanReviewModal
          transaction={reviewTx}
          onClose={() => setReviewTx(null)}
          onSubmitReview={handleReviewAction}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <LandingPageContent />
    </Suspense>
  );
}
