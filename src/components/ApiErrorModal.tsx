'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Cpu, Sliders, X, Check } from 'lucide-react';

interface ApiErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorTitle?: string;
  errorMessage?: string;
  onSwitchToBuiltin: () => void;
  onOpenSettings: () => void;
  onRetry?: () => void;
}

export const ApiErrorModal: React.FC<ApiErrorModalProps> = ({
  isOpen,
  onClose,
  errorTitle = 'API Rate Limit or Quota Reached',
  errorMessage = 'The external AI provider (Groq / OpenAI / Gemini) returned a rate limit (429) or quota error. SaaSReels has automatically prepared the Built-In Zero-Cost engine so you can continue creating without interruption.',
  onSwitchToBuiltin,
  onOpenSettings,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#121219] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-snug">{errorTitle}</h3>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Status: Rate Limit / Output Fallback
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <p className="mt-4 text-xs text-neutral-300 leading-relaxed bg-black/50 p-3.5 rounded-xl border border-white/5">
          {errorMessage}
        </p>

        {/* Action Recommendations */}
        <div className="mt-5 flex flex-col gap-2.5">
          {/* Button 1: Use Built-In Zero-Cost Engine */}
          <button
            type="button"
            onClick={() => {
              onSwitchToBuiltin();
              onClose();
            }}
            className="flex items-center justify-between rounded-xl bg-yellow-400 px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-yellow-300 shadow-md"
          >
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span>Use Built-In Engine (100% Free & Unlimited)</span>
            </div>
            <Check className="h-4 w-4" />
          </button>

          {/* Button 2: Switch Provider in Settings */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-700 transition-all"
          >
            <Sliders className="h-3.5 w-3.5 text-yellow-400" />
            <span>Switch Provider / Key in Settings</span>
          </button>

          {/* Button 3: Retry if provided */}
          {onRetry && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-white py-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
