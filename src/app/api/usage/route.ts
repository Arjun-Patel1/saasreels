import { NextRequest, NextResponse } from 'next/server';
import { userDb, sanitizeUser } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const uid = req.cookies.get('saasreels_uid')?.value;
  if (!uid) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const user = userDb.findUserById(uid);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    tier: user.tier,
    creditsRemaining: user.creditsRemaining,
    totalCredits: user.totalCredits,
    isByok: user.isByok,
    hasCustomApiKey: Boolean(user.apiKey),
  });
}

export async function POST(req: NextRequest) {
  try {
    const uid = req.cookies.get('saasreels_uid')?.value;
    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId || uid;

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const result = userDb.consumeCredit(targetUserId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'No credits remaining. Upgrade to Pro or add your custom Groq API key.',
          creditsRemaining: 0,
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      success: true,
      creditsRemaining: result.creditsRemaining,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
