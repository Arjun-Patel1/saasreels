import { BrandInfo, HookAngle, ScriptSegment, ScriptWord, VideoScript, VideoTemplateFormat } from '@/types';
import { generateAllScripts as generateFallbackScripts } from '../scriptEngine';
import { quotaAlertService } from './quotaAlertService';
import { groqKeyPool } from './groqKeyPool';

export interface LLMConfig {
  provider: 'groq' | 'openai' | 'gemini' | 'anthropic' | 'builtin';
  apiKey?: string;
  model?: string;
}

export async function generateScriptsWithLLM(
  brand: BrandInfo,
  customConfig?: Partial<LLMConfig>
): Promise<VideoScript[]> {
  const provider = customConfig?.provider || (process.env.LLM_PROVIDER as any) || 'groq';

  if (provider === 'groq' || provider === 'openai') {
    const isGroq = provider === 'groq';
    const endpoint = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const model =
      customConfig?.model ||
      process.env.LLM_MODEL ||
      (isGroq ? 'openai/gpt-oss-120b' : 'gpt-4o-mini');

    const systemPrompt = `You are the world's top direct-response short-form video copywriter for high-growth SaaS, indie founders, and tech products.

Your mission: Transform the provided product profile into 5 battle-tested, high-retention 15-second video scripts engineered for TikTok, Instagram Reels, and YouTube Shorts.

Rules for Every Script:
1. WORD COUNT: Strictly between 42 and 48 words (~14-16 seconds at 1.08x speech rate). Every script MUST contain 42 to 48 words total. Never fewer than 42 words, and never exceed 48 words.
2. GRAMMAR & FLUENCY: Never concatenate scraped taglines verbatim. Synthesize value propositions into complete, grammatically flawless sentences. Never repeat comparative prepositions like "instead of".
3. PACING (4-Part Direct Response Structure):
   - Hook (0-3s | 9-11 words): Violent pattern interrupt or contrarian truth.
   - Agitation (3-7s | 12-15 words): Vivid description of the tedious/expensive manual reality.
   - Solution (7-12s | 13-15 words): The exact mechanism of how the software solves it in seconds.
   - CTA (12-15s | 6-8 words): Clear, low-friction command to tap link in bio.
4. TONE: Punchy, authentic, tech-savvy, no marketing fluff or corporate jargon.
5. BANNED PHRASES: "In today's fast-paced world", "Look no further", "Game changer", "Revolutionize", "Streamline", "Hey everyone", "Are you tired of", "In this video", "Instead of instead of".
6. 5 DISTINCT VIRAL ANGLES:
   - Angle 1: "The Villain / Agency Roast" (Exposes $2,000/mo agencies or burning 20 hours editing)
   - Angle 2: "The Cheat Code / Gatekept Secret" (Unfair advantage elite solo founders gatekeep)
   - Angle 3: "The Contrarian Reality Check" (Pattern interrupt: why nobody cares about features if marketing is boring)
   - Angle 4: "The 1-Click Speed Run" (Direct demo: turning a URL into 30 videos in 30 seconds)
   - Angle 5: "The Exhausted Founder Confession" (Was 2 weeks away from burnout until automating this workflow)

Return ONLY a valid JSON object matching this exact schema:
{
  "scripts": [
    {
      "id": "angle-1",
      "angleName": "The Villain / Agency Roast",
      "angle": "agency_roast",
      "templateFormat": "tweet_reveal",
      "hook": "Stop paying $2,000 a month to slow video agencies right now!",
      "fullScript": "Stop paying $2,000 a month to slow video agencies right now! Most founders waste ten hours weekly waiting on expensive freelancers. Here is the secret: SaaSReels turns any landing page into viral ads in seconds. Just paste your URL and launch. Tap the bio link to test it free!",
      "ctaText": "Tap link in bio to try 100% free",
      "viralScore": 96,
      "estimatedDurationSec": 15
    }
  ]
}`;

    const primaryPain = brand.painPoints?.[0] || 'spending 4 hours manually editing short-form videos';
    const secondaryPain = brand.painPoints?.[1] || 'hiring expensive $2,000/mo UGC agencies';
    const primaryFeature = brand.features?.[0] || (brand as any).keyFeatures?.[0] || 'turning any URL into 30 viral video ads in 30 seconds';
    const secondaryFeature = brand.features?.[1] || (brand as any).keyFeatures?.[1] || 'automated AI voiceover with live screen mockup sync';

    const userPrompt = `Input Product Profile:
- Brand Name: ${brand.name}
- Headline / Pitch: ${brand.tagline || brand.description}
- Primary Pain Point: ${primaryPain}
- Secondary Pain Point: ${secondaryPain}
- Killer Feature / Magic Mechanism: ${primaryFeature}
- Secondary Feature: ${secondaryFeature}
- Target Persona: ${brand.targetAudience || 'Founders, Creators, & Marketers'}
- Target URL: ${brand.url || 'https://saasreels.ai'}

Generate exactly 5 distinct viral scripts for these 5 angles:
1. "agency_roast" (The Villain / Agency Roast | format: tweet_reveal)
2. "pov_cheat_code" (The Cheat Code / Gatekept Secret | format: podcast_hook)
3. "contrarian_reality" (The Contrarian Reality Check | format: split_gameplay)
4. "one_click_speedrun" (The 1-Click Speed Run | format: split_screen_demo)
5. "founder_confession" (The Exhausted Founder Confession | format: split_screen_demo)

Strictly adhere to the 42-48 word limit per script and return valid JSON.`;

    // Retrieve candidate keys (supports single, comma-separated, and multi-key fallback pool)
    const candidateKeys = isGroq
      ? groqKeyPool.getAvailableKeys(customConfig?.apiKey)
      : [customConfig?.apiKey || process.env.OPENAI_API_KEY || ''];

    for (const apiKey of candidateKeys) {
      if (!apiKey || apiKey.trim().length < 5) continue;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 3000,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            if (parsed.scripts && Array.isArray(parsed.scripts) && parsed.scripts.length > 0) {
              if (isGroq) groqKeyPool.recordSuccess(apiKey);
              return formatLLMScripts(parsed.scripts, brand);
            }
          }
        } else {
          const errText = await response.text();
          console.warn(`LLM key attempt failed (status ${response.status}): ${errText.slice(0, 100)}`);
          if (isGroq) groqKeyPool.recordFailure(apiKey, response.status, errText);
          // Continues to next key in pool!
        }
      } catch (err: any) {
        console.warn(`LLM key connection error: ${err.message}`);
        if (isGroq) groqKeyPool.recordFailure(apiKey, 500, err.message);
      }
    }

    // All keys in the pool were exhausted or rate limited -> dispatch Discord webhook & switch to fallback
    await quotaAlertService.recordQuotaAlert({
      provider,
      model,
      statusCode: 429,
      errorMessage: `All keys in ${provider.toUpperCase()} pool exhausted or rate-limited. Successfully switched to Built-in Zero-Cost Local Engine.`,
      targetBrand: brand.name,
    });
  }

  return generateFallbackScripts(brand);
}

