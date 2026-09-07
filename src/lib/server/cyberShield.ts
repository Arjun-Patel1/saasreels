import { URL } from 'url';

// Cyber Shield Security Suite for SaaSReels
// Protects against SSRF, Private IP traversal, Protocol smuggling, XSS, and Prompt Injections.

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // AWS/GCP metadata service
  'metadata.google.internal',
  'instance-data',
]);

// Private IP Range Regex (IPv4 & IPv6)
const PRIVATE_IP_REGEX = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|0\.|fc00:|fe80:|::1$)/i;

// In-Memory Rate Limiting Tracker
const RATE_LIMIT_CACHE = new Map<string, { count: number; resetAt: number }>();

export const cyberShield = {
  /**
   * Validates a URL against SSRF, internal network scanning, and malicious protocol attacks.
   */
  validateUrl(inputUrl: string): { isValid: boolean; sanitizedUrl?: string; error?: string } {
    if (!inputUrl || typeof inputUrl !== 'string') {
      return { isValid: false, error: 'Empty or invalid URL parameter.' };
    }

    let raw = inputUrl.trim();

    // Prevent data:, javascript:, file:, gopher:, ftp: protocol injection
    if (/^(javascript|data|file|gopher|ftp|dict|ldap):/i.test(raw)) {
      return { isValid: false, error: 'Prohibited URI scheme detected. Only HTTP/HTTPS is permitted.' };
    }

    if (!/^https?:\/\//i.test(raw)) {
      raw = 'https://' + raw;
    }

    try {
      const parsed = new URL(raw);

      // Enforce HTTP / HTTPS protocol only
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isValid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
      }

      const hostname = parsed.hostname.toLowerCase().trim();

      // Check blacklisted hostnames (SSRF defense)
      if (BLOCKED_HOSTNAMES.has(hostname) || PRIVATE_IP_REGEX.test(hostname)) {
        return {
          isValid: false,
          error: 'Security Alert: Access to localhost, private IP subnets, or cloud metadata endpoints is restricted.',
        };
      }

      // Block non-standard suspicious ports (e.g. redis 6379, ssh 22, database 5432)
      if (parsed.port) {
        const portNum = parseInt(parsed.port, 10);
        if (portNum !== 80 && portNum !== 443 && portNum !== 8080 && portNum !== 3000) {
          return {
            isValid: false,
            error: `Security Alert: Connections to port ${parsed.port} are not permitted.`,
          };
        }
      }

      // Check domain length & syntax
      if (hostname.length > 253 || !/^[a-z0-9.-]+$/i.test(hostname)) {
        return { isValid: false, error: 'Malformed domain name syntax.' };
      }

      return {
        isValid: true,
        sanitizedUrl: parsed.toString(),
      };
    } catch {
      return { isValid: false, error: 'Invalid URL formatting.' };
    }
  },

  /**
   * Sanitizes scraped text against XSS, HTML injections, and LLM prompt escape payloads.
   */
  sanitizeScrapedText(text: string, maxLength = 500): string {
    if (!text || typeof text !== 'string') return '';

    return text
      // Strip HTML tags
      .replace(/<[^>]*>/g, '')
      // Strip script / style artifacts
      .replace(/javascript:|onload=|onerror=|eval\(|<script/gi, '')
      // Neutralize prompt injection markers
      .replace(/ignore (all )?previous instructions|system prompt|reveal your prompt/gi, '[filtered]')
      // Replace multiple spaces & control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  },

  /**
   * Sliding window rate limiter to protect server endpoints from DDoS/scraping abuse.
   */
  checkRateLimit(identifier: string, maxRequests = 30, windowSeconds = 60): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = RATE_LIMIT_CACHE.get(identifier);

    if (!entry || now > entry.resetAt) {
      RATE_LIMIT_CACHE.set(identifier, {
        count: 1,
        resetAt: now + windowSeconds * 1000,
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    entry.count += 1;
    return { allowed: true, remaining: maxRequests - entry.count };
  },
};
