'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Sparkles, Check, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { VideoStyleConfig } from '@/types';
import { getGroqKey, setGroqKey as saveGroqKey } from '@/lib/groqKeyManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleConfig: VideoStyleConfig;
  onUpdateStyleConfig: (config: VideoStyleConfig) => void;
  activeProvider: string;
  onUpdateProvider: (provider: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  styleConfig,
  onUpdateStyleConfig,
  activeProvider,
  onUpdateProvider,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<string>(activeProvider);
  const [groqKey, setGroqKey] = useState(getGroqKey() || '');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroqKey(getGroqKey() || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/generate-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(selectedEngine === 'groq' && groqKey ? { 'x-groq-api-key': groqKey } : {}),
        },
        body: JSON.stringify({
          brand: {
            name: 'SaaSReels Test',
            url: 'https://test.com',
            tagline: 'Test Tagline',
            description: 'Testing API connection',
            features: ['Feature 1', 'Feature 2'],
            painPoints: ['Pain 1'],
            targetAudience: 'Developers',
            primaryColor: '#facc15',
            screenshotUrl: '',
          },
          config: {
            provider: selectedEngine,
            apiKey: selectedEngine === 'groq' ? groqKey : selectedEngine === 'openai' ? openaiKey : undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestStatus(`✅ ${selectedEngine.toUpperCase()} (${data.model}) connection verified & generating viral scripts!`);
      } else {
        setTestStatus(`⚠️ API test failed with code ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (groqKey.trim()) {
      saveGroqKey(groqKey.trim());
    }
    onUpdateProvider(selectedEngine);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#121218] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">LLM Provider & API Keys</h3>
              <p className="text-xs text-neutral-400">Modular backend engine (Groq, OpenAI, Gemini, Claude)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* AI Engine Selection */}
        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Select Active LLM Provider
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedEngine('groq')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedEngine === 'groq'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-semibold ring-1 ring-yellow-400/30'
                    : 'border-white/10 bg-neutral-900 text-neutral-300 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Groq Cloud</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded">Active Key</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">Llama 3.3 70B (Ultra Fast)</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEngine('openai')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedEngine === 'openai'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-semibold ring-1 ring-yellow-400/30'
                    : 'border-white/10 bg-neutral-900 text-neutral-300 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold">OpenAI</div>
                <div className="text-[10px] text-neutral-400 mt-1">GPT-4o / GPT-4o-mini</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEngine('gemini')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedEngine === 'gemini'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-semibold ring-1 ring-yellow-400/30'
                    : 'border-white/10 bg-neutral-900 text-neutral-300 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold">Google Gemini</div>
                <div className="text-[10px] text-neutral-400 mt-1">Gemini 2.5 Flash (Free Tier)</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEngine('anthropic')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedEngine === 'anthropic'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-semibold ring-1 ring-yellow-400/30'
                    : 'border-white/10 bg-neutral-900 text-neutral-300 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold">Anthropic Claude</div>
                <div className="text-[10px] text-neutral-400 mt-1">Claude 3.5 Sonnet</div>
              </button>
            </div>
          </div>

          {/* API Key inputs */}
          <div className="rounded-xl border border-white/5 bg-black/40 p-3.5 space-y-3">
            {selectedEngine === 'groq' && (
              <div>
                <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Groq API Key:</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Configured from .env.local</span>
                </label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-yellow-400 focus:outline-none font-mono"
                />
              </div>
            )}

            {selectedEngine === 'openai' && (
              <div>
                <label className="text-xs font-semibold text-neutral-300">OpenAI API Key:</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-yellow-400 focus:outline-none font-mono"
                />
              </div>
            )}

            {selectedEngine === 'gemini' && (
              <div>
                <label className="text-xs font-semibold text-neutral-300">Gemini API Key:</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-yellow-400 focus:outline-none font-mono"
                />
              </div>
            )}

            {selectedEngine === 'anthropic' && (
              <div>
                <label className="text-xs font-semibold text-neutral-300">Anthropic Claude Key:</label>
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-yellow-400 focus:outline-none font-mono"
                />
              </div>
            )}

            {/* Test Connection Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-400 hover:bg-yellow-400/20 transition-all disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    <span>Test {selectedEngine.toUpperCase()} API</span>
                  </>
                )}
              </button>

              {testStatus && (
                <p className="mt-2 text-[11px] text-neutral-300 bg-neutral-900 p-2 rounded-lg border border-white/5">
                  {testStatus}
                </p>
              )}
            </div>
          </div>

          {/* Video Subtitle & Typography Preferences */}
          <div className="border-t border-white/10 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Subtitles & Visual Styling
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Caption Font:</label>
                <select
                  value={styleConfig.captionFont}
                  onChange={(e) =>
                    onUpdateStyleConfig({
                      ...styleConfig,
                      captionFont: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-neutral-900 p-2 text-white"
                >
                  <option value="impact">Impact Bold (MrBeast / Hormozi)</option>
                  <option value="sans">Modern Sans (Linear Style)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Default Highlight:</label>
                <div className="flex gap-2 pt-1">
                  {['#facc15', '#22c55e', '#38bdf8', '#f43f5e'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onUpdateStyleConfig({ ...styleConfig, captionColor: c })}
                      className={`h-6 w-6 rounded-full border-2 ${
                        styleConfig.captionColor === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-yellow-400 px-5 py-2 text-xs font-bold text-black hover:bg-yellow-300 transition-all"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save & Apply</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
