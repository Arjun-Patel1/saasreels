'use client';

const GROQ_STORAGE_KEY = 'saasreels_groq_api_key';
const GROQ_KEY_EVENT = 'saasreels_groq_key_change';

/**
 * Retrieves the stored Groq API key from localStorage.
 */
export function getGroqKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = localStorage.getItem(GROQ_STORAGE_KEY);
    return key && key.trim().length > 0 ? key.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Saves a new Groq API key to localStorage and notifies listeners.
 */
export function setGroqKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = key.trim();
    localStorage.setItem(GROQ_STORAGE_KEY, trimmed);
    window.dispatchEvent(new CustomEvent(GROQ_KEY_EVENT, { detail: { key: trimmed } }));
  } catch (err) {
    console.warn('Failed to save Groq API key to localStorage:', err);
  }
}

/**
 * Removes the Groq API key from localStorage and notifies listeners.
 */
export function clearGroqKey(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GROQ_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(GROQ_KEY_EVENT, { detail: { key: null } }));
  } catch (err) {
    console.warn('Failed to remove Groq API key from localStorage:', err);
  }
}

/**
 * Returns true if a valid Groq API key is present in localStorage.
 */
export function hasGroqKey(): boolean {
  return !!getGroqKey();
}

/**
 * Validates that the provided key follows the official Groq API key format (gsk_...).
 */
export function isValidGroqKeyFormat(key: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith('gsk_') && trimmed.length >= 24;
}

/**
 * Returns request headers containing the x-groq-api-key if available.
 */
export function getGroqHeaders(): Record<string, string> {
  const key = getGroqKey();
  if (key) {
    return { 'x-groq-api-key': key };
  }
  return {};
}

/**
 * Subscribes to Groq key changes across components.
 */
export function subscribeToGroqKey(callback: (key: string | null) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ key: string | null }>;
    callback(customEvent.detail?.key ?? getGroqKey());
  };

  window.addEventListener(GROQ_KEY_EVENT, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === GROQ_STORAGE_KEY) {
      callback(getGroqKey());
    }
  });

  return () => {
    window.removeEventListener(GROQ_KEY_EVENT, handler);
  };
}
