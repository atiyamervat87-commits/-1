/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cryptographic service for SHA-256 hashing and integrity verification
 */

/**
 * Computes a standard SHA-256 hexadecimal string from text.
 * Falls back to a deterministic 32-bit polynomial hash if crypto.subtle is unavailable.
 */
export async function sha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }

  // Deterministic fallback for environments without subtle crypto
  return fallbackHash(text);
}

/**
 * Synchronous hash calculation for fast UI checks
 */
export function fastHashSync(text: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x55555555;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ char, 0x01000193);
    hash2 = Math.imul(hash2 ^ (char << 1), 0x27d4eb2d);
  }
  const h1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `h_${h1}${h2}`;
}

function fallbackHash(str: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}
