'use client';

import React, { useState } from 'react';
import { Globe, ArrowRight, Sparkles, RefreshCw, CheckCircle2, Cpu, Edit3, ShoppingBag, Smartphone, ShieldCheck } from 'lucide-react';
import { BrandInfo } from '@/types';
import { PRESET_BRANDS } from '@/lib/mockData';

interface UrlIngestionProps {
  currentBrand: BrandInfo;
  onBrandExtracted: (brand: BrandInfo) => void;
  isGenerating: boolean;
  activeProvider: string;
}

export const UrlIngestion: React.FC<UrlIngestionProps> = ({
  currentBrand,
  onBrandExtracted,
  isGenerating,
  activeProvider,
}) => {
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');
  const [inputUrl, setInputUrl] = useState(currentBrand.url);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Manual Mode State (For non-techies without a website yet)
  const [manualName, setManualName] = useState(currentBrand.name);
  const [manualTagline, setManualTagline] = useState(currentBrand.tagline);
  const [manualIndustry, setManualIndustry] = useState<any>(currentBrand.industry || 'saas');
  const [manualPainPoint, setManualPainPoint] = useState(currentBrand.painPoints?.[0] || 'Wasting 4 hours every day doing manual video editing');
  const [manualFeature, setManualFeature] = useState(currentBrand.features?.[0] || '1-click automated AI workflow');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'manual') {
      const customBrand: BrandInfo = {
        url: `${manualName.toLowerCase().replace(/\s+/g, '')}.com`,
        name: manualName || 'My Product',
        industry: manualIndustry,
        tagline: manualTagline || 'The fastest way to achieve results',
        description: `${manualName} helps users solve ${manualPainPoint} with ${manualFeature}.`,
        features: [manualFeature, 'Instant automation', 'Turnkey templates', 'Zero setup'],
        painPoints: [manualPainPoint, 'Overpaying for slow agencies', 'Losing hours every week'],
        targetAudience: manualIndustry === 'ecommerce' ? 'Online Shoppers & Buyers' : manualIndustry === 'mobile_app' ? 'Mobile App Users' : 'Founders & Creators',
        primaryColor: manualIndustry === 'ecommerce' ? '#ec4899' : '#f59e0b',
        screenshotUrl: currentBrand.screenshotUrl,
        logoUrl: manualIndustry === 'ecommerce' ? '🛍️' : manualIndustry === 'mobile_app' ? '📱' : '⚡',
        promoCode: 'SAVE50',
        discountText: 'Get 50% Off Today',
        starRating: 4.9,
        reviewCount: '1.5k+ reviews',
      };
      onBrandExtracted(customBrand);
      return;
    }

    if (!inputUrl.trim()) return;

    setLoading(true);
    setStatusMessage('Scanning product landing page & offers...');

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.brand) {
          setStatusMessage(`Extracting with ${activeProvider.toUpperCase()}...`);
          onBrandExtracted(data.brand);
        }
      } else {
        setStatusMessage('Using fallback heuristic...');
      }
    } catch (err) {
      console.warn('Scraping request failed, falling back:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleSelectPreset = (preset: BrandInfo) => {
    setInputUrl(preset.url);
    onBrandExtracted(preset);
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="mb-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
            <Globe className="h-4 w-4 text-amber-400" />
            <span>AI Product & Ad Ingestion Wizard</span>
          </h2>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-400 border border-amber-400/20">
            <Cpu className="h-3 w-3" />
            <span>SaaSReels AI Engine</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Paste any website URL (SaaS, Shopify, App Store) or type your product details below.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mb-3 flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800 text-xs w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition-all min-h-[38px] ${
            inputMode === 'url' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Paste Product URL</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition-all min-h-[38px] ${
            inputMode === 'manual' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Manual Input</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-3.5">
        {inputMode === 'url' ? (
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Globe className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://yourapp.com or Shopify/App Store link"
                className="w-full rounded-2xl border border-zinc-700/80 bg-zinc-950 py-3 pl-10 pr-4 text-base sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || isGenerating}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-amber-400 px-5 py-3 text-xs sm:text-sm font-black text-black transition-all hover:bg-amber-300 disabled:opacity-50 shadow-lg shadow-amber-500/20 active:scale-95 min-h-[44px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Scraping...</span>
                </>
              ) : (
                <>
                  <span>Extract & AI</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Product Name</label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Lumina Sleep Mask"
                className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-700/70 px-3 py-2.5 text-base sm:text-xs text-white outline-none focus:border-amber-400 min-h-[40px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Industry / Category</label>
              <select
                value={manualIndustry}
                onChange={(e) => setManualIndustry(e.target.value)}
                className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-700/70 px-3 py-2.5 text-base sm:text-xs text-white outline-none focus:border-amber-400 min-h-[40px]"
              >
                <option value="saas">⚡ SaaS & Tech Software</option>
                <option value="ecommerce">🛍️ E-Commerce & Physical Product</option>
                <option value="mobile_app">📱 Mobile iOS/Android App</option>
                <option value="course">🎓 Online Course & Coaching</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Short Tagline / Pitch</label>
              <input
                type="text"
                value={manualTagline}
                onChange={(e) => setManualTagline(e.target.value)}
                placeholder="e.g. 100% Blackout Sleep Mask with built-in Bluetooth audio"
                className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-700/70 px-3 py-2.5 text-base sm:text-xs text-white outline-none focus:border-amber-400 min-h-[40px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-red-400 uppercase">Biggest Pain Point Solved</label>
              <input
                type="text"
                value={manualPainPoint}
                onChange={(e) => setManualPainPoint(e.target.value)}
                placeholder="e.g. Waking up tired due to morning sunlight"
                className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-700/70 px-3 py-2.5 text-base sm:text-xs text-white outline-none focus:border-amber-400 min-h-[40px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase">Killer Feature / Magic</label>
              <input
                type="text"
                value={manualFeature}
                onChange={(e) => setManualFeature(e.target.value)}
                placeholder="e.g. 3D ergonomic memory foam with zero eye pressure"
                className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-700/70 px-3 py-2.5 text-base sm:text-xs text-white outline-none focus:border-amber-400 min-h-[40px]"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end mt-1">
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-black hover:bg-amber-300 transition-all shadow-md active:scale-95 min-h-[44px]"
              >
                <span>Generate High-Converting Ad Scripts</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {statusMessage && (
          <p className="mt-1.5 text-[11px] text-amber-400 font-medium animate-pulse">
            ⚡ {statusMessage}
          </p>
        )}
      </form>

      {/* Preset Quick Select */}
      <div className="mb-3">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Try Instant Presets:</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
          {PRESET_BRANDS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all min-h-[36px] active:scale-95 ${
                currentBrand.name.toLowerCase() === preset.name.toLowerCase()
                  ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-bold shadow-sm'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span>{preset.logoUrl}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Brand Insights Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: currentBrand.primaryColor || '#f59e0b' }}
            />
            <span className="font-bold text-white text-sm">{currentBrand.name}</span>
            {currentBrand.industry && (
              <span className="rounded-lg bg-zinc-800 px-2 py-0.5 text-[9px] uppercase font-bold text-zinc-400 border border-zinc-700/50">
                {currentBrand.industry}
              </span>
            )}
          </div>
          <span className="text-[10px] text-amber-400 font-bold">
            ⭐⭐⭐⭐⭐ {currentBrand.starRating || 4.9} ({currentBrand.reviewCount || '2.4k+'})
          </span>
        </div>

        <p className="mt-2 text-zinc-300 italic text-[11px] sm:text-xs">{currentBrand.tagline}</p>

        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="font-semibold text-red-400">🔥 Core Pain Point:</span>
            <p className="text-zinc-400 line-clamp-1">{currentBrand.painPoints?.[0]}</p>
          </div>
          <div>
            <span className="font-semibold text-emerald-400">⚡ Killer Feature:</span>
            <p className="text-zinc-400 line-clamp-1">{currentBrand.features?.[0]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
