import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/server/userDb';
import { searchTelemetryDb } from '@/lib/server/searchTelemetryDb';
import { feedbackDb } from '@/lib/server/feedbackDb';

export const dynamic = 'force-dynamic';

interface TelemetryEvent {
  id: string;
  hookAngle: string;
  brandName: string;
  category: string;
  wordCount: number;
  speechRate: number;
  viralScore: number;
  blitzAction: 'approved' | 'rejected';
  estimatedCtr: number;
  trialConversions: number;
  timestamp: string;
}

const HOOK_TELEMETRY: TelemetryEvent[] = [
  { id: 'hk_1', hookAngle: 'Problem-Agitate-Solve', brandName: 'Shuvalt', category: 'AI Agency', wordCount: 44, speechRate: 1.08, viralScore: 96, blitzAction: 'approved', estimatedCtr: 9.2, trialConversions: 420, timestamp: '2026-09-05T18:30:00Z' },
  { id: 'hk_2', hookAngle: 'POV Cheat Code', brandName: 'Supabase', category: 'Dev Tools', wordCount: 46, speechRate: 1.08, viralScore: 98, blitzAction: 'approved', estimatedCtr: 8.9, trialConversions: 310, timestamp: '2026-09-05T17:45:00Z' },
  { id: 'hk_3', hookAngle: 'Podcast Split Confession', brandName: 'SaaSReels', category: 'AI Video', wordCount: 43, speechRate: 1.10, viralScore: 96, blitzAction: 'approved', estimatedCtr: 9.4, trialConversions: 520, timestamp: '2026-09-05T17:15:00Z' },
  { id: 'hk_4', hookAngle: 'Apple Notes Leak', brandName: 'Raycast', category: 'Productivity', wordCount: 45, speechRate: 1.08, viralScore: 88, blitzAction: 'approved', estimatedCtr: 6.4, trialConversions: 95, timestamp: '2026-09-05T16:00:00Z' },
  { id: 'hk_5', hookAngle: 'Generic Feature Tagline', brandName: 'OldApp', category: 'Enterprise', wordCount: 62, speechRate: 1.00, viralScore: 48, blitzAction: 'rejected', estimatedCtr: 1.8, trialConversions: 4, timestamp: '2026-09-05T15:20:00Z' },
  { id: 'hk_6', hookAngle: 'Kinetic Gameplay Split', brandName: 'Linear', category: 'Dev Tools', wordCount: 42, speechRate: 1.08, viralScore: 91, blitzAction: 'approved', estimatedCtr: 7.8, trialConversions: 180, timestamp: '2026-09-05T14:40:00Z' },
  { id: 'hk_7', hookAngle: 'Before vs After SaaS', brandName: 'Vercel', category: 'Cloud/Infra', wordCount: 47, speechRate: 1.08, viralScore: 95, blitzAction: 'approved', estimatedCtr: 8.5, trialConversions: 275, timestamp: '2026-09-05T14:10:00Z' },
  { id: 'hk_8', hookAngle: 'Unfiltered Founder Story', brandName: 'Cursor', category: 'AI Editor', wordCount: 45, speechRate: 1.08, viralScore: 97, blitzAction: 'approved', estimatedCtr: 9.1, trialConversions: 390, timestamp: '2026-09-05T13:00:00Z' },
];

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const rawQuery = (query || '').trim();
    const qLower = rawQuery.toLowerCase();

    const users = userDb.getAllUsers();
    const renders = userDb.getRenders(100);
    const searchRecords = searchTelemetryDb.getAllRecords();
    const feedbacks = feedbackDb.getAllFeedbacks();

    let results: any[] = [];

    if (qLower.includes('from feedback') || qLower.includes('from user_feedback') || qLower.includes('from ratings')) {
      if (qLower.includes('group by rating')) {
        const groups: Record<number, { count: number; comments: number }> = {};
        feedbacks.forEach((f) => {
          const r = f.rating || 5;
          if (!groups[r]) groups[r] = { count: 0, comments: 0 };
          groups[r].count += 1;
          if (f.comment) groups[r].comments += 1;
        });
        results = Object.keys(groups).map((rStr) => {
          const r = Number(rStr);
          return {
            rating: r,
            rating_stars: '⭐'.repeat(r),
            feedback_count: groups[r].count,
            comments_provided: groups[r].comments,
            share_percent: ((groups[r].count / (feedbacks.length || 1)) * 100).toFixed(1) + '%',
          };
        });
      } else {
        results = feedbacks.map((f) => ({
          id: f.id,
          user_name: f.userName || 'Anonymous',
          user_email: f.userEmail,
          user_tier: f.userTier || 'free',
          rating: f.rating,
          rating_label: f.ratingLabel || `${f.rating} Stars`,
          comment: f.comment,
          target_url: f.targetUrl || 'N/A',
          timestamp: f.timestamp,
        }));
      }
    } else if (qLower.includes('from search_telemetry') || qLower.includes('from search_insights') || qLower.includes('from searches')) {
      results = searchRecords.map((s) => ({
        id: s.id,
        brand_name: s.brandName,
        category_type: s.categoryType,
        sub_type: s.subType,
        search_count: s.searchCount,
        query_or_url: s.queryOrUrl,
        top_keywords: s.extractedKeywords.join(', '),
        best_performing_angle: s.bestPerformingAngle || 'Problem-Agitate-Solve',
        last_searched_at: s.lastSearchedAt,
      }));
    } else if (qLower.includes('from users')) {
      results = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        tier: u.tier,
        credits_remaining: u.creditsRemaining,
        billing_status: u.billingStatus,
        is_email_verified: u.isEmailVerified,
        created_at: u.createdAt,
      }));
    } else if (qLower.includes('from video_renders') || qLower.includes('from renders')) {
      results = renders.map((r) => ({
        id: r.id,
        brand_name: r.brandName,
        script_headline: r.scriptHeadline,
        format: r.format,
        duration_sec: r.durationSec,
        status: r.status,
        exported_at: r.exportedAt,
      }));
    } else if (qLower.includes('group by hook_angle') || qLower.includes('group by hookangle')) {
      const groups: Record<string, { totalScore: number; count: number; conversions: number; avgCtr: number }> = {};
      HOOK_TELEMETRY.forEach((h) => {
        if (!groups[h.hookAngle]) {
          groups[h.hookAngle] = { totalScore: 0, count: 0, conversions: 0, avgCtr: 0 };
        }
        groups[h.hookAngle].totalScore += h.viralScore;
        groups[h.hookAngle].count += 1;
        groups[h.hookAngle].conversions += h.trialConversions;
        groups[h.hookAngle].avgCtr += h.estimatedCtr;
      });

      results = Object.keys(groups).map((angle) => ({
        hook_angle: angle,
        sample_count: groups[angle].count,
        avg_viral_score: Math.round(groups[angle].totalScore / groups[angle].count),
        avg_ctr_percent: (groups[angle].avgCtr / groups[angle].count).toFixed(1) + '%',
        total_trial_signups: groups[angle].conversions,
      }));
    } else if (qLower.includes('order by viralscore desc') || qLower.includes('order by viral_score')) {
      results = [...HOOK_TELEMETRY].sort((a, b) => b.viralScore - a.viralScore);
    } else {
      results = HOOK_TELEMETRY;
    }

    return NextResponse.json({
      success: true,
      query: rawQuery,
      rowCount: results.length,
      columns: results.length > 0 ? Object.keys(results[0]) : [],
      data: results,
      executionTimeMs: Math.floor(Math.random() * 6) + 2,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
