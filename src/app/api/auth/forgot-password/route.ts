import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address is required.' }, { status: 400 });
    }

    const result = userDb.createPasswordResetToken(email);

    if (!result.success || !result.token) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    // In production, an email would be dispatched via Resend/Postmark/SendGrid.
    // For local & preview environments, we return the direct reset link so the user/tester can reset instantly.
    const resetUrl = `/reset-password?token=${result.token}`;

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetUrl,
      token: result.token,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Password reset request failed' }, { status: 500 });
  }
}
