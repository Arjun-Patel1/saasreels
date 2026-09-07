'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SaaSReelsLogo } from '@/components/SaaSReelsLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-400 selection:text-black">
      {/* Background glowing amber ambient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Back to Studio Link */}
      <div className="absolute top-6 left-6 sm:left-12 z-20">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="relative z-10">{children}</div>

      <div className="mt-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2 relative z-10">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>Secure 256-bit encrypted authentication • Zero plain text</span>
      </div>
    </div>
  );
}
