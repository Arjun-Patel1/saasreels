import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '@/lib/server/scraperService';
import { cyberShield } from '@/lib/server/cyberShield';
import { searchTelemetryDb } from '@/lib/server/searchTelemetryDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anon_client';
    const rateCheck = cyberShield.checkRateLimit(`extract_${ip}`, 25, 60);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before analyzing more URLs.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { url } = body;

    // Cyber SSRF & Malicious URL Validation
    const validation = cyberShield.validateUrl(url);
    if (!validation.isValid || !validation.sanitizedUrl) {
      return NextResponse.json(
        { error: validation.error || 'Invalid or prohibited URL address.' },
        { status: 400 }
      );
    }

    const brandInfo = await scrapeWebsite(validation.sanitizedUrl);

    // Automatically store and categorize query in SQL search telemetry for future AI improvement
    try {
      searchTelemetryDb.logSearchInsight({
        queryOrUrl: url,
        brandName: brandInfo.name,
        description: brandInfo.description,
        features: brandInfo.features,
      });
    } catch (e) {
      console.warn('Telemetry log error:', e);
    }

    return NextResponse.json({ success: true, brand: brandInfo });
  } catch (error: any) {
    console.error('Error in /api/extract:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract website information' },
      { status: 500 }
    );
  }
}
