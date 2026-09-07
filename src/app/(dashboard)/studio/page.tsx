'use client';

import React, { useState, useEffect } from 'react';
import { UrlIngestion } from '@/components/UrlIngestion';
import { ScriptEditor } from '@/components/ScriptEditor';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AvatarLibrary } from '@/components/AvatarLibrary';
import { ApiErrorModal } from '@/components/ApiErrorModal';
import { BrandInfo, QueuedPost, VideoScript, VideoStyleConfig } from '@/types';
import { DEFAULT_STYLE_CONFIG, PRESET_BRANDS, AI_PERSONAS, HUMAN_VOICE_PRESETS } from '@/lib/mockData';
import { generateAllScripts } from '@/lib/scriptEngine';
import { useAuth } from '@/context/AuthContext';
import { audioEngine } from '@/lib/audioEngine';
import { getGroqHeaders, getGroqKey } from '@/lib/groqKeyManager';
import { CheckCircle2, Sparkles, Flame, Radio, ArrowRight, Mic, UserCheck, Check, SlidersHorizontal, Volume2, Play } from 'lucide-react';
import Link from 'next/link';

export default function StudioPage() {
  const [mobileStudioTab, setMobileStudioTab] = useState<'config' | 'preview'>('config');
  const [configSubTab, setConfigSubTab] = useState<'scripts' | 'voice_avatars'>('scripts');
  const [currentBrand, setCurrentBrand] = useState<BrandInfo>(PRESET_BRANDS[0]);
  const [persona, setPersona] = useState(AI_PERSONAS[0]);
  const [styleConfig, setStyleConfig] = useState<VideoStyleConfig>(DEFAULT_STYLE_CONFIG);
  const [scripts, setScripts] = useState<VideoScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<VideoScript | null>(null);
  const [activeProvider, setActiveProvider] = useState<string>('groq');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  // API Rate Limit & Error Modal State
  const [apiErrorModalOpen, setApiErrorModalOpen] = useState(false);
  const [apiErrorDetails, setApiErrorDetails] = useState<{ title: string; message: string }>({
    title: 'API Rate Limit or Quota Alert',
    message: 'The AI provider returned a rate limit alert. SaaSReels has activated the Built-In Zero-Cost engine so you can continue creating seamlessly.',
  });

  const { user, consumeCredit, openPricingModal } = useAuth();

  useEffect(() => {
    fetchScriptsForBrand(currentBrand);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleTriggerApiError = (title: string, message: string) => {
    setApiErrorDetails({ title, message });
    setApiErrorModalOpen(true);
  };

  const fetchScriptsForBrand = async (brand: BrandInfo) => {
    setIsGenerating(true);
    try {
      const groqKey = getGroqKey();
      const res = await fetch('/api/generate-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGroqHeaders(),
        },
        body: JSON.stringify({
          brand,
          config: {
            provider: activeProvider,
            apiKey: groqKey || undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.scripts && data.scripts.length > 0) {
          setScripts(data.scripts);
          setSelectedScript(data.scripts[0]);
          return;
        }
      } else if (res.status === 429 || res.status === 500) {
        handleTriggerApiError(
          'API Rate Limit Reached',
          `The ${activeProvider.toUpperCase()} provider returned status (HTTP ${res.status}). SaaSReels has activated the Built-In Zero-Cost Engine.`
        );
      }
    } catch (err: any) {
      console.warn('API script generation failed, using local engine:', err);
      handleTriggerApiError(
        'AI Provider Alert',
        'Unable to connect to the external API. Falling back to the SaaSReels Built-In Zero-Cost Viral Engine.'
      );
    } finally {
      setIsGenerating(false);
    }

    const local = generateAllScripts(brand);
    setScripts(local);
    setSelectedScript(local[0]);
  };

  const handleBrandExtracted = async (newBrand: BrandInfo) => {
    setCurrentBrand(newBrand);
    await fetchScriptsForBrand(newBrand);
    setMobileStudioTab('preview');
    showToast(`⚡ Extracted ${newBrand.name} & synthesized viral hooks!`);
  };

  const handleAddToQueue = (scriptToQueue: VideoScript) => {
    const hasCredit = consumeCredit();
    if (!hasCredit) {
      showToast('⚠️ No reel credits remaining. Upgrade or add your API key!');
      openPricingModal();
      return;
    }

    const newPost: QueuedPost = {
      id: `post-${Date.now()}`,
      title: scriptToQueue.hookHeadline,
      brand: currentBrand,
      script: scriptToQueue,
      persona: persona,
      platforms: ['tiktok', 'instagram', 'youtube'],
      status: 'ready',
      scheduledTime: 'Tomorrow at 11:00 AM (Peak SaaS Hours)',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('saasreels_queue') || '[]');
      localStorage.setItem('saasreels_queue', JSON.stringify([newPost, ...existing]));
    } catch (e) {}

    showToast(`✨ Approved "${scriptToQueue.hookHeadline.slice(0, 28)}..." to Queue!`);
  };

  const handleUpdateScriptText = (newText: string) => {
    if (!selectedScript) return;
    const updated = { ...selectedScript, fullText: newText };
    setSelectedScript(updated);
    setScripts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleRegenerateHooks = async () => {
    await fetchScriptsForBrand(currentBrand);
    showToast(`🔄 Fresh viral hooks synthesized for ${currentBrand.name}!`);
  };

  const activeVoiceId = styleConfig.voiceId || (styleConfig.voiceGender === 'female' ? 'en-US-AvaMultilingualNeural' : 'en-US-AndrewMultilingualNeural');

  return (
    <div className="flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-bold text-black shadow-2xl animate-pop border border-black/10">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Mobile-Only iOS Segmented Control Pill (< lg screens) */}
      <div className="flex lg:hidden items-center justify-center mb-4">
        <div className="flex items-center rounded-2xl bg-zinc-900/90 p-1 border border-zinc-800 shadow-lg w-full max-w-sm">
          <button
            onClick={() => setMobileStudioTab('config')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all min-h-[36px] ${
              mobileStudioTab === 'config'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>✍️ Configuration</span>
          </button>
          <button
            onClick={() => setMobileStudioTab('preview')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all min-h-[36px] ${
              mobileStudioTab === 'preview'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>📱 Live Reel Preview</span>
          </button>
        </div>
      </div>

      {/* Beta Free Trial & 1-Month Unlimited Banner */}
      <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-zinc-900/60 p-3 sm:p-4 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black font-black text-xs">
            {user?.creditsRemaining ?? 3}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">
                {(user?.creditsRemaining ?? 3) > 0
                  ? `⚡ ${(user?.creditsRemaining ?? 3)} of 3 Free Beta Reels Remaining`
                  : '⚠️ 3 Free Beta Reels Used!'}
              </span>
              <span className="rounded-full bg-amber-400/20 px-2 py-0.2 text-[9px] font-black text-amber-300">
                PUBLIC BETA
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {(user?.creditsRemaining ?? 3) > 0
                ? 'Creating videos for free using the default high-speed AI engine & Neural TTS.'
                : 'Free trial complete. Book a 15-min call with the founder to get 1 Month of Unlimited AI Reels Free!'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openPricingModal}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-3.5 py-2 text-xs font-black text-black transition-all active:scale-95 shadow-md shrink-0"
        >
          <span>{(user?.creditsRemaining ?? 3) > 0 ? '🎁 Claim 1 Month Free' : '👉 Unlock 1 Month Free'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Desktop Side-by-Side & Mobile Tabbed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Wizard, Scripts & Voice/Avatar Selection */}
        <div className={`lg:col-span-7 flex flex-col gap-5 ${mobileStudioTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
          <UrlIngestion
            currentBrand={currentBrand}
            onBrandExtracted={handleBrandExtracted}
            isGenerating={isGenerating}
            activeProvider={activeProvider}
          />

          {/* Quick Voice Bar (2 Male & 2 Female) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-amber-400" />
                <span>Voice Persona (2 Male • 2 Female)</span>
              </span>
              <button
                type="button"
                onClick={() => setConfigSubTab(configSubTab === 'voice_avatars' ? 'scripts' : 'voice_avatars')}
                className="text-[10px] text-amber-400 hover:underline font-bold"
              >
                {configSubTab === 'voice_avatars' ? '← Back to Scripts' : '⚙️ Manage Avatars & Voice Samples →'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HUMAN_VOICE_PRESETS.map((v) => {
                const isSelected = activeVoiceId === v.id;
                const isPlayingSample = previewingVoiceId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setStyleConfig({
                        ...styleConfig,
                        voiceId: v.id,
                        voiceGender: v.gender,
                      });
                      const matched = AI_PERSONAS.find((p) => p.id === v.avatarId);
                      if (matched) setPersona(matched);
                      
                      // Play immediate voice sample so user can hear the voice
                      audioEngine.playVoiceSample(
                        v.sampleText,
                        v.id,
                        v.gender,
                        () => setPreviewingVoiceId(v.id),
                        () => setPreviewingVoiceId(null)
                      );
                      showToast(`🎙️ Voice switched to ${v.name} (Playing sample)`);
                    }}
                    className={`flex items-center justify-between gap-1 rounded-xl p-2.5 text-left transition-all border group ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 text-white font-bold ring-1 ring-amber-400/30 shadow-md'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{v.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold truncate text-zinc-200 flex items-center gap-1">
                          <span>{v.shortName}</span>
                          {isPlayingSample && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                          )}
                        </div>
                        <div className={`text-[8px] font-bold uppercase tracking-tight ${v.gender === 'male' ? 'text-sky-400' : 'text-rose-400'}`}>
                          {v.gender === 'male' ? '♂ Male' : '♀ Female'}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5 text-zinc-500 group-hover:text-amber-400 shrink-0 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SubTab Switcher (Scripts vs Full Voice/Avatar Studio) */}
          {configSubTab === 'voice_avatars' ? (
            <div className="flex flex-col gap-4">
              <AvatarLibrary
                selectedPersona={persona}
                onSelectPersona={setPersona}
                styleConfig={styleConfig}
                onStyleConfigChange={setStyleConfig}
              />
              <button
                type="button"
                onClick={() => setConfigSubTab('scripts')}
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition-all"
              >
                ← Return to Script & Angle Selection
              </button>
            </div>
          ) : (
            selectedScript && (
              <ScriptEditor
                scripts={scripts}
                selectedScript={selectedScript}
                onSelectScript={(s) => {
                  setSelectedScript(s);
                  if (window.innerWidth < 1024) {
                    setMobileStudioTab('preview');
                  }
                }}
                onUpdateScriptText={handleUpdateScriptText}
                onAddToQueue={handleAddToQueue}
                onRegenerate={handleRegenerateHooks}
              />
            )
          )}

          {/* Quick Link to Radar / Blitz Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/radar"
              className="flex items-center justify-between rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-transparent p-4 hover:border-amber-400/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-black font-black">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Trending Radar</h4>
                  <p className="text-[11px] text-zinc-400">Apply viral templates</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </Link>

            <Link
              href="/blitz"
              className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 to-transparent p-4 hover:border-rose-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">Blitz Mode</h4>
                  <p className="text-[11px] text-zinc-400">Tinder-style approvals</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-rose-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Right Column: Live Video Canvas Engine & Player */}
        <div className={`lg:col-span-5 flex flex-col gap-4 ${mobileStudioTab === 'config' ? 'hidden lg:flex' : 'flex'}`}>
          {selectedScript ? (
            <VideoPlayer
              brand={currentBrand}
              script={selectedScript}
              persona={persona}
              styleConfig={styleConfig}
              onStyleConfigChange={setStyleConfig}
            />
          ) : (
            <div className="flex h-[450px] sm:h-[600px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center text-zinc-500">
              <Sparkles className="h-10 w-10 text-amber-400/50 mb-3 animate-pulse" />
              <p className="text-sm font-medium text-zinc-300">No script selected</p>
              <p className="text-xs text-zinc-500 mt-1">Extract a URL or select a hook angle on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* API Error / Rate Limit Modal */}
      <ApiErrorModal
        isOpen={apiErrorModalOpen}
        onClose={() => setApiErrorModalOpen(false)}
        errorTitle={apiErrorDetails.title}
        errorMessage={apiErrorDetails.message}
        onSwitchToBuiltin={() => {
          setActiveProvider('local');
          setApiErrorModalOpen(false);
          fetchScriptsForBrand(currentBrand);
        }}
        onOpenSettings={() => {
          setApiErrorModalOpen(false);
        }}
      />
    </div>
  );
}
