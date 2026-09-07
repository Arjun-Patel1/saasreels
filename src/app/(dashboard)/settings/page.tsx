'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OtpVerificationModal } from '@/components/OtpVerificationModal';
import {
  Settings,
  KeyRound,
  Crown,
  Zap,
  Save,
  CheckCircle2,
  Lock,
  User,
  Phone,
  Mail,
  Shield,
  Download,
  ShieldAlert,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUserApiKey, updateUserDetails, openPricingModal } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState(user?.apiKey || '');
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [selectedProvider, setSelectedProvider] = useState<'groq' | 'openai' | 'anthropic' | 'gemini'>('groq');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verification Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpTarget, setOtpTarget] = useState<{ identifier: string; type: 'email' | 'phone' }>({
    identifier: user?.email || '',
    type: 'email',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = () => {
    updateUserDetails({
      name: nameInput,
      phone: phoneInput,
    });
    showToast('✅ Profile updated successfully!');
  };

  const handleSaveApiKey = () => {
    updateUserApiKey(apiKeyInput.trim());
    showToast('🔑 API Key saved! Unlimited free generations active.');
  };

  const handleTriggerVerification = (type: 'email' | 'phone') => {
    const id = type === 'email' ? user?.email : user?.phone || phoneInput;
    if (!id) {
      showToast(`Please enter a valid ${type} first`);
      return;
    }
    setOtpTarget({ identifier: id, type });
    setOtpModalOpen(true);
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch(`/api/auth/export?userId=${user?.id || 'usr_founder_1'}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saasreels_account_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('📥 Account data backup downloaded successfully!');
    } catch {
      showToast('❌ Failed to download backup');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-bold text-black shadow-2xl animate-pop border border-black/10">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-black">
              <Settings className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white">Account & System Settings</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your verified credentials, active subscription, BYOK API keys, and data safeguards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Profile & Subscription */}
        <div className="md:col-span-1 flex flex-col gap-5">
          {/* User Profile Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-amber-400" />
              <span>User Profile</span>
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=alex'}
                alt={user?.name || 'User'}
                className="h-14 w-14 rounded-2xl border border-zinc-700 bg-zinc-800 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-white">{user?.name || 'Guest Founder'}</p>
                <p className="text-xs text-zinc-400">{user?.email || 'Not logged in'}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-amber-400 focus:outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400">Phone Number</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-amber-400 focus:outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2 text-xs font-bold text-zinc-200 transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>

          {/* Plan Status & Auto-Dunning Card */}
          <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-b from-amber-500/10 via-zinc-900/40 to-zinc-900/60 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" />
                <span>Current Plan</span>
              </h3>
              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-300 uppercase">
                {user?.tier || 'Free BYOK'}
              </span>
            </div>

            <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-3">
              <p className="text-xs text-zinc-400">Available Reel Credits:</p>
              <p className="text-xl font-black text-white mt-0.5">
                {user?.isByok && user?.apiKey ? '∞ Unlimited (BYOK)' : `${user?.creditsRemaining || 0} / ${user?.totalCredits || 3} left`}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-2.5 text-[11px] text-zinc-400 flex items-start gap-2">
              <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Data Loss Guarantee</strong>: If payment ever fails, accounts are never locked and gracefully drop to Free BYOK with 3 days grace.
              </span>
            </div>

            <button
              onClick={openPricingModal}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-black text-black hover:from-amber-300 hover:to-amber-400 transition-all shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade / Manage Plan</span>
            </button>
          </div>
        </div>

        {/* Right Column: Security Verification, Data Backup & BYOK */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Email & Phone Verification Badges */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Security & Verified Contact Recovery</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Verified contacts enable instant 1-click password recovery via SMS or Email OTP so your valuable data is never lost.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Email Status */}
              <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Work Email</p>
                    <p className="text-[11px] text-zinc-400 truncate max-w-[140px]">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerVerification('email')}
                  className="flex items-center gap-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-black text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified</span>
                </button>
              </div>

              {/* Phone Status */}
              <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">SMS Phone</p>
                    <p className="text-[11px] text-zinc-400">{user?.phone || phoneInput || 'Add phone'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerVerification('phone')}
                  className="flex items-center gap-1 rounded-xl bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[10px] font-black text-amber-400 hover:bg-amber-500/25 transition-colors"
                >
                  <span>Verify SMS</span>
                </button>
              </div>
            </div>

            {/* 1-Click Data Backup */}
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 mt-2">
              <div>
                <h4 className="text-xs font-bold text-white">Download Complete Account Backup</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Export all generated copy, render histories, and brand assets to JSON.</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-bold text-zinc-200 transition-all active:scale-95 shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* BYOK Configuration Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-400" />
                <span>Bring Your Own Key (BYOK) Setup</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Connect your personal AI provider API key for zero-cost, unlimited script synthesis.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Select AI Provider</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['groq', 'openai', 'anthropic', 'gemini'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setSelectedProvider(prov)}
                      className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                        selectedProvider === prov
                          ? 'border-amber-400 bg-amber-400/15 text-amber-300 shadow-sm'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {prov.toUpperCase()}
                      {prov === 'groq' && <span className="block text-[9px] text-amber-400/80 font-normal">Fastest / Free</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                  {selectedProvider.toUpperCase()} API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={selectedProvider === 'groq' ? 'gsk_...' : 'sk-...'}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                  />
                  <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Keys are stored locally in your encrypted browser session and never sent to third-party databases.
                </p>
              </div>

              <button
                onClick={handleSaveApiKey}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-2.5 text-xs font-black text-black hover:bg-amber-300 transition-all active:scale-95 shadow-lg shadow-amber-400/10 self-start"
              >
                <Save className="h-4 w-4" />
                <span>Save API Key</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        identifier={otpTarget.identifier}
        type={otpTarget.type}
        userId={user?.id}
        onVerifiedSuccess={() => {
          showToast(`✅ ${otpTarget.type === 'email' ? 'Email' : 'Phone'} successfully verified!`);
        }}
      />
    </div>
  );
}
