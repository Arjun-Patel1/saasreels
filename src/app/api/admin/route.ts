import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';
import { feedbackDb } from '@/lib/server/feedbackDb';
import { quotaAlertService } from '@/lib/server/quotaAlertService';
import { groqKeyPool } from '@/lib/server/groqKeyPool';

export const dynamic = 'force-dynamic';

export async function GET() {
  const telemetry = userDb.getSystemTelemetry();
  const users = userDb.getAllUsers();
  const renders = userDb.getRenders(25);
  const feedbacks = feedbackDb.getAllFeedbacks();
  const feedbackStats = feedbackDb.getFeedbackStats();
  const quotaStatus = quotaAlertService.getQuotaStatus();
  const keyPoolStatus = groqKeyPool.getPoolStatus();

  return NextResponse.json({
    success: true,
    telemetry,
    users,
    renders,
    feedbacks,
    feedbackStats,
    quotaStatus,
    keyPoolStatus,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, tier, credits, feedbackId } = body;

    if (action === 'update_tier') {
      const updated = userDb.updateTier(userId, tier);
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'grant_credits') {
      const updated = userDb.grantCredits(userId, Number(credits) || 10);
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'delete_user') {
      const deleted = userDb.deleteUser(userId);
      return NextResponse.json({ success: deleted });
    }

    if (action === 'delete_feedback') {
      const deleted = feedbackDb.deleteFeedback(feedbackId);
      return NextResponse.json({ success: deleted });
    }

    return NextResponse.json({ success: false, error: 'Unknown admin action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
