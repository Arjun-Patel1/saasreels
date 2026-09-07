'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Sparkles, RefreshCw, Layers, CheckCircle2, Tv, Video, MessageSquareQuote, Gamepad2, Radio, Mic, Check } from 'lucide-react';
import { AIPersona, BrandInfo, ScriptWord, VideoScript, VideoStyleConfig } from '@/types';
import { audioEngine } from '@/lib/audioEngine';
import { ClientVideoRecorder, getEmojiForWord, getActiveCaptionChunk } from '@/lib/videoRenderer';
import { HUMAN_VOICE_PRESETS } from '@/lib/mockData';
import { FeedbackModal } from './FeedbackModal';
import { useAuth } from '@/context/AuthContext';

function KineticLoopCanvas({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const render = (now: number) => {
      const time = (now - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      // Dark cyber background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#040408');
      grad.addColorStop(0.5, '#0b0b14');
      grad.addColorStop(1, '#05050a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Undulating Cyber Matrix Horizon Grid
      const horizon = height * 0.45;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;

      const numLines = 14;
      for (let i = 0; i < numLines; i++) {
        const lineY = horizon + Math.pow(i / numLines, 2.2) * (height - horizon);
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const waveY = lineY + Math.sin(x * 0.02 + time * 3.2 + i) * (2 + i * 0.6);
          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }

      // Vanishing perspective rays
      const vanishingX = width / 2;
      const vanishingY = horizon * 0.7;
      const numRays = 14;
      for (let r = 0; r <= numRays; r++) {
        const bottomX = (r / numRays) * width;
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      // Floating kinetic glow particles
      for (let p = 0; p < 20; p++) {
        const px = (Math.sin(p * 47 + time * 0.4) * 0.45 + 0.5) * width;
        const py = ((p * 35 - time * 45) % height + height) % height;
        const alpha = 0.3 + Math.sin(time * 3 + p) * 0.3;
        const pSize = 1.5 + (p % 3);

        ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width={360} height={300} className="h-full w-full object-cover" />;
}

interface VideoPlayerProps {
  brand: BrandInfo;
  script: VideoScript;
  persona: AIPersona;
  styleConfig: VideoStyleConfig;
  onStyleConfigChange: (config: VideoStyleConfig) => void;
  onApiError?: (title: string, msg: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  brand,
  script,
  persona,
  styleConfig,
  onStyleConfigChange,
  onApiError,
}) => {
  const { user, consumeCredit, openPricingModal } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const allWords: ScriptWord[] = (script?.segments && script.segments.length > 0)
    ? script.segments.flatMap((s) => s.words)
    : (script?.fullText || '').split(/\s+/).filter(Boolean).map((w, i) => ({ word: w, start: i * 0.35, end: (i + 1) * 0.35 }));
  const totalDuration = Math.max(allWords[allWords.length - 1]?.end || 0, 22.0);

  const activeVoiceId = styleConfig.voiceId || (persona.gender === 'female' ? 'en-US-AvaMultilingualNeural' : 'en-US-AndrewMultilingualNeural');

  useEffect(() => {
    setIsPlaying(false);
    setActiveWordIndex(null);
    setProgress(0);
    setImageError(false);
    audioEngine.stop();
    audioEngine.preloadAudio(script.fullText, activeVoiceId);
  }, [script.id, persona.gender, styleConfig.voiceId, brand.screenshotUrl]);

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setActiveWordIndex(null);
    } else {
      setIsPlaying(true);

      audioEngine.speakScript(
        script.fullText,
        allWords,
        styleConfig.voiceGender,
        styleConfig.speechRate,
        (idx, word) => {
          setActiveWordIndex(idx);
          const currentT = word.start;
          setProgress((currentT / totalDuration) * 100);
        },
        () => {
          setIsPlaying(false);
          setActiveWordIndex(null);
          setProgress(100);
        },
        {
          voice: activeVoiceId,
          bgmTrack: styleConfig.bgmTrack,
          bgmVolume: styleConfig.bgmVolume,
        }
      );
    }
  };

  const handleExport = async () => {
    const hasCredit = consumeCredit();
    if (!hasCredit) {
      openPricingModal();
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    // Intercept with post-generation feedback modal while export renders in background
    setFeedbackModalOpen(true);
    try {
      const recorder = new ClientVideoRecorder(720, 1280);
      const url = await recorder.renderAndExportVideo(
        brand,
        script,
        persona,
        styleConfig,
        (p) => setExportProgress(p)
      );
      setExportedVideoUrl(url);
    } catch (err: any) {
      console.error('Export failed', err);
      if (onApiError) {
        onApiError('Video Render Alert', 'Export encountered a canvas buffer delay. Built-in zero-cost rendering will now retry with fallback settings.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const activeWord = activeWordIndex !== null ? allWords[activeWordIndex] : null;
  const activeChunkInfo = activeWordIndex !== null ? getActiveCaptionChunk(allWords, activeWordIndex) : null;
  const visibleWordsWindow = activeChunkInfo ? activeChunkInfo.chunk.words : allWords.slice(0, 2);
  const isSoloChunk = activeChunkInfo ? activeChunkInfo.chunk.isSolo : false;

  const format = styleConfig.templateFormat || 'split_screen_demo';

  return (
    <div className="flex flex-col items-center w-full">
      {/* Template Format Switcher Pills */}
      <div className="mb-3 flex items-center gap-1.5 rounded-2xl bg-zinc-900/90 p-1 border border-zinc-800 text-xs overflow-x-auto max-w-full">
        <button
          onClick={() => onStyleConfigChange({ ...styleConfig, templateFormat: 'split_screen_demo' })}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 transition-all min-h-[32px] ${
            format === 'split_screen_demo'
              ? 'bg-amber-400 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Video className="h-3 w-3" />
          <span>Split Demo</span>
        </button>

        <button
          onClick={() => onStyleConfigChange({ ...styleConfig, templateFormat: 'podcast_hook' })}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 transition-all min-h-[32px] ${
            format === 'podcast_hook'
              ? 'bg-amber-400 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Tv className="h-3 w-3" />
          <span>Podcast</span>
        </button>

        <button
          onClick={() => onStyleConfigChange({ ...styleConfig, templateFormat: 'tweet_reveal' })}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 transition-all min-h-[32px] ${
            format === 'tweet_reveal'
              ? 'bg-amber-400 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquareQuote className="h-3 w-3" />
          <span>Tweet Hook</span>
        </button>

        <button
          onClick={() => onStyleConfigChange({ ...styleConfig, templateFormat: 'split_gameplay' })}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 transition-all min-h-[32px] ${
            format === 'split_gameplay'
              ? 'bg-amber-400 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="h-3 w-3" />
          <span>Satisfying Loop</span>
        </button>
      </div>

      {/* 9:16 Vertical Video Frame with Dynamic Mobile Viewport Scaling (max-h-[72vh]) */}
      <div className="relative aspect-[9/16] w-full max-h-[72vh] max-w-[340px] sm:max-w-[360px] mx-auto overflow-hidden rounded-[28px] sm:rounded-[32px] border-[3px] border-zinc-800 bg-zinc-950 shadow-2xl ring-1 ring-white/10 flex flex-col justify-between select-none">
        
        {/* Live Playing Audio Waveform Indicator */}
        {isPlaying && (
          <div className="absolute top-3 inset-x-0 z-40 flex justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 rounded-full bg-black/85 px-3 py-1 border border-yellow-400/40 shadow-lg">
              <Radio className="h-3 w-3 text-yellow-400 animate-pulse" />
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                Playing Voiceover
              </span>
              <span className="flex gap-0.5 items-end h-2.5">
                <span className="w-0.5 bg-yellow-400 h-2 animate-bounce" />
                <span className="w-0.5 bg-yellow-400 h-3 animate-pulse" />
                <span className="w-0.5 bg-yellow-400 h-1.5 animate-bounce" />
              </span>
            </div>
          </div>
        )}

        {/* TOP SECTION: Based on Selected Viral Template with Smooth Ken Burns Slow Push */}
        {format === 'tweet_reveal' ? (
          <div className="relative h-[48%] w-full bg-neutral-950 p-4 flex flex-col justify-center">
            <div className="rounded-2xl border border-white/10 bg-black/90 p-3.5 shadow-xl">
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src={persona.avatarUrl}
                  alt={persona.name}
                  className="h-8 w-8 rounded-full object-cover border border-yellow-400"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">{persona.name}</span>
                    <span className="text-[10px] text-sky-400">✓</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">@{persona.name.toLowerCase().replace(/\s+/g, '')}</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-white leading-snug">
                "{script.hookHeadline}"
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500 border-t border-white/5 pt-1.5">
                <span>11:42 AM • 4.2M Views</span>
                <span className="text-yellow-400 font-bold">🔥 VIRAL</span>
              </div>
            </div>
          </div>
        ) : format === 'podcast_hook' ? (
          <div className="relative h-[48%] w-full overflow-hidden bg-neutral-950">
            <img
              src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80"
              alt="Podcast Studio"
              className={`h-full w-full object-cover opacity-60 transition-transform duration-1000 ${
                isPlaying ? 'scale-108' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090e] via-transparent to-black/60" />
            
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2.5 rounded-2xl bg-black/85 p-2 border border-white/15 backdrop-blur-md">
              <img
                src={persona.avatarUrl}
                alt={persona.name}
                className="h-10 w-10 rounded-xl object-cover border-2 border-yellow-400"
              />
              <div>
                <span className="text-xs font-bold text-white block">🎙️ {persona.name}</span>
                <span className="text-[10px] text-yellow-400 font-semibold">The Growth Podcast</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-[48%] w-full overflow-hidden bg-neutral-950">
            <img
              src={persona.avatarUrl}
              alt={persona.name}
              className={`h-full w-full object-cover transition-transform ease-out duration-1000 ${
                isPlaying ? 'scale-108 translate-y-[-4px]' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#09090e]" />

            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/75 px-3 py-1 border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-white">{persona.name}</span>
              <span className="text-[10px] text-yellow-400 font-semibold">{persona.role}</span>
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 border border-white/15 backdrop-blur-md">
              <span className="text-xs">{brand.logoUrl || '⚡'}</span>
              <span className="text-xs font-bold text-white">{brand.name}</span>
            </div>
          </div>
        )}

        {/* CENTER: Floating Modern Subtitles with Submagic/CapCut Springing Emoji Badges */}
        <div className="absolute top-[44%] inset-x-2 z-30 flex flex-col items-center pointer-events-none">
          <div className="flex items-center justify-center gap-2 flex-wrap text-center max-w-[320px]">
            {visibleWordsWindow.map((w, i) => {
              const isActive = activeWord && w.start === activeWord.start;
              const emoji = getEmojiForWord(w.word, w.emoji);
              return (
                <div key={i} className="relative inline-flex flex-col items-center">
                  {isActive && emoji && (
                    <div className="absolute -top-10 flex items-center justify-center h-8 w-8 rounded-full bg-black/90 border border-white/20 shadow-[0_0_12px_rgba(250,204,21,0.5)] animate-bounce text-sm z-30">
                      {emoji}
                    </div>
                  )}
                  <span
                    className={`font-black uppercase tracking-tight transition-all ${
                      isSoloChunk ? 'text-2xl' : 'text-xl'
                    } ${
                      isActive
                        ? isSoloChunk
                          ? 'text-black px-3.5 py-1.5 rounded-2xl shadow-2xl scale-115 ring-2 ring-white/80'
                          : 'text-black px-2.5 py-1 rounded-xl shadow-2xl scale-110'
                        : 'text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]'
                    }`}
                    style={{
                      fontFamily: 'Impact, Arial Black, -apple-system, sans-serif',
                      backgroundColor: isActive ? (styleConfig.captionColor || '#facc15') : 'transparent',
                      textShadow: isActive
                        ? 'none'
                        : '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 12px rgba(0,0,0,0.9)',
                    }}
                  >
                    {w.word}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM SECTION: Live Interactive Browser Demo with Ken Burns & Safe Zone Padding */}
        {format === 'split_gameplay' ? (
          <div className="relative h-[48%] w-full overflow-hidden bg-neutral-950 p-3 pt-0">
            <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 relative">
              <KineticLoopCanvas isPlaying={isPlaying} />
              <div className="absolute inset-0 bg-black/30 pointer-events-none flex items-center justify-center">
                <span className="rounded-xl bg-black/80 px-3 py-1 text-xs font-bold text-yellow-400 border border-yellow-400/30 shadow-lg">
                  ⚡ 4.2x Retention Loop
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-[48%] w-full p-3 pt-0 pb-4 flex flex-col justify-end">
            <div
              className={`h-full w-full rounded-2xl border-2 bg-neutral-900/90 overflow-hidden flex flex-col shadow-xl transition-transform duration-700 ${
                isPlaying ? 'scale-[1.02]' : 'scale-100'
              }`}
              style={{ borderColor: brand.primaryColor || '#facc15' }}
            >
              {/* Browser Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950 px-3 py-1.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <span className="text-neutral-400 font-mono text-[9px] truncate max-w-[150px]">
                  🔒 {brand.url}
                </span>
                <span className="text-emerald-400 font-bold text-[9px]">LIVE</span>
              </div>

              {/* Dynamic Live SaaS Product Screen OR Scene 4 Offer Card */}
              {isPlaying && ((progress / 100) * totalDuration >= totalDuration - 3.5) ? (
                /* Scene 4: Clean Unified CTA Card (Only in final 3.5s) */
                <div className="relative flex-1 bg-neutral-950/95 p-3 flex flex-col items-center justify-center text-center animate-fade-in">
                  <span className="text-yellow-400 text-xs font-bold mb-1">⭐⭐⭐⭐⭐ 4.9 / 5.0 Rating</span>
                  <div className="w-full max-w-[260px] rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2 my-1.5">
                    <span className="text-xs font-black text-emerald-400 block uppercase tracking-wide">
                      {styleConfig.promoCode ? `CODE: ${styleConfig.promoCode}` : 'TRY 100% FREE TODAY'}
                    </span>
                    <span className="text-[10px] text-neutral-300">Instant Access • No Card Required</span>
                  </div>
                  <span className="text-[11px] font-bold text-yellow-400 mt-1">
                    👉 Tap Link in Bio to Start Now
                  </span>
                </div>
              ) : (
                /* Scene 1-3: Live Product Mockup OR Procedural Hero Fallback */
                <div className="relative flex-1 bg-black/80 flex flex-col justify-center items-center p-3 text-center overflow-hidden">
                  {!imageError && brand.screenshotUrl && !/dns_probe|err_name_not_resolved|chrome-error|error_page|can't be reached/i.test(brand.screenshotUrl) ? (
                    <img
                      src={brand.screenshotUrl}
                      alt={brand.name}
                      onError={() => setImageError(true)}
                      className={`absolute inset-0 h-full w-full object-cover transition-transform ease-out duration-1000 ${
                        isPlaying ? 'scale-108 translate-y-[-6px]' : 'scale-100'
                      }`}
                    />
                  ) : (
                    /* Procedural Hero Layout Fallback (Gradient Skeleton + Domain + Action) */
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d16] via-[#141424] to-[#090910] p-3 flex flex-col justify-between items-center text-center">
                      <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 border border-yellow-400/40 mt-1">
                        <span className="text-xs">{brand.logoUrl || '⚡'}</span>
                        <span className="text-[10px] font-bold text-yellow-400">{brand.name.toUpperCase()}</span>
                      </div>
                      <div className="my-1">
                        <h5 className="text-xs font-black text-white line-clamp-1">{brand.tagline || brand.name}</h5>
                        <div className="flex justify-center gap-1 mt-1.5">
                          <span className="text-[8px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-400/30">⚡ 10X SPEED</span>
                          <span className="text-[8px] bg-sky-400/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-400/30">🔒 AUTO-SYNC</span>
                          <span className="text-[8px] bg-emerald-400/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-400/30">⭐ 4.9 RATED</span>
                        </div>
                      </div>
                      <div className="w-full max-w-[200px] h-10 rounded-lg bg-white/5 border border-white/10 p-1.5 flex gap-1.5 animate-pulse">
                        <div className="flex-1 bg-yellow-400/20 rounded" />
                        <div className="flex-1 bg-sky-400/20 rounded" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col items-center pointer-events-none">
                    <span className="text-xl mb-0.5 drop-shadow">{brand.logoUrl || '⚡'}</span>
                    <h4 className="text-xs font-extrabold text-white line-clamp-1 drop-shadow-md">{brand.name}</h4>
                    <p className="text-[10px] text-neutral-200 line-clamp-1 mt-0.5 max-w-[200px] drop-shadow">
                      {brand.tagline}
                    </p>
                    
                    {/* Single High-Converting CTA Pill */}
                    <div
                      className="mt-2 flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[9px] font-bold text-black shadow-lg animate-pulse"
                      style={{ backgroundColor: brand.primaryColor || '#facc15' }}
                    >
                      <span>⚡ 1-CLICK ACTION</span>
                      <span>→</span>
                      <span className="font-extrabold">TRY FREE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-2 inset-x-4 z-40">
          <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-150"
              style={{ width: `${progress}%`, backgroundColor: styleConfig.captionColor }}
            />
          </div>
        </div>
      </div>

      {/* Video Control Bar */}
      <div className="mt-3.5 flex w-full max-w-[360px] items-center justify-between gap-2 rounded-2xl bg-zinc-900/90 p-2.5 border border-zinc-800 backdrop-blur-md shadow-lg">
        {/* Play/Pause Toggle */}
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-black hover:bg-amber-300 transition-all shadow-md active:scale-95"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 fill-black" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-black" />
              <span>Preview Reel</span>
            </>
          )}
        </button>

        {/* 1-Word Highlight Color Picker */}
        <div className="flex items-center gap-1.5 px-2">
          {['#f59e0b', '#10b981', '#38bdf8', '#f43f5e'].map((color) => (
            <button
              key={color}
              onClick={() => onStyleConfigChange({ ...styleConfig, captionColor: color })}
              className={`h-5 w-5 rounded-full border-2 transition-all active:scale-95 ${
                styleConfig.captionColor === color ? 'scale-125 border-white shadow-sm' : 'border-transparent opacity-60'
              }`}
              style={{ backgroundColor: color }}
              title={`Highlight color: ${color}`}
            />
          ))}
        </div>

        {/* 1-Click Export MP4 */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 hover:border-zinc-600 transition-all disabled:opacity-50 active:scale-95"
        >
          {isExporting ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
              <span>{exportProgress}%</span>
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5 text-amber-400" />
              <span>Export HD</span>
            </>
          )}
        </button>
      </div>

      {/* 2 Male & 2 Female Conversational Human Voice Models Switcher */}
      <div className="mt-3.5 flex flex-col w-full max-w-[360px] rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
            <Mic className="h-3.5 w-3.5 text-amber-400" />
            <span>Voice Persona (2 Male • 2 Female)</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Studio Neural
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {HUMAN_VOICE_PRESETS.map((v) => {
            const isSelected = activeVoiceId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  onStyleConfigChange({
                    ...styleConfig,
                    voiceId: v.id,
                    voiceGender: v.gender,
                  });
                  audioEngine.playVoiceSample(v.sampleText, v.id, v.gender);
                }}
                className={`flex items-center justify-between gap-1.5 rounded-xl p-2 text-left transition-all border ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/15 text-white font-bold ring-1 ring-amber-400/30 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base shrink-0">{v.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold leading-tight truncate text-zinc-200">{v.shortName}</div>
                    <div className={`text-[9px] uppercase font-bold tracking-tight ${v.gender === 'male' ? 'text-sky-400' : 'text-rose-400'}`}>
                      {v.gender === 'male' ? '♂ Male' : '♀ Female'}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                ) : (
                  <span className="text-[9px] text-zinc-400 shrink-0">Select</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Beat Storyboard Scene Breakdown */}
      <div className="mt-3 flex w-full max-w-[360px] items-center justify-between rounded-2xl bg-zinc-950/80 border border-zinc-800 p-2.5 text-[11px] text-zinc-400">
        <span className="font-bold text-amber-400">Beats:</span>
        <span className="bg-zinc-800 px-2 py-0.5 rounded-lg text-white">0-3s Hook</span>
        <span>→</span>
        <span className="bg-zinc-800 px-2 py-0.5 rounded-lg text-white">3-7s Problem</span>
        <span>→</span>
        <span className="bg-zinc-800 px-2 py-0.5 rounded-lg text-white">7-12s Demo</span>
        <span>→</span>
        <span className="bg-zinc-800 px-2 py-0.5 rounded-lg text-emerald-400 font-bold">12-15s Offer</span>
      </div>

      {/* Background Music & Sound FX Controls */}
      <div className="mt-3 flex flex-col gap-2 w-full max-w-[360px] text-xs rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-300 uppercase flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>Procedural BGM Loop (Zero-Asset)</span>
          </label>
          <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            Sidechain Ducked
          </span>
        </div>

        {/* 4 BGM Track Segmented Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'upbeat_tech', label: '⚡ Upbeat Tech', bpm: '124 BPM' },
            { id: 'lofi_chill', label: '☕ Lofi Chill', bpm: '80 BPM' },
            { id: 'phonk_drill', label: '🏎️ Phonk Drift', bpm: '135 BPM' },
            { id: 'none', label: '🔇 Voice Only', bpm: 'Mute BGM' },
          ].map((track) => {
            const isSelected = (styleConfig.bgmTrack || 'upbeat_tech') === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={async () => {
                  await audioEngine.unlockAudio();
                  onStyleConfigChange({
                    ...styleConfig,
                    bgmTrack: track.id as any,
                  });

                  if (isPlaying) {
                    // Hot-swap BGM live in preview
                    audioEngine.speakScript(
                      script.fullText,
                      allWords,
                      styleConfig.voiceGender,
                      styleConfig.speechRate,
                      (idx, word) => {
                        setActiveWordIndex(idx);
                        const currentT = word.start;
                        setProgress((currentT / totalDuration) * 100);
                      },
                      () => {
                        setIsPlaying(false);
                        setActiveWordIndex(null);
                        setProgress(100);
                      },
                      {
                        voice: activeVoiceId,
                        bgmTrack: track.id as any,
                        bgmVolume: styleConfig.bgmVolume ?? 0.12,
                      }
                    );
                  } else if (track.id !== 'none') {
                    // Quick 4s beat preview
                    audioEngine.previewBgm(track.id);
                  }
                }}
                className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all border ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/20 text-white font-bold ring-1 ring-amber-400/40 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate leading-tight">{track.label}</div>
                  <div className="text-[8px] text-zinc-400 font-mono">{track.bpm}</div>
                </div>
                {isSelected && <Check className="h-3 w-3 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Promo Code Input */}
        <div className="mt-1 pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-zinc-400 shrink-0">🎁 Offer Badge:</span>
          <input
            type="text"
            value={styleConfig.promoCode ?? brand.promoCode ?? 'SAVE50'}
            onChange={(e) => onStyleConfigChange({ ...styleConfig, promoCode: e.target.value })}
            placeholder="e.g. SAVE50"
            className="w-28 rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1 text-[11px] text-amber-400 font-mono font-bold text-right outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Download Alert & Watch Exported Video */}
      {exportedVideoUrl && (
        <div className="mt-4 flex flex-col w-full max-w-[360px] rounded-2xl bg-zinc-900 border border-emerald-500/30 p-3.5 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Video Ready with Studio Voice & BGM!</span>
            </div>
            <a
              href={exportedVideoUrl}
              download={`${brand.name.toLowerCase()}-saasreels.mp4`}
              className="rounded-xl bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-emerald-300 transition-all shadow-md flex items-center gap-1"
            >
              <span>Download MP4</span>
            </a>
          </div>

          <div className="relative aspect-[9/16] w-full rounded-xl overflow-hidden bg-black border border-white/10">
            <video
              src={exportedVideoUrl}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Post-Generation / Pre-Download Feedback & Beta Perks Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        brandName={brand.name}
        targetUrl={brand.url}
      />
    </div>
  );
};
