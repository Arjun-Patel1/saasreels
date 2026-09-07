import { AIPersona, BrandInfo, ScriptWord, VideoScript, VideoStyleConfig } from '@/types';
import { audioEngine } from './audioEngine';
import { soundFxEngine } from './soundFxEngine';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

// Cubic Bezier Easing Helper
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const KEYWORD_EMOJI_MAP: Record<string, string> = {
  money: '💸', cash: '💸', revenue: '💸', arr: '💸', mrr: '💸', cost: '💸', spend: '💸', dollars: '💸', paying: '💸', paid: '💸',
  burnout: '😫', tired: '😫', waste: '😫', hours: '😫', grind: '😫', slow: '😫', break: '😫',
  secret: '🤫', gatekeep: '🤫', gatekeeping: '🤫', cheat: '🤫', hack: '🤫', code: '🤫', locked: '🤫',
  fast: '⚡', quick: '⚡', seconds: '⚡', instant: '⚡', speed: '⚡', automate: '⚡', automated: '⚡', '30s': '⚡',
  growth: '🚀', scale: '🚀', viral: '🚀', views: '🚀', traffic: '🚀', ranking: '🚀', launch: '🚀',
  saas: '💻', tool: '💻', app: '💻', software: '💻', platform: '💻', dev: '💻',
  free: '🎁', discount: '🎁', deal: '🎁', bonus: '🎁',
  stop: '🛑', halt: '🛑',
  crazy: '🤯', insane: '🤯', mindblown: '🤯',
  hate: '😡', angry: '😡',
};

export function getEmojiForWord(word: string, explicitEmoji?: string): string | null {
  if (explicitEmoji) return explicitEmoji;
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  return KEYWORD_EMOJI_MAP[clean] || null;
}

export interface CaptionChunk {
  words: ScriptWord[];
  indices: number[];
  isSolo: boolean;
}

/**
 * Sentence-Boundary 2-Word Micro-Chunker:
 * NEVER pairs words across sentence boundaries (. ! ?).
 * If a sentence has an odd number of words, the trailing word is kept as a solo emphasized badge.
 */
