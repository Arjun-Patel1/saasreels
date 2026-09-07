'use client';

import React, { useState } from 'react';
import { AIPersona, VideoStyleConfig } from '@/types';
import { AI_PERSONAS, HUMAN_VOICE_PRESETS, HumanVoicePreset } from '@/lib/mockData';
import { UserCheck, Sparkles, Volume2, ShieldCheck, Play, Pause, Radio, Check, Mic } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';

interface AvatarLibraryProps {
  selectedPersona: AIPersona;
  onSelectPersona: (persona: AIPersona) => void;
  styleConfig: VideoStyleConfig;
  onStyleConfigChange: (config: VideoStyleConfig) => void;
}

export const AvatarLibrary: React.FC<AvatarLibraryProps> = ({
  selectedPersona,
  onSelectPersona,
  styleConfig,
  onStyleConfigChange,
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const handleTestVoice = (preset: HumanVoicePreset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (playingVoiceId === preset.id) {
      audioEngine.stop();
      setPlayingVoiceId(null);
    } else {
      audioEngine.playVoiceSample(
        preset.sampleText,
        preset.id,
        preset.gender,
        () => setPlayingVoiceId(preset.id),
        () => setPlayingVoiceId(null)
      );
    }
  };

  const handleSelectVoice = (preset: HumanVoicePreset) => {
    onStyleConfigChange({
      ...styleConfig,
      voiceId: preset.id,
      voiceGender: preset.gender,
    });
    // Also match persona if applicable
    const matchedPersona = AI_PERSONAS.find((p) => p.id === preset.avatarId);
    if (matchedPersona) {
      onSelectPersona(matchedPersona);
    }
  };

  const activeVoiceId = styleConfig.voiceId || (styleConfig.voiceGender === 'female' ? 'en-US-AvaMultilingualNeural' : 'en-US-AndrewMultilingualNeural');

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-zinc-800/80 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-zinc-100">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>AI Brand Ambassadors & Human Voice Models</span>
          </h2>
          <span className="self-start sm:self-auto rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
            🎙️ 2 Male & 2 Female Studio Voices
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Switch between 2 Male and 2 Female human conversational voices (NOT robotic AI). Pick an ambassador and listen to real voice previews.
        </p>
      </div>

      {/* 2 Male & 2 Female Human Conversational Voices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5 text-amber-400" />
            <span>1. Choose Human Voice (2 Male • 2 Female)</span>
          </h3>
          <span className="text-[10px] text-zinc-400">Click to Select & Preview</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HUMAN_VOICE_PRESETS.map((v) => {
            const isSelected = activeVoiceId === v.id || (!styleConfig.voiceId && v.gender === styleConfig.voiceGender && v.id.includes('Andrew'));
            const isPlayingThis = playingVoiceId === v.id;

            return (
              <div
                key={v.id}
                onClick={() => handleSelectVoice(v)}
                className={`group relative cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/20 shadow-lg'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{v.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{v.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          v.gender === 'male'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {v.gender === 'male' ? '♂ Male' : '♀ Female'}
                        </span>
                      </div>
                      <span className="inline-block text-[10px] text-amber-400 font-semibold mt-0.5">
                        {v.tag}
                      </span>
                    </div>
                  </div>

                  {/* Play Voice Sample Button */}
                  <button
                    type="button"
                    onClick={(e) => handleTestVoice(v, e)}
                    className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-sm ${
                      isPlayingThis
                        ? 'bg-amber-400 text-zinc-950 animate-pulse'
                        : 'border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-zinc-950" />
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-zinc-300 text-zinc-300" />
                        <span>Listen Sample</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed italic">
                  "{v.sampleText}"
                </p>

                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-400">
                  <span>{v.vibe}</span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Check className="h-3 w-3" /> ACTIVE VOICE
                    </span>
                  ) : (
                    <span className="text-zinc-400 group-hover:text-zinc-200">Tap to Use</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of 4 Visual AI Brand Ambassadors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            2. Select Visual AI Brand Ambassador
          </h3>
          <span className="text-[10px] text-zinc-400">2 Male & 2 Female Ambassadors</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AI_PERSONAS.map((persona) => {
            const isSelected = persona.id === selectedPersona.id;
            return (
              <div
                key={persona.id}
                onClick={() => {
                  onSelectPersona(persona);
                  // Find matching preset
                  const matchedPreset = HUMAN_VOICE_PRESETS.find((v) => v.avatarId === persona.id);
                  if (matchedPreset) {
                    onStyleConfigChange({
                      ...styleConfig,
                      voiceGender: persona.gender,
                      voiceId: matchedPreset.id,
                    });
                  } else {
                    onStyleConfigChange({
                      ...styleConfig,
                      voiceGender: persona.gender,
                    });
                  }
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-3 transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/20 shadow-xl'
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                {/* Avatar Image & Badge */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-900">
                  <img
                    src={persona.avatarUrl}
                    alt={persona.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-1.5 right-1.5 rounded-full bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 backdrop-blur-md">
                    {persona.badge}
                  </span>

                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-500/15 flex items-end justify-center pb-2">
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-zinc-950 shadow">
                        SELECTED
                      </span>
                    </div>
                  )}
                </div>

                {/* Persona Metadata */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-100 text-xs sm:text-sm truncate">{persona.name}</h4>
                    <span className={`text-[9px] font-semibold px-1 rounded uppercase ${
                      persona.gender === 'male' ? 'text-sky-400 bg-sky-950/60' : 'text-rose-400 bg-rose-950/60'
                    }`}>
                      {persona.gender}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">{persona.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
