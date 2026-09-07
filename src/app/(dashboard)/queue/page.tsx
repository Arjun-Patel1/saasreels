'use client';

import React, { useState, useEffect } from 'react';
import { ContentQueue } from '@/components/ContentQueue';
import { QueuedPost } from '@/types';
import { PRESET_BRANDS, AI_PERSONAS } from '@/lib/mockData';
import { generateAllScripts } from '@/lib/scriptEngine';
import { CheckCircle2, Calendar, Sparkles, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function QueuePage() {
  const [queue, setQueue] = useState<QueuedPost[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('saasreels_queue');
      if (saved) {
        setQueue(JSON.parse(saved));
        return;
      }
    } catch (e) {}

    // Default pre-populated items for a realistic demo
    const defaultScripts = generateAllScripts(PRESET_BRANDS[0]);
    const mockQueue: QueuedPost[] = [
      {
        id: 'queue-1',
        title: defaultScripts[0].hookHeadline,
        brand: PRESET_BRANDS[0],
        script: defaultScripts[0],
        persona: AI_PERSONAS[0],
        platforms: ['tiktok', 'instagram', 'youtube'],
        status: 'ready',
        scheduledTime: 'Tomorrow at 11:00 AM (Peak SaaS Hours)',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'queue-2',
        title: defaultScripts[1].hookHeadline,
        brand: PRESET_BRANDS[0],
        script: defaultScripts[1],
        persona: AI_PERSONAS[1],
        platforms: ['tiktok', 'instagram'],
        status: 'ready',
        scheduledTime: 'Thursday at 2:30 PM',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
    setQueue(mockQueue);
    localStorage.setItem('saasreels_queue', JSON.stringify(mockQueue));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveFromQueue = (id: string) => {
    const updated = queue.filter((p) => p.id !== id);
    setQueue(updated);
    try {
      localStorage.setItem('saasreels_queue', JSON.stringify(updated));
    } catch (e) {}
    showToast('🗑️ Removed post from queue');
  };

  const handleClearQueue = () => {
    setQueue([]);
    try {
      localStorage.removeItem('saasreels_queue');
    } catch (e) {}
    showToast('🧹 Queue cleared');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-bold text-black shadow-2xl animate-pop border border-black/10">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-black">
              <Calendar className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white">Social Publishing Queue</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Organize, schedule, copy viral captions, and bulk export your approved SaaS reels.
          </p>
        </div>

        <Link
          href="/studio"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all shadow-md self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create New Reel</span>
        </Link>
      </div>

      <ContentQueue
        queue={queue}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
      />
    </div>
  );
}
