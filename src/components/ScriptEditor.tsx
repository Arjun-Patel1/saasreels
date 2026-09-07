'use client';

import React from 'react';
import { Flame, Edit3, Sparkles, Hash, ArrowUpRight, Check, Plus, RefreshCw } from 'lucide-react';
import { VideoScript } from '@/types';

interface ScriptEditorProps {
  scripts: VideoScript[];
  selectedScript: VideoScript;
  onSelectScript: (script: VideoScript) => void;
  onUpdateScriptText: (newText: string) => void;
  onAddToQueue: (script: VideoScript) => void;
  onRegenerate: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  scripts,
  selectedScript,
  onSelectScript,
  onUpdateScriptText,
  onAddToQueue,
  onRegenerate,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm sm:text-base font-bold text-zinc-100">AI Script & Hook Angles</h3>
        </div>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-all active:scale-95"
        >
          <RefreshCw className="h-3 w-3 text-amber-400" />
          <span>Regenerate Hooks</span>
        </button>
      </div>

      {/* 5 Viral Angles Tab Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {scripts.map((s) => {
          const isSelected = s.id === selectedScript.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectScript(s)}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/5'
                  : 'border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-200 line-clamp-1">
                  {s.angleTitle}
                </span>
                <span className="flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-400">
                  <Flame className="h-2.5 w-2.5 fill-amber-400" />
                  {s.viralScore}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                "{s.hookHeadline}"
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Script Text Editor */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-300">Active Narration Script</span>
          <span className="text-[11px] text-zinc-500">
            {selectedScript.fullText.split(/\s+/).length} words (~15s)
          </span>
        </div>

        <textarea
          rows={4}
          value={selectedScript.fullText}
          onChange={(e) => onUpdateScriptText(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 text-base sm:text-sm text-zinc-100 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans leading-relaxed transition-colors"
        />

        {/* CTA and Hashtags */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-zinc-800/80 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Call to Action:</span>
            <span className="text-amber-400 font-medium">{selectedScript.callToAction}</span>
          </div>

          <button
            onClick={() => onAddToQueue(selectedScript)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 sm:py-1.5 text-xs font-bold text-zinc-950 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Approve & Add to Queue</span>
          </button>
        </div>

        {/* Hashtags Bar */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-zinc-500" />
          {selectedScript.suggestedHashtags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 text-[10px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