export function buildSentenceBoundaryChunks(words: ScriptWord[]): CaptionChunk[] {
  if (!words || words.length === 0) return [];

  const chunks: CaptionChunk[] = [];
  let currentSentence: { word: ScriptWord; index: number }[] = [];

  const isSentenceEnd = (w: string) => /[.!?]+["']?$/.test(w.trim());

  for (let i = 0; i < words.length; i++) {
    const item = { word: words[i], index: i };
    currentSentence.push(item);

    if (isSentenceEnd(words[i].word) || i === words.length - 1) {
      // Chunk current sentence into pairs without crossing sentence boundaries
      for (let j = 0; j < currentSentence.length; j += 2) {
        const slice = currentSentence.slice(j, j + 2);
        chunks.push({
          words: slice.map((s) => s.word),
          indices: slice.map((s) => s.index),
          isSolo: slice.length === 1,
        });
      }
      currentSentence = [];
    }
  }

  return chunks;
}

export function getActiveCaptionChunk(
  words: ScriptWord[],
  activeIndex: number
): { chunk: CaptionChunk; chunkIndex: number } | null {
  if (activeIndex < 0 || activeIndex >= words.length) return null;
  const chunks = buildSentenceBoundaryChunks(words);
  const foundIndex = chunks.findIndex((c) => c.indices.includes(activeIndex));
  if (foundIndex === -1) return null;
  return { chunk: chunks[foundIndex], chunkIndex: foundIndex };
}

export class ClientVideoRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private lastCaptionPair = -1;
  private dingPlayed = false;
  private clickPlayed = false;

  constructor(width = 720, height = 1280) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public async renderAndExportVideo(
    brand: BrandInfo,
    script: VideoScript,
    persona: AIPersona,
    style: VideoStyleConfig,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      this.recordedChunks = [];
      this.lastCaptionPair = -1;
      this.dingPlayed = false;
      this.clickPlayed = false;

      const canvasStream = this.canvas.captureStream(30);

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = AudioCtxClass ? new AudioCtxClass() : null;
      let combinedStream = canvasStream;
      let voiceSource: AudioBufferSourceNode | null = null;
      let bgmSource: AudioBufferSourceNode | null = null;

      const rawWords: ScriptWord[] = [];
      script.segments.forEach((seg) => rawWords.push(...seg.words));
      let calibratedWords = rawWords;

      const selectedVoice =
        style.voiceId ||
        (persona.gender === 'female' ? 'en-US-AvaMultilingualNeural' : 'en-US-AndrewMultilingualNeural');

      let audioDest: MediaStreamAudioDestinationNode | null = null;

      // 1. Decouple Export Duration from raw voiceover:
      // Guarantee full timeline (minimum 22.0 - 23.0s for Scene 1-3 demo + Scene 4 Offer Reveal + decaying BGM outro)
      const scriptWordsDuration = rawWords[rawWords.length - 1]?.end || 0;
      let totalExportDuration = Math.max(scriptWordsDuration, 22.5);

      if (audioCtx) {
        try {
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }

          const { buffer: voiceBuffer } = await audioEngine.getAudioForText(script.fullText, selectedVoice);
          const speechRate = style.speechRate || 1.08;
          const voiceDuration = voiceBuffer ? (voiceBuffer.duration / speechRate) : 18.0;

          totalExportDuration = Math.max(
            scriptWordsDuration,
            voiceDuration + 3.5, // Allow full Scene 4 CTA reveal and outro decay
            22.0 // Fallback minimum for full reel + CTA decay
          );

          audioDest = audioCtx.createMediaStreamDestination();

          if (voiceBuffer) {
            calibratedWords = audioEngine.calibrateWordTimestamps(rawWords, voiceDuration);

            // Voiceover Audio Node
            voiceSource = audioCtx.createBufferSource();
            voiceSource.buffer = voiceBuffer;
            voiceSource.playbackRate.value = speechRate;
            const voiceGain = audioCtx.createGain();
            voiceGain.gain.value = 1.0;
            voiceSource.connect(voiceGain);
            voiceGain.connect(audioDest);
            voiceGain.connect(audioCtx.destination);
          }

          // Background Music (BGM) Node with Procedural Synthesizer & Dynamic Sidechain Ducking
          const bgmTrack = style.bgmTrack && style.bgmTrack !== 'none' ? style.bgmTrack : 'upbeat_tech';
          const bgmBuffer = audioEngine.generateProceduralBgmBuffer(bgmTrack, totalExportDuration + 4);
          if (bgmBuffer && style.bgmTrack !== 'none') {
            bgmSource = audioCtx.createBufferSource();
            bgmSource.buffer = bgmBuffer;
            bgmSource.loop = true;
            const bgmGain = audioCtx.createGain();
            bgmGain.gain.setValueAtTime(style.bgmVolume ?? 0.16, audioCtx.currentTime);

            // Apply Automated Ducking Envelope
            audioEngine.applySidechainDucking(
              bgmGain,
              calibratedWords,
              totalExportDuration,
              voiceDuration,
              audioCtx,
              audioCtx.currentTime
            );

            bgmSource.connect(bgmGain);
            bgmGain.connect(audioDest);
          }

          const audioTracks = audioDest.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            combinedStream = new MediaStream([
              ...canvasStream.getVideoTracks(),
              ...audioTracks,
            ]);
          }
        } catch (err) {
          console.warn('Could not attach audio tracks to video stream:', err);
        }
      }

      const totalDuration = totalExportDuration;

      // Check native platform MP4 vs WebM container support
      const isMp4Supported = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')
        || MediaRecorder.isTypeSupported('video/mp4');

      const mimeType = isMp4Supported
        ? (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2') ? 'video/mp4;codecs=avc1,mp4a.40.2' : 'video/mp4')
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      try {
        this.mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 8000000,
        });
      } catch (err) {
        reject(err);
        return;
      }

      // 2. Gather all chunks strictly inside ondataavailable
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // 3. Trigger Blob packaging and file download strictly inside onstop
      this.mediaRecorder.onstop = () => {
        const outMime = isMp4Supported ? 'video/mp4' : 'video/webm';
        const finalBlob = new Blob(this.recordedChunks, { type: outMime });
        const downloadUrl = URL.createObjectURL(finalBlob);

        try {
          const a = document.createElement('a');
          a.href = downloadUrl;
          const sanitizedBrand = (brand.name || 'saasreels').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          a.download = `${sanitizedBrand}-saasreels.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (dlErr) {
          console.warn('Automatic download anchor click error:', dlErr);
        }

        resolve(downloadUrl);
      };

      this.mediaRecorder.start(250); // Request slices every 250ms for consistent buffering
      this.isRecording = true;

      // Start audio playback into recording stream
      if (voiceSource) {
        try {
          voiceSource.start(0);
        } catch {}
      }
      if (bgmSource) {
        try {
          bgmSource.start(0);
        } catch {}
      }

      const avatarImg = await this.loadImage(persona.avatarUrl).catch(() => null);
      const mockupImg = await this.loadImage(brand.screenshotUrl).catch(() => null);

      // 4. Deterministic Frame Rendering (Step through time at 30 FPS to prevent background tab throttling)
      const fps = 30;
      const totalFrames = Math.ceil(totalExportDuration * fps);
      let currentFrame = 0;
      const renderStartTime = performance.now();
      let hasCompleted = false;

      const renderInterval = setInterval(() => {
        if (!this.isRecording || hasCompleted) {
          clearInterval(renderInterval);
          return;
        }

        currentFrame++;
        const elapsedFromClock = (performance.now() - renderStartTime) / 1000;
        const elapsedFromFrames = currentFrame / fps;
        const currentRenderTime = Math.min(totalExportDuration, Math.max(elapsedFromClock, elapsedFromFrames));

        if (currentRenderTime >= totalExportDuration || currentFrame >= totalFrames) {
          hasCompleted = true;
          clearInterval(renderInterval);

          // 500ms safety drain delay before calling .stop() to allow browser encoder & audio nodes to flush
          setTimeout(() => {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
              try {
                this.mediaRecorder.requestData();
              } catch {}
              this.mediaRecorder.stop();
            }
            if (voiceSource) {
              try { voiceSource.stop(); voiceSource.disconnect(); } catch {}
            }
            if (bgmSource) {
              try { bgmSource.stop(); bgmSource.disconnect(); } catch {}
            }
            this.isRecording = false;
          }, 500);
          return;
        }

        // Trigger programmatic Micro-SFX in sync with visual cues
        this.handleSfxTriggers(currentRenderTime, totalExportDuration, calibratedWords, audioDest);

        this.drawFrame(currentRenderTime, brand, script, persona, style, calibratedWords, avatarImg, mockupImg, totalExportDuration);

        if (onProgress) {
          onProgress(Math.min(99, Math.floor((currentRenderTime / totalExportDuration) * 100)));
        }
      }, 1000 / fps);
    });
  }

  private handleSfxTriggers(
    time: number,
    totalDuration: number,
    words: ScriptWord[],
    audioDest: MediaStreamAudioDestinationNode | null
  ) {
    const destNode = audioDest || undefined;

    // 1. Whoosh SFX on sentence-boundary caption chunk changes
    let activeIndex = words.findIndex((w) => time >= w.start && time <= w.end);
    if (activeIndex === -1 && words.length > 0) {
      for (let i = 0; i < words.length; i++) {
        if (time >= words[i].start && (i === words.length - 1 || time < words[i + 1].start)) {
          activeIndex = i;
          break;
        }
      }
    }

    if (activeIndex !== -1) {
      const activeChunkInfo = getActiveCaptionChunk(words, activeIndex);
      if (activeChunkInfo && activeChunkInfo.chunkIndex !== this.lastCaptionPair) {
        this.lastCaptionPair = activeChunkInfo.chunkIndex;
        if (time > 0.3) {
          audioEngine.playWhoosh(destNode);
        }
      }
    }

    // 2. Click SFX at 50% timeline (Simulated UI Click)
    const clickTime = totalDuration * 0.50;
    if (time >= clickTime && !this.clickPlayed) {
      this.clickPlayed = true;
      audioEngine.playClick(destNode);
    }

    // 3. Ding Chime SFX at Scene 4 Offer Reveal (ONLY in final 3.5s)
    const offerTime = totalDuration - 3.5;
    if (time >= offerTime && !this.dingPlayed) {
      this.dingPlayed = true;
      audioEngine.playDing(destNode);
    }
  }

  private drawFrame(
    time: number,
    brand: BrandInfo,
    script: VideoScript,
    persona: AIPersona,
    style: VideoStyleConfig,
    words: ScriptWord[],
    avatarImg: HTMLImageElement | null,
    mockupImg: HTMLImageElement | null,
    totalDuration: number
  ) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 1. Dark Studio Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#060609');
    bgGrad.addColorStop(0.5, '#101018');
    bgGrad.addColorStop(1, '#07070c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const topHeight = height * 0.49;
    const isSatisfyingLoop = style.templateFormat === 'split_gameplay';

    // 2. Top Half: Procedural Satisfying Loop OR Handheld Camera Drift on Avatar
    if (isSatisfyingLoop) {
      this.drawSatisfyingKineticLoop(ctx, width, topHeight, time);
    } else if (avatarImg) {
      ctx.save();
      // Arcads-Style Multi-Frequency Handheld Camera Drift
      const swayX = Math.sin(time * 1.8) * 2.0;
      const bounceY = Math.cos(time * 2.4) * 1.5;
      const rollRad = Math.sin(time * 1.2) * 0.005; // ±0.3 deg organic roll

      ctx.beginPath();
      ctx.rect(0, 0, width, topHeight);
      ctx.clip();

      ctx.translate(width / 2, topHeight / 2);
      ctx.rotate(rollRad);
      ctx.translate(-width / 2 + swayX, -topHeight / 2 + bounceY);

      // Continuous slow zoom scaled to 1.06 base to prevent edge gaps during drift
      const zoomProgress = Math.min(1, time / Math.max(1, totalDuration));
      const zoom = 1.06 + zoomProgress * 0.06;
      const zoomedW = width * zoom;
      const zoomedH = topHeight * zoom;
      const offsetX = (width - zoomedW) / 2;
      const offsetY = (topHeight - zoomedH) / 2;

      ctx.drawImage(avatarImg, offsetX, offsetY, zoomedW, zoomedH);

      // Dynamic Angled Light Ray Sweep across Avatar
      const lightSweepX = ((time * 160) % (width * 2.5)) - width * 0.5;
      const lightGrad = ctx.createLinearGradient(lightSweepX, 0, lightSweepX + 180, topHeight);
      lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      lightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.09)');
      lightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, width, topHeight);

      // Ambient Floating Sparkle Particles
      for (let i = 0; i < 6; i++) {
        const px = ((i * 127 + time * 18) % width);
        const py = ((i * 91 + Math.sin(time * 2 + i) * 25 + topHeight) % topHeight);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else {
      // Sleek Minimal Avatar Fallback
      ctx.save();
      ctx.fillStyle = '#14141e';
      ctx.fillRect(0, 0, width, topHeight);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🎙️ ${persona.name}`, width / 2, topHeight / 2 - 10);
      ctx.fillStyle = '#facc15';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(persona.role, width / 2, topHeight / 2 + 20);
      ctx.restore();
    }

    // Top Overlays: Creator Badge & Brand Pill
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(24, 24, 200, 50, 25);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(44, 49, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(persona.name, 58, 45);

    ctx.fillStyle = '#facc15';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(persona.role.slice(0, 18), 58, 61);

    // Top Right Brand Pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(width - 180, 24, 156, 50, 25);
    ctx.fill();
    ctx.strokeStyle = brand.primaryColor || '#facc15';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${brand.logoUrl || '⚡'} ${brand.name.slice(0, 10)}`, width - 165, 55);
    ctx.restore();

    // 3. Bottom Half: Interactive Live Screen with Subtle Ken Burns Push-In & Gentle Scroll
    const bottomY = topHeight + 12;
    const bottomHeight = height - bottomY - 50;

    ctx.save();
    ctx.fillStyle = '#111119';
    ctx.beginPath();
    ctx.roundRect(20, bottomY, width - 40, bottomHeight, 22);
    ctx.fill();
    ctx.strokeStyle = brand.primaryColor || '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Browser header bar
    ctx.fillStyle = '#1b1b26';
    ctx.beginPath();
    ctx.roundRect(20, bottomY, width - 40, 44, [22, 22, 0, 0]);
    ctx.fill();

    // Window controls (Red, Yellow, Green)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(44, bottomY + 22, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(62, bottomY + 22, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(80, bottomY + 22, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // URL bar
    ctx.fillStyle = '#09090f';
    ctx.beginPath();
    ctx.roundRect(102, bottomY + 7, width - 138, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px monospace';
    ctx.fillText(`🔒 ${brand.url}`, 118, bottomY + 27);

    // Mockup screenshot with subtle dynamic push-in / slow drift OR Procedural Hero Fallback
    if (mockupImg) {
      ctx.save();
      // Clip inside browser viewport
      ctx.beginPath();
      ctx.roundRect(22, bottomY + 44, width - 44, bottomHeight - 46, [0, 0, 22, 22]);
      ctx.clip();

      const screenZoomProgress = Math.min(1, time / Math.max(1, totalDuration));
      const screenZoom = 1.0 + screenZoomProgress * 0.06;
      const screenW = (width - 44) * screenZoom;
      const screenH = (bottomHeight - 46) * screenZoom;
      const screenOffsetX = 22 + ((width - 44) - screenW) / 2;
      const screenOffsetY = (bottomY + 44) - (screenZoomProgress * 15);

      ctx.drawImage(mockupImg, screenOffsetX, screenOffsetY, screenW, screenH);
      ctx.restore();
    } else {
      // Procedural Hero Fallback (when image fails, fails CORS, or returns blank)
      this.drawProceduralHeroMockup(ctx, 22, bottomY + 44, width - 44, bottomHeight - 46, brand, time);
    }

    // Pattern Interrupt Hook (0.0s – 1.5s): Animated energetic neon highlight box
    if (time <= 1.5) {
      this.drawPatternInterruptHook(ctx, width, bottomY, bottomHeight, time);
    }

    // 4. Multi-Scene Dynamic Storyboard Overlays (Safe Zone Optimized)
    const isOfferScene = time >= totalDuration - 3.5;
    if (isOfferScene) {
      // SCENE 4: Clean Unified CTA (Positioned ONLY in final 3.5s to never obscure demo)
      this.drawOfferScene(ctx, width, bottomY, bottomHeight, brand, style, script);
    } else if (time >= 3.0) {
      // SCENE 3: Simulated Live UI Cursor & Interaction Physics
      this.drawSimulatedCursor(ctx, width, bottomY, bottomHeight, time, totalDuration);
    }

    ctx.restore();

    // 5. Modern Lightweight Floating Subtitles with Springing Emoji Badges
    this.drawCrispSubtitles(ctx, width, height, time, words, style);
  }

  /**
   * Procedural Hero Layout Fallback:
   * Rendered when screenshot fails, CORS blocks the image, or screenshotUrl is blank.
   * Displays the brand's domain name, title, value props, and an animated gradient skeleton
   * so the bottom frame is NEVER an empty black box.
   */
  private drawProceduralHeroMockup(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    brand: BrandInfo,
    time: number
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [0, 0, 22, 22]);
    ctx.clip();

    // Dark sleek gradient background
    const heroBg = ctx.createLinearGradient(x, y, x, y + h);
    heroBg.addColorStop(0, '#0d0d16');
    heroBg.addColorStop(0.5, '#141424');
    heroBg.addColorStop(1, '#090910');
    ctx.fillStyle = heroBg;
    ctx.fillRect(x, y, w, h);

    // Subtle perspective grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let gx = x; gx < x + w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + h);
      ctx.stroke();
    }
    for (let gy = y; gy < y + h; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();
    }

    // Top Brand Badge & Logo
    const primaryColor = brand.primaryColor || '#facc15';
    const centerX = x + w / 2;

    // Brand Logo Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(centerX - 130, y + 26, 260, 44, 22);
    ctx.fill();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${brand.logoUrl || '⚡'} ${brand.name.toUpperCase()}`, centerX, y + 54);

    // Main Hero Headline / Tagline
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    const headline = brand.tagline || brand.name;
    if (headline.length > 32) {
      ctx.fillText(headline.slice(0, 30) + '...', centerX, y + 105);
    } else {
      ctx.fillText(headline, centerX, y + 105);
    }

    // Feature Badges Row (3 pills)
    const pills = [
      { text: '⚡ 10X SPEED', bg: 'rgba(250, 204, 21, 0.12)', border: '#facc15' },
      { text: '🔒 LIVE SYNC', bg: 'rgba(56, 189, 248, 0.12)', border: '#38bdf8' },
      { text: '⭐ 4.9 RATED', bg: 'rgba(34, 197, 94, 0.12)', border: '#22c55e' },
    ];
    const pillW = (w - 70) / 3;
    pills.forEach((p, idx) => {
      const px = x + 25 + idx * (pillW + 10);
      const py = y + 130;
      ctx.fillStyle = p.bg;
      ctx.beginPath();
      ctx.roundRect(px, py, pillW, 30, 8);
      ctx.fill();
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = p.border;
      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, px + pillW / 2, py + 19);
    });

    // Animated Shimmer Skeleton Container
    const skelY = y + 180;
    const skelH = h - 250;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.roundRect(x + 20, skelY, w - 40, skelH, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2 Simulated Dashboard Skeleton Metric Cards
    const cardW = (w - 70) / 2;
    for (let c = 0; c < 2; c++) {
      const cardX = x + 30 + c * (cardW + 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(cardX, skelY + 15, cardW, 60, 10);
      ctx.fill();

      // Metric Skeleton Bars
      ctx.fillStyle = c === 0 ? 'rgba(250, 204, 21, 0.4)' : 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(cardX + 12, skelY + 28, cardW * 0.4, 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(cardX + 12, skelY + 44, cardW * 0.7, 12);
    }

    // Skeleton Data Table / Graph Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.roundRect(x + 30, skelY + 90, w - 60, skelH - 105, 8);
    ctx.fill();

    // Animated Shimmer Gradient Sweep across Skeleton
    const shimmerPos = ((time * 240) % (w * 2)) - w * 0.5;
    const shimmer = ctx.createLinearGradient(x + shimmerPos, y, x + shimmerPos + 120, y + h);
    shimmer.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shimmer.addColorStop(0.5, 'rgba(255, 255, 255, 0.09)');
    shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shimmer;
    ctx.fillRect(x, y, w, h);

    // Glowing CTA Button at Bottom of Mockup
    const btnY = y + h - 55;
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(centerX - 120, btnY, 240, 40, 20);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '900 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ START USING ${brand.name.toUpperCase()} NOW →`, centerX, btnY + 25);

    ctx.restore();
  }

  /**
   * Procedural Satisfying Kinetic Loop (Cliptalk Style):
   * 100% procedural dark cyberpunk matrix perspective grid + floating particles
   */
  private drawSatisfyingKineticLoop(ctx: CanvasRenderingContext2D, width: number, topHeight: number, time: number) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, topHeight);
    ctx.clip();

    // Dark cyberpunk radial backdrop
    const grad = ctx.createRadialGradient(width / 2, topHeight / 2, 20, width / 2, topHeight / 2, width * 0.8);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.6, '#080d1a');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, topHeight);

    // Dynamic Undulating Cyber Grid Matrix
    const horizon = topHeight * 0.45;
    const numLines = 12;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 1.8;

    // Horizontal undulating waves
    for (let i = 0; i < numLines; i++) {
      const lineProgress = (i / numLines + (time * 0.25) % (1 / numLines)) % 1;
      const y = horizon + Math.pow(lineProgress, 2) * (topHeight - horizon);

      ctx.beginPath();
      for (let x = 0; x <= width; x += 15) {
        const wave = Math.sin(x * 0.02 + time * 3.2 + i) * (8 * lineProgress);
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    // Perspective vertical rays converging to vanishing point
    const vanishingX = width / 2;
    const vanishingY = horizon * 0.7;
    const numRays = 16;
    for (let r = 0; r <= numRays; r++) {
      const bottomX = (r / numRays) * width;
      ctx.beginPath();
      ctx.moveTo(vanishingX, vanishingY);
      ctx.lineTo(bottomX, topHeight);
      ctx.stroke();
    }

    // 25 Floating Kinetic Glow Particles with Alpha Pulsing
    for (let p = 0; p < 25; p++) {
      const px = (Math.sin(p * 47 + time * 0.4) * 0.45 + 0.5) * width;
      const py = ((p * 35 - time * 45) % topHeight + topHeight) % topHeight;
      const alpha = 0.3 + Math.sin(time * 3 + p) * 0.3;
      const pSize = 1.8 + (p % 3);

      ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Glowing Holographic Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 125, 28, 250, 42, 21);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 4.2x RETENTION KINETIC LOOP', width / 2, 54);

    // Bottom gradient blend into division
    const topGrad = ctx.createLinearGradient(0, topHeight - 80, 0, topHeight);
    topGrad.addColorStop(0, 'rgba(6, 6, 9, 0)');
    topGrad.addColorStop(1, '#060609');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, topHeight - 80, width, 80);
    ctx.restore();
  }

  /**
   * Pattern Interrupt Hook (0.0s – 1.5s):
   * Animated glowing neon bounding box and hook badge to arrest attention in the first second
   */
  private drawPatternInterruptHook(
    ctx: CanvasRenderingContext2D,
    width: number,
    bottomY: number,
    bottomHeight: number,
    time: number
  ) {
    ctx.save();
    const boxX = 40;
    const boxY = bottomY + 70;
    const boxW = width - 80;
    const boxH = bottomHeight * 0.45;

    // Pulsing Neon Yellow Glow
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 15 + Math.sin(time * 12) * 6;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 8]);
    ctx.lineDashOffset = -time * 40;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.stroke();

    // "👀 LOOK AT THIS" Alert Badge
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 90, boxY - 16, 180, 32, 16);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '900 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 30-SEC AUTOMATION', width / 2, boxY + 5);

    ctx.restore();
  }

  /**
   * Simulated Live UI Cursor & Interaction Physics:
   * Cubic Bezier gliding cursor that hits the CTA button at 50%, scales button (0.95x),
   * triggers radial ripple pulse, and displays status pill.
   */
  private drawSimulatedCursor(
    ctx: CanvasRenderingContext2D,
    width: number,
    bottomY: number,
    bottomHeight: number,
    time: number,
    totalDuration: number
  ) {
    const clickTime = totalDuration * 0.50;
    const buttonX = width / 2;
    const buttonY = bottomY + bottomHeight * 0.68;

    // Cubic Bezier cursor glide trajectory
    let cursorX = width * 0.25;
    let cursorY = bottomY + bottomHeight * 0.4;

    if (time < clickTime) {
      const progress = Math.max(0, Math.min(1, (time - 4.0) / (clickTime - 4.0)));
      const eased = easeInOutCubic(progress);
      cursorX = width * 0.25 + (buttonX - width * 0.25) * eased;
      cursorY = (bottomY + bottomHeight * 0.4) + (buttonY - (bottomY + bottomHeight * 0.4)) * eased;
    } else {
      // Post-click smooth hover
      const postTime = time - clickTime;
      cursorX = buttonX + Math.sin(postTime * 2) * 15;
      cursorY = buttonY + Math.cos(postTime * 2) * 8;
    }

    ctx.save();

    // Simulated Button Click Ripple Effect (at 50% timeline)
    const timeSinceClick = time - clickTime;
    if (timeSinceClick >= 0 && timeSinceClick < 1.0) {
      const rippleRadius = timeSinceClick * 80;
      const rippleOpacity = Math.max(0, 1 - timeSinceClick);

      ctx.strokeStyle = `rgba(250, 204, 21, ${rippleOpacity})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(buttonX, buttonY, rippleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Click Impact Flash
      ctx.fillStyle = `rgba(250, 204, 21, ${rippleOpacity * 0.35})`;
      ctx.beginPath();
      ctx.arc(buttonX, buttonY, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    // Neon Yellow Cursor Pointer
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY);
    ctx.lineTo(cursorX + 16, cursorY + 14);
    ctx.lineTo(cursorX + 8, cursorY + 16);
    ctx.lineTo(cursorX + 14, cursorY + 28);
    ctx.lineTo(cursorX + 6, cursorY + 30);
    ctx.lineTo(cursorX, cursorY + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // "⚡ 1-CLICK ACTION" Action Pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.90)';
    ctx.beginPath();
    ctx.roundRect(cursorX + 22, cursorY - 14, 175, 30, 8);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(time >= clickTime ? '⚡ VIRAL REEL GENERATED' : '⚡ 1-CLICK GENERATE', cursorX + 30, cursorY + 5);

    ctx.restore();
  }

  private drawOfferScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    bottomY: number,
    bottomHeight: number,
    brand: BrandInfo,
    style: VideoStyleConfig,
    script: VideoScript
  ) {
    ctx.save();
    const cardY = bottomY + 35;
    const cardHeight = bottomHeight - 80;

    // Dark Glass Backdrop Blur
    ctx.fillStyle = 'rgba(8, 8, 14, 0.94)';
    ctx.beginPath();
    ctx.roundRect(28, cardY, width - 56, cardHeight, 20);
    ctx.fill();
    ctx.strokeStyle = brand.primaryColor || '#facc15';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Determine CTA Type from script
    const scriptLower = (script.fullText + ' ' + (script.callToAction || '')).toLowerCase();
    const isFreeTrial = scriptLower.includes('free') || scriptLower.includes('bio') || scriptLower.includes('try');

    // Star Rating
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐⭐⭐⭐⭐ (4.9 / 5.0)', width / 2, cardY + 50);

    if (isFreeTrial && !style.promoCode) {
      // Clean Free Trial Conversion Box
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 160, cardY + 75, 320, 65, 14);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('TRY 100% FREE TODAY', width / 2, cardY + 115);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('⚡ Instant Access • No Credit Card Required', width / 2, cardY + 175);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('👉 Tap Link in Bio to Start Now', width / 2, cardY + 215);
    } else {
      // Unified Promo Code Box
      const promoCode = style.promoCode || brand.promoCode || 'FAST50';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 140, cardY + 75, 280, 60, 14);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.font = '900 24px monospace';
      ctx.fillText(`CODE: ${promoCode}`, width / 2, cardY + 113);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`${style.discountText || brand.discountText || 'Get 50% Off Today!'}`, width / 2, cardY + 170);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('👉 Tap Link in Bio to Claim', width / 2, cardY + 210);
    }

    ctx.restore();
  }

  private drawCrispSubtitles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    words: ScriptWord[],
    style: VideoStyleConfig
  ) {
    let activeIndex = words.findIndex((w) => time >= w.start && time <= w.end);
    if (activeIndex === -1 && words.length > 0) {
      for (let i = 0; i < words.length; i++) {
        if (time >= words[i].start && (i === words.length - 1 || time < words[i + 1].start)) {
          activeIndex = i;
          break;
        }
      }
    }
    if (activeIndex === -1) return;

    // Sentence-boundary 2-word micro-chunking (never pairs words across sentence boundaries)
    const activeChunkInfo = getActiveCaptionChunk(words, activeIndex);
    if (!activeChunkInfo) return;

    const { chunk } = activeChunkInfo;
    const phraseWords = chunk.words;
    const isSoloWord = chunk.isSolo;

    const centerY = height * 0.49;

    ctx.save();
    ctx.font = isSoloWord
      ? '900 40px Impact, Arial Black, sans-serif'
      : '900 36px Impact, Arial Black, sans-serif';
    ctx.textBaseline = 'middle';

    const currentActiveWord = words[activeIndex];
    const wordWidths = phraseWords.map((w) => {
      const txt = w.word.toUpperCase();
      const badgeEmoji = getEmojiForWord(w.word, w.emoji);
      return {
        wordObj: w,
        text: txt,
        width: ctx.measureText(txt).width,
        isCurrent: currentActiveWord && (w.start === currentActiveWord.start || (w.start <= time && w.end >= time)),
        emoji: badgeEmoji,
      };
    });

    const spacing = 16;
    const totalW = wordWidths.reduce((sum, item) => sum + item.width, 0) + (wordWidths.length - 1) * spacing;
    let currentX = (width - totalW) / 2;

    wordWidths.forEach((item) => {
      if (item.isCurrent) {
        const highlightColor = style.captionColor || '#facc15';
        ctx.fillStyle = highlightColor;
        ctx.beginPath();

        // Emphasized badge geometry for solo odd-ending sentence words
        const padX = isSoloWord ? 18 : 10;
        const padY = isSoloWord ? 30 : 26;
        const badgeH = isSoloWord ? 60 : 52;
        const radius = isSoloWord ? 16 : 12;

        ctx.roundRect(currentX - padX, centerY - padY, item.width + padX * 2, badgeH, radius);
        ctx.fill();

        // Solo word accent outline
        if (isSoloWord) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        ctx.fillStyle = '#000000';
        ctx.fillText(item.text, currentX, centerY);

        // Submagic / CapCut Springing Emoji Badge
        if (item.emoji) {
          const tRel = Math.max(0, time - item.wordObj.start);
          let springScale = 1.0;
          if (tRel < 0.12) {
            springScale = 0.3 + (tRel / 0.12) * 0.95; // 0.3x -> 1.25x
          } else if (tRel < 0.22) {
            springScale = 1.25 - ((tRel - 0.12) / 0.10) * 0.25; // 1.25x -> 1.0x
          }
          const floatHoverY = Math.sin(time * 6) * 3;

          const emojiCenterX = currentX + item.width / 2;
          const emojiCenterY = centerY - 54 + floatHoverY;

          ctx.save();
          ctx.translate(emojiCenterX, emojiCenterY);
          ctx.scale(springScale, springScale);

          // Glassmorphic dark badge behind emoji
          ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
          ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.roundRect(-22, -22, 44, 44, 22);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.font = '26px -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.emoji, 0, 2);
          ctx.restore();
        }
      } else {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(item.text, currentX, centerY);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(item.text, currentX, centerY);
        ctx.restore();
      }
      currentX += item.width + spacing;
    });

    ctx.restore();
  }

  private loadImage(url: string, timeoutMs = 2500): Promise<HTMLImageElement | null> {
    if (!url || /dns_probe|err_name_not_resolved|chrome-error|error_page|can't be reached/i.test(url)) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      let settled = false;
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          console.warn(`Image load timed out after ${timeoutMs}ms: ${url.slice(0, 60)}...`);
          resolve(null);
        }
      }, timeoutMs);

      img.onload = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(img);
        }
      };

      img.onerror = (e) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          console.warn(`Image load failed (CORS or network): ${url.slice(0, 60)}...`);
          resolve(null);
        }
      };

      img.src = url;
    });
  }
}

