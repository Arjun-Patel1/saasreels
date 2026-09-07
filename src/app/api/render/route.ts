import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const renders = userDb.getRenders(50);
  return NextResponse.json({ success: true, renders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, brandName, scriptHeadline, format, durationSec, renderTimeMs } = body;

    const job = userDb.logRender({
      userId,
      brandName: brandName || 'SaaS Product',
      scriptHeadline: scriptHeadline || 'Viral Reel Demo',
      format: format || 'split_screen_demo',
      durationSec: durationSec || 15,
      status: 'completed',
      renderTimeMs: renderTimeMs || 1500,
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Render logging failed' }, { status: 500 });
  }
}
