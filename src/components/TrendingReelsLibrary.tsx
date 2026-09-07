'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, TrendingUp, Play, ArrowRight, Video, Music2, Eye, RefreshCw, Radio, Hash } from 'lucide-react';
import { BrandInfo, TrendingReelTemplate, VideoStyleConfig } from '@/types';

interface TrendingReelsLibraryProps {
  brand: BrandInfo;
  onApplyTemplate: (template: any) => void;
  styleConfig: VideoStyleConfig;
}

export const TrendingReelsLibrary: React.FC<TrendingReelsLibraryProps> = ({
  brand,
  onApplyTemplate,
  styleConfig,
}) => {
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchLiveTrends();
  }, []);

  const fetchLiveTrends = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trending');
      if (res.ok) {
        const data = await res.json();
        if (data.trends) {
          setTrends(data.trends);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live trends:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const mapCategoryToFormat = (cat: string) => {
    switch (cat) {
      case 'podcast':
        return 'podcast_hook';
      case 'split_gameplay':
        return 'split_gameplay';
      case 'tweet_reveal':
        return 'tweet_reveal';
      case 'apple_notes':
        return 'apple_notes_confession';
      default:
        return 'split_screen_demo';
    }
  };

  const categories = [
    { id: 'all', label: '🔥 All FYP Radar' },
    { id: 'split_demo', label: '📱 AI UGC & Demos' },
    { id: 'podcast', label: '🎙️ Podcasts' },
    { id: 'split_gameplay', label: '🎮 Kinetic ASMR (4.2x)' },
    { id: 'tweet_reveal', label: '🥊 Roasts & Tweets' },
  ];

  const filteredTrends = selectedCategory === 'all'
    ? trends
    : trends.filter((t) => t.category === selectedCategory || (selectedCategory === 'split_demo' && (t.category === 'split_demo' || t.category === 'apple_notes')));

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-100">Live Trending Reels & TikTok Radar</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time feed of live viral TikToks, Instagram Reels, and Shorts dominating FYP algorithms right now.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-[11px] text-zinc-400">Updated: {lastUpdated}</span>
          <button
            onClick={fetchLiveTrends}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Scan Live Trends</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              selectedCategory === c.id
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid of Live Trending Reels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrends.map((trend) => {
          const mappedFormat = mapCategoryToFormat(trend.category);
          const isSelected = styleConfig.templateFormat === mappedFormat;
          const customizedHook = trend.hookFormula
            .replace(/\[PRODUCT_NAME\]/g, brand.name)
            .replace(/\[PAIN_POINT\]/g, brand.painPoints[0] || 'manual busywork');

          return (
            <div
              key={trend.id}
              className={`group flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-2xl'
                  : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/80'
              }`}
            >
              <div>
                {/* Thumbnail Preview & Live Badge */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 mb-3">
                  <img
                    src={trend.previewThumbnail}
                    alt={trend.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-black text-white uppercase backdrop-blur-md">
                      <Radio className="h-2.5 w-2.5 animate-pulse" />
                      LIVE FYP
                    </span>
                    <span className="rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md border border-zinc-700/50">
                      {trend.viewsMetric}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{trend.velocity}</span>
                  </div>
                </div>

                {/* Title & Platform */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-100 text-sm">{trend.title}</h3>
                  <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">
                    {trend.soundBpm} BPM
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 mt-0.5">Platform: {trend.platform}</p>

                {/* Live Viral Hook Formula with Product Adaptation */}
                <div className="mt-3 rounded-xl bg-zinc-900/95 p-3 border border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Live Hook Script for {brand.name}:
                  </span>
                  <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-medium">
                    "{customizedHook}"
                  </p>
                </div>

                {/* Trending Hashtag Clusters */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {trend.trendingHashtags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button & Soundtrack */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Music2 className="h-3 w-3 text-amber-400" />
                  <span className="truncate max-w-[120px]">{trend.soundtrack}</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onApplyTemplate({
                      format: mappedFormat,
                      title: trend.title,
                      hookText: customizedHook,
                    })
                  }
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 shadow'
                      : 'bg-zinc-800 text-zinc-100 hover:bg-amber-400 hover:text-zinc-950'
                  }`}
                >
                  <span>{isSelected ? 'Applied' : 'Remix Live Trend'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
