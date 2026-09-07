'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
  TrendingUp,
  Globe,
  Check,
  Video,
  Layers,
  Volume2,
  VolumeX,
  Cpu,
  ThumbsUp,
  MessageCircle,
  Star,
  Mail,
  Calendar,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface PresetDemo {
  id: string;
  name: string;
  url: string;
  avatarUrl: string;
  avatarName: string;
  hookTitle: string;
  hookCaption: string;
  emoji: string;
  retention: string;
  views: string;
}

const PRESET_DEMOS: PresetDemo[] = [
  {
    id: 'supabase',
    name: 'Supabase (DB & Auth)',
    url: 'https://supabase.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    avatarName: 'Rachel (AI UGC)',
    hookTitle: '🥊 The Villain Roast',
    hookCaption: 'STOP paying $2,000/mo for bloated cloud databases!',
    emoji: '💸',
    retention: '98.4%',
    views: '240K',
  },
  {
    id: 'resend',
    name: 'Resend (Email API)',
    url: 'https://resend.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    avatarName: 'Adam (AI Founder)',
    hookTitle: '🤫 The Gatekept Secret',
    hookCaption: 'POV: You found the developer email API everyone is gatekeeping.',
    emoji: '🔥',
    retention: '96.2%',
    views: '185K',
  },
  {
    id: 'linear',
    name: 'Linear (Issue Tracking)',
    url: 'https://linear.app',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    avatarName: 'Bella (AI Creator)',
    hookTitle: '⚡ 30s Speed Run Demo',
    hookCaption: 'Watch me manage a 50-person sprint in literally 10 seconds.',
    emoji: '⚡',
    retention: '94.8%',
    views: '310K',
  },
];

