'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingReelsLibrary } from '@/components/TrendingReelsLibrary';
import { PRESET_BRANDS, DEFAULT_STYLE_CONFIG } from '@/lib/mockData';
import { BrandInfo } from '@/types';
import { Radio, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RadarPage() {
  const router = useRouter();
  const [currentBrand, setCurrentBrand] = useState<BrandInfo>(PRESET_BRANDS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyTemplate = (template: any) => {
    showToast(`🔥 Applied live trending format: ${template.title}! Redirecting to Studio...`);
    setTimeout(() => {
      router.push('/studio');
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-bold text-black shadow-2xl animate-pop border border-black/10">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-black">
              <Radio className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white">Live Trending Reels Radar</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time scraping of viral TikTok, Instagram Reels, and YouTube Shorts formulas converting SaaS users right now.
          </p>
        </div>

        {/* Brand Selector */}
        <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 self-start sm:self-auto">
          <span className="text-[11px] text-zinc-400">Target SaaS:</span>
          <select
            value={currentBrand.name}
            onChange={(e) => {
              const b = PRESET_BRANDS.find((pb) => pb.name === e.target.value) || PRESET_BRANDS[0];
              setCurrentBrand(b);
            }}
            className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
          >
            {PRESET_BRANDS.map((b) => (
              <option key={b.name} value={b.name} className="bg-zinc-900 text-white">
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Trending Library Component */}
      <TrendingReelsLibrary
        brand={currentBrand}
        onApplyTemplate={handleApplyTemplate}
        styleConfig={DEFAULT_STYLE_CONFIG}
      />
    </div>
  );
}
