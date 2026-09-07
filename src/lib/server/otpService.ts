import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface OtpRecord {
  identifier: string; // email or phone
  type: 'email' | 'phone';
  code: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const OTP_FILE = path.join(DATA_DIR, 'otps.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(OTP_FILE)) {
    fs.writeFileSync(OTP_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readOtps(): OtpRecord[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(OTP_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeOtps(records: OtpRecord[]) {
  ensureDataDir();
  // Filter out records older than 1 hour to keep storage clean
  const fresh = records.filter((r) => Date.now() - new Date(r.createdAt).getTime() < 60 * 60 * 1000);
  fs.writeFileSync(OTP_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
}

export const otpService = {
  generateOtp(identifier: string, type: 'email' | 'phone'): { code: string; expiresAt: number; message: string } {
    const cleanId = identifier.trim().toLowerCase();
    const otps = readOtps();

    // Check rate limit: max 3 active OTPs in last 5 minutes
    const recent = otps.filter(
      (r) => r.identifier === cleanId && Date.now() - new Date(r.createdAt).getTime() < 5 * 60 * 1000
    );

    if (recent.length >= 4) {
      throw new Error('Too many verification code requests. Please wait a few minutes.');
    }

    // Generate cryptographically secure 6-digit code
    const code = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newRecord: OtpRecord = {
      identifier: cleanId,
      type,
      code,
      expiresAt,
      attempts: 0,
      verified: false,
      createdAt: new Date().toISOString(),
    };

    // Remove old unused codes for this identifier
    const filtered = otps.filter((r) => r.identifier !== cleanId || r.verified);
    filtered.push(newRecord);
    writeOtps(filtered);

    const message =
      type === 'email'
        ? `Verification code ${code} sent to ${cleanId}. Valid for 10 minutes.`
        : `SMS verification code ${code} dispatched to ${cleanId}. Valid for 10 minutes.`;

    return { code, expiresAt, message };
  },

  verifyOtp(identifier: string, inputCode: string): { success: boolean; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanCode = inputCode.trim();
    const otps = readOtps();

    const record = otps.find((r) => r.identifier === cleanId && !r.verified);

    if (!record) {
      return { success: false, error: 'No active verification code found for this contact. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    if (record.attempts >= 5) {
      return { success: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
    }

    record.attempts += 1;

    if (record.code !== cleanCode) {
      writeOtps(otps);
      return { success: false, error: `Invalid code. ${5 - record.attempts} attempts remaining.` };
    }

    // Mark verified
    record.verified = true;
    writeOtps(otps);

    return { success: true };
  },
};
