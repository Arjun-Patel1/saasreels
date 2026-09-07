import { AIPersona, BrandInfo, VideoStyleConfig } from '@/types';

export interface HumanVoicePreset {
  id: string;
  name: string;
  shortName: string;
  gender: 'male' | 'female';
  icon: string;
  tag: string;
  vibe: string;
  sampleText: string;
  avatarId: string;
}

export const HUMAN_VOICE_PRESETS: HumanVoicePreset[] = [
  {
    id: 'en-US-AndrewMultilingualNeural',
    name: 'Adam (Tech Founder)',
    shortName: 'Adam',
    gender: 'male',
    icon: '👨',
    tag: 'Founder Tone',
    vibe: 'Deep, Casual & Conversational (ElevenLabs style)',
    sampleText: 'Hey founders, if you are still manually editing reels, you are wasting 20 hours a week. Check this out.',
    avatarId: 'marcus-growth',
  },
  {
    id: 'en-US-BrianMultilingualNeural',
    name: 'Charlie (Podcast Host)',
    shortName: 'Charlie',
    gender: 'male',
    icon: '🎙️',
    tag: 'Studio Host',
    vibe: 'Deep Resonant Studio Voice (Diary of a CEO style)',
    sampleText: 'What is the one secret software tool every top 1% founder is quietly gatekeeping right now?',
    avatarId: 'david-skeptic',
  },
  {
    id: 'en-US-AvaMultilingualNeural',
    name: 'Rachel (Authentic Creator)',
    shortName: 'Rachel',
    gender: 'female',
    icon: '👩',
    tag: 'Creator FYP',
    vibe: 'Friendly, Natural & Relatable (TikTok / UGC style)',
    sampleText: 'POV: You just found the one software tool that saves your entire team 15 hours every single week.',
    avatarId: 'alex-tech',
  },
  {
    id: 'en-US-EmmaMultilingualNeural',
    name: 'Bella (Fast Storyteller)',
    shortName: 'Bella',
    gender: 'female',
    icon: '✨',
    tag: 'Viral Energy',
    vibe: 'Energetic, High-Paced & Engaging (Viral FYP style)',
    sampleText: 'Why is nobody talking about this insane software hack?! Look at this live demo.',
    avatarId: 'sarah-dev',
  },
];

export const DEFAULT_STYLE_CONFIG: VideoStyleConfig = {
  captionColor: '#facc15', // Crisp solid yellow
  captionFont: 'impact',
  captionPosition: 'center',
  captionGlowIntensity: 'subtle', // Subtle clean contrast, NO blurry excessive glow
  captionStyle: 'hormozi',
  showAvatar: true,
  avatarPosition: 'top-split',
  showProductMockup: true,
  templateFormat: 'split_screen_demo',
  speechRate: 1.08,
  voiceGender: 'male',
  voiceId: 'en-US-AndrewMultilingualNeural',
  backgroundVibe: 'creator_desk',
};

export const AI_PERSONAS: AIPersona[] = [
  {
    id: 'alex-tech',
    name: 'Alex Vance',
    role: 'Tech Solopreneur',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    gender: 'female',
    tone: 'Energetic & Direct',
    badge: '🔥 89k Viral Avg'
  },
  {
    id: 'marcus-growth',
    name: 'Marcus Reed',
    role: 'SaaS Growth Hacker',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    gender: 'male',
    tone: 'Confident & Analytical',
    badge: '⚡ Top Converting'
  },
  {
    id: 'sarah-dev',
    name: 'Sarah Chen',
    role: 'Indie Builder',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    gender: 'female',
    tone: 'Curious & Mindblown',
    badge: '✨ High Retention'
  },
  {
    id: 'david-skeptic',
    name: 'David Miller',
    role: 'Product Reviewer',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    gender: 'male',
    tone: 'Skeptical to Converted',
    badge: '🎯 4.8x Hook Rate'
  }
];

export const PRESET_BRANDS: BrandInfo[] = [
  {
    url: 'https://saasreels.ai',
    name: 'SaaSReels',
    tagline: 'AI Short-Form Video Studio for Software & Tech',
    description: 'Turn your product URL into viral TikToks, Instagram Reels, and YouTube Shorts on autopilot.',
    features: [
      'URL-to-Viral-Reel in 30 seconds',
      'Blitz Mode swipe-to-publish queue',
      'AI UGC Avatars & Screen demo mashup',
      'Auto-publishing to TikTok, Reels, Shorts',
      'Full conversion & UTM attribution'
    ],
    painPoints: [
      'Spending 4 hours editing one TikTok',
      'Hiring expensive $2,000/mo UGC creators',
      'Zero traffic to SaaS landing page',
      'Burnout from daily manual posting'
    ],
    targetAudience: 'SaaS Founders, Indie Hackers, Solopreneurs',
    primaryColor: '#F59E0B',
    screenshotUrl: 'https://api.microlink.io/?url=https%3A%2F%2Fsaasreels.ai&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720&viewport.isMobile=false&viewport.deviceScaleFactor=2&hide=.cookie-banner,%23onetrust-consent-sdk,%23crisp-chatbox,%23intercom-container,.cookie-notice,[id*="cookie"],[class*="cookie"],[id*="consent"]',
    logoUrl: '🎬'
  },
  {
    url: 'https://supabase.com',
    name: 'Supabase',
    tagline: 'The Open Source Firebase Alternative',
    description: 'Build production-ready backends with instant Postgres database, authentication, edge functions, and real-time subscriptions.',
    features: [
      'Dedicated Postgres Database with vector support',
      'Row Level Security & turnkey Auth',
      'Real-time WebSocket subscriptions',
      'Auto-generated TypeScript APIs'
    ],
    painPoints: [
      'Firebase vendor lock-in and unexpected bills',
      'Writing boilerplate CRUD API endpoints',
      'Managing complex backend infrastructure'
    ],
    targetAudience: 'Full-stack Developers, Startups, Indie Builders',
    primaryColor: '#3ecf8e',
    screenshotUrl: 'https://api.microlink.io/?url=https%3A%2F%2Fsupabase.com&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720&viewport.isMobile=false&viewport.deviceScaleFactor=2&hide=.cookie-banner,%23onetrust-consent-sdk,%23crisp-chatbox,%23intercom-container,.cookie-notice,[id*="cookie"],[class*="cookie"],[id*="consent"]',
    logoUrl: '⚡'
  },
  {
    url: 'https://linear.app',
    name: 'Linear',
    tagline: 'The issue tracker you will actually love',
    description: 'Streamline software projects, sprints, tasks, and bug tracking with blazingly fast keyboard-first workflows.',
    features: [
      'Instant 50ms sync speed with offline support',
      'Keyboard-first shortcuts for everything',
      'Automated cycles and milestone tracking',
      'Built-in GitHub and Figma integrations'
    ],
    painPoints: [
      'Jira is slow, clunky, and hated by engineers',
      'Tasks getting lost in messy Slack threads',
      'Wasting time clicking through 10 dropdown menus'
    ],
    targetAudience: 'Product Teams, Software Engineers, Modern Startups',
    primaryColor: '#5e6ad2',
    screenshotUrl: 'https://api.microlink.io/?url=https%3A%2F%2Flinear.app&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720&viewport.isMobile=false&viewport.deviceScaleFactor=2&hide=.cookie-banner,%23onetrust-consent-sdk,%23crisp-chatbox,%23intercom-container,.cookie-notice,[id*="cookie"],[class*="cookie"],[id*="consent"]',
    logoUrl: '📐'
  }
];
