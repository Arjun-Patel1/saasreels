import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Reset token and new password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const result = userDb.resetPasswordWithToken(token, password);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in with your new password.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Password reset failed' }, { status: 500 });
  }
}
