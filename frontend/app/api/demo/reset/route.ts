import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json({
    status: 'success',
    message: 'Demo state reset successfully.',
    timestamp: new Date().toISOString(),
  });
}
