'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SaaSReelsLogo } from '@/components/SaaSReelsLogo';
import { Sparkles, ArrowRight, ShieldCheck, Flame, ExternalLink, Mail, Calendar, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('arjunpatel89806@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      {/* 1. STICKY TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-2 px-3 text-center text-xs font-bold text-zinc-950 shadow-sm relative z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 flex-wrap">
          <span>
            🎉 <strong className="font-extrabold">SaaSReels Public Beta is LIVE:</strong> Get Free Unlimited Video Generations! Help us shape the product —
          </span>
          <a
            href="https://calendly.com/arjunpatel89806/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-0.5 text-[11px] font-black text-amber-300 hover:bg-zinc-900 transition-colors shadow-sm active:scale-95"
          >
            <span>Book a 15-Min Founder Chat</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* 2. PUBLIC MARKETING TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <SaaSReelsLogo />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <Link href="/#features" className="hover:text-zinc-100 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-zinc-100 transition-colors">
              Pricing
            </Link>
            <Link href="/vs/fastlane" className="hover:text-zinc-100 transition-colors flex items-center gap-1">
              <span>Comparisons</span>
              <span className="rounded bg-amber-400/10 px-1.5 py-0.2 text-[9px] font-bold text-amber-400 border border-amber-400/20">VS</span>
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-feedback-modal'))}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 text-xs font-semibold text-zinc-400"
            >
              <span>💬 Feedback</span>
            </button>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/studio"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-md shadow-amber-500/10"
                >
                  <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Open Studio</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1.5 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-md shadow-amber-500/10"
                >
                  <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Open Studio (3 Free)</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Body */}
      <main className="flex-1">{children}</main>

      {/* Public Marketing Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Brand Info */}
            <div className="md:col-span-2 space-y-3">
              <SaaSReelsLogo />
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                The premier AI short-form video studio for SaaS founders, developer tools, and tech products to generate viral TikToks, Instagram Reels, and Shorts on autopilot.
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero-risk 30-day money back guarantee</span>
              </div>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li><Link href="/signup" className="hover:text-amber-400 transition-colors">Video Studio (3 Free)</Link></li>
                <li><Link href="/signup" className="hover:text-amber-400 transition-colors">Blitz Swipe Deck</Link></li>
                <li><Link href="/signup" className="hover:text-amber-400 transition-colors">Trending Radar</Link></li>
                <li><Link href="/#features" className="hover:text-amber-400 transition-colors">Core Features</Link></li>
                <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing & Beta</Link></li>
              </ul>
            </div>

            {/* Col 3: Comparisons */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">Comparisons</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li><Link href="/vs/fastlane" className="hover:text-amber-400 transition-colors">vs Fastlane</Link></li>
                <li><Link href="/vs/arcads" className="hover:text-amber-400 transition-colors">vs Arcads</Link></li>
                <li><Link href="/vs/submagic" className="hover:text-amber-400 transition-colors">vs Submagic</Link></li>
                <li><Link href="/vs/cliptalk" className="hover:text-amber-400 transition-colors">vs Cliptalk</Link></li>
              </ul>
            </div>

            {/* Col 4: Founder Direct Contact & Beta */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1">
                <span>Direct Founder Line</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h4>
              <p className="text-xs text-zinc-400 mb-2.5 leading-relaxed">
                Have feedback or questions? Contact Arjun directly:
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:arjunpatel89806@gmail.com"
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-amber-300 transition-colors font-mono"
                >
                  <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">arjunpatel89806@gmail.com</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                </button>
                <div className="pt-1">
                  <a
                    href="https://calendly.com/arjunpatel89806/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition-all shadow-sm"
                  >
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span>Book 15-Min Call</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-6 text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} SaaSReels Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
