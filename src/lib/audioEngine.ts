import { ScriptWord } from '@/types';
import { normalizeTextForSpeech } from './speechNormalizer';

class NaturalAudioEngine {
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentAudioEl: HTMLAudioElement | null = null;
  private animFrameId: number | null = null;
  private isPlaying = false;
  private startTime = 0;
  private onWordCallback: ((wordIndex: number, word: ScriptWord) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private cachedAudioUrls: Map<string, string> = new Map();
  private cachedBuffers: Map<string, AudioBuffer> = new Map();
  private preloadingPromises: Map<string, Promise<any>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      // Warm up voices
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    return this.audioCtx;
  }

  public async unlockAudio(): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx) {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        // Play silent 1-sample buffer to satisfy browser Autoplay gesture requirements
        const silentBuf = ctx.createBuffer(1, 1, ctx.sampleRate);
        const source = ctx.createBufferSource();
        source.buffer = silentBuf;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) {
        console.warn('AudioContext resume warning:', e);
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }
  }

  public async playVoiceSample(
    sampleText: string,
    voiceId: string,
    gender: 'male' | 'female' = 'male',
    onStart?: () => void,
    onEnded?: () => void
  ) {
    this.stop();
    await this.unlockAudio();
    if (onStart) onStart();

    const spoken = normalizeTextForSpeech(sampleText);
    const { audioUrl, buffer } = await this.getAudioForText(spoken, voiceId);

    const ctx = this.getAudioContext();
    if (ctx && buffer) {
      if (ctx.state === 'suspended') await ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      this.currentSource = source;
      source.onended = () => {
        if (onEnded) onEnded();
      };
      source.start(0);
      this.isPlaying = true;
      return;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      this.currentAudioEl = audio;
      audio.onended = () => {
        if (onEnded) onEnded();
      };
      audio.onerror = () => {
        this.fallbackWebSpeech(spoken, [], gender, 1.05);
        if (onEnded) onEnded();
      };
      await audio.play();
      this.isPlaying = true;
      return;
    }

    this.fallbackWebSpeech(spoken, [], gender, 1.05);
    if (onEnded) onEnded();
  }

  public preloadAudio(text: string, voice?: string) {
    const spoken = normalizeTextForSpeech(text);
    const cacheKey = `${voice || 'default'}_${spoken}`;
    if (this.cachedAudioUrls.has(cacheKey) || this.preloadingPromises.has(cacheKey)) return;

    const p = this.getAudioForText(spoken, voice);
    this.preloadingPromises.set(cacheKey, p);
  }

  public async getAudioForText(
    text: string,
    voice?: string
  ): Promise<{ audioUrl?: string; buffer?: AudioBuffer | null }> {
    const spokenText = normalizeTextForSpeech(text);
    const cacheKey = `${voice || 'default'}_${spokenText}`;
    if (this.cachedAudioUrls.has(cacheKey)) {
      return {
        audioUrl: this.cachedAudioUrls.get(cacheKey),
        buffer: this.cachedBuffers.get(cacheKey) || null,
      };
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: spokenText,
          voice: voice || 'en-US-AndrewMultilingualNeural',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          this.cachedAudioUrls.set(cacheKey, data.audioUrl);

          // Decode buffer via AudioContext
          const ctx = this.getAudioContext();
          if (ctx) {
            try {
              if (ctx.state === 'suspended') {
                await ctx.resume();
              }
              const base64Data = data.audioUrl.split(',')[1] || data.audioUrl;
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const decoded = await ctx.decodeAudioData(bytes.buffer.slice(0));
              this.cachedBuffers.set(cacheKey, decoded);
              return { audioUrl: data.audioUrl, buffer: decoded };
            } catch (decErr) {
              console.warn('AudioContext decode warning:', decErr);
            }
          }

          return { audioUrl: data.audioUrl };
        }
      }
    } catch (err) {
      console.warn('Error fetching natural TTS audio:', err);
    }
    return {};
  }

  public calibrateWordTimestamps(words: ScriptWord[], actualDuration: number): ScriptWord[] {
    if (!words || words.length === 0 || actualDuration <= 0) return words;
    const rawEnd = words[words.length - 1]?.end || 1;
    const ratio = actualDuration / rawEnd;

    return words.map((w) => ({
      ...w,
      start: parseFloat((w.start * ratio).toFixed(2)),
      end: parseFloat((w.end * ratio).toFixed(2)),
    }));
  }

  /**
   * Programmatic Micro-SFX: Whoosh
   * Filtered white noise sweep with rapid exponential pitch decay for scene/caption transitions
   */
  public playWhoosh(destNode?: AudioNode): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const targetDest = destNode || ctx.destination;

      // 1. Noise Buffer (0.2s white noise)
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // 2. Sweeping Bandpass Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.5, now);
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.22);

      // 3. Volume Envelope
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.28, now + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(targetDest);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.23);
    } catch (e) {
      console.warn('playWhoosh warning:', e);
    }
  }

  /**
   * Programmatic Micro-SFX: Mechanical UI Click/Pop
   * Short 20ms mechanical UI pop with high-pass transient for animated cursor interactions
   */
  public playClick(destNode?: AudioNode): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const targetDest = destNode || ctx.destination;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gainNode);
      gainNode.connect(targetDest);

      osc.start(now);
      osc.stop(now + 0.026);
    } catch (e) {
      console.warn('playClick warning:', e);
    }
  }

  /**
   * Programmatic Micro-SFX: Harmonic Chime Ding
   * Dual-oscillator bell chime (harmonic decay at 1046Hz + 2093Hz) for CTA / offer reveal
   */
  public playDing(destNode?: AudioNode): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const targetDest = destNode || ctx.destination;

      // Fundamental C6 (1046.5 Hz) + Octave Harmonic C7 (2093 Hz)
      const freqs = [1046.5, 2093];
      const gains = [0.35, 0.18];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(gains[idx], now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gainNode);
        gainNode.connect(targetDest);

        osc.start(now);
        osc.stop(now + 1.22);
      });
    } catch (e) {
      console.warn('playDing warning:', e);
    }
  }

  private cachedBgmBuffers: Map<string, AudioBuffer> = new Map();
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private previewBgmTimeout: any = null;

  /**
   * Zero-Asset Procedural BGM Synthesizer (100% Free, Local & Royalty-Free)
   * Procedurally generates studio-quality stereo audio loops directly via Web Audio API.
   */
  public generateProceduralBgmBuffer(style: string = 'upbeat_tech', durationSec: number = 30): AudioBuffer | null {
    const raw = (style || '').toLowerCase().replace(/[-_]/g, '');
    if (raw === 'none' || raw === 'off' || raw === 'mute' || raw === 'voiceonly') {
      return null;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return null;

    const sampleRate = ctx.sampleRate || 44100;
    const cacheKey = `${raw}_${sampleRate}_${durationSec}`;
    if (this.cachedBgmBuffers.has(cacheKey)) {
      return this.cachedBgmBuffers.get(cacheKey)!;
    }

    const totalSamples = Math.floor(sampleRate * durationSec);
    const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    if (raw.includes('lofi') || raw.includes('chill')) {
      // ==========================================
      // STYLE 1: LOFI MIDNIGHT CHILL (80 BPM)
      // ==========================================
      const bpm = 80;
      const beatSec = 60 / bpm; // 0.75s
      const barSec = beatSec * 4; // 3.0s

      // 4-Bar Jazzy Lofi Chord Progression
      // Fmaj7 -> Em7 -> Dm7 -> Cmaj7
      const chordProgression = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [164.81, 196.00, 246.94, 293.66], // Em7
        [146.83, 174.61, 220.00, 261.63], // Dm7
        [130.81, 164.81, 196.00, 246.94], // Cmaj7
      ];

      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const barTime = t % barSec;
        const chordIdx = Math.floor((t / barSec) % chordProgression.length);
        const chord = chordProgression[chordIdx];

        // 1. Electric Piano / Rhodes Keys
        let keysL = 0;
        let keysR = 0;
        const vibrato = 1.2 * Math.sin(2 * Math.PI * 4.5 * t);
        const chordDecay = Math.exp(-1.8 * barTime);

        for (let n = 0; n < chord.length; n++) {
          const baseFreq = chord[n] + vibrato;
          const noteStrumDelay = n * 0.018; // gentle strum timing
          const noteTime = Math.max(0, barTime - noteStrumDelay);
          const noteEnv = Math.exp(-2.2 * noteTime);

          // Warm harmonic structure: fundamental + 2nd harmonic + 3rd harmonic
          const s1 = Math.sin(2 * Math.PI * baseFreq * t);
          const s2 = Math.sin(2 * Math.PI * (baseFreq * 2) * t) * 0.35;
          const s3 = Math.sin(2 * Math.PI * (baseFreq * 3) * t) * 0.12;
          const tone = (s1 + s2 + s3) * noteEnv * 0.08;

          // Stereo spread
          const pan = (n / (chord.length - 1)) * 0.4 - 0.2;
          keysL += tone * (0.5 - pan);
          keysR += tone * (0.5 + pan);
        }

        // 2. Vinyl Crackle Layer
        const vinylNoise = (Math.random() * 2 - 1) * 0.004;
        let vinylPop = 0;
        if (Math.random() > 0.9992) {
          vinylPop = (Math.random() * 2 - 1) * 0.035;
        }

        // 3. Lazy Boom-Bap Drums
        let drumL = 0;
        let drumR = 0;

        // Kick on Beat 1 (0.0s) and Beat 3.5 (2.625s) with lazy swing
        const tKick1 = barTime;
        const tKick2 = Math.max(0, barTime - (beatSec * 2.5 + 0.025));
        if (tKick1 < 0.35) {
          const kickFreq = 42 + 65 * Math.exp(-24 * tKick1);
          const kickEnv = Math.exp(-12 * tKick1);
          const kickTone = Math.sin(2 * Math.PI * kickFreq * tKick1) * kickEnv * 0.35;
          drumL += kickTone;
          drumR += kickTone;
        }
        if (barTime >= beatSec * 2.5 && tKick2 < 0.35) {
          const kickFreq = 42 + 65 * Math.exp(-24 * tKick2);
          const kickEnv = Math.exp(-12 * tKick2);
          const kickTone = Math.sin(2 * Math.PI * kickFreq * tKick2) * kickEnv * 0.3;
          drumL += kickTone;
          drumR += kickTone;
        }

        // Snap Snare on Beat 2 (0.75s) and Beat 4 (2.25s)
        const tSnare1 = Math.max(0, barTime - beatSec);
        const tSnare2 = Math.max(0, barTime - beatSec * 3);
        if (barTime >= beatSec && tSnare1 < 0.25) {
          const snareBody = Math.sin(2 * Math.PI * 185 * tSnare1) * Math.exp(-22 * tSnare1) * 0.18;
          const snareNoise = (Math.random() * 2 - 1) * Math.exp(-28 * tSnare1) * 0.14;
          drumL += snareBody + snareNoise;
          drumR += snareBody + snareNoise;
        }
        if (barTime >= beatSec * 3 && tSnare2 < 0.25) {
          const snareBody = Math.sin(2 * Math.PI * 185 * tSnare2) * Math.exp(-22 * tSnare2) * 0.18;
          const snareNoise = (Math.random() * 2 - 1) * Math.exp(-28 * tSnare2) * 0.14;
          drumL += snareBody + snareNoise;
          drumR += snareBody + snareNoise;
        }

        left[i] = keysL + drumL + vinylNoise + vinylPop;
        right[i] = keysR + drumR + vinylNoise + vinylPop;
      }
    } else if (raw.includes('phonk') || raw.includes('drill') || raw.includes('drift')) {
      // ==========================================
      // STYLE 2: PHONK DRIFT BEAT (135 BPM)
      // ==========================================
      const bpm = 135;
      const beatSec = 60 / bpm; // ~0.4444s
      const barSec = beatSec * 4; // ~1.7777s

      // 4-Bar Phonk 808 Bass Root Notes
      // F1 -> G#1 -> D#1 -> C#1
      const bassRoots = [43.65, 51.91, 38.89, 34.65];

      // Memphis Cowbell 8th-note melody
      const cowbellMelody = [830.6, 1046.5, 1244.5, 1046.5, 830.6, 698.5, 830.6, 622.3];

      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const barTime = t % barSec;
        const beatTime = t % beatSec;
        const barIdx = Math.floor((t / barSec) % bassRoots.length);
        const rootFreq = bassRoots[barIdx];

        // 1. Heavy Distorted 808 Sub-Bass with Soft Saturation
        const bassEnv = Math.exp(-1.4 * barTime);
        const rawSine = Math.sin(2 * Math.PI * rootFreq * t);
        // Soft clipping / overdrive saturation curve
        const saturated808 = Math.tanh(3.2 * rawSine) * bassEnv * 0.42;

        // 2. Memphis Cowbell Arpeggio
        const noteIdx = Math.floor((barTime / (beatSec / 2)) % cowbellMelody.length);
        const noteTime = barTime % (beatSec / 2);
        const bellFreq = cowbellMelody[noteIdx];
        const bellEnv = Math.exp(-22 * noteTime);
        // Metallic dual-square/triangle bell synthesis
        const sq1 = Math.sin(2 * Math.PI * bellFreq * t) > 0 ? 1 : -1;
        const sq2 = Math.sin(2 * Math.PI * (bellFreq * 1.48) * t) > 0 ? 1 : -1;
        const cowbellTone = (sq1 * 0.6 + sq2 * 0.4) * bellEnv * 0.16;

        // 3. Punchy Trap Snare on Beat 3
        let snareL = 0;
        let snareR = 0;
        const tSnare = Math.max(0, barTime - beatSec * 2);
        if (barTime >= beatSec * 2 && tSnare < 0.28) {
          const body = Math.sin(2 * Math.PI * 230 * tSnare) * Math.exp(-28 * tSnare) * 0.25;
          const snap = (Math.random() * 2 - 1) * Math.exp(-24 * tSnare) * 0.28;
          snareL = body + snap;
          snareR = body + snap;
        }

        // 4. Fast 16th Hi-Hats with rolling triplets on bar ends
        const t16 = beatTime % (beatSec / 4);
        const hatEnv = Math.exp(-75 * t16);
        const hatNoise = (Math.random() * 2 - 1) * hatEnv * 0.055;

        left[i] = saturated808 + cowbellTone * 0.85 + snareL + hatNoise;
        right[i] = saturated808 + cowbellTone * 1.15 + snareR + (Math.random() * 2 - 1) * hatEnv * 0.055;
      }
    } else {
      // ==========================================
      // STYLE 3: UPBEAT TECH BASS (124 BPM) - DEFAULT
      // ==========================================
      const bpm = 124;
      const beatSec = 60 / bpm; // ~0.48387s
      const barSec = beatSec * 4; // ~1.9355s

      // Minor 7th Ambient Synth Chords: Dm7 -> Am7
      const chords = [
        [146.83, 174.61, 220.00, 261.63], // Dm7
        [146.83, 174.61, 220.00, 261.63], // Dm7
        [110.00, 130.81, 164.81, 196.00], // Am7
        [110.00, 130.81, 164.81, 196.00], // Am7
      ];

      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const beatTime = t % beatSec;
        const barTime = t % (barSec * 2);
        const chordIdx = Math.floor((barTime / (barSec / 2)) % chords.length);
        const chord = chords[chordIdx];

        // 1. Four-on-the-floor sub-bass kick (exponential drop 150Hz -> 45Hz)
        const kickPitch = 45 + 105 * Math.exp(-45 * beatTime);
        const kickEnv = Math.exp(-12 * beatTime);
        let kickTone = Math.sin(2 * Math.PI * kickPitch * beatTime) * kickEnv * 0.58;
        if (beatTime < 0.004) {
          kickTone += (1 - beatTime / 0.004) * (Math.random() * 2 - 1) * 0.18;
        }

        // 2. Filtered Ambient Synth Chords (detuned stereo chorus pads)
        let padL = 0;
        let padR = 0;
        const lfoFilter = 0.55 + 0.35 * Math.sin(2 * Math.PI * 0.2 * t);

        for (let n = 0; n < chord.length; n++) {
          const freq = chord[n];
          // Triangle wave synthesis
          const triL = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * (freq * 1.002) * t));
          const triR = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * (freq * 0.998) * t));
          const noteLevel = 0.045 * lfoFilter;
          padL += triL * noteLevel;
          padR += triR * noteLevel;
        }

        // 3. Rhythmic 16th-Note Shaker & Hi-Hat Transients
        const sub16 = beatTime % (beatSec / 4);
        const sub16Idx = Math.floor(beatTime / (beatSec / 4));
        const accent = sub16Idx === 1 || sub16Idx === 3 ? 1.0 : 0.55;
        const hatEnv = Math.exp(-85 * sub16);
        const hatL = (Math.random() * 2 - 1) * hatEnv * 0.045 * accent;
        const hatR = (Math.random() * 2 - 1) * hatEnv * 0.045 * accent;

        left[i] = kickTone + padL + hatL;
        right[i] = kickTone + padR + hatR;
      }
    }

    // Soft Master Limiter
    let maxPeak = 0;
    for (let i = 0; i < totalSamples; i++) {
      const p = Math.max(Math.abs(left[i]), Math.abs(right[i]));
      if (p > maxPeak) maxPeak = p;
    }
    if (maxPeak > 0.92) {
      const normalizeFactor = 0.92 / maxPeak;
      for (let i = 0; i < totalSamples; i++) {
        left[i] *= normalizeFactor;
        right[i] *= normalizeFactor;
      }
    }

    this.cachedBgmBuffers.set(cacheKey, buffer);
    return buffer;
  }

  /**
   * Preview BGM track alone for 4 seconds when user selects a beat in the UI
   */
  public async previewBgm(style: string = 'upbeat_tech') {
    this.stop();
    await this.unlockAudio();

    const ctx = this.getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    const buffer = this.generateProceduralBgmBuffer(style, 12);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.0);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);

    this.bgmSource = source;
    this.bgmGainNode = gain;
    this.isPlaying = true;

    if (this.previewBgmTimeout) clearTimeout(this.previewBgmTimeout);
    this.previewBgmTimeout = setTimeout(() => {
      this.stop();
    }, 4100);
  }

  /**
   * Automated Sidechain Ducking Envelope on BGM Gain Node:
   * Smoothly ducks BGM to -16 dB (gain 0.16) when voice is active,
   * and swells BGM to -9 dB (gain 0.35) during pauses (>300ms) and during the outro hold.
   */
  public applySidechainDucking(
    bgmGain: GainNode,
    words: ScriptWord[],
    totalDuration: number,
    voiceDuration: number,
    ctx: AudioContext,
    startTime: number
  ) {
    if (!bgmGain) return;
    try {
      const DUCKED_GAIN = 0.16; // -16 dB driving energetic baseline
      const SWELL_GAIN = 0.35;  // -9 dB
      const RAMP_TIME = 0.15;   // 150ms smooth transition

      bgmGain.gain.setValueAtTime(words && words.length > 0 ? DUCKED_GAIN : SWELL_GAIN, startTime);

      if (words && words.length > 0) {
        let lastWordEnd = 0;
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const wordStart = startTime + word.start;
          const wordEnd = startTime + word.end;

          // Check if there is a natural pause > 300ms before this word
          if (word.start - lastWordEnd > 0.3) {
            const pauseStart = startTime + lastWordEnd;
            bgmGain.gain.setTargetAtTime(SWELL_GAIN, pauseStart + 0.05, RAMP_TIME);
          }

          // Duck before active speech begins
          bgmGain.gain.setTargetAtTime(DUCKED_GAIN, Math.max(startTime, wordStart - 0.05), RAMP_TIME);
          lastWordEnd = word.end;
        }

        // Swell background music smoothly during the outro hold
        const outroStart = startTime + voiceDuration;
        bgmGain.gain.setTargetAtTime(SWELL_GAIN, outroStart + 0.05, RAMP_TIME);
      }
    } catch (e) {
      console.warn('applySidechainDucking warning:', e);
    }
  }

  public async speakScript(
    text: string,
    words: ScriptWord[],
    gender: 'male' | 'female' = 'male',
    rate = 1.08,
    onWord?: (index: number, word: ScriptWord) => void,
    onEnd?: () => void,
    options?: {
      voice?: string;
      bgmTrack?: 'upbeat_tech' | 'lofi_chill' | 'phonk_drill' | 'none' | string;
      bgmVolume?: number;
      streamDestination?: AudioNode;
    }
  ) {
    this.stop();
    await this.unlockAudio();

    const spokenText = normalizeTextForSpeech(text);
    this.onWordCallback = onWord || null;
    this.onEndCallback = onEnd || null;
    this.isPlaying = true;

    const selectedVoice =
      options?.voice ||
      (gender === 'female' ? 'en-US-AvaMultilingualNeural' : 'en-US-AndrewMultilingualNeural');

    const ctx = this.getAudioContext();
    const bgmTrack = options?.bgmTrack && options.bgmTrack !== 'none' ? options.bgmTrack : 'upbeat_tech';

    // Start Procedural BGM if selected
    if (ctx && options?.bgmTrack !== 'none') {
      try {
        if (ctx.state === 'suspended') await ctx.resume();
        const bgmBuffer = this.generateProceduralBgmBuffer(bgmTrack, 35);
        if (bgmBuffer) {
          const bgmSrc = ctx.createBufferSource();
          bgmSrc.buffer = bgmBuffer;
          bgmSrc.loop = true;

          const bgmGain = ctx.createGain();
          bgmGain.gain.setValueAtTime(options?.bgmVolume ?? 0.16, ctx.currentTime);

          this.applySidechainDucking(
            bgmGain,
            words,
            30,
            14,
            ctx,
            ctx.currentTime
          );

          bgmSrc.connect(bgmGain);
          bgmGain.connect(ctx.destination);
          if (options?.streamDestination) {
            bgmGain.connect(options.streamDestination);
          }

          bgmSrc.start(0);
          this.bgmSource = bgmSrc;
          this.bgmGainNode = bgmGain;
        }
      } catch (bgmErr) {
        console.warn('Procedural BGM startup warning:', bgmErr);
      }
    }

    // Attempt Studio HD Neural Audio
    try {
      const { audioUrl, buffer } = await this.getAudioForText(spokenText, selectedVoice);
      if (!this.isPlaying) return; // Stopped while fetching

      // Path 1: High Fidelity Web Audio Buffer
      if (ctx && buffer) {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = rate;
        source.connect(ctx.destination);
        if (options?.streamDestination) {
          source.connect(options.streamDestination);
        }
        this.currentSource = source;

        const totalDuration = buffer.duration / rate;
        const calibratedWords = this.calibrateWordTimestamps(words, totalDuration);

        this.startTime = ctx.currentTime;

        // Recalibrate ducking with exact voice duration
        if (this.bgmGainNode) {
          this.applySidechainDucking(
            this.bgmGainNode,
            calibratedWords,
            totalDuration + 2,
            totalDuration,
            ctx,
            this.startTime
          );
        }

        source.onended = () => {
          if (this.isPlaying) {
            this.stop();
            if (this.onEndCallback) this.onEndCallback();
          }
        };

        source.start(0);
        this.startBufferTracker(ctx, calibratedWords);
        return;
      }

      // Path 2: HTMLAudioElement
      if (audioUrl) {
        const audio = new Audio();
        audio.src = audioUrl;
        audio.volume = 1.0;
        audio.playbackRate = rate;
        this.currentAudioEl = audio;

        const totalDuration = buffer?.duration || 14;
        const calibratedWords = this.calibrateWordTimestamps(words, totalDuration / rate);

        audio.onended = () => {
          this.stop();
          if (this.onEndCallback) this.onEndCallback();
        };

        audio.onerror = () => {
          this.fallbackWebSpeech(spokenText, words, gender, rate);
        };

        await audio.play();
        this.startAudioTracker(audio, calibratedWords);
        return;
      }
    } catch (err) {
      console.warn('HD Neural Voice playback error, using instant native voice:', err);
    }

    // Path 3: Native Browser Speech (100% Reliable Offline Fallback)
    this.fallbackWebSpeech(spokenText, words, gender, rate);
  }

  private startBufferTracker(ctx: AudioContext, words: ScriptWord[]) {
    const track = () => {
      if (!this.isPlaying || !this.currentSource) return;

      const elapsed = ctx.currentTime - this.startTime;
      let activeIdx = words.findIndex((w) => elapsed >= w.start && elapsed <= w.end);
      if (activeIdx === -1 && words.length > 0) {
        for (let i = 0; i < words.length; i++) {
          if (elapsed >= words[i].start && (i === words.length - 1 || elapsed < words[i + 1].start)) {
            activeIdx = i;
            break;
          }
        }
      }

      if (activeIdx !== -1 && this.onWordCallback) {
        this.onWordCallback(activeIdx, words[activeIdx]);
      }

      this.animFrameId = requestAnimationFrame(track);
    };

    this.animFrameId = requestAnimationFrame(track);
  }

  private startAudioTracker(audio: HTMLAudioElement, words: ScriptWord[]) {
    const track = () => {
      if (!this.isPlaying || !this.currentAudioEl || audio.paused) return;

      const elapsed = audio.currentTime;
      let activeIdx = words.findIndex((w) => elapsed >= w.start && elapsed <= w.end);
      if (activeIdx === -1 && words.length > 0) {
        for (let i = 0; i < words.length; i++) {
          if (elapsed >= words[i].start && (i === words.length - 1 || elapsed < words[i + 1].start)) {
            activeIdx = i;
            break;
          }
        }
      }

      if (activeIdx !== -1 && this.onWordCallback) {
        this.onWordCallback(activeIdx, words[activeIdx]);
      }

      this.animFrameId = requestAnimationFrame(track);
    };

    this.animFrameId = requestAnimationFrame(track);
  }

  private fallbackWebSpeech(
    text: string,
    words: ScriptWord[],
    gender: 'male' | 'female',
    rate: number
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    const synth = window.speechSynthesis;
    try {
      synth.cancel();
      synth.resume(); // Fix Chrome/Edge pause freeze bug
    } catch {}

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = gender === 'female' ? 1.05 : 0.95;
    utterance.volume = 1.0;

    const voices = synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (gender === 'female'
          ? v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('aria') ||
            v.name.toLowerCase().includes('jenny')
          : v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('guy') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('ryan') ||
            v.name.toLowerCase().includes('andrew'))
    ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    if (naturalVoice) utterance.voice = naturalVoice;

    let wordCounter = 0;
    utterance.onboundary = (e) => {
      if (e.name === 'word' && wordCounter < words.length && this.onWordCallback) {
        this.onWordCallback(wordCounter, words[wordCounter]);
        wordCounter++;
      }
    };

    utterance.onend = () => {
      this.isPlaying = false;
      if (this.onEndCallback) this.onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isPlaying = false;
      if (this.onEndCallback) this.onEndCallback();
    };

    // Unfreeze and speak
    synth.speak(utterance);
    if (synth.paused) {
      synth.resume();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {}
      this.currentSource = null;
    }
    if (this.bgmSource) {
      try {
        this.bgmSource.stop();
        this.bgmSource.disconnect();
      } catch {}
      this.bgmSource = null;
    }
    if (this.bgmGainNode) {
      try {
        this.bgmGainNode.disconnect();
      } catch {}
      this.bgmGainNode = null;
    }
    if (this.currentAudioEl) {
      try {
        this.currentAudioEl.pause();
        this.currentAudioEl.currentTime = 0;
      } catch {}
      this.currentAudioEl = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const audioEngine = new NaturalAudioEngine();
