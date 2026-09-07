import { NextRequest, NextResponse } from 'next/server';
import { analyticsStore } from '@/lib/server/analyticsStore';

export const dynamic = 'force-dynamic';

// CORS response helper so customer landing pages can send telemetry to SaaSReels
function corsResponse(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return corsResponse({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    let payload;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const text = await req.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }

    const { siteId, eventType, url, path, referrer, utm, meta, timestamp, screen } = payload;

    const recorded = analyticsStore.recordEvent({
      siteId: siteId || 'unknown_site',
      eventType: eventType || 'pageview',
      url: url || '',
      path: path || '/',
      referrer: referrer || '',
      utm: utm || {
        source: 'direct',
        medium: 'unknown',
        campaign: 'none',
        content: '',
        term: '',
        timestamp: Date.now(),
      },
      meta: meta || {},
      timestamp: timestamp || new Date().toISOString(),
      screen: screen || '',
    });

    return corsResponse({
      success: true,
      eventId: recorded.id,
      attributionLogged: Boolean(recorded.utm?.source),
    });
  } catch (error: any) {
    return corsResponse({ success: false, error: error?.message || 'Failed to ingest event' }, 400);
  }
}
