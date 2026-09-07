export type HookAngle = 
  | 'problem_agitate_solve'
  | 'the_villain'
  | 'agency_roast'
  | 'pov_cheat_code'
  | 'secret_discovery'
  | 'contrarian_reality'
  | 'one_click_speedrun'
  | 'founder_confession'
  | 'competitor_roast'
  | 'founder_journey'
  | 'podcast_interview'
  | 'tweet_controversy'
  | 'split_screen_gameplay';

export type VideoTemplateFormat = 
  | 'split_screen_demo'        // Top: UGC/Facecam, Bottom: SaaS live mockup
  | 'podcast_hook'             // Studio mic & guest podcast setup
  | 'tweet_reveal'             // Top: Viral Tweet/Reddit hook, Bottom: SaaS solution
  | 'split_gameplay'           // Top: SaaS demo, Bottom: High-retention Subway/Minecraft loop
  | 'apple_notes_confession'   // Realistic Apple Notes typing animation
  | 'full_screen_zoom';        // Dynamic zoom & pan on UI feature

export interface ScriptWord {
  word: string;
  start: number; // in seconds
  end: number;
  highlight?: boolean;
  emoji?: string;
}

export interface ScriptSegment {
  id: string;
  text: string;
  type: 'hook' | 'problem' | 'solution' | 'demo' | 'cta';
  duration: number; // in seconds
  words: ScriptWord[];
}

export interface VideoScript {
  id: string;
  angle: HookAngle;
  angleTitle: string;
  templateFormat: VideoTemplateFormat;
  viralScore: number; // 0-100
  hookHeadline: string;
  targetEmotion: 'urgent' | 'excited' | 'skeptical' | 'secret' | 'mindblown';
  fullText: string;
  segments: ScriptSegment[];
  suggestedHashtags: string[];
  callToAction: string;
  backgroundVideoUrl?: string;
  soundEffect?: string;
}

export interface TrendingReelTemplate {
  id: string;
  title: string;
  format: VideoTemplateFormat;
  badge: string;
  viewsMetric: string;
  soundtrack: string;
  previewThumbnail: string;
  description: string;
  exampleHook: string;
}

export interface BrandInfo {
  url: string;
  name: string;
  tagline: string;
  description: string;
  industry?: 'saas' | 'ecommerce' | 'mobile_app' | 'course' | 'local_business';
  features: string[];
  painPoints: string[];
  targetAudience: string;
  primaryColor: string;
  screenshotUrl: string;
  logoUrl?: string;
  promoCode?: string;
  discountText?: string;
  starRating?: number;
  reviewCount?: string;
}

export interface AIPersona {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  videoBgUrl?: string;
  gender: 'male' | 'female';
  tone: string;
  badge: string;
}

export interface QueuedPost {
  id: string;
  title: string;
  brand: BrandInfo;
  script: VideoScript;
  persona: AIPersona;
  platforms: ('tiktok' | 'instagram' | 'youtube')[];
  status: 'queued' | 'rendering' | 'ready' | 'published';
  scheduledTime: string;
  createdAt: string;
  videoUrl?: string;
}

export interface VideoStyleConfig {
  captionColor: string; // active highlight color e.g. #facc15
  captionFont: 'impact' | 'sans' | 'mono';
  captionPosition: 'center' | 'bottom' | 'top';
  captionGlowIntensity: 'none' | 'subtle'; // Crisp, non-blurry highlight
  captionStyle: 'hormozi' | 'beast_bold' | 'minimal_clean' | 'karaoke';
  showAvatar: boolean;
  avatarPosition: 'top-split' | 'circle-overlay' | 'full';
  showProductMockup: boolean;
  templateFormat: VideoTemplateFormat;
  speechRate: number;
  voiceGender: 'male' | 'female';
  voiceId?: string;
  backgroundVibe: 'creator_desk' | 'podcast_studio' | 'minecraft_satisfying' | 'dark_cyber';
  bgmTrack?: 'upbeat_tech' | 'lofi_chill' | 'phonk_drill' | 'none';
  bgmVolume?: number; // 0 to 1
  enableSfx?: boolean;
  promoCode?: string;
  discountText?: string;
}
