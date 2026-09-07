'use client';

import React from 'react';

interface SaaSReelsLogoProps {
  compact?: boolean;
  showBadge?: boolean;
  className?: string;
}

export const SaaSReelsLogo: React.FC<SaaSReelsLogoProps> = ({
  compact = false,
  showBadge = true,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 9:16 Smartphone + Film-Strip Perforations + Play Icon */}
      <div className="relative flex items-center justify-center">
        <svg
          width={compact ? "26" : "34"}
          height={compact ? "34" : "44"}
          viewBox="0 0 36 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_rgba(245,158,11,0.35)] transition-transform hover:scale-105"
        >
          <defs>
            <linearGradient id="phoneBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="phoneScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#09090B" />
            </linearGradient>
            <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Outer Phone Shell (9:16 Aspect) */}
          <rect
            x="2"
            y="2"
            width="32"
            height="42"
            rx="7"
            fill="url(#phoneScreenGrad)"
            stroke="url(#phoneBorderGrad)"
            strokeWidth="2"
          />

          {/* Film-Strip Perforation Notches on Left Edge */}
          <rect x="4" y="6" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="4" y="12" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="4" y="18" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="4" y="24" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="4" y="30" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="4" y="36" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />

          {/* Film-Strip Perforation Notches on Right Edge */}
          <rect x="30" y="6" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="30" y="12" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="30" y="18" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="30" y="24" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="30" y="30" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
          <rect x="30" y="36" width="2" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />

          {/* Phone Speaker Notch */}
          <rect x="14" y="4" width="8" height="1.5" rx="0.75" fill="#71717A" opacity="0.6" />

          {/* Central Play Triangle (Vertical Video) */}
          <path
            d="M15 17.5L24 23L15 28.5V17.5Z"
            fill="url(#playGrad)"
            className="filter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
          />

          {/* Bottom Home Indicator Bar */}
          <rect x="13" y="39.5" width="10" height="1.5" rx="0.75" fill="#71717A" opacity="0.5" />
        </svg>
      </div>

      {/* Typography: <SaaS> + Reels */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <div className="flex items-baseline tracking-tight font-extrabold text-white">
            {/* SaaS with code brackets */}
            <span className="font-mono text-amber-400 font-bold mr-0.5 text-xs sm:text-sm">&lt;</span>
            <span className="text-base sm:text-xl font-black tracking-tighter bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              SaaS
            </span>
            <span className="font-mono text-amber-400 font-bold ml-0.5 mr-1 text-xs sm:text-sm">&gt;</span>

            {/* Reels with neon dots */}
            <span className="relative text-base sm:text-xl font-black tracking-tight text-white">
              R
              <span className="relative">
                e
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B] animate-pulse" />
              </span>
              <span className="relative">
                e
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B] animate-pulse" />
              </span>
              ls
            </span>
          </div>

          {/* Mini Tag Badge */}
          {showBadge && !compact && (
            <span className="rounded-md bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-400 border border-amber-400/30 uppercase tracking-widest shadow-sm">
              AI ENGINE
            </span>
          )}
        </div>

        {!compact && (
          <p className="text-[10px] text-zinc-400 font-medium tracking-wide hidden sm:block">
            Software to Viral Video Studio
          </p>
        )}
      </div>
    </div>
  );
};
