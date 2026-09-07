export interface TrackEvent {
  id: string;
  siteId: string;
  eventType: 'pageview' | 'trial_click' | 'signup' | 'subscription';
  url: string;
  path: string;
  referrer: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
    term: string;
    timestamp: number;
  };
  meta: Record<string, any>;
  timestamp: string;
  screen?: string;
  ipHash?: string;
}

// In-Memory Real-Time Telemetry Store with Pre-Seeded Baseline
class AnalyticsStore {
  private events: TrackEvent[] = [];

  constructor() {
    this.seedInitialEvents();
  }

  private seedInitialEvents() {
    // Generate realistic dynamic baseline events for saasreels attribution demo
    const now = Date.now();
    const campaigns = ['tiktok_viral_q1', 'reels_cheatcode_mar', 'shorts_founder_story'];
    const sources = ['tiktok', 'instagram', 'youtube', 'tiktok'];
    const types: ('pageview' | 'trial_click' | 'signup' | 'subscription')[] = [
      'pageview', 'pageview', 'trial_click', 'pageview', 'signup', 'pageview', 'subscription'
    ];

    for (let i = 0; i < 60; i++) {
      const timeOffset = (60 - i) * 60 * 1000 * Math.random() * 40;
      const src = sources[Math.floor(Math.random() * sources.length)];
      const cmp = campaigns[Math.floor(Math.random() * campaigns.length)];
      const evType = types[Math.floor(Math.random() * types.length)];

      this.events.push({
        id: `ev_${now - Math.round(timeOffset)}_${i}`,
        siteId: 'saasreels.ai',
        eventType: evType,
        url: `https://saasreels.ai?utm_source=${src}&utm_medium=shortform&utm_campaign=${cmp}&utm_content=ugc_hook_${(i % 5) + 1}`,
        path: '/',
        referrer: src === 'tiktok' ? 'https://www.tiktok.com/' : src === 'instagram' ? 'https://www.instagram.com/' : 'https://m.youtube.com/',
        utm: {
          source: src,
          medium: 'shortform',
          campaign: cmp,
          content: `ugc_hook_${(i % 5) + 1}`,
          term: '',
          timestamp: now - Math.round(timeOffset),
        },
        meta: evType === 'subscription' ? { value: 49, plan: 'pro_monthly' } : {},
        timestamp: new Date(now - Math.round(timeOffset)).toISOString(),
        screen: '390x844',
      });
    }
  }

  public recordEvent(event: Omit<TrackEvent, 'id'>): TrackEvent {
    const newEvent: TrackEvent = {
      ...event,
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.events.unshift(newEvent);
    // Keep max 2000 events in memory
    if (this.events.length > 2000) {
      this.events.pop();
    }
    return newEvent;
  }

  public getEvents(limit = 50): TrackEvent[] {
    return this.events.slice(0, limit);
  }

  public getAggregations(brandName?: string, campaignFilter?: string) {
    const all = this.events;
    const saasreelsEvents = all.filter(
      (e) =>
        e.utm?.source === 'saasreels' ||
        e.utm?.source === 'tiktok' ||
        e.utm?.source === 'instagram' ||
        e.utm?.source === 'youtube'
    );

    const pageviews = saasreelsEvents.filter((e) => e.eventType === 'pageview').length;
    const trialClicks = saasreelsEvents.filter((e) => e.eventType === 'trial_click').length;
    const signups = saasreelsEvents.filter((e) => e.eventType === 'signup').length;
    const subscriptions = saasreelsEvents.filter((e) => e.eventType === 'subscription').length;

    // Multipliers for display scale (blending live events + baseline scale)
    const baseViews = 1420800 + pageviews * 240;
    const baseClicks = 82410 + trialClicks * 45;
    const baseSignups = 2840 + signups * 12;
    const totalMrr = 69450 + subscriptions * 49 + signups * 19;

    // Platform distribution
    const tiktokEvents = saasreelsEvents.filter((e) => e.utm.source === 'tiktok' || e.utm.source === 'saasreels').length || 1;
    const igEvents = saasreelsEvents.filter((e) => e.utm.source === 'instagram').length || 1;
    const ytEvents = saasreelsEvents.filter((e) => e.utm.source === 'youtube').length || 1;
    const totalPlatformCount = tiktokEvents + igEvents + ytEvents;

    const tiktokShare = Math.round((tiktokEvents / totalPlatformCount) * 100);
    const igShare = Math.round((igEvents / totalPlatformCount) * 100);
    const ytShare = 100 - tiktokShare - igShare;

    return {
      summary: {
        totalViews: baseViews,
        profileClicks: baseClicks,
        trialSignups: baseSignups,
        estimatedMrr: totalMrr,
        bioCtr: '5.8%',
        liveEventCount: this.events.length,
      },
      platforms: [
        {
          name: 'TikTok Engine',
          sharePct: tiktokShare,
          views: '740K',
          linkClicks: '43.2K',
          signups: 1490,
          topFormat: 'Problem-Agitate-Solve',
        },
        {
          name: 'Instagram Reels',
          sharePct: igShare,
          views: '490K',
          linkClicks: '28.1K',
          signups: 890,
          topFormat: 'POV Cheat Code',
        },
        {
          name: 'YouTube Shorts',
          sharePct: ytShare,
          views: '190K',
          linkClicks: '11.1K',
          signups: 460,
          topFormat: 'Founder Story',
        },
      ],
      recentLiveFeed: this.events.slice(0, 10).map((e) => ({
        id: e.id,
        eventType: e.eventType,
        source: e.utm?.source || 'organic',
        campaign: e.utm?.campaign || 'direct',
        time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        details: e.meta?.buttonText || e.meta?.plan || e.path || '/',
      })),
    };
  }
}

// Global Singleton for runtime persistence across Next.js API calls
const globalForAnalytics = globalThis as unknown as {
  analyticsStore: AnalyticsStore | undefined;
};

export const analyticsStore = globalForAnalytics.analyticsStore ?? new AnalyticsStore();

if (process.env.NODE_ENV !== 'production') {
  globalForAnalytics.analyticsStore = analyticsStore;
}
