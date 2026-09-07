import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, email, tier } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Customer email required' }, { status: 400 });
    }

    const result = userDb.handlePaymentEvent({
      email,
      event: event || 'payment_success',
      tier: tier || 'pro',
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      user: result.user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
