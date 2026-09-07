'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, Globe, Video, UserCheck, Flame, Zap } from 'lucide-react';
import { PRESET_BRANDS, AI_PERSONAS, DEFAULT_STYLE_CONFIG } from '@/lib/mockData';
import { BrandInfo } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [brandUrl, setBrandUrl] = useState('https://supabase.com');
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo>(PRESET_BRANDS[0]);
  const [selectedPersona, setSelectedPersona] = useState(AI_PERSONAS[0]);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: brandUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.brand) {
          setSelectedBrand(data.brand);
        }
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsExtracting(false);
      setStep(2);
    }
  };

  const handleFinishOnboarding = () => {
    router.push('/studio');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2">
          <span>Step {step} of 3</span>
          <span className="text-amber-400">
            {step === 1 ? 'Ingest SaaS Landing Page' : step === 2 ? 'Select AI Ambassador' : 'Preview & Launch'}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>
      </div>

      {/* STEP 1: Ingest URL */}
      {step === 1 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Enter Your SaaS Product URL</h2>
              <p className="text-xs text-zinc-400">SaaSReels will automatically scrape your headline, value props, and hero mockups.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Landing Page URL</label>
              <input
                type="text"
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <span className="text-[11px] font-bold text-zinc-400 block mb-2">Or select a popular demo preset:</span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_BRANDS.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => {
                      setBrandUrl(b.url);
                      setSelectedBrand(b);
                    }}
                    className={`rounded-xl border p-2.5 text-left text-xs transition-all ${
                      brandUrl === b.url
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-bold block">{b.name}</span>
                    <span className="text-[10px] text-zinc-500 truncate block">{b.tagline}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={isExtracting || !brandUrl}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-4"
            >
              <span>{isExtracting ? 'Extracting Brand & Hero Fold...' : 'Analyze Landing Page →'}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Persona */}
      {step === 2 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Choose Your AI Brand Ambassador</h2>
              <p className="text-xs text-zinc-400">Select a recurring face and conversational tone that matches your SaaS audience.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {AI_PERSONAS.map((p) => {
              const isSelected = p.id === selectedPersona.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPersona(p)}
                  className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/20'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-zinc-900">
                    <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-amber-400 text-zinc-950 p-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 fill-zinc-950 text-amber-400" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100">{p.name}</h4>
                  <p className="text-[10px] text-zinc-400 truncate">{p.role}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <span>Next: Synthesize Reel →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Ready to Launch */}
      {step === 3 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-400 mx-auto border border-emerald-500/30 mb-4">
            <Zap className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold text-zinc-100">Setup Complete! Ready to Synthesize</h2>
          <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto">
            We have generated 5 viral angles for <strong>{selectedBrand.name}</strong> paired with ambassador <strong>{selectedPersona.name}</strong>.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Brand Profile:</span>
              <strong className="text-zinc-200">{selectedBrand.name}</strong>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Primary Hook Angle:</span>
              <strong className="text-amber-400">The Villain / Agency Roast</strong>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Video Resolution:</span>
              <strong className="text-zinc-200">1080×1920 60FPS</strong>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleFinishOnboarding}
              className="w-full max-w-md mx-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/20"
            >
              <span>Launch Video Studio & Render Reel</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
