import { NextRequest, NextResponse } from 'next/server';
import { feedbackDb } from '@/lib/server/feedbackDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, ratingLabel, comment, targetUrl, email, userId, userName, userTier } = body;

    if (!rating && !comment) {
      return NextResponse.json(
        { error: 'Please provide a rating or feedback message.' },
        { status: 400 }
      );
    }

    const trimmedComment = (comment || '').trim().slice(0, 1500);

    const feedbackEntry = feedbackDb.addFeedback({
      userId,
      userName,
      userEmail: email,
      userTier,
      rating,
      ratingLabel,
      comment: trimmedComment,
      targetUrl,
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    console.log('📣 [SaaSReels User Feedback Recorded]:', {
      id: feedbackEntry.id,
      rating: feedbackEntry.rating,
      userEmail: feedbackEntry.userEmail,
      userName: feedbackEntry.userName,
      commentLength: feedbackEntry.comment.length,
      timestamp: feedbackEntry.timestamp,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully. Thank you for helping shape SaaSReels!',
      id: feedbackEntry.id,
      feedback: feedbackEntry,
    });
  } catch (error: any) {
    console.error('Error handling feedback submission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record feedback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const feedbacks = feedbackDb.getAllFeedbacks();
    const stats = feedbackDb.getFeedbackStats();

    return NextResponse.json({
      success: true,
      total: feedbacks.length,
      stats,
      feedbacks,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      if (body.id) {
        const deleted = feedbackDb.deleteFeedback(body.id);
        return NextResponse.json({ success: deleted });
      }
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    const deleted = feedbackDb.deleteFeedback(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
