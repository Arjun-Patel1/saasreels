'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SaaSReelsLogo } from '@/components/SaaSReelsLogo';
import { CaptchaWidget } from '@/components/CaptchaWidget';
import { OtpVerificationModal } from '@/components/OtpVerificationModal';
import { useAuth, UserTier } from '@/context/AuthContext';
import { Lock, Mail, Phone, User, ArrowRight, Eye, EyeOff, KeyRound, Zap, Crown } from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = (searchParams.get('plan') as UserTier) || (searchParams.get('tier') as UserTier) || 'free';

  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTier, setSelectedTier] = useState<UserTier>(initialTier);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Captcha & OTP States
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | undefined>();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaValid || !captchaAnswer) {
      setErrorMsg('Please solve the human verification challenge below.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          tier: selectedTier,
          captchaToken,
          captchaAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      await signup(name, email, password, selectedTier, phone);
      setRegisteredUserId(data.user?.id);

      // Launch 6-digit OTP verification modal to protect user data
      setIsOtpModalOpen(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please verify details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    router.push('/studio');
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="flex justify-center mb-4">
        <SaaSReelsLogo />
      </div>
      <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
        Create Your SaaSReels Account
      </h2>
      <p className="mt-2 text-center text-xs text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-amber-400 hover:text-amber-300 transition-colors">
          Sign In here
        </Link>
      </p>

      <div className="mt-7 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
        {errorMsg && (
          <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 text-center animate-fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type="text"
                required
                placeholder="Alex Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2.5 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="founder@saas.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2.5 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2.5 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2.5 pl-9 pr-10 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Select Starting Tier</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedTier('free')}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  selectedTier === 'free'
                    ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/20'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-200">
                  <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Free BYOK</span>
                </div>
                <p className="mt-1 text-base font-black text-zinc-100">$0</p>
                <span className="text-[10px] text-zinc-400 block mt-0.5">3 free exports</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('pro')}
                className={`relative rounded-2xl border p-3 text-left transition-all ${
                  selectedTier === 'pro'
                    ? 'border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/30'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Pro Growth</span>
                </div>
                <p className="mt-1 text-base font-black text-amber-300">$49<span className="text-[10px] text-zinc-400 font-normal">/mo</span></p>
                <span className="text-[10px] text-zinc-400 block mt-0.5">50 reels/mo</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('agency')}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  selectedTier === 'agency'
                    ? 'border-emerald-400 bg-emerald-400/15 ring-2 ring-emerald-400/30'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <Crown className="h-3.5 w-3.5" />
                  <span>Agency</span>
                </div>
                <p className="mt-1 text-base font-black text-emerald-300">$199<span className="text-[10px] text-zinc-400 font-normal">/mo</span></p>
                <span className="text-[10px] text-zinc-400 block mt-0.5">300 reels</span>
              </button>
            </div>
          </div>

          {/* Zero-Cost Free Captcha */}
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
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-3"
          >
            <span>{isLoading ? 'Securing Account...' : 'Create Account & Get 3 Free Reels'}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        identifier={email || phone}
        type={email ? 'email' : 'phone'}
        userId={registeredUserId}
        onVerifiedSuccess={handleVerificationComplete}
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-400 text-xs">Loading sign up...</div>}>
      <SignupContent />
    </Suspense>
  );
}
