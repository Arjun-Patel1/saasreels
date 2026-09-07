'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Calendar,
  Gift,
  CheckCircle2,
  ExternalLink,
  Mail,
  Check,
} from 'lucide-react';

export const BetaWelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('saasreels_beta_welcome_dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // Trigger pop-up strictly after 5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('saasreels_beta_welcome_dismissed', 'true');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('arjunpatel89806@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0d0d12] p-6 sm:p-8 shadow-2xl ring-1 ring-amber-500/20">
        
        {/* Glow Background Gradient */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-black text-amber-400 mb-4 shadow-sm shadow-amber-400/10">
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          <span>🚀 PUBLIC BETA IS LIVE</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">1 Month of Unlimited AI Reels</span> Free!
        </h2>

        {/* Body Description */}
        <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          We just launched the SaaSReels public beta! To celebrate, we are gifting <strong className="text-amber-300">1 Full Month of Unlimited Video Exports ($199 value)</strong> to founders who take a quick 15-minute onboarding & feedback call with our founder.
        </p>

        {/* Benefits Checklist */}
        <div className="my-5 space-y-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2.5 text-xs text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span><strong>Unlimited HD MP4 Video Exports</strong> for 30 full days</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span><strong>Custom Viral Hook Strategy</strong> tailored specifically to your SaaS</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span><strong>VIP Feature Priority:</strong> We build the features you request live</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href="https://calendly.com/arjunpatel89806/30min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3.5 text-xs sm:text-sm font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-400/20 text-center"
          >
            <Calendar className="h-4 w-4 stroke-[2.5]" />
            <span>Book 15-Min Call & Claim Free Access</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-xs font-bold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
            title="Copy founder email"
          >
            {copiedEmail ? <Check className="h-4 w-4 text-emerald-400" /> : <Mail className="h-4 w-4 text-amber-400" />}
            <span>{copiedEmail ? 'Email Copied!' : 'Copy Email'}</span>
          </button>
        </div>

        {/* Footer Dismiss */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/60">
          <span>Direct Founder Line: Arjun Patel</span>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-200 underline font-medium"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
