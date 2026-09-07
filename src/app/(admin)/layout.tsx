'use client';

import React from 'react';
import Link from 'next/link';
import { SaaSReelsLogo } from '@/components/SaaSReelsLogo';
import { ShieldCheck, ArrowLeft, Terminal, Activity, Users, Video } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <SaaSReelsLogo />
            </Link>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>COMMAND CENTER</span>
            </div>
          </div>

          {/* Quick App Links in Admin Header */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
            <Link href="/studio" className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Studio
            </Link>
            <Link href="/radar" className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Radar
            </Link>
            <Link href="/blitz" className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Blitz
            </Link>
            <Link href="/queue" className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Queue
            </Link>
            <Link href="/attribution" className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Attribution
            </Link>
            <Link href="/pricing" className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1.5 text-xs font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all shadow-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Studio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
