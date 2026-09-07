'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserTier = 'free' | 'pro' | 'agency';

export interface UserAccount {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatarUrl?: string;
  tier: UserTier;
  creditsRemaining: number;
  totalCredits: number;
  isByok: boolean; // Bring Your Own Key
  apiKey?: string;
  brandName?: string;
  brandUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string, demoTier?: UserTier) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, tier?: UserTier, phone?: string) => Promise<boolean>;
  logout: () => void;
  upgradeTier: (tier: UserTier) => void;
  consumeCredit: () => boolean;
  updateApiKey: (key: string) => void;
  updateUserApiKey: (key: string) => void;
  updateUserDetails: (details: Partial<UserAccount>) => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openPricingModal: () => void;
  closePricingModal: () => void;
  isPricingModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USER: UserAccount = {
  id: 'usr_founder_demo',
  email: 'demo@saasreels.ai',
  phone: '+1 (555) 019-2834',
  name: 'Beta Founder',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  tier: 'free',
  creditsRemaining: 3,
  totalCredits: 3,
  isByok: true,
  brandName: 'SaaSReels',
  brandUrl: 'https://saasreels.ai',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  useEffect(() => {
    // Check server session or localStorage
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('saasreels_user_session', JSON.stringify(data.user));
            return;
          }
        }
      } catch (err) {
        // Fallback to local storage
      }

      const stored = localStorage.getItem('saasreels_user_session');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
          return;
        } catch (e) {}
      }

      // Visitor is unauthenticated until sign in / registration
      setUser(null);
    };

    initAuth();
  }, []);

  const saveUser = (u: UserAccount | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('saasreels_user_session', JSON.stringify(u));
    } else {
      localStorage.removeItem('saasreels_user_session');
    }
  };

  const login = async (identifier: string, pass: string, demoTier: UserTier = 'pro'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          saveUser(data.user);
          setIsAuthModalOpen(false);
          return true;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // Fallback simulated login
    const tierCredits: Record<UserTier, { remaining: number; total: number; isByok: boolean }> = {
      free: { remaining: 3, total: 3, isByok: true },
      pro: { remaining: 50, total: 50, isByok: false },
      agency: { remaining: 300, total: 300, isByok: false },
    };

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: identifier.includes('@') ? identifier : `${identifier.replace(/\D/g, '')}@saas.com`,
      phone: identifier.includes('@') ? '+1 (555) 019-2834' : identifier,
      name: identifier.includes('@') ? identifier.split('@')[0] : 'SaaS Founder',
      tier: demoTier,
      creditsRemaining: tierCredits[demoTier].remaining,
      totalCredits: tierCredits[demoTier].total,
      isByok: tierCredits[demoTier].isByok,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${identifier}`,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    tier: UserTier = 'free',
    phone: string = ''
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password: pass, tier }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          saveUser(data.user);
          setIsAuthModalOpen(false);
          return true;
        }
      }
    } catch (e) {}

    return login(email, pass, tier);
  };

  const logout = () => {
    saveUser(null);
  };

  const upgradeTier = (tier: UserTier) => {
    if (!user) {
      login('founder@saasreels.ai', 'password', tier);
      return;
    }
    const creditsMap: Record<UserTier, number> = { free: 3, pro: 50, agency: 300 };
    const updated: UserAccount = {
      ...user,
      tier,
      creditsRemaining: creditsMap[tier],
      totalCredits: creditsMap[tier],
      isByok: tier === 'free',
    };
    saveUser(updated);
    setIsPricingModalOpen(false);
  };

  const consumeCredit = (): boolean => {
    if (!user) return false;
    if (user.isByok && user.apiKey) {
      return true; // Unlimited when BYOK key is provided
    }
    if (user.creditsRemaining > 0) {
      const updated = {
        ...user,
        creditsRemaining: user.creditsRemaining - 1,
      };
      saveUser(updated);
      return true;
    }
    return false;
  };

  const updateApiKey = (key: string) => {
    if (!user) return;
    const updated = {
      ...user,
      apiKey: key,
      isByok: Boolean(key),
    };
    saveUser(updated);
  };

  const updateUserDetails = (details: Partial<UserAccount>) => {
    if (!user) return;
    const updated = {
      ...user,
      ...details,
    };
    saveUser(updated);
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openPricingModal = () => setIsPricingModalOpen(true);
  const closePricingModal = () => setIsPricingModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        upgradeTier,
        consumeCredit,
        updateApiKey,
        updateUserApiKey: updateApiKey,
        updateUserDetails,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        openPricingModal,
        closePricingModal,
        isPricingModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
