import * as cheerio from 'cheerio';
import { BrandInfo } from '@/types';
import { PRESET_BRANDS } from '../mockData';
import { cyberShield } from './cyberShield';

export async function scrapeWebsite(url: string): Promise<BrandInfo> {
  const urlValidation = cyberShield.validateUrl(url);
  let targetUrl = urlValidation.isValid && urlValidation.sanitizedUrl ? urlValidation.sanitizedUrl : url.trim();

  let hostname = '';
  try {
    const parsed = new URL(targetUrl);
    hostname = parsed.hostname.replace(/^www\./, '');
  } catch {
    hostname = targetUrl.replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'app.com';
  }

  // Detect industry from URL or domain
  const isEcom = /shopify|amazon|store|shop|etsy|product|buy|cart/i.test(targetUrl);
  const isApp = /apps\.apple\.com|play\.google\.com|app/i.test(targetUrl);
  const isCourse = /course|learn|academy|bootcamp|school/i.test(targetUrl);
  const industry = isEcom ? 'ecommerce' : isApp ? 'mobile_app' : isCourse ? 'course' : 'saas';

  // Check preset first if available
  const preset = PRESET_BRANDS.find(
    (b) => b.url.toLowerCase().includes(hostname.toLowerCase()) || hostname.toLowerCase().includes(b.name.toLowerCase())
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SaaSReelsBot/2.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();

      // Check if page contains browser error pages, parking pages, or DNS failure markers
      const isErrorPage = /DNS_PROBE|ERR_NAME_NOT_RESOLVED|site can't be reached|This domain is for sale|Domain Has Expired|502 Bad Gateway|503 Service Unavailable/i.test(html);
      if (isErrorPage) {
        throw new Error('Target domain returned DNS or error page');
      }

      const $ = cheerio.load(html);

      const rawTitle =
        $('meta[property="og:title"]').attr('content') ||
        $('title').text().trim() ||
        hostname.split('.')[0];
      const title = cyberShield.sanitizeScrapedText(rawTitle, 100);

      const rawDescription =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        $('p').first().text().trim() ||
        'The game-changing solution built for instant results.';
      const description = cyberShield.sanitizeScrapedText(rawDescription, 250);

      const ogImage = $('meta[property="og:image"]').attr('content');

      // Extract headings as features with strict sanitization
      const headings: string[] = [];
      $('h1, h2, h3').each((_, el) => {
        const text = cyberShield.sanitizeScrapedText($(el).text(), 90);
        if (text.length > 10 && text.length < 90 && !headings.includes(text)) {
          headings.push(text);
        }
      });

      const rawName =
        $('meta[property="og:site_name"]').attr('content') ||
        title.split(/[-|:–]/)[0].trim() ||
        hostname.split('.')[0];

      const cleanName = cyberShield.sanitizeScrapedText(rawName, 50);
      const brandName = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : 'SaaS App';

      const features =
        headings.length >= 3
          ? headings.slice(0, 4)
          : isEcom
          ? ['Premium quality & 100% satisfaction guarantee', 'Free express 2-day shipping worldwide', 'Over 10,000+ happy 5-star customers', '30-day money-back guarantee']
          : isApp
          ? ['Available on iOS & Android in 1 click', '4.9 Star Rating with 50,000+ downloads', 'Zero ads & instant offline support', 'Smart AI automated features']
          : [
              `Automated ${brandName} 1-click engine`,
              '10x faster real-time workflow & AI automation',
              'Turnkey templates with zero manual editing',
              'Built-in analytics dashboard with instant setup',
            ];

      const painPoints = isEcom
        ? [
            'Wasting money on cheap low-quality knockoffs that break in 2 weeks',
            'Overpaying for branded products with zero warranty',
            'Waiting weeks for slow international shipping',
          ]
        : isApp
        ? [
            'Clunky outdated mobile apps full of annoying subscription paywalls',
            'Spending 3 hours doing simple tasks on your phone',
            'Losing data due to zero automatic sync',
          ]
        : [
            `Wasting 10+ hours every single week doing manual work instead of using ${brandName}`,
            'Paying $2,000/month for expensive agencies or multiple fragmented tools',
            'Burning out before getting any real traction or sales',
          ];

      // Live High-Res Hero Viewport Screenshot (Above-the-fold 1280x720, 2x scale, cookie banners hidden)
      const hideSelectors = encodeURIComponent(
        '.cookie-banner,#onetrust-consent-sdk,#crisp-chatbox,#intercom-container,.cookie-notice,[id*="cookie"],[class*="cookie"],[id*="consent"],[id*="popup"],[class*="popup"]'
      );
      const liveScreenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(
        targetUrl
      )}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720&viewport.isMobile=false&viewport.deviceScaleFactor=2&hide=${hideSelectors}`;

      // Test live screenshot availability with a strict 4-second timeout
      let validScreenshotUrl = ogImage && ogImage.startsWith('http') && !/error|dns_probe/i.test(ogImage) ? ogImage : '';
      try {
        const liveController = new AbortController();
        const liveTimeout = setTimeout(() => liveController.abort(), 4000);
        const liveCheck = await fetch(liveScreenshotUrl, {
          method: 'HEAD',
          signal: liveController.signal,
        });
        clearTimeout(liveTimeout);
        if (liveCheck.ok) {
          validScreenshotUrl = liveScreenshotUrl;
        }
      } catch {
        // Fallback to og:image if live capture times out or is blocked
        if (!validScreenshotUrl && ogImage && ogImage.startsWith('http') && !/error|dns_probe/i.test(ogImage)) {
          validScreenshotUrl = ogImage;
        }
      }

      // If screenshot is still empty or failed, use clean preset mockups
      const defaultCleanMockup = PRESET_BRANDS[1]?.screenshotUrl || PRESET_BRANDS[2]?.screenshotUrl || '';
      const screenshotUrl =
        validScreenshotUrl ||
        preset?.screenshotUrl ||
        defaultCleanMockup ||
        liveScreenshotUrl;

      return {
        url: targetUrl,
        name: brandName,
        industry,
        tagline: description.slice(0, 100) + (description.length > 100 ? '...' : ''),
        description: description,
        features: features,
        painPoints: painPoints,
        targetAudience: isEcom ? 'Shoppers, Ecom Buyers, Trend Setters' : isApp ? 'Mobile Users, Creators, Busy Professionals' : 'Founders, Creators, Growth Teams',
        primaryColor: preset?.primaryColor || (isEcom ? '#ec4899' : '#facc15'),
        screenshotUrl,
        logoUrl: preset?.logoUrl || (isEcom ? '🛍️' : isApp ? '📱' : '⚡'),
        promoCode: 'VIRAL50',
        discountText: 'Get 50% Off Today',
        starRating: 4.9,
        reviewCount: '2.4k+ reviews',
      };
    }
  } catch (err) {
    console.warn(`Scrape failed for ${targetUrl}, using intelligent fallback:`, err);
  }

  // Fallback to preset or clean smart inference (using default Supabase / Linear preset mockup)
  if (preset) return { ...preset, url: targetUrl };

  const rawName = hostname.split('.')[0] || 'Product';
  const brandName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const cleanPresetMockup = PRESET_BRANDS[1]?.screenshotUrl || PRESET_BRANDS[2]?.screenshotUrl || PRESET_BRANDS[0]?.screenshotUrl;

  return {
    url: targetUrl,
    name: brandName,
    industry,
    tagline: `The #1 Breakthrough Platform for ${brandName}`,
    description: `Supercharge your workflow and save 15+ hours every week with ${brandName}'s automated tools.`,
    features: [
      `Automated ${brandName} 1-click engine`,
      'Instant real-time sync & collaboration',
      'One-click smart exports & templates',
      'Zero-code intuitive dashboard',
    ],
    painPoints: [
      'Wasting 4+ hours daily on repetitive manual tasks',
      'Paying $2,000/month for multiple fragmented apps',
      'Complex setups that take weeks to configure',
    ],
    targetAudience: 'Creators, Founders, Modern Teams',
    primaryColor: '#facc15',
    screenshotUrl: cleanPresetMockup,
    logoUrl: '⚡',
    promoCode: 'FAST50',
    discountText: '50% Off Limited Time',
    starRating: 4.9,
    reviewCount: '1.8k+ reviews',
  };
}
