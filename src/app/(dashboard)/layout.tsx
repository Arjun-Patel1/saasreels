'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SaaSReelsLogo } from '@/components/SaaSReelsLogo';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Flame,
  Layers,
  Calendar,
  BarChart3,
  Settings,
  Radio,
  Zap,
  Crown,
  KeyRound,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { SettingsModal } from '@/components/SettingsModal';
import { DEFAULT_STYLE_CONFIG } from '@/lib/mockData';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openPricingModal, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [styleConfig, setStyleConfig] = useState(DEFAULT_STYLE_CONFIG);
  const [activeProvider, setActiveProvider] = useState('groq');

  useEffect(() => {
    // Redirect unauthenticated visitors to signup
    const stored = localStorage.getItem('saasreels_user_session');
    if (!stored && !user) {
      const timer = setTimeout(() => {
        const checkStored = localStorage.getItem('saasreels_user_session');
        if (!checkStored) {
          router.push('/signup');
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const navItems = [
    { href: '/studio', label: 'Studio', icon: Sparkles },
    { href: '/radar', label: 'Radar', icon: Radio },
    { href: '/blitz', label: 'Blitz', icon: Flame, badge: 'SWIPE' },
    { href: '/queue', label: 'Queue', icon: Calendar },
    { href: '/attribution', label: 'Attribution', icon: BarChart3 },
  ];

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden md:block hover:opacity-90 transition-opacity">
              <SaaSReelsLogo />
            </Link>
            <Link href="/" className="block md:hidden hover:opacity-90 transition-opacity">
              <SaaSReelsLogo compact showBadge={false} />
            </Link>
          </div>

          {/* DESKTOP CENTER NAVIGATION TABS (>= md screens) */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-500/20 px-1.5 py-0.2 text-[9px] font-black text-red-400 border border-red-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS: Credits, Upgrade, User Menu, Settings */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs">
                {tierBadge()}
                <span className="text-[11px] font-mono text-zinc-300">
                  {user.isByok && user.apiKey
                    ? '⚡ BYOK Key Active'
                    : `⚡ ${user.creditsRemaining}/${user.totalCredits} Reels`}
                </span>
              </div>
            )}

            <button
              onClick={openPricingModal}
              className="hidden sm:flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-extrabold text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-md shadow-amber-500/10"
            >
              <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Upgrade</span>
            </button>

            {/* User Dropdown */}
            {user && (
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
                          openPricingModal();
                        }}
                        className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-400 hover:bg-zinc-900 transition-colors"
                      >
                        <span>Change / Upgrade Plan</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        href="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Account & API Settings</span>
                      </Link>
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
            )}

            {/* Quick Settings Gear */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* 3. MOBILE FROSTED-GLASS BOTTOM NAVIGATION BAR (< md screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 pb-safe shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 ${
                  isActive ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
                  )}
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        styleConfig={styleConfig}
        onUpdateStyleConfig={setStyleConfig}
        activeProvider={activeProvider}
        onUpdateProvider={setActiveProvider}
      />
    </div>
  );
}
