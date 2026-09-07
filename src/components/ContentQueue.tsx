'use client';

import React from 'react';
import { QueuedPost } from '@/types';
import { Calendar, Download, Trash2, CheckCircle2, Share2, Flame, Copy, ExternalLink } from 'lucide-react';

interface ContentQueueProps {
  queue: QueuedPost[];
  onRemoveFromQueue: (id: string) => void;
  onClearQueue: () => void;
}

export const ContentQueue: React.FC<ContentQueueProps> = ({
  queue,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyCaption = (post: QueuedPost) => {
    const fullCaption = `${post.script.hookHeadline}\n\n${post.script.callToAction}\n\n${post.script.suggestedHashtags.join(' ')}`;
    navigator.clipboard.writeText(fullCaption);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const avgScore = queue.length
    ? Math.round(queue.reduce((acc, p) => acc + p.script.viralScore, 0) / queue.length)
    : 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-zinc-100">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span>Social Publishing Queue & Calendar</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Approved shorts ready for automated publishing across TikTok, Instagram Reels, and YouTube Shorts.
          </p>
        </div>

        {queue.length > 0 && (
          <button
            onClick={onClearQueue}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Queue</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <span className="text-[11px] font-medium text-zinc-400">Approved Posts</span>
          <p className="text-2xl font-black text-zinc-100 mt-0.5">{queue.length}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <span className="text-[11px] font-medium text-zinc-400">Avg Viral Score</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
            <p className="text-2xl font-black text-amber-400">{avgScore} / 100</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <span className="text-[11px] font-medium text-zinc-400">Target Platforms</span>
          <p className="text-xs font-bold text-emerald-400 mt-1.5">TikTok • Reels • Shorts</p>
        </div>
      </div>

      {/* Queue List */}
      {queue.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
          <Calendar className="h-10 w-10 text-zinc-600 mb-2" />
          <h4 className="text-base font-bold text-zinc-300">Your Queue is Empty</h4>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">
            Use the <strong>Studio</strong> or <strong>Blitz Mode</strong> swipe deck to review and approve viral shorts for your product.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map((post, idx) => (
            <div
              key={post.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              {/* Left post preview */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 font-black">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100 line-clamp-1">
                      {post.script.hookHeadline}
                    </span>
                    <span className="flex items-center gap-0.5 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-400">
                      <Flame className="h-2.5 w-2.5 fill-amber-400" />
                      {post.script.viralScore}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                    {post.brand.name} • {post.persona.name} ({post.persona.role})
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>Scheduled: {post.scheduledTime}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">Ready to Publish</span>
                  </div>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleCopyCaption(post)}
                  className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-600 hover:text-white transition-all active:scale-95"
                  title="Copy ready-to-post caption & hashtags"
                >
                  {copiedId === post.id ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onRemoveFromQueue(post.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-all active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
