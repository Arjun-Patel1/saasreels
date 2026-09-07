'use client';

import React, { useState, useEffect } from 'react';
import { BlitzMode } from '@/components/BlitzMode';
import { BrandInfo, VideoScript, AIPersona, QueuedPost } from '@/types';
import { PRESET_BRANDS, AI_PERSONAS, DEFAULT_STYLE_CONFIG, HUMAN_VOICE_PRESETS } from '@/lib/mockData';
import { generateAllScripts } from '@/lib/scriptEngine';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Flame, Sparkles, Layers, ArrowRight, Mic, Check } from 'lucide-react';
import Link from 'next/link';

export default function BlitzPage() {
  const [currentBrand, setCurrentBrand] = useState<BrandInfo>(PRESET_BRANDS[0]);
  const [persona, setPersona] = useState<AIPersona>(AI_PERSONAS[0]);
  const [styleConfig, setStyleConfig] = useState(DEFAULT_STYLE_CONFIG);
  const [scripts, setScripts] = useState<VideoScript[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const { user, consumeCredit, openPricingModal } = useAuth();

  useEffect(() => {
    // Generate fresh hooks for blitz
    const generated = generateAllScripts(currentBrand);
    setScripts(generated);
  }, [currentBrand]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (script: VideoScript) => {
    const hasCredit = consumeCredit();
    if (!hasCredit) {
      showToast('⚠️ No reel credits remaining. Upgrade to approve more reels!');
      openPricingModal();
      return;
    }

    const newPost: QueuedPost = {
      id: `post-${Date.now()}`,
      title: script.hookHeadline,
      brand: currentBrand,
      script: script,
      persona: persona,
      platforms: ['tiktok', 'instagram', 'youtube'],
      status: 'ready',
      scheduledTime: 'Tomorrow at 11:00 AM (Peak SaaS Hours)',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('saasreels_queue') || '[]');
      localStorage.setItem('saasreels_queue', JSON.stringify([newPost, ...existing]));
    } catch (e) {}

    setApprovedCount((c) => c + 1);
    showToast(`🔥 Approved: "${script.hookHeadline.slice(0, 24)}..." queued for export!`);
  };

  const handleReject = (script: VideoScript) => {
    setRejectedCount((c) => c + 1);
    showToast(`🗑️ Discarded hook`);
  };

  const handleReset = () => {
    const generated = generateAllScripts(currentBrand);
    setScripts(generated);
    setApprovedCount(0);
    setRejectedCount(0);
    showToast(`🔄 Refreshed Blitz Deck for ${currentBrand.name}`);
  };

  const activeVoiceId = styleConfig.voiceId || (styleConfig.voiceGender === 'female' ? 'en-US-AvaMultilingualNeural' : 'en-US-AndrewMultilingualNeural');

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-bold text-black shadow-2xl animate-pop border border-black/10">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 text-black">
              <Flame className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white">Blitz Mode™ Swipe Deck</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Review 20+ viral hook variations in 60 seconds. Swipe right (or press →) to approve, swipe left (or ←) to discard.
          </p>
        </div>

        {/* Brand Selector Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 border border-zinc-800 px-3 py-1.5">
            <span className="text-[11px] text-zinc-400">Brand:</span>
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

          <Link
            href="/queue"
            className="flex items-center gap-1.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-bold text-zinc-200 transition-colors"
          >
            <span>Queue ({approvedCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Voice Persona Bar (2 Male & 2 Female) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
          <Mic className="h-4 w-4 text-amber-400" />
          <span>Active Voice Persona:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HUMAN_VOICE_PRESETS.map((v) => {
            const isSelected = activeVoiceId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setStyleConfig({
                    ...styleConfig,
                    voiceId: v.id,
                    voiceGender: v.gender,
                  });
                  const matched = AI_PERSONAS.find((p) => p.id === v.avatarId);
                  if (matched) setPersona(matched);
                  showToast(`🎙️ Voice set to ${v.name}`);
                }}
                className={`flex items-center justify-between gap-1.5 rounded-xl px-2.5 py-1.5 text-left transition-all border ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/15 text-white font-bold ring-1 ring-amber-400/30 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-sm">{v.icon}</span>
                  <span className="text-[11px] font-bold truncate">{v.shortName}</span>
                </div>
                <span className={`text-[8px] font-bold uppercase ${v.gender === 'male' ? 'text-sky-400' : 'text-rose-400'}`}>
                  {v.gender === 'male' ? '♂' : '♀'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipe Deck Canvas */}
      <div className="flex justify-center">
        <BlitzMode
          scripts={scripts}
          brand={currentBrand}
          persona={persona}
          styleConfig={styleConfig}
          onApprove={handleApprove}
          onReject={handleReject}
          onResetDeck={handleReset}
        />
      </div>
    </div>
  );
}
