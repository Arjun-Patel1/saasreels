import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body; // identifier can be email OR phone number

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Email or phone number, and password are required.' },
        { status: 400 }
      );
    }

    const result = userDb.authenticateUser(identifier, password);

    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Logged in successfully.',
    });

    response.cookies.set('saasreels_uid', result.user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Login failed' }, { status: 500 });
  }
}
