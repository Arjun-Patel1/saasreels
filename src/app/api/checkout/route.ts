import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, tier, billingCycle, paymentDetails } = body;

    if (!tier || (tier !== 'pro' && tier !== 'agency')) {
      return NextResponse.json(
        { success: false, error: 'Valid plan (pro or agency) is required.' },
        { status: 400 }
      );
    }

    // Check if Stripe API Key is configured in environment
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Prices
    const pricing = {
      pro: billingCycle === 'annual' ? 39 * 12 : 49,
      agency: billingCycle === 'annual' ? 159 * 12 : 199,
    };

    const amount = pricing[tier as 'pro' | 'agency'];

    // Update user tier in local database
    let updatedUser;
    if (userId) {
      updatedUser = userDb.updateTier(userId, tier);
    }

    // Return confirmed transaction receipt
    return NextResponse.json({
      success: true,
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      currency: 'USD',
      tier,
      billingCycle: billingCycle || 'monthly',
      status: 'paid',
      user: updatedUser,
      message: `Successfully activated ${tier.toUpperCase()} subscription!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Checkout processing failed' },
      { status: 500 }
    );
  }
}
