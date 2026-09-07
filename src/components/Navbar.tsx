'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Layers,
  Calendar,
  BarChart3,
  Flame,
  Settings,
  Radio,
  Zap,
  Crown,
  KeyRound,
  User,
  LogOut,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { SaaSReelsLogo } from './SaaSReelsLogo';
import { useAuth } from '@/context/AuthContext';
import { GroqKeyModal } from './GroqKeyModal';
import { getGroqKey, subscribeToGroqKey } from '@/lib/groqKeyManager';

interface NavbarProps {
  activeTab: 'studio' | 'trending' | 'blitz' | 'avatars' | 'queue' | 'analytics';
  setActiveTab: (tab: 'studio' | 'trending' | 'blitz' | 'avatars' | 'queue' | 'analytics') => void;
  queueCount: number;
  activeProvider: string;
  onOpenSettings: () => void;
  currentBrandName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  queueCount,
  activeProvider,
  onOpenSettings,
  currentBrandName = 'SaaSReels',
}) => {
  const { user, openAuthModal, openPricingModal, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [groqModalOpen, setGroqModalOpen] = useState(false);
  const [groqKey, setLocalGroqKey] = useState<string | null>(null);

  useEffect(() => {
    setLocalGroqKey(getGroqKey());
    const unsubscribe = subscribeToGroqKey((k) => setLocalGroqKey(k));
    return () => unsubscribe();
  }, []);

  const tierBadge = () => {
    if (!user) return null;
    if (user.tier === 'agency') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
          <Crown className="h-3 w-3" />
          <span>AGENCY</span>
        </span>
      );
    }
    if (user.tier === 'pro') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30">
          <Zap className="h-3 w-3" />
          <span>PRO</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300 border border-zinc-700">
        <KeyRound className="h-3 w-3 text-zinc-400" />
        <span>BYOK FREE</span>
      </span>
    );
  };

  return (
    <>
      {/* 1. TOP HEADER (Responsive: Rich on Desktop, Minimalist on Mobile) */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
          {/* Brand Logo Component */}
          <div className="flex items-center gap-3">
            {/* Desktop Full Logo */}
            <div className="hidden md:block">
              <SaaSReelsLogo />
            </div>
            {/* Mobile Compact Logo */}
            <div className="block md:hidden">
              <SaaSReelsLogo compact showBadge={false} />
            </div>
          </div>

          {/* DESKTOP CENTER NAVIGATION TABS (>= md screens) */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'trending'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('blitz')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'blitz'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Blitz</span>
              <span className="rounded-full bg-red-500/20 px-1.5 py-0.2 text-[9px] font-black text-red-400 border border-red-500/30">
                SWIPE
              </span>
            </button>

            <button
              onClick={() => setActiveTab('avatars')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'avatars'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Personas</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'queue'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Queue</span>
              {queueCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black">
                  {queueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Attribution</span>
            </button>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2">
            {/* Global Feedback Trigger */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-feedback-modal'))}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold text-zinc-400 hover:border-amber-400/40 hover:text-amber-300 transition-all active:scale-95 shadow-sm"
              title="Leave Feedback & Feature Request"
            >
              <span className="text-sm">💬</span>
              <span>Feedback</span>
            </button>

            {/* Groq BYOK Key Status / Add Button */}
            {groqKey ? (
              <button
                onClick={() => setGroqModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-amber-400/10 border border-amber-400/40 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition-all shadow-[0_0_12px_rgba(250,204,21,0.2)]"
                title="Groq API Key Connected - Click to view or manage"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>⚡ Groq Key: Connected (Unlimited)</span>
              </button>
            ) : (
              <button
                onClick={() => setGroqModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:border-amber-400/50 hover:text-amber-300 px-2.5 py-1 text-xs font-bold text-zinc-400 transition-all active:scale-95 shadow-sm"
              >
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                <span>🔑 Add Free Groq Key</span>
              </button>
            )}

            {/* User Credits / Tier Pill */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs">
                {tierBadge()}
                <span className="text-[11px] font-mono text-zinc-300">
                  {groqKey
                    ? '⚡ Unlimited'
                    : user.isByok && user.apiKey
                    ? '⚡ BYOK Active'
                    : `⚡ ${user.creditsRemaining}/${user.totalCredits} Reels`}
                </span>
              </div>
            )}

            {/* Beta Free Month CTA Button */}
            <button
              onClick={openPricingModal}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-md shadow-amber-500/10"
            >
              <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>🎁 Get 1 Mo Free</span>
            </button>

            {/* User Profile Avatar / Sign In Trigger */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 p-1 pr-2 hover:border-zinc-700 transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=alex'}
                    alt={user.name}
                    className="h-7 w-7 rounded-lg object-cover bg-zinc-800"
                  />
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl animate-fade-in">
                    <div className="p-2 border-b border-zinc-800/80">
                      <p className="text-xs font-bold text-zinc-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">Plan:</span>
                        {tierBadge()}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setGroqModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-400 hover:bg-zinc-900 transition-colors"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        <span>{groqKey ? 'Manage Groq Key' : 'Connect Free Groq Key'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openPricingModal();
                        }}
                        className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors"
                      >
                        <span>Change / Upgrade Plan</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSettings();
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5 text-zinc-400" />
                        <span>API & Engine Settings</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-zinc-800/80">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Settings Gear Button */}
            <button
              onClick={onOpenSettings}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MOBILE FROSTED-GLASS BOTTOM NAVIGATION BAR (< md screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 pb-safe shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
          {/* 1. Studio */}
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 ${
              activeTab === 'studio' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Sparkles className={`h-5 w-5 ${activeTab === 'studio' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {activeTab === 'studio' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Studio</span>
          </button>

          {/* 2. Blitz Mode */}
          <button
            onClick={() => setActiveTab('blitz')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 ${
              activeTab === 'blitz' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Flame className={`h-5 w-5 ${activeTab === 'blitz' ? 'fill-amber-400 stroke-amber-400' : 'stroke-[1.75]'}`} />
              <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white shadow-sm">
                SWIPE
              </span>
              {activeTab === 'blitz' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Blitz</span>
          </button>

          {/* 3. Radar (Trending) */}
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 ${
              activeTab === 'trending' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Radio className={`h-5 w-5 ${activeTab === 'trending' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {activeTab === 'trending' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Radar</span>
          </button>

          {/* 4. Queue */}
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 ${
              activeTab === 'queue' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Calendar className={`h-5 w-5 ${activeTab === 'queue' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {queueCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black shadow-sm">
                  {queueCount}
                </span>
              )}
              {activeTab === 'queue' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Queue</span>
          </button>

          {/* 5. Attribution */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 ${
              activeTab === 'analytics' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <BarChart3 className={`h-5 w-5 ${activeTab === 'analytics' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {activeTab === 'analytics' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Attribution</span>
          </button>
        </div>
      </nav>

      {/* Groq BYOK Modal */}
      <GroqKeyModal
        isOpen={groqModalOpen}
        onClose={() => setGroqModalOpen(false)}
      />
    </>
  );
};
