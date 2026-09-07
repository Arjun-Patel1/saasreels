import { BrandInfo } from '@/types';
import { PRESET_BRANDS } from './mockData';

export function extractBrandFromUrl(inputUrl: string): BrandInfo {
  let cleaned = inputUrl.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  let hostname = '';
  try {
    const urlObj = new URL(cleaned);
    hostname = urlObj.hostname.replace('www.', '');
  } catch {
    hostname = cleaned.replace(/https?:\/\//, '').replace('www.', '').split('/')[0] || 'mysaas.com';
  }

  // Check if we have an exact match in presets
  const foundPreset = PRESET_BRANDS.find(
    (b) => b.url.toLowerCase().includes(hostname.toLowerCase()) || hostname.toLowerCase().includes(b.name.toLowerCase())
  );
  if (foundPreset) {
    return { ...foundPreset, url: cleaned };
  }

  // Generate intelligent brand inference
  const rawName = hostname.split('.')[0] || 'App';
  const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Palette generator based on brand name
  const palettes = ['#facc15', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];
  const colorIndex = Math.abs(capitalizedName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % palettes.length;
  const primaryColor = palettes[colorIndex];

  return {
    url: cleaned,
    name: capitalizedName,
    tagline: `The All-In-One AI Platform for ${capitalizedName}`,
    description: `Supercharge your workflow and save 15+ hours every week with ${capitalizedName}'s automated tools.`,
    features: [
      `Automated ${capitalizedName} workflow engine`,
      'Instant real-time sync and collaboration',
      'One-click smart exports and templates',
      'Zero-code intuitive dashboard'
    ],
    painPoints: [
      'Wasting 4+ hours daily on repetitive manual tasks',
      'Paying \$500/month for 5 different fragmented apps',
      'Complex setups that take weeks to configure'
    ],
    targetAudience: 'Creators, Founders, Modern Teams',
    primaryColor,
    screenshotUrl: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80`,
    logoUrl: '⚡'
  };
}