export default function MarketingLandingPage() {
  const [urlInput, setUrlInput] = useState('https://supabase.com');
  const [activePreset, setActivePreset] = useState<PresetDemo>(PRESET_DEMOS[0]);
  const [isPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoCount, setVideoCount] = useState(30);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('arjunpatel89806@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // 3D Tilt State for Hero Card
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3D Mouse Parallax on Hero Showcase
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // ROI Calculator Calculations
  const agencyCost = videoCount * 250;
  const editorHours = Math.round(videoCount * 2.5);
  const saasReelsCost = videoCount <= 10 ? 0 : videoCount <= 40 ? 29 : 79;
  const savings = agencyCost - saasReelsCost;

  return (
    <div className="relative overflow-hidden bg-[#09090d]">
      {/* 1. TOP SCROLL PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 z-50 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(245,158,11,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 2. BACKGROUND 3D GLOW & CYBER GRID */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-amber-500/15 via-yellow-500/10 to-transparent rounded-full blur-[180px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[800px] -left-40 w-[600px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[1600px] -right-40 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[180px] pointer-events-none" />

      {/* 3. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-zinc-900/80 px-4 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-xl mb-8 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-float-slow">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="shimmer-text font-black tracking-wide">
              NEXT-GEN AI SHORT-FORM VIDEO STUDIO
            </span>
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          </div>

          {/* Main Title with 3D Depth Typography */}
          <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Turn Any Product URL into{' '}
            <span className="relative inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(245,158,11,0.3)]">
              Viral SaaS Reels
            </span>{' '}
            in 30 Seconds
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Never waste $2,400/mo on video agencies or 16 hours in CapCut. Ingest your landing page, synthesize 5 battle-tested psychology hooks, and swipe-approve 1080p MP4s on autopilot.
          </p>

          {/* Interactive URL Bar */}
          <div className="mx-auto mt-9 max-w-xl">
            <div className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all focus-within:border-amber-400/80 focus-within:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <div className="relative w-full flex items-center">
                <Globe className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="https://yourstartup.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 pl-10 pr-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 border border-zinc-800 focus:border-amber-400 focus:outline-none transition-colors font-mono"
                />
              </div>
              <Link
                href={`/signup?url=${encodeURIComponent(urlInput)}`}
                className="w-full sm:w-auto flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-6 py-3.5 text-xs font-black text-zinc-950 hover:brightness-110 transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <span>Synthesize Reels</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </Link>
            </div>

            {/* Micro Guarantees */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                3 Free 1080p Video Exports
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                No Credit Card Required
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                Bring-Your-Own-Key $0 Forever
              </span>
            </div>
          </div>

          {/* 4. INTERACTIVE 3D HERO STUDIO SIMULATOR */}
          <div className="mt-16 perspective-1500">
            {/* Live Preset Switcher Pills */}
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-2">
                Live Presets:
              </span>
              {PRESET_DEMOS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActivePreset(preset);
                    setUrlInput(preset.url);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePreset.id === preset.id
                      ? 'bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            {/* 3D Tilted Console Window */}
            <div
              ref={heroCardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
              }}
              className="relative max-w-5xl mx-auto rounded-3xl border border-zinc-700/70 bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 p-4 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl transform-style-3d cursor-pointer"
            >
              {/* Floating 3D Depth Badges */}
              <div className="hidden lg:block absolute -top-5 -left-6 rounded-2xl bg-zinc-900/95 border border-amber-500/30 px-4 py-2.5 text-left shadow-2xl backdrop-blur-xl translate-z-40 animate-float-slow">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-mono text-zinc-300">Live 60 FPS Canvas</span>
                </div>
                <p className="text-xs font-black text-amber-400 mt-0.5">1080×1920 Full HD</p>
              </div>

              <div className="hidden lg:block absolute -bottom-6 -right-6 rounded-2xl bg-zinc-900/95 border border-emerald-500/30 px-4 py-2.5 text-left shadow-2xl backdrop-blur-xl translate-z-40 animate-float-reverse">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold text-zinc-300">Retention Score</span>
                </div>
                <p className="text-xs font-black text-emerald-400 mt-0.5">{activePreset.retention} Complete Watch</p>
              </div>

              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-zinc-400 text-[11px] pl-2">
                    studio://renderer.saasreels.com/{activePreset.id}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-amber-400" />}
                  </button>
                  <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-400/20">
                    {activePreset.hookTitle}
                  </span>
                </div>
              </div>

              {/* Main Studio Viewport Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left 9:16 Video Mockup Smartphone */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="relative aspect-[9/16] w-64 sm:w-72 rounded-[32px] border-4 border-zinc-700/80 bg-black overflow-hidden shadow-2xl ring-1 ring-zinc-500/30">
                    {/* Simulated Scanner Beam */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan-beam z-30 pointer-events-none" />

                    {/* Top 50%: AI UGC Avatar Cam */}
                    <div className="h-1/2 w-full relative overflow-hidden bg-zinc-900">
                      <img
                        src={activePreset.avatarUrl}
                        alt="AI Avatar"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-3 left-3 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-bold text-amber-300 backdrop-blur-md border border-amber-400/20 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                        {activePreset.avatarName}
                      </div>

                      {/* Equalizer Wave Simulation */}
                      {isPlaying && (
                        <div className="absolute bottom-2 right-3 flex items-end gap-0.5 h-4 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                          <span className="w-1 bg-amber-400 rounded-full h-3 animate-pulse" />
                          <span className="w-1 bg-amber-400 rounded-full h-4 animate-pulse delay-75" />
                          <span className="w-1 bg-amber-400 rounded-full h-2 animate-pulse delay-150" />
                          <span className="w-1 bg-amber-400 rounded-full h-3.5 animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Bottom 50%: Scraped App Screen + Springing Submagic Captions */}
                    <div className="h-1/2 w-full relative bg-zinc-950 p-3 flex flex-col justify-between border-t-2 border-zinc-800">
                      {/* URL Badge Header */}
                      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-2 text-left">
                        <div className="flex items-center justify-between text-[9px] text-zinc-400">
                          <span className="font-bold text-amber-400">Live Ingest Viewport</span>
                          <span className="text-emerald-400">● 100% Extracted</span>
                        </div>
                        <p className="text-[11px] text-zinc-200 font-mono font-bold mt-0.5 truncate">
                          {activePreset.url}
                        </p>
                      </div>

                      {/* Submagic Kinetic Springing Badge */}
                      <div className="my-auto text-center px-1">
                        <div className="inline-block rounded-2xl bg-zinc-950/90 px-3 py-2 text-xs sm:text-sm font-black text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] border-2 border-amber-400/40 transform scale-105 transition-transform animate-float-slow">
                          <span className="text-base mr-1">{activePreset.emoji}</span>
                          {activePreset.hookCaption}
                        </div>
                      </div>

                      {/* Engagement Overlay Bar */}
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/80 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-zinc-400" /> 14.8k</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3 text-zinc-400" /> 842</span>
                        </div>
                        <span className="text-emerald-400 font-bold font-mono">{activePreset.views} Views</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Studio Controls & Feature Breakdown */}
                <div className="md:col-span-7 text-left space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Studio Control Engine
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Automated 4-Beat Video Pipeline
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Every generated reel follows direct-response psychology designed to hold user attention across the full 23 seconds.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Beat 1 */}
                    <div className="flex items-start gap-3 rounded-2xl bg-zinc-900/80 p-3.5 border border-zinc-800 hover:border-zinc-700 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 font-mono font-bold text-xs">
                        01
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-zinc-100 block">
                          Beat 1: Pattern Interrupt Hook (0–3s)
                        </strong>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          High-energy AI UGC avatar callout with 2-word kinetic submagic badges to stop FYP scrolling.
                        </p>
                      </div>
                    </div>

                    {/* Beat 2 */}
                    <div className="flex items-start gap-3 rounded-2xl bg-zinc-900/80 p-3.5 border border-zinc-800 hover:border-zinc-700 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 font-mono font-bold text-xs">
                        02
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-zinc-100 block">
                          Beat 2: Problem Agitation & Screen Walkthrough (3–12s)
                        </strong>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Smooth Arcads-style handheld camera sway showing live product features and pain point solutions.
                        </p>
                      </div>
                    </div>

                    {/* Beat 3 */}
                    <div className="flex items-start gap-3 rounded-2xl bg-zinc-900/80 p-3.5 border border-zinc-800 hover:border-zinc-700 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 font-mono font-bold text-xs">
                        03
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-zinc-100 block">
                          Beat 3: Offer & Smart Attribution CTA (12–23s)
                        </strong>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Clean CTA card reveal with decaying background beats and embedded UTM tracking pixel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      href={`/signup?url=${encodeURIComponent(activePreset.url)}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                    >
                      <span>Remix This Preset (Get 3 Free Reels)</span>
                      <ArrowRight className="h-4 w-4 stroke-[3]" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 3D WORKFLOW PIPELINE SECTION */}
      <section className="py-24 border-t border-zinc-800/80 bg-zinc-950/70 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2 block">
            HOW SAASREELS WORKS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            From Raw URL to 5 Viral Ads in 3 Clicks
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Our autonomous rendering engine coordinates LLM script synthesis, Web Audio speech generation, and 1080p WebCodecs export.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Step 1 */}
            <div className="group rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-7 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-1.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-5">
                <Globe className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
                STEP 01
              </span>
              <h3 className="text-lg font-black text-zinc-100 mb-2">
                1. Ingest & Screen Extraction
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paste your SaaS URL. The engine extracts your hero copy, key value props, brand palette, and captures high-res 1280x720 UI screenshots above-the-fold.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-7 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-1.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-5">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
                STEP 02
              </span>
              <h3 className="text-lg font-black text-zinc-100 mb-2">
                2. Multi-Angle Script Synthesis
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                AI synthesizes 5 proven direct-response hooks (Villain Roast, Gatekept Secret, Speed Run, Competitor Flip) with timed word-level timestamps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-7 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-1.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-5">
                <Video className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
                STEP 03
              </span>
              <h3 className="text-lg font-black text-zinc-100 mb-2">
                3. Blitz Swipe & 1080p Export
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Swipe right in Blitz Mode to approve. The hardware-accelerated 60 FPS renderer exports pristine 1080x1920 MP4s ready for TikTok, Shorts, and Reels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE ROI & VELOCITY CALCULATOR */}
      <section className="py-24 border-t border-zinc-800/80 bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl text-center">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2 block">
              ROI & OUTPUT VELOCITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Calculate Your Monthly Savings & Velocity
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Drag the slider to adjust your target monthly video volume.
            </p>

            {/* Slider */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-2">
                <span>Target Video Output:</span>
                <span className="text-amber-400 text-base font-black font-mono">
                  {videoCount} Reels / month
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={videoCount}
                onChange={(e) => setVideoCount(Number(e.target.value))}
                className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>5 reels</span>
                <span>45 reels</span>
                <span>90 reels</span>
              </div>
            </div>

            {/* Metric Comparison Cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
              {/* Agency Cost */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                <span className="text-xs text-zinc-400 block font-semibold">UGC Video Agency</span>
                <p className="text-3xl font-black text-rose-400 mt-1.5 font-mono">
                  ${agencyCost.toLocaleString()}
                  <span className="text-xs text-zinc-500 font-normal">/mo</span>
                </p>
                <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
                  Based on industry average $250 per UGC video + 7-day turnaround delays.
                </p>
              </div>

              {/* Time Saved */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                <span className="text-xs text-zinc-400 block font-semibold">Founder Time Saved</span>
                <p className="text-3xl font-black text-amber-400 mt-1.5 font-mono">
                  {editorHours} Hours
                  <span className="text-xs text-zinc-500 font-normal">/mo</span>
                </p>
                <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
                  Reclaim 2.5 hours per reel previously wasted in video timelines and retakes.
                </p>
              </div>

              {/* SaaSReels Cost */}
              <div className="rounded-2xl border-2 border-amber-400 bg-amber-400/10 p-5 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                <span className="text-xs text-amber-400 block font-bold">SaaSReels Studio Cost</span>
                <p className="text-3xl font-black text-white mt-1.5 font-mono">
                  ${saasReelsCost}
                  <span className="text-xs text-zinc-400 font-normal">/mo</span>
                </p>
                <div className="mt-3 pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Net Savings:</span>
                  <span className="font-mono font-black">+${savings.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="mt-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/20"
              >
                <span>Sign Up & Get 3 Free Trial Reels</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5 DEDICATED DIRECT FOUNDER CONTACT & BETA FEEDBACK */}
      <section className="py-16 border-t border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-[#0e0e16] to-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-zinc-950 p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-400 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Direct Founder Line & Public Beta Perks</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Built for Solo Founders & Indie Hackers
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
              Have feedback, feature requests, or need help launching your viral video pipeline? Contact Arjun directly or book a live 1-on-1 walkthrough.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Direct Email Action with Copy Tooltip */}
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-2 pl-4 text-xs">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:arjunpatel89806@gmail.com"
                  className="font-mono text-zinc-200 hover:text-amber-300 transition-colors"
                >
                  arjunpatel89806@gmail.com
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all flex items-center gap-1.5"
                >
                  {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Calendly Booking CTA */}
              <a
                href="https://calendly.com/arjunpatel89806/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                <Calendar className="h-4 w-4 stroke-[2.5]" />
                <span>Schedule a 15-min Call with Arjun</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LIVE FOUNDER RESULTS & VERIFIED TESTIMONIALS */}
      <section className="py-24 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2 block">
            PROVEN TRACK RECORD
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Loved by Fast-Growing SaaS Founders
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                "We scaled our developer tool from $8k to $34k MRR purely from automated TikTok reels. The Villain Roast angle converted 4.2x higher than paid Google search."
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-zinc-800/80 pt-3">
                <div className="h-8 w-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xs font-bold text-amber-400">
                  MR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">Marcus Reed</h4>
                  <p className="text-[10px] text-zinc-500">Founder, DevStack ($34k MRR)</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                "Blitz Mode is incredible. I generated 20 reels for our launch week in literally 8 minutes over my morning coffee. Approved 14 of them and scheduled them to TikTok."
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-zinc-800/80 pt-3">
                <div className="h-8 w-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-400">
                  SL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">Sarah Lin</h4>
                  <p className="text-[10px] text-zinc-500">Growth Lead, FormFlow</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                "The 1080p 60FPS video export quality is unmatched. The Submagic caption physics and camera drift make it look like a high-budget UGC creator shot it manually."
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-zinc-800/80 pt-3">
                <div className="h-8 w-8 rounded-full bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-xs font-bold text-purple-400">
                  DK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">David Kim</h4>
                  <p className="text-[10px] text-zinc-500">Co-Founder, PromptHub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL HIGH-CONVERSION CTA */}
      <section className="py-24 border-t border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400 mb-6">
            <Flame className="h-3.5 w-3.5" />
            <span>Launch in 30 Seconds</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Ready to Scale Your Organic Video Pipeline?
          </h2>
          <p className="mt-4 text-xs sm:text-base text-zinc-400 max-w-lg mx-auto">
            Join hundreds of SaaS founders creating 100k+ organic views every week. Zero video editing skills required.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-8 py-4 text-xs font-black text-zinc-950 hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-amber-500/25"
            >
              <span>Create Your First Reel 100% Free</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto rounded-xl border border-zinc-700 bg-zinc-800/90 px-6 py-4 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Explore Pricing & Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

