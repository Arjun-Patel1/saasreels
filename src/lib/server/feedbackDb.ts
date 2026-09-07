import fs from 'fs';
import path from 'path';

export interface FeedbackRecord {
  id: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  userTier?: string;
  rating: number; // 1 to 5
  ratingLabel?: string;
  comment: string;
  targetUrl?: string;
  timestamp: string;
  userAgent?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FEEDBACKS_FILE = path.join(DATA_DIR, 'feedbacks.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FEEDBACKS_FILE)) {
    const seedFeedbacks: FeedbackRecord[] = [
      {
        id: 'fb_seed_101',
        userId: 'usr_founder_1',
        userName: 'Alex Vance',
        userEmail: 'alex@growthscale.io',
        userTier: 'pro',
        rating: 5,
        ratingLabel: '🚀 Insane',
        comment: 'Generated 5 TikToks in under 3 minutes for our launch. The split-screen gameplay hook retention is incredible!',
        targetUrl: 'https://growthscale.io',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      {
        id: 'fb_seed_102',
        userName: 'Sarah Jenkins',
        userEmail: 'sarah@hypertask.app',
        userTier: 'free',
        rating: 5,
        ratingLabel: '🔥 Great',
        comment: 'The voice synthesis is much cleaner with Edge Neural TTS. Would love direct YouTube Shorts auto-scheduling integration next!',
        targetUrl: 'https://hypertask.app',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        id: 'fb_seed_103',
        userName: 'Devin K.',
        userEmail: 'devin@saasify.co',
        userTier: 'agency',
        rating: 4,
        ratingLabel: '🔥 Great',
        comment: 'High viral scores on the Problem-Agitate-Solve hook template. Saved our video editor at least 15 hours this week.',
        targetUrl: 'https://saasify.co',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      },
    ];
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(seedFeedbacks, null, 2), 'utf-8');
  }
}

function readFeedbacks(): FeedbackRecord[] {
  ensureDb();
  try {
    const raw = fs.readFileSync(FEEDBACKS_FILE, 'utf-8');
    return JSON.parse(raw) as FeedbackRecord[];
  } catch (err) {
    console.error('Error reading feedbacks DB:', err);
    return [];
  }
}

function writeFeedbacks(feedbacks: FeedbackRecord[]): void {
  ensureDb();
  fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
}

export const feedbackDb = {
  getAllFeedbacks(): FeedbackRecord[] {
    return readFeedbacks();
  },

  addFeedback(params: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userTier?: string;
    rating: number | string;
    ratingLabel?: string;
    comment: string;
    targetUrl?: string;
    userAgent?: string;
  }): FeedbackRecord {
    const feedbacks = readFeedbacks();

    let numericRating = 5;
    if (typeof params.rating === 'number') {
      numericRating = Math.max(1, Math.min(5, Math.round(params.rating)));
    } else {
      const rLower = String(params.rating).toLowerCase();
      if (rLower === 'poor' || rLower === '1') numericRating = 1;
      else if (rLower === 'okay' || rLower === 'fair' || rLower === '2') numericRating = 2;
      else if (rLower === 'good' || rLower === '3') numericRating = 3;
      else if (rLower === 'great' || rLower === '4') numericRating = 4;
      else if (rLower === 'insane' || rLower === '5') numericRating = 5;
    }

    const labelsMap: Record<number, string> = {
      1: '😡 Poor',
      2: '😕 Okay',
      3: '🙂 Good',
      4: '🔥 Great',
      5: '🚀 Insane',
    };

    const newRecord: FeedbackRecord = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      userName: params.userName || 'Anonymous Founder',
      userEmail: (params.userEmail || 'guest@saasreels.ai').trim(),
      userTier: params.userTier || 'free',
      rating: numericRating,
      ratingLabel: params.ratingLabel || labelsMap[numericRating] || '🔥 Great',
      comment: (params.comment || '').trim().slice(0, 1500),
      targetUrl: params.targetUrl?.trim() || '',
      timestamp: new Date().toISOString(),
      userAgent: params.userAgent || 'Web Browser',
    };

    feedbacks.unshift(newRecord);
    if (feedbacks.length > 1000) feedbacks.pop();
    writeFeedbacks(feedbacks);

    return newRecord;
  },

  deleteFeedback(id: string): boolean {
    const feedbacks = readFeedbacks();
    const filtered = feedbacks.filter((f) => f.id !== id);
    if (filtered.length === feedbacks.length) return false;
    writeFeedbacks(filtered);
    return true;
  },

  getFeedbackStats() {
    const feedbacks = readFeedbacks();
    if (feedbacks.length === 0) {
      return { total: 0, averageRating: 5.0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const total = feedbacks.length;
    const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0);
    const avg = Number((sum / total).toFixed(1));

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => {
      const r = Math.max(1, Math.min(5, Math.round(f.rating || 5)));
      distribution[r] = (distribution[r] || 0) + 1;
    });

    return {
      total,
      averageRating: avg,
      distribution,
    };
  },
};
