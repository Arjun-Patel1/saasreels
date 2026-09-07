'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, CheckCircle2, AlertTriangle, RefreshCw, X, Shield } from 'lucide-react';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  identifier: string;
  type?: 'email' | 'phone';
  userId?: string;
  onVerifiedSuccess: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  identifier,
  type = 'email',
  userId,
  onVerifiedSuccess,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 mins
  const [resendCooldown, setResendCooldown] = useState(30);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Send initial OTP
    handleSendOtp();

    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
      setResendCooldown((r) => (r > 0 ? r - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, identifier]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setIsResending(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, type }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.devCode) {
          setDevCodeHint(data.devCode);
        }
        setResendCooldown(30);
      } else {
        setErrorMsg(data.error || 'Failed to dispatch code');
      }
    } catch {
      setErrorMsg('Network error while dispatching code');
    } finally {
      setIsResending(false);
    }
  };

  const handleDigitChange = (idx: number, val: string) => {
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = char;
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto advance focus
    if (char && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }

    // If all 6 digits filled, trigger auto verify
    if (newDigits.every((d) => d !== '') && idx === 5) {
      submitCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const submitCode = async (fullCode: string) => {
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code: fullCode, userId, type }),
      });
      const data = await res.json();
      if (data.success) {
        onVerifiedSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid verification code');
      }
    } catch {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            {type === 'email' ? <Mail className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
          </div>

          <h3 className="text-xl font-black text-white">
            Verify Your {type === 'email' ? 'Email Address' : 'Phone Number'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xs">
            We sent a 6-digit security code to <strong className="text-amber-300 font-mono">{identifier}</strong>
          </p>

          {devCodeHint && (
            <div className="mt-3 rounded-xl bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 text-[11px] text-amber-300 font-mono">
              💡 Development Verification PIN: <strong>{devCodeHint}</strong>
            </div>
          )}

          {/* 6 Digit Inputs */}
          <div className="flex items-center gap-2 sm:gap-3 my-6">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                maxLength={1}
                value={d}
                autoFocus={i === 0}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-10 sm:w-12 rounded-xl border border-zinc-800 bg-zinc-900 text-center text-lg font-black text-white focus:border-amber-400 focus:outline-none transition-colors"
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-semibold mb-4 animate-shake">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-between w-full text-xs text-zinc-400">
            <span>Expires in: <strong className="font-mono text-zinc-200">{formatTime(countdown)}</strong></span>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={resendCooldown > 0 || isResending}
              className="text-amber-400 hover:text-amber-300 font-semibold disabled:opacity-50"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => submitCode(digits.join(''))}
            disabled={digits.some((d) => d === '') || isVerifying}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-400/10 disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Confirm & Activate Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
