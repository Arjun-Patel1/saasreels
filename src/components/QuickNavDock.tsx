'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Sparkles,
  Flame,
  Radio,
  Calendar,
  BarChart3,
  Settings,
  ShieldCheck,
  Home,
  Tag,
  Swords,
  LogIn,
  UserPlus,
  KeyRound,
  Rocket,
  Search,
  X,
  ChevronRight,
  Command,
} from 'lucide-react';

interface RouteItem {
  title: string;
  href: string;
  category: 'App Suite' | 'Marketing' | 'Comparisons' | 'Auth & Onboarding' | 'Developer';
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const ALL_ROUTES: RouteItem[] = [
  // App Suite
  {
    title: 'Video Studio',
    href: '/studio',
    category: 'App Suite',
    badge: 'Canvas Engine',
    icon: Sparkles,
    description: 'URL ingestion, script editor & live HTML5 video player with MP4 export',
  },
  {
    title: 'Blitz Mode™',
    href: '/blitz',
    category: 'App Suite',
    badge: 'Swipe Deck',
    icon: Flame,
    description: 'Tinder-style rapid hook approval and discard deck',
  },
  {
    title: 'Trending Radar',
    href: '/radar',
    category: 'App Suite',
    badge: 'Live',
    icon: Radio,
    description: 'Scraped viral TikTok, Reels, and Shorts SaaS formats with 1-click apply',
  },
  {
    title: 'Publishing Queue',
    href: '/queue',
    category: 'App Suite',
    badge: 'Calendar',
    icon: Calendar,
    description: 'Social distribution scheduling, caption copying, and bulk reel export',
  },
  {
    title: 'Attribution Engine',
    href: '/attribution',
    category: 'App Suite',
    badge: 'MRR Tracking',
    icon: BarChart3,
    description: 'Smart UTM generator, embeddable pixel tracker, and conversion metrics',
  },
  {
    title: 'Settings & BYOK',
    href: '/settings',
    category: 'App Suite',
    icon: Settings,
    description: 'Manage profile, Groq/OpenAI/Gemini keys, and subscription tier',
  },

  // Marketing & Public
  {
    title: 'Landing Page',
    href: '/',
    category: 'Marketing',
    icon: Home,
    description: 'High-converting hero, interactive demo, and ROI calculator',
  },
  {
    title: 'Pricing & Plans',
    href: '/pricing',
    category: 'Marketing',
    badge: '3 Tiers',
    icon: Tag,
    description: 'Free BYOK ($0), Pro ($29/mo), and Agency ($79/mo) plans',
  },
  {
    title: '3-Step Onboarding',
    href: '/onboarding',
    category: 'Marketing',
    badge: 'Wizard',
    icon: Rocket,
    description: 'Guided initial setup and first viral reel generation',
  },

  // Competitor Comparisons
  {
    title: 'vs Fastlane',
    href: '/vs/fastlane',
    category: 'Comparisons',
    badge: 'Comparison',
    icon: Swords,
    description: 'See why SaaSReels offers 10x faster rendering and BYOK zero cost',
  },
  {
    title: 'vs Arcads',
    href: '/vs/arcads',
    category: 'Comparisons',
    badge: 'Comparison',
    icon: Swords,
    description: 'Natural kinetic voiceovers without $120/mo lock-in',
  },
  {
    title: 'vs Submagic',
    href: '/vs/submagic',
    category: 'Comparisons',
    badge: 'Comparison',
    icon: Swords,
    description: 'Full video generation from URL rather than just captions',
  },
  {
    title: 'vs Cliptalk',
    href: '/vs/cliptalk',
    category: 'Comparisons',
    badge: 'Comparison',
    icon: Swords,
    description: 'Engineered specifically for B2B SaaS and software products',
  },

  // Auth & Recovery
  {
    title: 'Sign In',
    href: '/login',
    category: 'Auth & Onboarding',
    icon: LogIn,
    description: 'Dual-mode login with email or phone number',
  },
  {
    title: 'Sign Up',
    href: '/signup',
    category: 'Auth & Onboarding',
    icon: UserPlus,
    description: 'Create account with free tier or pre-selected paid plan',
  },
  {
    title: 'Forgot Password',
    href: '/forgot-password',
    category: 'Auth & Onboarding',
    icon: KeyRound,
    description: 'Generate password reset recovery token',
  },
];

export const QuickNavDock: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredRoutes = ALL_ROUTES.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.href.toLowerCase().includes(q)
    );
  });

  const categories = Array.from(new Set(filteredRoutes.map((r) => r.category)));

  const handleSelectRoute = (href: string) => {
    setIsOpen(false);
    setSearch('');
    router.push(href);
  };

  return (
    <>
      {/* 1. FLOATING QUICK JUMP PILL (Bottom-Left) */}
      <div className="fixed bottom-20 md:bottom-5 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-amber-400/30 bg-zinc-950/90 hover:bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 hover:border-amber-400"
          title="Open Sitemap & Navigation Hub (Ctrl + K)"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-black shadow-sm group-hover:rotate-45 transition-transform duration-300">
            <Compass className="h-3 w-3" />
          </span>
          <span className="hidden sm:inline text-zinc-300 group-hover:text-white transition-colors">
            Jump Anywhere
          </span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700">
            ⌘K
          </span>
        </button>
      </div>

      {/* 2. COMMAND / SITEMAP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
          <div
            className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-3xl border border-zinc-800 bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Search Box */}
            <div className="flex items-center gap-3 border-b border-zinc-800/80 px-4 py-3.5 bg-zinc-900/50">
              <Search className="h-4 w-4 text-amber-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search all 15+ pages... (e.g. Studio, Blitz, Admin, Pricing, VS)"
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Route Matrix */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {filteredRoutes.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <Compass className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No matching pages found for "{search}"</p>
                </div>
              ) : (
                categories.map((cat) => {
                  const routesInCat = filteredRoutes.filter((r) => r.category === cat);
                  return (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2">
                        {cat}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {routesInCat.map((route) => {
                          const Icon = route.icon;
                          const isActive = pathname === route.href;
                          return (
                            <button
                              key={route.href}
                              onClick={() => handleSelectRoute(route.href)}
                              className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all group ${
                                isActive
                                  ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                                  : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-200'
                              }`}
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  isActive
                                    ? 'bg-amber-400 text-black font-black'
                                    : 'bg-zinc-800 text-zinc-400 group-hover:bg-amber-400 group-hover:text-black'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold truncate">
                                    {route.title}
                                  </span>
                                  {route.badge && (
                                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-semibold text-zinc-400 border border-zinc-700">
                                      {route.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                  {route.description}
                                </p>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 self-center shrink-0 transition-colors" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer with Shortcuts */}
            <div className="flex items-center justify-between border-t border-zinc-800/80 px-4 py-2.5 bg-zinc-900/40 text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span>Navigate anywhere with 1 click</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">ESC</span> to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
