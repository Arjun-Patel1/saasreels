'use client';

import React, { useState } from 'react';
import { useAuth, UserTier } from '@/context/AuthContext';
import { SaaSReelsLogo } from './SaaSReelsLogo';
import { X, Lock, Mail, Phone, User, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, signup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode || 'signin');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Phone for login
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTier, setSelectedTier] = useState<UserTier>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signin') {
        await login(identifier, password, selectedTier);
      } else {
        await signup(name, email, password, selectedTier, phone);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (tier: UserTier) => {
    const demoEmails: Record<UserTier, string> = {
      free: 'trial_byok@saasreels.ai',
      pro: 'pro_creator@saasreels.ai',
      agency: 'agency_director@saasreels.ai',
    };
    login(demoEmails[tier], 'demopassword', tier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl shadow-black/80 my-6">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <SaaSReelsLogo />
          <h3 className="mt-3 text-lg font-bold text-zinc-100">
            {mode === 'signin' ? 'Welcome Back to SaaSReels' : 'Create Your SaaSReels Account'}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            {mode === 'signin'
              ? 'Sign in with your Email or Phone Number.'
              : 'Start converting software URLs into viral reels on autopilot.'}
          </p>
        </div>

        {/* Segmented Switcher: Sign In vs Sign Up */}
        <div className="mt-5 flex rounded-xl border border-zinc-800 bg-zinc-900/90 p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`w-1/2 rounded-lg py-1.5 text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-zinc-800 text-zinc-100 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`w-1/2 rounded-lg py-1.5 text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-amber-400 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs font-medium text-rose-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === 'signup' ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="founder@yourbrand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="founder@saas.com or +1 555-0199"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-3 text-base sm:text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Select Starting Tier</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTier('free')}
                  className={`rounded-xl border p-2 text-center transition-all ${
                    selectedTier === 'free'
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  <span className="block text-[11px] font-black">Free BYOK</span>
                  <span className="text-[10px] text-zinc-400">Own Key</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier('pro')}
                  className={`rounded-xl border p-2 text-center transition-all ${
                    selectedTier === 'pro'
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  <span className="block text-[11px] font-black">Pro $49</span>
                  <span className="text-[10px] text-zinc-400">Managed AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier('agency')}
                  className={`rounded-xl border p-2 text-center transition-all ${
                    selectedTier === 'agency'
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  <span className="block text-[11px] font-black">Agency $199</span>
                  <span className="text-[10px] text-zinc-400">300 Reels</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <span>{mode === 'signin' ? 'Sign In to Studio' : 'Create Account & Launch'}</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
          </button>
        </form>

        {/* 1-Click Quick Demo Accounts Bar */}
        <div className="mt-6 border-t border-zinc-800/80 pt-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block text-center mb-2">
            ⚡ Quick 1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleQuickDemoLogin('free')}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2 py-1.5 text-[10px] font-bold text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
            >
              🆓 Free BYOK
            </button>
            <button
              onClick={() => handleQuickDemoLogin('pro')}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all active:scale-95"
            >
              ⚡ Pro Member
            </button>
            <button
              onClick={() => handleQuickDemoLogin('agency')}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
            >
              👑 Agency Scale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
