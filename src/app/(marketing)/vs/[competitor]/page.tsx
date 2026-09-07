'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Check, X, Sparkles, ArrowRight, ShieldCheck, Flame, Zap, HelpCircle } from 'lucide-react';

export default function CompetitorComparisonPage() {
  const params = useParams();
  const competitorSlug = ((params?.competitor as string) || 'fastlane').toLowerCase();

  const competitorData: Record<
    string,
    {
      name: string;
      tagline: string;
      verdict: string;
      pricingComparison: string;
      matrix: { feature: string; saasreels: boolean | string; competitor: boolean | string }[];
    }
  > = {
    fastlane: {
      name: 'Fastlane',
      tagline: 'AI Marketing Clone',
      verdict: 'SaaSReels provides true mobile touch swiping, live UTM attribution pixel, and Submagic spring emojis that Fastlane lacks.',
      pricingComparison: 'Fastlane requires expensive upfront plans; SaaSReels offers a Free BYOK tier + $49/mo Pro.',
      matrix: [
        { feature: 'URL-to-Viral-Reel in 30 Seconds', saasreels: true, competitor: true },
        { feature: 'Submagic Springing Emoji Physics', saasreels: true, competitor: false },
        { feature: 'Arcads Handheld Camera Sway', saasreels: true, competitor: false },
        { feature: 'Tinder-Style Touch Blitz Swipe Approval', saasreels: true, competitor: 'Desktop only' },
        { feature: '1-Line Live UTM Attribution Pixel', saasreels: true, competitor: false },
        { feature: 'Free Bring-Your-Own-Key (BYOK) Tier', saasreels: true, competitor: false },
        { feature: '1080×1920 60FPS MP4 Export', saasreels: true, competitor: true },
        { feature: '5 Psychological Direct-Response Angles', saasreels: true, competitor: 'Generic scripts' },
      ],
    },
    arcads: {
      name: 'Arcads',
      tagline: 'AI UGC Avatar Platform',
      verdict: 'Arcads is great for generic avatars, but lacks automated SaaS URL scraping, screen mockup layers, and live attribution.',
      pricingComparison: 'Arcads starts at $110+/mo with strict minute limits; SaaSReels starts free or $49/mo for 50 reels.',
      matrix: [
        { feature: 'Instant SaaS URL Web Scraper', saasreels: true, competitor: false },
        { feature: 'Screen Mockup + Creator Split Layout', saasreels: true, competitor: false },
        { feature: 'Simulated Handheld Camera Drift', saasreels: true, competitor: true },
        { feature: 'Live Trending Reels Radar', saasreels: true, competitor: false },
        { feature: '1-Line Live Attribution Tracking', saasreels: true, competitor: false },
        { feature: 'Price per Video Export', saasreels: '< $0.98 / reel', competitor: '$5.50 / reel' },
      ],
    },
    submagic: {
      name: 'Submagic',
      tagline: 'Short-Form Caption Editor',
      verdict: 'Submagic only captions existing video recordings. SaaSReels generates the entire script, avatar, screen mockup, and video from just a URL.',
      pricingComparison: 'Submagic charges $50/mo just for subtitles; SaaSReels gives you complete AI video synthesis for $49/mo.',
      matrix: [
        { feature: 'Full Video Generation from URL', saasreels: true, competitor: false },
        { feature: 'Keyword-Triggered Emoji Badges', saasreels: true, competitor: true },
        { feature: 'AI Voiceover & Script Synthesis', saasreels: true, competitor: false },
        { feature: 'Blitz Mode Mobile Swiping', saasreels: true, competitor: false },
        { feature: 'Free BYOK Personal Key Tier', saasreels: true, competitor: false },
      ],
    },
    cliptalk: {
      name: 'Cliptalk',
      tagline: 'Procedural Video Tool',
      verdict: 'SaaSReels focuses specifically on high-converting SaaS & DevTools marketing with live screen demos and direct attribution.',
      pricingComparison: 'SaaSReels offers superior direct-response copywriting angles and mobile Blitz approval.',
      matrix: [
        { feature: 'SaaS-Specific 5 Viral Angles', saasreels: true, competitor: false },
        { feature: 'Procedural Satisfying Kinetic Loops', saasreels: true, competitor: true },
        { feature: 'Live Screen Ingestion & Frame Mockup', saasreels: true, competitor: false },
        { feature: 'Real-Time Telemetry & MRR Tracking', saasreels: true, competitor: false },
      ],
    },
  };

  const comp = competitorData[competitorSlug] || competitorData.fastlane;

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Detailed Competitor Comparison</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight">
            SaaSReels vs. {comp.name}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            {comp.verdict}
          </p>

          {/* Quick Competitor Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {Object.keys(competitorData).map((slug) => (
              <Link
                key={slug}
                href={`/vs/${slug}`}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  slug === competitorSlug
                    ? 'bg-amber-400 text-zinc-950 shadow-md'
                    : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                vs {competitorData[slug].name}
              </Link>
            ))}
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80">
                <th className="py-4 px-6 font-bold text-zinc-300">Feature / Capability</th>
                <th className="py-4 px-6 font-black text-amber-400 text-center bg-amber-500/5">SaaSReels</th>
                <th className="py-4 px-6 font-bold text-zinc-400 text-center">{comp.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {comp.matrix.map((row) => (
                <tr key={row.feature} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-zinc-200">{row.feature}</td>
                  <td className="py-3.5 px-6 text-center bg-amber-500/5 font-bold">
                    {typeof row.saasreels === 'boolean' ? (
                      row.saasreels ? (
                        <Check className="h-4 w-4 text-emerald-400 mx-auto stroke-[3]" />
                      ) : (
                        <X className="h-4 w-4 text-rose-400 mx-auto" />
                      )
                    ) : (
                      <span className="text-amber-400 font-extrabold">{row.saasreels}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-center text-zinc-400">
                    {typeof row.competitor === 'boolean' ? (
                      row.competitor ? (
                        <Check className="h-4 w-4 text-zinc-400 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-rose-500/80 mx-auto" />
                      )
                    ) : (
                      <span className="text-zinc-400 font-medium">{row.competitor}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Comparison Note */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Pricing Advantage</h3>
            <p className="text-xs text-zinc-400 mt-1">{comp.pricingComparison}</p>
          </div>
          <Link
            href="/signup?plan=pro"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <span>Switch to SaaSReels</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
