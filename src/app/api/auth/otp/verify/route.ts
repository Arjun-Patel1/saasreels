import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/server/otpService';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, code, userId, type = 'email' } = body;

    if (!identifier || !code) {
      return NextResponse.json(
        { success: false, error: 'Identifier and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const verification = otpService.verifyOtp(identifier, code);
    if (!verification.success) {
      return NextResponse.json({ success: false, error: verification.error }, { status: 400 });
    }

    // If userId provided or user found by identifier, mark verified in userDb
    let updatedUser;
    if (userId) {
      updatedUser = userDb.markContactVerified(userId, type);
    } else {
      const existing = userDb.findUserByIdentifier(identifier);
      if (existing) {
        updatedUser = userDb.markContactVerified(existing.id, type);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully!`,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Verification error' }, { status: 500 });
  }
}