function formatLLMScripts(rawScripts: any[], brand: BrandInfo): VideoScript[] {
  return rawScripts.map((raw, idx) => {
    const angle: HookAngle = raw.angle || (idx === 0 ? 'agency_roast' : idx === 1 ? 'pov_cheat_code' : idx === 2 ? 'contrarian_reality' : idx === 3 ? 'one_click_speedrun' : 'founder_confession');
    const templateFormat: VideoTemplateFormat = raw.templateFormat || getTemplateFormatForAngle(angle);
    const text: string = (raw.fullScript || raw.fullText || '').trim();
    const timedWords = buildTimedWords(text, 0);

    const segments: ScriptSegment[] = [
      {
        id: `seg-0`,
        type: 'hook',
        text: text,
        duration: timedWords.duration,
        words: timedWords.words,
      },
    ];

    return {
      id: `script-${brand.name.toLowerCase()}-${angle}-${idx}`,
      angle,
      templateFormat,
      angleTitle: raw.angleName || raw.angleTitle || getAngleTitle(angle),
      viralScore: Number(raw.viralScore) || (90 + (idx % 8)),
      targetEmotion: raw.targetEmotion || (idx === 0 ? 'urgent' : idx === 1 ? 'mindblown' : idx === 2 ? 'skeptical' : idx === 3 ? 'excited' : 'secret'),
      hookHeadline: raw.hook || raw.hookHeadline || text.split(/[.!?]/)[0] || text.slice(0, 45) + '...',
      fullText: text,
      segments,
      callToAction: raw.ctaText || raw.callToAction || `Try ${brand.name} for free → link in bio`,
      suggestedHashtags: raw.suggestedHashtags || [`#${brand.name.toLowerCase()}`, '#saas', '#techtools', '#founders', '#aitools'],
    };
  });
}

