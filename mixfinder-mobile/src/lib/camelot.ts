/**
 * Camelot Wheel Key System
 * Maps Spotify's key (0-11) + mode (0=minor, 1=major) to Camelot notation
 */

export interface CamelotKey {
  key: string;
  number: number;
  mode: 'A' | 'B'; // A = minor, B = major
}

// Spotify key to Camelot mapping
const KEY_TO_CAMELOT: Record<number, { minor: string; major: string }> = {
  0: { minor: '5A', major: '8B' }, // C
  1: { minor: '12A', major: '3B' }, // C#/Db
  2: { minor: '7A', major: '10B' }, // D
  3: { minor: '2A', major: '5B' }, // D#/Eb
  4: { minor: '9A', major: '12B' }, // E
  5: { minor: '4A', major: '7B' }, // F
  6: { minor: '11A', major: '2B' }, // F#/Gb
  7: { minor: '6A', major: '9B' }, // G
  8: { minor: '1A', major: '4B' }, // G#/Ab
  9: { minor: '8A', major: '11B' }, // A
  10: { minor: '3A', major: '6B' }, // A#/Bb
  11: { minor: '10A', major: '1B' }, // B
};

/**
 * Convert Spotify key and mode to Camelot notation
 */
export function toCamelot(key: number, mode: 0 | 1): string {
  if (key === -1) return 'Unknown';
  
  const mapping = KEY_TO_CAMELOT[key];
  if (!mapping) return 'Unknown';
  
  return mode === 0 ? mapping.minor : mapping.major;
}

/**
 * Parse Camelot notation to get number and mode
 */
export function parseCamelot(camelot: string): CamelotKey | null {
  if (camelot === 'Unknown') return null;
  
  const match = camelot.match(/^(\d+)([AB])$/);
  if (!match) return null;
  
  return {
    key: camelot,
    number: parseInt(match[1], 10),
    mode: match[2] as 'A' | 'B',
  };
}

/**
 * Check if two Camelot keys are harmonically compatible
 * Rules:
 * - Same key (perfect match)
 * - Adjacent keys on the wheel (±1)
 * - Relative major/minor (same number, different mode)
 */
export function isHarmonicMatch(camelot1: string, camelot2: string): boolean {
  if (camelot1 === 'Unknown' || camelot2 === 'Unknown') return false;
  if (camelot1 === camelot2) return true;
  
  const key1 = parseCamelot(camelot1);
  const key2 = parseCamelot(camelot2);
  
  if (!key1 || !key2) return false;
  
  // Same number, different mode (relative major/minor)
  if (key1.number === key2.number && key1.mode !== key2.mode) {
    return true;
  }
  
  // Adjacent keys on the wheel
  const diff = Math.abs(key1.number - key2.number);
  if (diff === 1 || diff === 11) { // 11 because wheel wraps around (12 -> 1)
    return true;
  }
  
  return false;
}

/**
 * Get harmonic compatibility score (0-1)
 */
export function getHarmonicScore(camelot1: string, camelot2: string): number {
  if (camelot1 === 'Unknown' || camelot2 === 'Unknown') return 0;
  if (camelot1 === camelot2) return 1;
  
  const key1 = parseCamelot(camelot1);
  const key2 = parseCamelot(camelot2);
  
  if (!key1 || !key2) return 0;
  
  // Same number, different mode (relative major/minor)
  if (key1.number === key2.number && key1.mode !== key2.mode) {
    return 0.8;
  }
  
  // Adjacent keys on the wheel
  const diff = Math.abs(key1.number - key2.number);
  if (diff === 1 || diff === 11) {
    return 0.6;
  }
  
  return 0;
}

/**
 * Get all harmonically compatible keys for a given key
 */
export function getCompatibleKeys(camelot: string): string[] {
  if (camelot === 'Unknown') return [];
  
  const key = parseCamelot(camelot);
  if (!key) return [];
  
  const compatible: string[] = [camelot]; // Same key
  
  // Relative major/minor
  const relativeMode = key.mode === 'A' ? 'B' : 'A';
  compatible.push(`${key.number}${relativeMode}`);
  
  // Adjacent keys
  const nextNumber = key.number === 12 ? 1 : key.number + 1;
  const prevNumber = key.number === 1 ? 12 : key.number - 1;
  
  compatible.push(`${nextNumber}${key.mode}`);
  compatible.push(`${prevNumber}${key.mode}`);
  
  return [...new Set(compatible)]; // Remove duplicates
}

/**
 * Get the next key in the Camelot wheel (for harmonic mixing)
 */
export function getNextKey(camelot: string): string {
  if (camelot === 'Unknown') return 'Unknown';
  
  const key = parseCamelot(camelot);
  if (!key) return 'Unknown';
  
  const nextNumber = key.number === 12 ? 1 : key.number + 1;
  return `${nextNumber}${key.mode}`;
}

/**
 * Get the previous key in the Camelot wheel
 */
export function getPreviousKey(camelot: string): string {
  if (camelot === 'Unknown') return 'Unknown';
  
  const key = parseCamelot(camelot);
  if (!key) return 'Unknown';
  
  const prevNumber = key.number === 1 ? 12 : key.number - 1;
  return `${prevNumber}${key.mode}`;
}
