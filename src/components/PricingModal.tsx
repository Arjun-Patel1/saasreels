'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Sparkles,
  Calendar,
  ExternalLink,
  Mail,
  Check,
  Zap,
  Lock,
  CheckCircle2,
  KeyRound,
  Gift,
} from 'lucide-react';

export const PricingModal: React.FC = () => {
  const { isPricingModalOpen, closePricingModal } = useAuth();
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isPricingModalOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('arjunpatel89806@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-[#0c0c10] p-6 sm:p-8 shadow-2xl shadow-black/80 my-8 ring-1 ring-amber-500/20">
        
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={closePricingModal}
          className="absolute top-5 right-5 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-black text-amber-300 border border-amber-400/30">
            <Lock className="h-3.5 w-3.5" />
            <span>PAID PURCHASING PAUSED • ACTIVE PUBLIC BETA</span>
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          Product Launch Coming Soon! <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
            Get 1 Month of Unlimited AI Reels Free
          </span>
        </h2>

        {/* Description */}
        <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          We are currently in active beta testing to fine-tune our video rendering models. Direct paid subscriptions are locked until official launch.
          Instead, we are gifting <strong className="text-amber-300">1 Full Month of Unlimited AI Reels ($199 value)</strong> to founders who take a quick 15-minute feedback call with our founder.
        </p>

        {/* VIP Benefits Box */}
        <div className="my-6 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Gift className="h-4 w-4" />
            <span>What's Included in Your Free 1-Month VIP Beta Access:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2 text-xs text-zinc-200">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span><strong>Unlimited HD MP4 Video Exports</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-200">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span><strong>Custom Viral Hook Strategy</strong> for your SaaS</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-200">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span><strong>All 6 AI Voice Actors</strong> + Procedural BGM</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-200">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span><strong>VIP Feature Priority:</strong> We build what you ask</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href="https://calendly.com/arjunpatel89806/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-xs sm:text-sm font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-400/20 text-center"
          >
            <Calendar className="h-4 w-4 stroke-[2.5]" />
            <span>👉 Book 15-Min Call & Claim 1 Month Free</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-xs font-bold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
            title="Copy founder email"
          >
            {copiedEmail ? <Check className="h-4 w-4 text-emerald-400" /> : <Mail className="h-4 w-4 text-amber-400" />}
            <span>{copiedEmail ? 'Email Copied!' : 'Copy Founder Email'}</span>
          </button>
        </div>

        {/* Alternative: Free Groq Key */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-amber-400" />
            <span>Or bring your own free Groq API key for unlimited AI scripts.</span>
          </span>
          <button
            type="button"
            onClick={closePricingModal}
            className="text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Back to Studio →
          </button>
        </div>
      </div>
    </div>
  );
};
