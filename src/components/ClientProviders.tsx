'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { PricingModal } from './PricingModal';
import { GlobalFeedbackWidget } from './GlobalFeedbackWidget';

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
      <PricingModal />
      <GlobalFeedbackWidget />
    </AuthProvider>
  );
};
