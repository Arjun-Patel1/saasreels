'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface CaptchaWidgetProps {
  onVerifiedChange: (verified: boolean, token: string, answer: string) => void;
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({ onVerifiedChange }) => {
  const [challenge, setChallenge] = useState<{ token: string; question: string } | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswerValid, setIsAnswerValid] = useState(false);

  const fetchCaptcha = async () => {
    setIsLoading(true);
    setAnswerInput('');
    setIsAnswerValid(false);
    onVerifiedChange(false, '', '');
    try {
      const res = await fetch('/api/auth/captcha');
      if (res.ok) {
        const data = await res.json();
        if (data.challenge) {
          setChallenge(data.challenge);
        }
      }
    } catch {
      // Fallback local challenge
      setChallenge({
        token: 'local_token_' + Date.now(),
        question: 'What is 7 + 4?',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleInputChange = (val: string) => {
    setAnswerInput(val);
    if (val.trim().length > 0 && challenge) {
      setIsAnswerValid(true);
      onVerifiedChange(true, challenge.token, val.trim());
    } else {
      setIsAnswerValid(false);
      onVerifiedChange(false, '', '');
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`h-4 w-4 ${isAnswerValid ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-[11px] font-bold text-zinc-300">Human Verification Challenge</span>
        </div>
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={isLoading}
          className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
          title="Refresh Challenge"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-mono font-bold text-amber-300 select-none">
          {isLoading ? 'Generating challenge...' : challenge?.question || 'What is 5 + 3?'}
        </div>
        <input
          type="number"
          value={answerInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Answer"
          className="w-24 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-center text-xs font-bold text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
        />
      </div>
      <p className="text-[10px] text-zinc-500">
        Free bot-protection challenge. Zero trackers or third-party cookies.
      </p>
    </div>
  );
};
