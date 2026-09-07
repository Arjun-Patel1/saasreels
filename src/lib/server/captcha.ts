import crypto from 'crypto';

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'saasreels_captcha_secret_key_2026';

export interface CaptchaChallenge {
  token: string;
  question: string;
  expiresAt: number;
}

export const captchaService = {
  generateChallenge(): CaptchaChallenge {
    const num1 = Math.floor(Math.random() * 9) + 2;
    const num2 = Math.floor(Math.random() * 8) + 1;
    const operators = ['+', '×', '-'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    let answer: number;
    let question: string;

    if (op === '+') {
      answer = num1 + num2;
      question = `What is ${num1} + ${num2}?`;
    } else if (op === '×') {
      answer = num1 * num2;
      question = `What is ${num1} × ${num2}?`;
    } else {
      const bigger = Math.max(num1, num2) + 4;
      const smaller = Math.min(num1, num2);
      answer = bigger - smaller;
      question = `What is ${bigger} - ${smaller}?`;
    }

    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
    const payload = `${answer}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');
    const token = `${Buffer.from(payload).toString('base64')}.${hmac}`;

    return {
      token,
      question,
      expiresAt,
    };
  },

  verifyCaptcha(token: string, userAnswer: string | number): boolean {
    if (!token || userAnswer === undefined || userAnswer === null || userAnswer === '') {
      return false;
    }

    try {
      const [payloadB64, hmac] = token.split('.');
      if (!payloadB64 || !hmac) return false;

      const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
      const expectedHmac = crypto.createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');

      if (hmac !== expectedHmac) {
        return false;
      }

      const [correctAnswer, expiresAtStr] = payload.split(':');
      const expiresAt = parseInt(expiresAtStr, 10);

      if (Date.now() > expiresAt) {
        return false; // Expired
      }

      const parsedUser = parseInt(String(userAnswer).trim(), 10);
      const parsedCorrect = parseInt(correctAnswer, 10);

      return parsedUser === parsedCorrect;
    } catch {
      return false;
    }
  },
};
