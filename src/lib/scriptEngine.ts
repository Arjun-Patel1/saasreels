import { BrandInfo, HookAngle, ScriptSegment, ScriptWord, VideoScript, VideoTemplateFormat } from '@/types';

function buildTimedWords(text: string, startTime: number, wordsPerSec = 2.8): { words: ScriptWord[]; duration: number } {
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
    tool: '🛠️',
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

export function generateAllScripts(brand: BrandInfo): VideoScript[] {
  const pain = brand.painPoints[0] || 'spending hours doing manual work';
  const pain2 = brand.painPoints[1] || 'wasting thousands of dollars';
  const feat = brand.features[0] || 'turn raw inputs into magic in seconds';
  const feat2 = brand.features[1] || 'automate your entire workflow';
  const name = brand.name;
  const target = brand.targetAudience;

  const scripts: VideoScript[] = [
    // 1. The Villain / Agency Roast (High CTR & Comments | 46 words)
    createScript({
      id: `script-${brand.name.toLowerCase()}-agency-roast`,
      angle: 'agency_roast',
      templateFormat: 'tweet_reveal',
      angleTitle: '🥊 The Villain / Agency Roast (High CTR)',
      viralScore: 96,
      targetEmotion: 'urgent',
      hookHeadline: `Stop paying $2,000 a month to slow video agencies right now!`,
      rawSegments: [
        {
          type: 'hook',
          text: `Stop paying $2,000 a month to slow video agencies right now!`
        },
        {
          type: 'problem',
          text: `Most founders waste ten hours every single week waiting on expensive freelancers.`
        },
        {
          type: 'solution',
          text: `Here is the secret: ${name} transforms your landing page into viral ads in seconds.`
        },
        {
          type: 'demo',
          text: `Just paste your URL and launch.`
        },
        {
          type: 'cta',
          text: `Tap the link in bio to test it free!`
        }
      ],
      callToAction: `Try ${name} 100% free → link in bio`,
      suggestedHashtags: [`#${name.toLowerCase()}`, '#saas', '#productivityhack', '#buildinpublic', '#techtools', '#entrepreneurship']
    }),

    // 2. The Cheat Code / Gatekept Secret (High Save Rate | 47 words)
    createScript({
      id: `script-${brand.name.toLowerCase()}-cheat-code`,
      angle: 'pov_cheat_code',
      templateFormat: 'podcast_hook',
      angleTitle: '🤫 The Cheat Code / Gatekept Secret (High Saves)',
      viralScore: 98,
      targetEmotion: 'mindblown',
      hookHeadline: `POV: You unlocked the software tool top solo founders gatekeep`,
      rawSegments: [
        {
          type: 'hook',
          text: `POV: You unlocked the software tool top solo founders gatekeep in 2026.`
        },
        {
          type: 'problem',
          text: `While competitors spend thousands on video production, smart creators use artificial intelligence.`
        },
        {
          type: 'solution',
          text: `It is called ${name}. One click turns your link into high-converting video ads.`
        },
        {
          type: 'demo',
          text: `AI syncs everything on autopilot.`
        },
        {
          type: 'cta',
          text: `Save this video and tap the bio link to test ${name} free!`
        }
      ],
      callToAction: `Claim early access to ${name}`,
      suggestedHashtags: [`#${name.toLowerCase()}`, '#cheatcode', '#saasgrowth', '#aitools', '#indiehackers', '#founders']
    }),

    // 3. The Contrarian Reality Check (Pattern Interrupt | 45 words)
    createScript({
      id: `script-${brand.name.toLowerCase()}-contrarian`,
      angle: 'contrarian_reality',
      templateFormat: 'split_gameplay',
      angleTitle: '⚡ The Contrarian Reality Check (Pattern Interrupt)',
      viralScore: 93,
      targetEmotion: 'skeptical',
      hookHeadline: `Harsh truth: Nobody cares about features if marketing is boring`,
      rawSegments: [
        {
          type: 'hook',
          text: `Harsh truth: Nobody cares about your software if your marketing looks boring.`
        },
        {
          type: 'problem',
          text: `Burning hours on manual video editing is killing your organic reach and growth.`
        },
        {
          type: 'solution',
          text: `Switch to ${name}. It instantly produces viral product demos on complete autopilot.`
        },
        {
          type: 'demo',
          text: `No camera or experience needed.`
        },
        {
          type: 'cta',
          text: `Tap the link in bio to claim your free access today!`
        }
      ],
      callToAction: `Try ${name} completely free → link in bio`,
      suggestedHashtags: [`#${name.toLowerCase()}`, '#startuptools', '#marketinghack', '#growthtips', '#buildsmart']
    }),

    // 4. The 1-Click Speed Run (Direct Demo | 46 words)
    createScript({
      id: `script-${brand.name.toLowerCase()}-speedrun`,
      angle: 'one_click_speedrun',
      templateFormat: 'split_screen_demo',
      angleTitle: '🏎️ The 1-Click Speed Run (Direct Demo)',
      viralScore: 95,
      targetEmotion: 'excited',
      hookHeadline: `Watch me turn a blank URL into viral videos in 30 seconds`,
      rawSegments: [
        {
          type: 'hook',
          text: `Watch me turn a blank URL into ready-to-post viral videos in thirty seconds.`
        },
        {
          type: 'problem',
          text: `Traditional video editing tools take four hours and constantly produce generic, boring results.`
        },
        {
          type: 'solution',
          text: `With ${name}, you just paste your product link and hit generate.`
        },
        {
          type: 'demo',
          text: `Captions and screen mockups sync automatically.`
        },
        {
          type: 'cta',
          text: `Tap the link in bio to try your first video free!`
        }
      ],
      callToAction: `Get your first video free → link in bio`,
      suggestedHashtags: [`#${name.toLowerCase()}`, '#efficiency', '#automation', '#nocode', '#saaslife', '#speedrun']
    }),

    // 5. The Exhausted Founder Confession (High Relatability | 45 words)
    createScript({
      id: `script-${brand.name.toLowerCase()}-confession`,
      angle: 'founder_confession',
      templateFormat: 'split_screen_demo',
      angleTitle: '🚀 The Exhausted Founder Confession',
      viralScore: 92,
      targetEmotion: 'secret',
      hookHeadline: `I was 2 weeks away from burnout until I automated this workflow`,
      rawSegments: [
        {
          type: 'hook',
          text: `I was two weeks away from burning out until I automated this entire workflow.`
        },
        {
          type: 'problem',
          text: `Creating organic video ads manually was draining all my energy and focus.`
        },
        {
          type: 'solution',
          text: `So I built ${name} to convert any landing page into ready-to-post TikToks.`
        },
        {
          type: 'demo',
          text: `It takes thirty seconds.`
        },
        {
          type: 'cta',
          text: `Tap the link in bio to test ${name} completely free today!`
        }
      ],
      callToAction: `Try ${name} 100% free → link in bio`,
      suggestedHashtags: [`#${name.toLowerCase()}`, '#buildinpublic', '#indiedev', '#startupfounder', '#solopreneur', '#coding']
    })
  ];

  return scripts;
}

function createScript(params: {
  id: string;
  angle: HookAngle;
  templateFormat: VideoTemplateFormat;
  angleTitle: string;
  viralScore: number;
  targetEmotion: 'urgent' | 'excited' | 'skeptical' | 'secret' | 'mindblown';
  hookHeadline: string;
  rawSegments: { type: 'hook' | 'problem' | 'solution' | 'demo' | 'cta'; text: string }[];
  callToAction: string;
  suggestedHashtags: string[];
}): VideoScript {
  let currentTime = 0;
  const segments: ScriptSegment[] = [];
  const fullTextParts: string[] = [];

  params.rawSegments.forEach((seg, idx) => {
    const { words, duration } = buildTimedWords(seg.text, currentTime);
    segments.push({
      id: `seg-${idx}`,
      type: seg.type,
      text: seg.text,
      duration,
      words,
    });
    fullTextParts.push(seg.text);
    currentTime += duration;
  });

  return {
    id: params.id,
    angle: params.angle,
    templateFormat: params.templateFormat,
    angleTitle: params.angleTitle,
    viralScore: params.viralScore,
    hookHeadline: params.hookHeadline,
    targetEmotion: params.targetEmotion,
    fullText: fullTextParts.join(' '),
    segments,
    suggestedHashtags: params.suggestedHashtags,
    callToAction: params.callToAction,
  };
}
