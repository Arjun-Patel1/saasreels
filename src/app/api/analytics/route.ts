import { NextRequest, NextResponse } from 'next/server';
import { analyticsStore } from '@/lib/server/analyticsStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brandName = searchParams.get('brand') || undefined;
  const campaign = searchParams.get('campaign') || undefined;

  const data = analyticsStore.getAggregations(brandName, campaign);

  return NextResponse.json({
    success: true,
    data,
  });
}
