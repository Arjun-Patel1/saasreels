'use client';

import React, { useState } from 'react';
import {
  X,
  MessageSquareHeart,
  Send,
  CheckCircle2,
  Calendar,
  Mail,
  Check,
  Sparkles,
  ExternalLink,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName?: string;
  targetUrl?: string;
  onSubmitted?: () => void;
}

const RATING_OPTIONS = [
  { id: 'poor', score: 1, emoji: '😡', label: 'Poor', color: 'hover:border-red-500/50 hover:bg-red-500/10' },
  { id: 'okay', score: 2, emoji: '😕', label: 'Okay', color: 'hover:border-amber-500/50 hover:bg-amber-500/10' },
  { id: 'good', score: 3, emoji: '🙂', label: 'Good', color: 'hover:border-sky-500/50 hover:bg-sky-500/10' },
  { id: 'great', score: 4, emoji: '🔥', label: 'Great', color: 'hover:border-amber-400/50 hover:bg-amber-400/10' },
  { id: 'insane', score: 5, emoji: '🚀', label: 'Insane', color: 'hover:border-emerald-400/50 hover:bg-emerald-400/10' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  brandName = 'Your SaaS',
  targetUrl = '',
  onSubmitted,
}) => {
  const { user } = useAuth();
  const [selectedRating, setSelectedRating] = useState<string>('great');
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const MAX_LETTERS = 1500;

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('arjunpatel89806@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedObj = RATING_OPTIONS.find((r) => r.id === selectedRating) || RATING_OPTIONS[3];
      const emailToSubmit = user?.email || userEmail.trim() || 'guest@saasreels.ai';

      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedObj.score,
          ratingLabel: `${selectedObj.emoji} ${selectedObj.label}`,
          comment: comment.trim(),
          email: emailToSubmit,
          userId: user?.id,
          userName: user?.name,
          userTier: user?.tier || 'free',
          targetUrl,
        }),
      });

      setIsSubmitted(true);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setComment('');
      }, 1800);
    } catch (err) {
      console.warn('Feedback submission error:', err);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const charRemaining = MAX_LETTERS - comment.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0d0d12] p-6 sm:p-7 shadow-2xl max-h-[94vh] overflow-y-auto ring-1 ring-amber-500/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center animate-fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-white">Thank You for Your Feedback!</h3>
            <p className="mt-2 text-xs text-zinc-400 max-w-xs mx-auto">
              Your feedback is recorded. Your video download is processing smoothly!
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
                <MessageSquareHeart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">How did this reel turn out?</h3>
                <p className="text-xs text-zinc-400">
                  Rate your video generation for <span className="text-amber-400 font-semibold">{brandName}</span>
                </p>
              </div>
            </div>

            {/* 1-Click 5-Emoji Rating Grid */}
            <div className="my-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                1-Click Video Rating
              </label>
              <div className="grid grid-cols-5 gap-2">
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = selectedRating === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedRating(opt.id)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border py-2.5 px-1 transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/30 scale-105'
                          : `border-zinc-800 bg-zinc-900/80 text-zinc-400 ${opt.color}`
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected ? 'text-amber-300' : 'text-zinc-400'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feature / Feedback Textarea (1500 Letters) */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Feedback & Feature Requests
                </label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    charRemaining < 100
                      ? 'text-rose-400'
                      : charRemaining < 300
                      ? 'text-amber-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {comment.length} / {MAX_LETTERS} letters
                </span>
              </div>
              <textarea
                value={comment}
                maxLength={MAX_LETTERS}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What's one feature or hook angle we should add to help you get more customers?"
                rows={3}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
              />
            </div>

            {/* User Account / Email */}
            {!user && (
              <div className="mt-3">
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Your Email (Optional, for beta perks & follow-ups)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="founder@yourcompany.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            )}

            {/* VIP Beta Incentive Callout Card */}
            <div className="mt-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent p-4 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <Gift className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-amber-300">
                    🎁 Want 1 Month Free Unlimited Video Generations?
                  </h4>
                  <p className="mt-1 text-[11px] text-zinc-300 leading-relaxed">
                    We're gifting 1 month of VIP access to founders who give us 15 minutes of live feedback.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href="https://calendly.com/arjunpatel89806/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-black hover:bg-amber-300 transition-all active:scale-95 shadow-md shadow-amber-500/20"
                    >
                      <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>👉 Book 15-Min Beta Call</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors"
                      title="Copy founder email"
                    >
                      {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Mail className="h-3 w-3" />}
                      <span>{copiedEmail ? 'Email Copied!' : 'Email Arjun'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Skip to Download →
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
