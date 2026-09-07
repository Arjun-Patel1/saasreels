import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, tier, brandName, brandUrl } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email address, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const result = userDb.createUser({
      name,
      email,
      phone: phone || '',
      password,
      tier: tier || 'free',
      brandName,
      brandUrl,
    });

    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Account created successfully.',
    });

    // Set simple session cookie
    response.cookies.set('saasreels_uid', result.user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Registration failed' }, { status: 500 });
  }
}
