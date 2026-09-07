'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Calendar,
  Mail,
  Check,
  Sparkles,
  ExternalLink,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const RATING_TIERS = [
  { value: 1, emoji: '😡', label: 'Poor', description: 'Needs work' },
  { value: 2, emoji: '😕', label: 'Fair', description: 'Could improve' },
  { value: 3, emoji: '🙂', label: 'Good', description: 'Works well' },
  { value: 4, emoji: '🔥', label: 'Great', description: 'Very impressed' },
  { value: 5, emoji: '🚀', label: 'Mindblowing', description: 'Game changer!' },
];

export const GlobalFeedbackWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const MAX_LETTERS = 1500;

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-feedback-modal', handleOpen);
    return () => window.removeEventListener('open-feedback-modal', handleOpen);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('arjunpatel89806@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() && !rating) return;

    setIsSubmitting(true);
    try {
      const selectedTier = RATING_TIERS.find((t) => t.value === rating);
      const emailToSubmit = user?.email || guestEmail.trim() || 'guest@saasreels.ai';

      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          ratingLabel: selectedTier ? (selectedTier.emoji + ' ' + selectedTier.label) : (rating + ' Stars'),
          comment: comment.trim(),
          email: emailToSubmit,
          userId: user?.id,
          userName: user?.name,
          userTier: user?.tier || 'free',
          targetUrl: targetUrl.trim(),
        }),
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setComment('');
        setTargetUrl('');
      }, 2200);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRatingObj = RATING_TIERS.find((t) => t.value === (hoverRating || rating)) || RATING_TIERS[4];
  const charRemaining = MAX_LETTERS - comment.length;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-amber-400/40 bg-zinc-900/95 px-4 py-2.5 text-xs font-black text-amber-300 shadow-2xl backdrop-blur-xl hover:bg-amber-400 hover:text-black hover:scale-105 transition-all active:scale-95 group"
        aria-label="Give Feedback"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400"></span>
        </span>
        <MessageSquare className="h-4 w-4 text-amber-400 group-hover:text-black transition-colors" />
        <span className="tracking-wide">Feedback & Rating</span>
      </button>

      {/* Feedback Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0c0c10] p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto ring-1 ring-amber-500/20">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {isSubmitted ? (
              <div className="py-10 text-center animate-fade-in">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-white">Thank You for Your Feedback!</h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Your rating and suggestions have been logged directly into our founder admin dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>Rate SaaSReels & Share Feedback</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Help us build the absolute best AI short-form studio for software founders.
                    </p>
                  </div>
                </div>

                {user ? (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-amber-400" />
                      <span>Submitting as <strong className="text-white">{user.name || user.email}</strong></span>
                    </div>
                    <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                      {user.tier} Plan
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Your Email (for follow-ups & 1-month free VIP pass)
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="founder@yourdomain.com"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* 1. Rate SaaS Reels */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between mb-2">
                    <span>1. Rate SaaSReels</span>
                    <span className="text-amber-400 font-black normal-case text-xs flex items-center gap-1">
                      <span className="text-lg">{activeRatingObj.emoji}</span>
                      <span>{activeRatingObj.label} — {activeRatingObj.description}</span>
                    </span>
                  </label>

                  <div className="grid grid-cols-5 gap-2">
                    {RATING_TIERS.map((tier) => {
                      const isSelected = rating === tier.value;
                      return (
                        <button
                          key={tier.value}
                          type="button"
                          onMouseEnter={() => setHoverRating(tier.value)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(tier.value)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-2xl border py-3 px-1 transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-400/40 scale-105'
                              : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/80 text-zinc-400'
                          }`}
                        >
                          <span className="text-2xl">{tier.emoji}</span>
                          <span className={`text-[11px] font-black ${isSelected ? 'text-amber-300' : 'text-zinc-400'}`}>
                            {tier.value}★ {tier.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Feedback Text Box (1500 Characters) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      2. Your Feedback & Suggestions (Up to 1500 letters)
                    </label>
                    <span
                      className={`text-[11px] font-mono font-bold ${
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
                    rows={4}
                    maxLength={MAX_LETTERS}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked, what felt confusing, or what specific video styles (e.g. kinetic typography, code breakdown, podcast interview) you want added next..."
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Optional Target URL */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Tested SaaS / Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://mysaas.com"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* VIP 1-Month Free Access Incentive */}
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent p-3.5 flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-300">
                      🎁 Want 1 Month Free Unlimited Reels?
                    </p>
                    <p className="text-zinc-400 text-[11px] mt-0.5">
                      Book a quick 15-minute feedback call with the founder and get full VIP access.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href="https://calendly.com/arjunpatel89806/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-[11px] font-black text-black hover:bg-amber-300"
                      >
                        <Calendar className="h-3 w-3" />
                        <span>Book 15-Min Call</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-300 hover:text-white"
                      >
                        {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Mail className="h-3 w-3" />}
                        <span>{copiedEmail ? 'Copied' : 'Email Arjun'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!comment.trim() && !rating)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-xs font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-400/20 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>{isSubmitting ? 'Submitting...' : 'Send Feedback'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
