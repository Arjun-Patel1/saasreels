'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SaaSReelsLogo } from '@/components/SaaSReelsLogo';
import { CaptchaWidget } from '@/components/CaptchaWidget';
import { useAuth, UserTier } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Captcha State
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaValid || !captchaAnswer) {
      setErrorMsg('Please solve the human verification challenge.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, captchaToken, captchaAnswer }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      await login(data.user.email, password, data.user.tier);
      router.push('/studio');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (tier: UserTier) => {
    const demoData = {
      free: { email: 'free_byok@saasreels.ai', pass: 'demopassword' },
      pro: { email: 'pro_creator@saasreels.ai', pass: 'demopassword' },
      agency: { email: 'agency_scale@saasreels.ai', pass: 'demopassword' },
    };
    setIdentifier(demoData[tier].email);
    setPassword(demoData[tier].pass);
    login(demoData[tier].email, demoData[tier].pass, tier);
    router.push('/studio');
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex justify-center mb-4">
        <SaaSReelsLogo />
      </div>
      <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
        Sign In to SaaSReels
      </h2>
      <p className="mt-2 text-center text-xs text-zinc-400">
        Or{' '}
        <Link href="/signup" className="font-bold text-amber-400 hover:text-amber-300 transition-colors">
          create a new account with 3 free video exports
        </Link>
      </p>

      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
        {errorMsg && (
          <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 text-center animate-fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="founder@saas.com or +1 555-0199"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2.5 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Password</label>
              <Link href="/forgot-password" className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
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

          {/* Captcha Challenge */}
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
            <span>{isLoading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Quick Demo Login Shortcut */}
        <div className="mt-6 border-t border-zinc-800/80 pt-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block text-center mb-2.5">
            ⚡ Instant 1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('free')}
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2 text-[11px] font-bold text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95 text-center"
            >
              🆓 Free BYOK
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('pro')}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all active:scale-95 text-center"
            >
              ⚡ Pro Growth
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('agency')}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 text-center"
            >
              👑 Agency Scale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
