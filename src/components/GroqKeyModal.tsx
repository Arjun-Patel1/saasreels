'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Trash2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  getGroqKey,
  setGroqKey,
  clearGroqKey,
  isValidGroqKeyFormat,
} from '@/lib/groqKeyManager';

interface GroqKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (key: string) => void;
}

export const GroqKeyModal: React.FC<GroqKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [existingKey, setExistingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getGroqKey();
      setExistingKey(saved);
      setApiKeyInput(saved || '');
      setErrorMessage(null);
      setSuccessMessage(null);
      setTestResult(null);
      setShowKey(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your Groq API key.');
      return;
    }

    if (!isValidGroqKeyFormat(trimmed)) {
      setErrorMessage('Invalid Groq API key. A valid key starts with "gsk_" followed by at least 20 characters.');
      return;
    }

    setErrorMessage(null);
    setGroqKey(trimmed);
    setExistingKey(trimmed);
    setSuccessMessage('🎉 Groq API Key connected! Unlimited generations unlocked.');

    if (onKeySaved) {
      onKeySaved(trimmed);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    clearGroqKey();
    setExistingKey(null);
    setApiKeyInput('');
    setSuccessMessage('Groq API Key removed.');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setErrorMessage('Please paste an API key to test.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-groq-api-key': keyToTest,
        },
        body: JSON.stringify({
          brand: {
            name: 'Groq Health Check',
            url: 'https://groq.com',
            tagline: 'Ultra-fast AI Inference',
            description: 'Testing connection to Groq API Cloud',
            features: ['Ultra-low latency', 'Llama 3.3 70B'],
            painPoints: ['Slow generations'],
            targetAudience: 'Developers',
            primaryColor: '#facc15',
            screenshotUrl: '',
          },
          config: {
            provider: 'groq',
            apiKey: keyToTest,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Connection successful! Verified on model: ${data.model || 'Llama 3.3 70B'}.`,
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: errData.error || `Groq API returned HTTP ${res.status}. Check if your key is active.`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network error while testing: ${err.message || 'Unable to reach server'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0d0d12] p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto ring-1 ring-amber-500/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <Zap className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Unlock Unlimited Video Generations for Free
            </h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Groq offers free high-speed API keys. Connect yours in 60 seconds to create unlimited reels forever without paying a cent.
            </p>
          </div>
        </div>

        {/* Status Badge if key is already active */}
        {existingKey && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Groq Key Connected: {existingKey.slice(0, 7)}••••••••{existingKey.slice(-4)}</span>
            </div>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>Remove</span>
            </button>
          </div>
        )}

        {/* Step-by-Step Guide Box */}
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-2.5">
            How to get your free key in 3 clicks:
          </span>
          <ol className="space-y-2.5 text-xs text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-black text-amber-400">
                1
              </span>
              <span>
                Open{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-amber-400 underline decoration-amber-400/50 hover:decoration-amber-400 transition-colors"
                >
                  <span>console.groq.com/keys</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-black text-amber-400">
                2
              </span>
              <span>Sign in with Google or GitHub and click <strong className="text-white">"Create API Key"</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-black text-amber-400">
                3
              </span>
              <span>Copy and paste your key below (starts with <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[11px] text-amber-300">gsk_...</code>).</span>
            </li>
          </ol>
        </div>

        {/* Input Field */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-zinc-200 mb-1.5">
            Your Groq API Key
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <Key className="h-4 w-4" />
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setErrorMessage(null);
                setTestResult(null);
              }}
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-10 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Validation / Error Messages */}
          {errorMessage && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 animate-shake">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`mt-2 flex items-center gap-1.5 text-xs font-medium rounded-lg p-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Security & Privacy Callout */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 text-[11px] text-zinc-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-zinc-100">🔒 100% Client-Side:</strong> Your API key is stored only in your local browser and never saved to our database.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !apiKeyInput.trim()}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Test Key</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-5 py-2.5 text-xs font-black text-zinc-950 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <Zap className="h-3.5 w-3.5 fill-black" />
            <span>Connect & Unlock Free</span>
          </button>
        </div>
      </div>
    </div>
  );
};
