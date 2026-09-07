'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Calendar,
  ExternalLink,
  Mail,
  Copy,
  Lock,
  Gift,
} from 'lucide-react';

export default function PricingPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('arjunpatel89806@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const faqs = [
    {
      q: 'How do the 3 Free Beta Reels work?',
      a: 'When you create a free account with your email/phone, you immediately get 3 Free HD Video Generations on the house. No credit card required.',
    },
    {
      q: 'Why are paid subscriptions frozen right now?',
      a: 'We are currently in active public beta, working directly with founders to refine our prompt engine, Edge neural voices, and viral split-screen templates before official launch.',
    },
    {
      q: 'How do I claim 1 Full Month of Unlimited Reels Free?',
      a: 'Simply book a quick 15-minute onboarding & feedback call with our founder, Arjun Patel. We will personally upgrade your account to 1 Month of Unlimited Video Exports ($199 value) at zero cost!',
    },
    {
      q: 'Can I bring my own Groq API key?',
      a: 'Yes! You can connect your free Groq API key in the navbar or studio anytime for unlimited AI script generations.',
    },
  ];

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Beta Freeze Announcement Hero Card */}
        <div className="mb-12 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-zinc-900/80 p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/20 px-3.5 py-1 text-xs font-black text-amber-300">
                <Lock className="h-3.5 w-3.5" />
                <span>PAID PLANS LOCKED • PUBLIC BETA ACTIVE</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Product Launch Soon — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">Get 1 Month Unlimited Free!</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Direct purchasing is temporarily frozen while we fine-tune our video generation engine with early beta testers. 
                Get started with <strong className="text-white">3 Free Trial Reels</strong>, or book a 15-min founder chat to claim <strong className="text-amber-300">1 Full Month of Unlimited AI Reels ($199 value)</strong> 100% free!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <a
                href="https://calendly.com/arjunpatel89806/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-xs sm:text-sm font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-400/20 text-center"
              >
                <Calendar className="h-4 w-4 stroke-[2.5]" />
                <span>👉 Book 15-Min Founder Call</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <Link
                href="/studio"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-3.5 text-xs sm:text-sm font-bold text-zinc-200 hover:text-white transition-all active:scale-95 text-center"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Try 3 Reels Free</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3-Tier Grid (All Linked to Beta Free Month / Founder Call) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE TRIAL TIER */}
          <div className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <KeyRound className="h-4 w-4 text-zinc-400" />
                <span>Starter Free Trial</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Instant access on sign up with email/phone.</p>
              <div className="my-5">
                <span className="text-4xl font-black text-zinc-100">$0</span>
                <span className="text-xs text-zinc-500"> / instant access</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300 border-t border-zinc-800/80 pt-5">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400 shrink-0" /><span><strong>3 Free HD Video Exports</strong> (No card needed)</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" /><span>Unlimited with your Groq API key</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" /><span>5 Direct-Response Copy Angles</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" /><span>Procedural Audio & Neural TTS</span></li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="mt-8 w-full block text-center rounded-xl bg-amber-400 py-3 text-xs font-black text-black hover:bg-amber-300 transition-all active:scale-95"
            >
              Sign Up & Get 3 Free Reels
            </Link>
          </div>

          {/* PRO BETA TIER (FEATURED) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-amber-400 bg-zinc-900/90 p-6 backdrop-blur-xl shadow-2xl shadow-amber-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 text-[10px] font-black text-zinc-950 uppercase tracking-wide shadow-md">
              🎁 FREE 1 MONTH VIA FOUNDER CALL
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Zap className="h-4 w-4" />
                <span>Pro Growth (Beta Pass)</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Unlocked via 15-min feedback call.</p>
              <div className="my-5">
                <span className="text-4xl font-black text-amber-300">FREE</span>
                <span className="text-xs text-zinc-400 line-through ml-2 font-mono">$49/mo</span>
                <span className="text-xs text-zinc-500"> / 1 Month VIP</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-200 border-t border-zinc-800/80 pt-5">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400 shrink-0" /><span><strong>Unlimited HD Video Exports</strong> for 30 Days</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400 shrink-0" /><span>All Studio Neural Voices & BGM</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400 shrink-0" /><span>Custom Viral Hook Strategy for your SaaS</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400 shrink-0" /><span>VIP Roadmap & Feature Request Priority</span></li>
              </ul>
            </div>
            <a
              href="https://calendly.com/arjunpatel89806/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
            >
              <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Book 15-Min Call to Claim Free</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* AGENCY SCALE TIER */}
          <div className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Crown className="h-4 w-4" />
                <span>Agency Scale (Launch Soon)</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Multi-brand SaaS video engine.</p>
              <div className="my-5">
                <span className="text-4xl font-black text-zinc-100">$199</span>
                <span className="text-xs text-zinc-500"> / mo (Coming Soon)</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300 border-t border-zinc-800/80 pt-5">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /><span><strong>300+ Managed Reel Exports</strong> / mo</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /><span>Unlimited Brand Profiles & Workspaces</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /><span>Priority GPU Render Queue</span></li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /><span>Dedicated Slack & VIP Founder Line</span></li>
              </ul>
            </div>
            <a
              href="mailto:arjunpatel89806@gmail.com?subject=Agency%20Tier%20Beta%20Access"
              className="mt-8 w-full block text-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
            >
              Contact for Agency Beta
            </a>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-100">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-400 mt-1">Everything you need to know about the SaaSReels public beta trial.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
