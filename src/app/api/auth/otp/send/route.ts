import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/server/otpService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, type = 'email' } = body;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email address or phone number is required.' },
        { status: 400 }
      );
    }

    const { code, expiresAt, message } = otpService.generateOtp(identifier, type);

    // In a production environment with real Twilio / SendGrid keys, dispatch email/SMS.
    // For local and zero-cost operation, we provide the code in development mode log and message.
    console.log(`[SaaSReels Security] OTP dispatched to ${identifier} (${type}): ${code}`);

    return NextResponse.json({
      success: true,
      message,
      expiresAt,
      // Dev helper for seamless instant verification
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to send OTP' }, { status: 429 });
  }
}
