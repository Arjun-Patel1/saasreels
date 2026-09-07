import { NextRequest, NextResponse } from 'next/server';
import { generateScriptsWithLLM } from '@/lib/server/llmService';
import { BrandInfo } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand, config } = body as { brand: BrandInfo; config?: any };

    if (!brand || !brand.name) {
      return NextResponse.json({ error: 'Valid brand object is required' }, { status: 400 });
    }

    // Normalize brand arrays
    const groqHeaderKey = req.headers.get('x-groq-api-key');
    const effectiveConfig = {
      ...(config || {}),
      apiKey: groqHeaderKey || config?.apiKey || undefined,
      provider: config?.provider || 'groq',
    };

    const scripts = await generateScriptsWithLLM(brand, effectiveConfig);
    return NextResponse.json({
      success: true,
      provider: effectiveConfig?.provider || process.env.LLM_PROVIDER || 'groq',
      model: effectiveConfig?.model || process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
      scripts,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-scripts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate scripts' },
      { status: 500 }
    );
  }
}
