import { NextResponse } from 'next/server';
import { captchaService } from '@/lib/server/captcha';

export const dynamic = 'force-dynamic';

export async function GET() {
  const challenge = captchaService.generateChallenge();
  return NextResponse.json({
    success: true,
    challenge,
  });
}
