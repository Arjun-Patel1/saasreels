import { NextRequest, NextResponse } from 'next/server';
import { userDb, sanitizeUser } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const uid = req.cookies.get('saasreels_uid')?.value;
    if (!uid) {
      return NextResponse.json({ success: false, user: null });
    }

    const user = userDb.findUserById(uid);
    if (!user) {
      return NextResponse.json({ success: false, user: null });
    }

    return NextResponse.json({ success: true, user: sanitizeUser(user) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
