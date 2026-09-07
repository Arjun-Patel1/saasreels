export interface KeyState {
  key: string;
  maskedKey: string;
  status: 'healthy' | 'cooldown' | 'invalid';
  cooldownUntil?: number;
  totalSuccess: number;
  totalErrors: number;
  lastUsedAt?: string;
  lastError?: string;
}

class GroqKeyPool {
  private keys: KeyState[] = [];
  private currentIndex = 0;

  constructor() {
    this.refreshKeys();
  }

  public refreshKeys() {
    const rawKeys: string[] = [];

    // 1. Check GROQ_API_KEYS (comma separated)
    if (process.env.GROQ_API_KEYS) {
      process.env.GROQ_API_KEYS.split(',').forEach((k) => rawKeys.push(k.trim()));
    }

    // 2. Check GROQ_API_KEY (could be comma separated or single)
    if (process.env.GROQ_API_KEY) {
      process.env.GROQ_API_KEY.split(',').forEach((k) => rawKeys.push(k.trim()));
    }

    // 3. Check numbered keys: GROQ_API_KEY_1, GROQ_API_KEY_2, etc.
    for (let i = 1; i <= 10; i++) {
      const k = process.env[`GROQ_API_KEY_${i}`];
      if (k) rawKeys.push(k.trim());
    }

    // Deduplicate and filter non-empty
    const uniqueKeys = Array.from(new Set(rawKeys.filter((k) => k && k.length > 5)));

    // Preserve existing stats if keys were already registered
    const existingMap = new Map(this.keys.map((s) => [s.key, s]));

    this.keys = uniqueKeys.map((k) => {
      const existing = existingMap.get(k);
      if (existing) return existing;
      return {
        key: k,
        maskedKey: `${k.slice(0, 7)}...${k.slice(-4)}`,
        status: 'healthy',
        totalSuccess: 0,
        totalErrors: 0,
      };
    });
  }

  /**
   * Get all active, non-cooldown keys in round-robin order
   */
  public getAvailableKeys(overrideKey?: string): string[] {
    this.refreshKeys();
    const now = Date.now();

    // Clear expired cooldowns
    this.keys.forEach((k) => {
      if (k.status === 'cooldown' && k.cooldownUntil && now > k.cooldownUntil) {
        k.status = 'healthy';
        k.cooldownUntil = undefined;
      }
    });

    if (overrideKey && overrideKey.trim().length > 5) {
      return [overrideKey.trim()];
    }

    // Return healthy keys starting from current index
    const healthy = this.keys.filter((k) => k.status === 'healthy');
    if (healthy.length === 0) return [];

    const ordered: string[] = [];
    const count = healthy.length;
    for (let i = 0; i < count; i++) {
      const idx = (this.currentIndex + i) % count;
      ordered.push(healthy[idx].key);
    }
    this.currentIndex = (this.currentIndex + 1) % Math.max(1, count);
    return ordered;
  }

  /**
   * Mark a key as successful
   */
  public recordSuccess(key: string) {
    const entry = this.keys.find((k) => k.key === key);
    if (entry) {
      entry.status = 'healthy';
      entry.totalSuccess += 1;
      entry.lastUsedAt = new Date().toISOString();
      entry.cooldownUntil = undefined;
    }
  }

  /**
   * Mark a key as rate limited (HTTP 429) or invalid
   */
  public recordFailure(key: string, statusCode: number, errorMsg: string) {
    const entry = this.keys.find((k) => k.key === key);
    if (entry) {
      entry.totalErrors += 1;
      entry.lastUsedAt = new Date().toISOString();
      entry.lastError = `HTTP ${statusCode}: ${errorMsg.slice(0, 100)}`;

      if (statusCode === 429) {
        // Cooldown for 5 minutes
        entry.status = 'cooldown';
        entry.cooldownUntil = Date.now() + 5 * 60 * 1000;
        console.warn(`⚠️ [KEY POOL] Key ${entry.maskedKey} rate-limited. Placed on 5-min cooldown.`);
      } else if (statusCode === 401 || statusCode === 403) {
        entry.status = 'invalid';
        console.error(`❌ [KEY POOL] Key ${entry.maskedKey} invalid/unauthorized.`);
      }
    }
  }

  /**
   * Get telemetry summary for admin panel
   */
  public getPoolStatus() {
    this.refreshKeys();
    const now = Date.now();
    const healthyCount = this.keys.filter(
      (k) => k.status === 'healthy' || (k.cooldownUntil && now > k.cooldownUntil)
    ).length;

    return {
      totalKeys: this.keys.length,
      healthyKeys: healthyCount,
      cooldownKeys: this.keys.filter((k) => k.status === 'cooldown' && k.cooldownUntil && now <= k.cooldownUntil).length,
      invalidKeys: this.keys.filter((k) => k.status === 'invalid').length,
      keys: this.keys.map((k) => ({
        maskedKey: k.maskedKey,
        status: k.status,
        totalSuccess: k.totalSuccess,
        totalErrors: k.totalErrors,
        cooldownRemainingSec: k.cooldownUntil && now < k.cooldownUntil ? Math.ceil((k.cooldownUntil - now) / 1000) : 0,
        lastUsedAt: k.lastUsedAt,
        lastError: k.lastError,
      })),
    };
  }
}

export const groqKeyPool = new GroqKeyPool();
