'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Check, X, Flame, Sparkles, Volume2, ArrowRight, ArrowLeft, RefreshCw, BookmarkPlus, Video, Tv, MessageSquareQuote } from 'lucide-react';
import { AIPersona, BrandInfo, ScriptWord, VideoScript, VideoStyleConfig } from '@/types';
import { audioEngine } from '@/lib/audioEngine';

interface BlitzModeProps {
  scripts: VideoScript[];
  brand: BrandInfo;
  persona: AIPersona;
  styleConfig: VideoStyleConfig;
  onApprove: (script: VideoScript) => void;
  onReject: (script: VideoScript) => void;
  onResetDeck: () => void;
}

export const BlitzMode: React.FC<BlitzModeProps> = ({
  scripts,
  brand,
  persona,
  styleConfig,
  onApprove,
  onReject,
  onResetDeck,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);

  const currentScript = scripts[currentIndex];

  const triggerHaptic = (ms = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  };

  const activeVoice = styleConfig.voiceId || (persona.gender === 'female' ? 'en-US-AvaMultilingualNeural' : 'en-US-AndrewMultilingualNeural');

  useEffect(() => {
    if (currentScript) {
      audioEngine.preloadAudio(currentScript.fullText, activeVoice);
    }
  }, [currentScript, persona.gender, styleConfig.voiceId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentScript) return;
      if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleAudioPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScript, currentIndex, isPlayingAudio]);

  const toggleAudioPreview = () => {
    if (!currentScript) return;
    triggerHaptic(10);

    if (isPlayingAudio) {
      audioEngine.stop();
      setIsPlayingAudio(false);
      setActiveWordIdx(null);
    } else {
      const allWords = currentScript.segments.flatMap((s) => s.words);
      setIsPlayingAudio(true);

      audioEngine.speakScript(
        currentScript.fullText,
        allWords,
        styleConfig.voiceGender,
        styleConfig.speechRate,
        (idx) => setActiveWordIdx(idx),
        () => {
          setIsPlayingAudio(false);
          setActiveWordIdx(null);
        },
        { voice: activeVoice }
      );
    }
  };

  const handleSwipe = (direction: 'right' | 'left') => {
    if (!currentScript) return;
    triggerHaptic(direction === 'right' ? 25 : 15);
    audioEngine.stop();
    setIsPlayingAudio(false);
    setActiveWordIdx(null);

    if (direction === 'right') {
      onApprove(currentScript);
    } else {
      onReject(currentScript);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  if (!currentScript || currentIndex >= scripts.length) {
    return (
      <div className="flex min-h-[480px] sm:min-h-[520px] flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 text-center backdrop-blur-xl mx-auto max-w-md">
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-amber-400/10 text-amber-400 mb-4 border border-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Sparkles className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">Deck Cleared!</h3>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          You reviewed all generated viral hooks for <span className="text-white font-semibold">{brand.name}</span>. Check your <strong className="text-amber-400">Queue</strong> to schedule and render your approved reels.
        </p>
        <button
          onClick={() => {
            triggerHaptic(20);
            setCurrentIndex(0);
            onResetDeck();
          }}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-xs sm:text-sm font-black text-black transition-all hover:bg-amber-300 active:scale-95 shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reload & Swipe Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-0">
      {/* Blitz Header Info */}
      <div className="mb-3 flex w-full max-w-md items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
            🔥 Blitz Swipe Mode
          </span>
        </div>
        <span className="rounded-full bg-zinc-800/90 px-2.5 py-0.5 text-xs font-semibold text-zinc-400 border border-zinc-700/50">
          {currentIndex + 1} / {scripts.length} Hooks
        </span>
      </div>

      {/* Swipeable Card Deck with Mobile-First Viewport Scaling */}
      <div className="relative h-[calc(100dvh-270px)] min-h-[380px] max-h-[540px] sm:h-[540px] w-full max-w-md" style={{ touchAction: 'pan-y' }}>
        <AnimatePresence mode="popLayout">
          <SwipeCard
            key={currentScript.id}
            script={currentScript}
            brand={brand}
            persona={persona}
            styleConfig={styleConfig}
            activeWordIdx={activeWordIdx}
            isPlayingAudio={isPlayingAudio}
            onToggleAudio={toggleAudioPreview}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>
      </div>

      {/* Ergonomic Thumb-Zone Floating Action Controls */}
      <div className="mt-4 sm:mt-5 flex w-full max-w-md flex-col items-center gap-2.5">
        <div className="flex w-full items-center justify-center gap-5 sm:gap-6">
          {/* Reject button (Thumb Left) */}
          <button
            onClick={() => handleSwipe('left')}
            className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-red-500/40 bg-red-500/15 text-red-400 shadow-xl shadow-red-500/15 transition-transform active:scale-90 hover:scale-105 hover:bg-red-500 hover:text-white"
            title="Reject / Discard (Swipe Left / ←)"
            aria-label="Discard Hook"
          >
            <X className="h-7 w-7 sm:h-8 sm:w-8 stroke-[3]" />
          </button>

          {/* Audio Preview toggle (Center) */}
          <button
            onClick={toggleAudioPreview}
            className={`flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full border-2 transition-transform active:scale-90 hover:scale-105 ${
              isPlayingAudio
                ? 'border-amber-400 bg-amber-400 text-black animate-pulse shadow-lg shadow-amber-400/30'
                : 'border-zinc-700 bg-zinc-800/90 text-zinc-300 hover:text-white'
            }`}
            title="Play / Pause Voice Preview (Spacebar)"
            aria-label="Play Voice Preview"
          >
            <Volume2 className="h-5 w-5" />
          </button>

          {/* Approve button (Thumb Right) */}
          <button
            onClick={() => handleSwipe('right')}
            className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-xl shadow-emerald-500/15 transition-transform active:scale-90 hover:scale-105 hover:bg-emerald-500 hover:text-white"
            title="Approve to Queue (Swipe Right / →)"
            aria-label="Approve Hook"
          >
            <Check className="h-7 w-7 sm:h-8 sm:w-8 stroke-[3.5]" />
          </button>
        </div>

        {/* Keyboard shortcut hint (Hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 font-mono">←</kbd> Discard
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 font-mono">Space</kbd> Preview Audio
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 font-mono">→</kbd> Approve
          </span>
        </div>
      </div>
    </div>
  );
};

interface SwipeCardProps {
  script: VideoScript;
  brand: BrandInfo;
  persona: AIPersona;
  styleConfig: VideoStyleConfig;
  activeWordIdx: number | null;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
  onSwipe: (dir: 'right' | 'left') => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  script,
  brand,
  persona,
  styleConfig,
  activeWordIdx,
  isPlayingAudio,
  onToggleAudio,
  onSwipe,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-16, 16]);
  const opacity = useTransform(x, [-180, -90, 0, 90, 180], [0.65, 1, 1, 1, 0.65]);

  const approveOpacity = useTransform(x, [20, 80], [0, 1]);
  const rejectOpacity = useTransform(x, [-20, -80], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    // 80px touch swipe threshold for effortless mobile snapping
    if (info.offset.x > 80) {
      onSwipe('right');
    } else if (info.offset.x < -80) {
      onSwipe('left');
    }
  };

  const allWords: ScriptWord[] = (script.segments && script.segments.length > 0)
    ? script.segments.flatMap((s) => s.words)
    : (script.fullText || '').split(/\s+/).filter(Boolean).map((w, i) => ({ word: w, start: i * 0.35, end: (i + 1) * 0.35 }));

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between touch-pan-y"
    >
      {/* Swipe Approval Badge (Green Glow Overlay) */}
      <motion.div
        style={{ opacity: approveOpacity }}
        className="pointer-events-none absolute right-4 sm:right-6 top-4 sm:top-6 z-30 rounded-2xl border-2 border-emerald-400 bg-emerald-500/25 px-3.5 sm:px-4 py-1.5 font-black uppercase tracking-wider text-emerald-400 rotate-12 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.4)] text-xs sm:text-sm"
      >
        APPROVE ✨
      </motion.div>

      {/* Swipe Rejection Badge (Red Glow Overlay) */}
      <motion.div
        style={{ opacity: rejectOpacity }}
        className="pointer-events-none absolute left-4 sm:left-6 top-4 sm:top-6 z-30 rounded-2xl border-2 border-red-500 bg-red-500/25 px-3.5 sm:px-4 py-1.5 font-black uppercase tracking-wider text-red-400 -rotate-12 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.4)] text-xs sm:text-sm"
      >
        DISCARD ❌
      </motion.div>

      {/* Card Top: Persona & Viral Retention Score */}
      <div>
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img
              src={persona.avatarUrl}
              alt={persona.name}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-amber-400 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs sm:text-sm">{persona.name}</span>
                <span className="text-[9px] sm:text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded-full border border-amber-400/20 font-semibold">
                  {persona.badge}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">{persona.role}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 text-amber-400 font-black text-xs shadow-sm">
              <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{script.viralScore} / 100</span>
            </div>
            <span className="text-[9px] text-zinc-400 mt-0.5">Viral Retention</span>
          </div>
        </div>

        {/* Hook Headline Banner */}
        <div className="mt-3">
          <span className="inline-block rounded-lg bg-zinc-800 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-zinc-300 border border-zinc-700/50">
            {script.angleTitle}
          </span>
          <h2 className="mt-2 text-base sm:text-lg font-black tracking-tight text-white line-clamp-2 leading-snug">
            "{script.hookHeadline}"
          </h2>
        </div>
      </div>

      {/* Script Narration Display with Word Highlighting */}
      <div className="my-2.5 sm:my-3 overflow-y-auto max-h-[180px] sm:max-h-[220px] rounded-2xl bg-black/60 p-3.5 sm:p-4 border border-zinc-800/80 text-xs sm:text-sm leading-relaxed">
        {isPlayingAudio && activeWordIdx !== null ? (
          <div className="flex flex-wrap gap-1">
            {allWords.map((w, idx) => {
              const isActive = idx === activeWordIdx;
              return (
                <span
                  key={idx}
                  className={`transition-all rounded px-1 ${
                    isActive
                      ? 'bg-amber-400 text-black font-black scale-105 shadow-sm'
                      : 'text-white font-medium'
                  }`}
                >
                  {w.emoji && `${w.emoji} `}
                  {w.word}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-zinc-200">
            {script.fullText}
          </p>
        )}
      </div>

      {/* Card Footer: CTA & Viral Tags */}
      <div className="border-t border-zinc-800/80 pt-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium text-[11px] sm:text-xs">
            CTA: <strong className="text-amber-400">{script.callToAction}</strong>
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400">~15s Short</span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {script.suggestedHashtags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-800/90 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-zinc-400 border border-zinc-700/40"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
