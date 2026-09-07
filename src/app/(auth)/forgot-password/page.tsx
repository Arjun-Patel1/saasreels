'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SaaSReelsLogo } from '@/components/SaaSReelsLogo';
import { CaptchaWidget } from '@/components/CaptchaWidget';
import { OtpVerificationModal } from '@/components/OtpVerificationModal';
import { Mail, Phone, ArrowRight, CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Captcha & OTP state
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaValid || !captchaAnswer) {
      setErrorMsg('Please solve the security challenge below.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (identifier.includes('@')) {
        // Email reset link request
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Password reset request failed');
        }

        setResetUrl(data.resetUrl);
      } else {
        // Phone SMS OTP reset flow
        setIsOtpModalOpen(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to request password recovery.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpRecoverySuccess = () => {
    // Redirect with temporary reset token
    const token = 'rst_otp_' + Buffer.from(identifier).toString('base64');
    router.push(`/reset-password?token=${token}`);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex justify-center mb-4">
        <SaaSReelsLogo />
      </div>
      <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
        Account Recovery
      </h2>
      <p className="mt-2 text-center text-xs text-zinc-400">
        Enter your registered email address or phone number to recover access.
      </p>

      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
        {resetUrl ? (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 mx-auto border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">Password Reset Link Ready</h3>
            <p className="text-xs text-zinc-400">
              In a live production environment, this link is emailed securely. In preview mode, click below to set your new password immediately:
            </p>
            <div className="pt-2">
              <Link
                href={resetUrl}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                <span>Proceed to Set New Password</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 text-center animate-fade-in">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="founder@yourbrand.com or +1 555-0199"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2.5 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Bot Protection Challenge */}
              <CaptchaWidget
                onVerifiedChange={(valid, token, answer) => {
                  setIsCaptchaValid(valid);
                  setCaptchaToken(token);
                  setCaptchaAnswer(answer);
                }}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Processing Recovery...' : 'Send Recovery Code / Link'}</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </form>
          </>
        )}

        <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
          <Link
            href="/login"
            className="text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>

      {/* Instant OTP Recovery Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        identifier={identifier}
        type={identifier.includes('@') ? 'email' : 'phone'}
        onVerifiedSuccess={handleOtpRecoverySuccess}
      />
    </div>
  );
}
