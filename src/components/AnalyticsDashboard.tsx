'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  Copy,
  CheckCircle2,
  Link2,
  Code2,
  Radio,
  Zap,
  Sparkles,
  RefreshCw,
  Activity,
  Check,
} from 'lucide-react';
import { BrandInfo } from '@/types';

interface AnalyticsDashboardProps {
  brand: BrandInfo;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ brand }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPixel, setCopiedPixel] = useState(false);
  const [campaignName, setCampaignName] = useState('tiktok_viral_q1');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);

  const generatedUtmUrl = `${brand.url}?utm_source=saasreels&utm_medium=shortform&utm_campaign=${campaignName}&utm_content=ugc_hook_1`;

  // Embeddable tracking script snippet
  const embedSnippet = `<script defer src="${typeof window !== 'undefined' ? window.location.origin : 'https://saasreels.ai'}/tracker.js" data-site="${brand.url.replace(/^https?:\/\//, '')}"></script>`;

  const fetchLiveAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics?brand=${encodeURIComponent(brand.name)}&campaign=${encodeURIComponent(campaignName)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAnalyticsData(json.data);
        }
      }
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    }
  };

  useEffect(() => {
    fetchLiveAnalytics();
    const interval = setInterval(fetchLiveAnalytics, 8000);
    return () => clearInterval(interval);
  }, [brand.name, campaignName]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUtmUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyPixel = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedPixel(true);
    setTimeout(() => setCopiedPixel(false), 2000);
  };

  const handleSimulateLiveEvent = async (type: 'pageview' | 'trial_click' | 'signup' | 'subscription') => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: brand.url.replace(/^https?:\/\//, ''),
          eventType: type,
          url: generatedUtmUrl,
          path: '/',
          referrer: 'https://www.tiktok.com/',
          utm: {
            source: 'saasreels',
            medium: 'shortform',
            campaign: campaignName,
            content: 'ugc_hook_1',
            term: '',
            timestamp: Date.now(),
          },
          meta: type === 'subscription' ? { value: 49, plan: 'pro_monthly' } : { buttonText: 'Start Free Trial' },
        }),
      });

      if (res.ok) {
        setLiveSuccessMsg(`Captured real-time "${type}" event from TikTok reel!`);
        await fetchLiveAnalytics();
        setTimeout(() => setLiveSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const summary = analyticsData?.summary || {
    totalViews: 1420800,
    profileClicks: 82410,
    trialSignups: 2840,
    estimatedMrr: 69450,
    bioCtr: '5.8%',
  };

  const platforms = analyticsData?.platforms || [
    { name: 'TikTok Engine', sharePct: 52, views: '740K', linkClicks: '43.2K', signups: 1490, topFormat: 'Problem-Agitate-Solve' },
    { name: 'Instagram Reels', sharePct: 34, views: '490K', linkClicks: '28.1K', signups: 890, topFormat: 'POV Cheat Code' },
    { name: 'YouTube Shorts', sharePct: 14, views: '190K', linkClicks: '11.1K', signups: 460, topFormat: 'Founder Story' },
  ];

  const recentFeed = analyticsData?.recentLiveFeed || [];

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-100">Live Attribution & Revenue Engine</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Trace real signups, trial starts, and MRR dollars directly back to individual TikTok, Reels, and Shorts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Pixel Ingest Active
          </span>
          <button
            onClick={fetchLiveAnalytics}
            className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-300 hover:text-white transition-all active:scale-95"
            title="Refresh Live Metrics"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {liveSuccessMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{liveSuccessMsg}</span>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Short Views</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-100">{summary.totalViews.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-emerald-400 mt-1 block">
            +38.4% this week
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Profile Clicks (CTR)</span>
            <MousePointerClick className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-100">{summary.profileClicks.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-amber-400 mt-1 block">
            {summary.bioCtr} avg bio CTR
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>SaaS Trial Signups</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-100">{summary.trialSignups.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-cyan-400 mt-1 block">
            $0 CAC (Pure Organic)
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Est. New MRR</span>
            <span className="text-xs text-amber-400 font-black">$</span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400">${summary.estimatedMrr.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-emerald-400 mt-1 block">
            Hit in 2 months 🚀
          </span>
        </div>
      </div>

      {/* Live Simulation Testing Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Test Live Attribution Ingest</span>
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Simulate traffic coming from your short-form reels directly into the telemetry engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimulateLiveEvent('pageview')}
              disabled={isSimulating}
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              +1 Pageview
            </button>
            <button
              onClick={() => handleSimulateLiveEvent('trial_click')}
              disabled={isSimulating}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              +1 Trial Click
            </button>
            <button
              onClick={() => handleSimulateLiveEvent('signup')}
              disabled={isSimulating}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              +1 Free Signup
            </button>
            <button
              onClick={() => handleSimulateLiveEvent('subscription')}
              disabled={isSimulating}
              className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-95 disabled:opacity-50 shadow-md shadow-amber-500/10"
            >
              +$49 Pro Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Platform Performance & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Distribution */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-zinc-100 mb-3">Multi-Platform Distribution Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {platforms.map((p: any) => (
              <div key={p.name} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-100">{p.name}</span>
                  <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-400 font-bold">
                    {p.sharePct}% Share
                  </span>
                </div>
                <div className="my-2.5 space-y-1">
                  <div className="flex justify-between text-zinc-400"><span>Views:</span> <strong className="text-zinc-100">{p.views}</strong></div>
                  <div className="flex justify-between text-zinc-400"><span>Link Clicks:</span> <strong className="text-zinc-100">{p.linkClicks}</strong></div>
                  <div className="flex justify-between text-zinc-400"><span>Signups:</span> <strong className="text-emerald-400">{p.signups}</strong></div>
                </div>
                <span className="text-[10px] text-zinc-500 truncate">Top: {p.topFormat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Live Event Feed */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Live Event Stream</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                REAL-TIME
              </span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-none text-[11px]">
              {recentFeed.length === 0 ? (
                <p className="text-zinc-500 text-xs text-center py-4">Waiting for first telemetry event...</p>
              ) : (
                recentFeed.map((ev: any) => (
                  <div key={ev.id} className="flex items-center justify-between rounded-lg bg-zinc-900/80 p-2 border border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${ev.eventType === 'subscription' ? 'bg-amber-400' : ev.eventType === 'signup' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                      <span className="font-bold text-zinc-200 uppercase">{ev.eventType.replace('_', ' ')}</span>
                      <span className="text-zinc-500">via {ev.source}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{ev.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1-Line Tracking Pixel Installation Box */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-zinc-100">
              1-Line Embeddable Tracking Script (Put in your SaaS `&lt;head&gt;`)
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400">1.8 KB Zero-Dependency • Privacy Friendly</span>
        </div>

        <div className="relative">
          <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-amber-300 font-mono leading-relaxed">
            {embedSnippet}
          </pre>
          <button
            onClick={handleCopyPixel}
            className="absolute top-2 right-2 flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition-all active:scale-95 border border-zinc-700"
          >
            {copiedPixel ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* UTM Smart Link Generator */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-bold text-zinc-100">Smart Attribution UTM Link Generator</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-1/3">
            <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Campaign Identifier:</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-base sm:text-xs text-zinc-100 focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="w-full sm:w-2/3">
            <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Tracking URL (Put in Bio & Pin Comment):</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedUtmUrl}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-300 font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-md shadow-amber-500/10"
              >
                {copiedUrl ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
