import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'usr_founder_1';

  const exportData = userDb.exportUserData(userId);
  if (!exportData) {
    // Return sample export if default
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userId,
          name: 'Alex Vance',
          email: 'founder@saasreels.ai',
          phone: '+1 (555) 019-2834',
          tier: 'pro',
          creditsRemaining: 42,
          totalCredits: 50,
          isEmailVerified: true,
          isPhoneVerified: true,
          billingStatus: 'active',
        },
        renders: userDb.getRenders(10),
        exportedAt: new Date().toISOString(),
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: exportData,
  });
}
