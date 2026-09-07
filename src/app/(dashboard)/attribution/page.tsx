'use client';

import React, { useState } from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { PRESET_BRANDS } from '@/lib/mockData';
import { BrandInfo } from '@/types';
import { BarChart3, Sparkles } from 'lucide-react';

export default function AttributionPage() {
  const [currentBrand, setCurrentBrand] = useState<BrandInfo>(PRESET_BRANDS[0]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-black">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white">SaaS Attribution & MRR Engine</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Trace trial signups and paid subscriptions directly back to individual TikTok, Reels, and Shorts.
          </p>
        </div>

        {/* Brand Selector */}
        <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 self-start sm:self-auto">
          <span className="text-[11px] text-zinc-400">Tracked Brand:</span>
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

      <AnalyticsDashboard brand={currentBrand} />
    </div>
  );
}
