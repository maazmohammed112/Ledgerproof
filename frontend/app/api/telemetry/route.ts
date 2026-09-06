import { NextResponse } from 'next/server';
import { initNeatlogs } from '@/app/lib/telemetry';
import * as neatlogs from 'neatlogs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const ready = initNeatlogs();

    if (!ready) {
      return NextResponse.json({
        success: true,
        recorded: false,
        reason: 'Neatlogs key not configured or initialized',
      });
    }

    const {
      workflowName = 'ledgerproof-finance-close',
      action = 'span',
      spanName = 'custom_finance_span',
      kind = 'TOOL',
      metadata = {},
      input = null,
      output = null,
    } = payload;

    // Send single trace or span safely
    await neatlogs.span(
      {
        name: spanName,
        kind: kind as any,
        description: metadata.description || 'Client-triggered finance step',
      },
      async () => {
        return {
          ...metadata,
          input,
          output,
          timestamp: new Date().toISOString(),
        };
      }
    );

    await neatlogs.flush();

    return NextResponse.json({
      success: true,
      recorded: true,
      span: spanName,
    });
  } catch (error) {
    console.error('[Telemetry API] Error recording trace:', error);
    // Never fail client
    return NextResponse.json({
      success: true,
      recorded: false,
      error: String(error),
    });
  }
}

export async function GET() {
  const hasKey = Boolean(process.env.NEATLOGS_API_KEY);
  return NextResponse.json({
    status: 'healthy',
    service: 'LedgerProof Telemetry Proxy',
    neatlogs_configured: hasKey,
  });
}