function getTemplateFormatForAngle(angle: HookAngle): VideoTemplateFormat {
  switch (angle) {
    case 'podcast_interview':
    case 'pov_cheat_code':
      return 'podcast_hook';
    case 'tweet_controversy':
    case 'competitor_roast':
    case 'agency_roast':
    case 'the_villain':
      return 'tweet_reveal';
    case 'split_screen_gameplay':
    case 'secret_discovery':
    case 'contrarian_reality':
      return 'split_gameplay';
    case 'one_click_speedrun':
    case 'founder_confession':
    default:
      return 'split_screen_demo';
  }
}

function getAngleTitle(angle: HookAngle): string {
  switch (angle) {
    case 'agency_roast':
    case 'the_villain':
      return '🥊 The Villain / Agency Roast (High CTR)';
    case 'pov_cheat_code':
      return '🤫 The Cheat Code / Gatekept Secret (High Saves)';
    case 'contrarian_reality':
    case 'secret_discovery':
      return '⚡ The Contrarian Reality Check (Pattern Interrupt)';
    case 'one_click_speedrun':
      return '🏎️ The 1-Click Speed Run (Direct Demo)';
    case 'founder_confession':
    case 'founder_journey':
      return '🚀 The Exhausted Founder Confession';
    case 'problem_agitate_solve':
      return '🛑 Problem-Agitate-Solve (High CTR)';
    default:
      return '🔥 High Converting Viral Angle';
  }
}

function buildTimedWords(text: string, startTime: number, wordsPerSec = 2.9): { words: ScriptWord[]; duration: number } {
  const rawWords = text.split(/\s+/).filter(Boolean);
  const words: ScriptWord[] = [];
  const durationPerWord = 1 / wordsPerSec;
  let currentTime = startTime;

  const highlightTriggers = [
    'stop', 'cheat', 'insane', 'secret', 'money', 'free', 'seconds', 'hours',
    'hate', 'kill', 'gamechanger', 'hack', 'steal', 'crazy', '10x', 'fast', 'broke',
    'easy', 'never', 'dont', "don't", 'worst', 'best', 'viral', 'launch'
  ];

  const emojiMap: Record<string, string> = {
    stop: '🛑',
    cheat: '🤫',
    secret: '🔐',
    hack: '⚡',
    crazy: '🤯',
    money: '💸',
    hours: '⏳',
    seconds: '⚡',
    hate: '😡',
    fire: '🔥',
    launch: '🚀',
    free: '🎁',
  };

  rawWords.forEach((word) => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isHighlight = highlightTriggers.includes(clean) || clean.length > 7;
    const emoji = emojiMap[clean];

    words.push({
      word,
      start: parseFloat(currentTime.toFixed(2)),
      end: parseFloat((currentTime + durationPerWord).toFixed(2)),
      highlight: isHighlight,
      emoji: emoji || undefined,
    });

    currentTime += durationPerWord;
  });

  return {
    words,
    duration: parseFloat((currentTime - startTime).toFixed(2)),
  };
}
