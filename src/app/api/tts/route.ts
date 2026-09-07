import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { normalizeTextForSpeech } from '@/lib/speechNormalizer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'en-US-AndrewMultilingualNeural', provider = 'edge', apiKey } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Phonetic & Linguistic Normalization: Fix $2,000/mo, acronyms, compound words
    const spokenText = normalizeTextForSpeech(text);

    // 1. ElevenLabs API (if custom key provided)
    if (provider === 'elevenlabs' && apiKey) {
      try {
        const voiceId = voice === 'female' ? '21m00Tcm4TlvDq8ikWAM' : 'pNInz6obpgDQGcFmaJgB'; // Rachel or Adam
        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: spokenText,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.85,
              style: 0.2,
              use_speaker_boost: true,
            },
          }),
        });

        if (elevenRes.ok) {
          const audioBuffer = await elevenRes.arrayBuffer();
          const base64Audio = Buffer.from(audioBuffer).toString('base64');
          return NextResponse.json({
            success: true,
            provider: 'elevenlabs',
            spokenText,
            audioUrl: `data:audio/mp3;base64,${base64Audio}`,
          });
        }
      } catch (err) {
        console.warn('ElevenLabs API error, falling back to Ultra-Natural Neural:', err);
      }
    }

    // 2. OpenAI TTS API (if custom key provided)
    if (provider === 'openai' && (apiKey || process.env.OPENAI_API_KEY)) {
      try {
        const openAiKey = apiKey || process.env.OPENAI_API_KEY;
        const openAiVoice = voice === 'female' || voice.includes('Jenny') || voice.includes('Ava') ? 'nova' : 'onyx';
        const openAiRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: spokenText,
            voice: openAiVoice,
            speed: 1.0,
          }),
        });

        if (openAiRes.ok) {
          const audioBuffer = await openAiRes.arrayBuffer();
          const base64Audio = Buffer.from(audioBuffer).toString('base64');
          return NextResponse.json({
            success: true,
            provider: 'openai',
            spokenText,
            audioUrl: `data:audio/mp3;base64,${base64Audio}`,
          });
        }
      } catch (err) {
        console.warn('OpenAI TTS error, falling back to Ultra-Natural Neural:', err);
      }
    }

    // 3. Ultra-Natural Multilingual Conversational Neural Voice with Emotional Inflection
    let selectedVoice = 'en-US-AndrewMultilingualNeural';
    let rate = '+2%';
    let pitch = '+1Hz';

    const vLower = (voice || '').toLowerCase();

    if (vLower === 'podcast' || vLower === 'charlie' || vLower === 'david' || vLower.includes('brian') || vLower.includes('eric') || vLower.includes('guy')) {
      selectedVoice = 'en-US-BrianMultilingualNeural'; // Warm studio podcast host (Deep, resonant)
      rate = '+0%';
      pitch = '-1Hz';
    } else if (vLower === 'enthusiastic' || vLower === 'bella' || vLower === 'sarah' || vLower.includes('emma')) {
      selectedVoice = 'en-US-EmmaMultilingualNeural'; // Fast, viral storytelling (High emotion)
      rate = '+5%';
      pitch = '+3Hz';
    } else if (vLower === 'female' || vLower === 'rachel' || vLower === 'alex' || vLower.includes('jenny') || vLower.includes('ava')) {
      selectedVoice = 'en-US-AvaMultilingualNeural'; // Conversational female creator (High energy, bright)
      rate = '+3%';
      pitch = '+2Hz';
    } else {
      selectedVoice = 'en-US-AndrewMultilingualNeural'; // Conversational male founder (Dynamic, engaging)
      rate = '+3%';
      pitch = '+1Hz';
    }

    const tempFile = path.join(os.tmpdir(), `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);
    
    try {
      // Apply conversational human inflection and energetic tempo
      const tts = new EdgeTTS({ voice: selectedVoice, rate, pitch });
      await tts.ttsPromise(spokenText, tempFile);
      const audioData = await fs.readFile(tempFile);
      await fs.unlink(tempFile).catch(() => {});

      const base64Audio = audioData.toString('base64');

      return NextResponse.json({
        success: true,
        provider: 'edge_neural',
        voice: selectedVoice,
        spokenText,
        audioUrl: `data:audio/mp3;base64,${base64Audio}`,
      });
    } catch (ttsErr: any) {
      console.warn('EdgeTTS synthesis error, client will use instant native voice:', ttsErr?.message || ttsErr);
      await fs.unlink(tempFile).catch(() => {});
      return NextResponse.json({
        success: false,
        fallback: true,
        spokenText,
        message: 'EdgeTTS unavailable, using client instant speech'
      });
    }
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    return NextResponse.json(
      { error: error.message || 'TTS Error', fallback: true },
      { status: 200 }
    );
  }
}
