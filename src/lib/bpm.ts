/**
 * BPM (Beats Per Minute) compatibility utilities
 */

export interface BPMCompatibility {
  isCompatible: boolean;
  score: number;
  ratio: number;
  type: 'exact' | 'tolerance' | 'half-time' | 'double-time' | 'incompatible';
}

/**
 * Check if two BPM values are compatible within tolerance
 */
export function tempoCompatible(
  bpm1: number,
  bpm2: number,
  tolerance: number = 4,
  allowHalfDouble: boolean = true
): BPMCompatibility {
  const diff = Math.abs(bpm1 - bpm2);
  
  // Exact match
  if (diff === 0) {
    return {
      isCompatible: true,
      score: 1,
      ratio: 1,
      type: 'exact',
    };
  }
  
  // Within tolerance
  if (diff <= tolerance) {
    const score = 1 - (diff / tolerance) * 0.3; // Slight penalty for difference
    return {
      isCompatible: true,
      score: Math.max(0.7, score),
      ratio: 1,
      type: 'tolerance',
    };
  }
  
  if (!allowHalfDouble) {
    return {
      isCompatible: false,
      score: 0,
      ratio: 0,
      type: 'incompatible',
    };
  }
  
  // Check for half-time (2:1 ratio)
  const halfTimeRatio = bpm1 / bpm2;
  if (Math.abs(halfTimeRatio - 2) <= tolerance / 100) {
    return {
      isCompatible: true,
      score: 0.8,
      ratio: 2,
      type: 'half-time',
    };
  }
  
  // Check for double-time (1:2 ratio)
  const doubleTimeRatio = bpm2 / bpm1;
  if (Math.abs(doubleTimeRatio - 2) <= tolerance / 100) {
    return {
      isCompatible: true,
      score: 0.8,
      ratio: 0.5,
      type: 'double-time',
    };
  }
  
  return {
    isCompatible: false,
    score: 0,
    ratio: 0,
    type: 'incompatible',
  };
}

/**
 * Get BPM compatibility score (0-1)
 */
export function getBPMScore(
  bpm1: number,
  bpm2: number,
  tolerance: number = 4,
  allowHalfDouble: boolean = true
): number {
  return tempoCompatible(bpm1, bpm2, tolerance, allowHalfDouble).score;
}

/**
 * Calculate the optimal BPM for mixing two tracks
 */
export function calculateOptimalBPM(bpm1: number, bpm2: number): number {
  // For smooth transitions, use the average
  return (bpm1 + bpm2) / 2;
}

/**
 * Get BPM transition type description
 */
export function getBPMTransitionDescription(compatibility: BPMCompatibility): string {
  switch (compatibility.type) {
    case 'exact':
      return 'Perfect BPM match';
    case 'tolerance':
      return `BPM within tolerance (±${Math.abs(compatibility.ratio - 1) * 100}%)`;
    case 'half-time':
      return 'Half-time transition (2:1 ratio)';
    case 'double-time':
      return 'Double-time transition (1:2 ratio)';
    case 'incompatible':
      return 'BPM incompatible';
    default:
      return 'Unknown BPM relationship';
  }
}

/**
 * Check if BPM values are in a harmonic relationship
 */
export function isHarmonicBPM(bpm1: number, bpm2: number, tolerance: number = 2): boolean {
  const ratios = [1, 1.5, 2, 2.5, 3, 4]; // Common harmonic ratios
  
  for (const ratio of ratios) {
    if (Math.abs(bpm1 / bpm2 - ratio) <= tolerance / 100) return true;
    if (Math.abs(bpm2 / bpm1 - ratio) <= tolerance / 100) return true;
  }
  
  return false;
}

/**
 * Get all compatible BPM values for a given BPM within tolerance
 */
export function getCompatibleBPMs(
  baseBPM: number,
  tolerance: number = 4,
  allowHalfDouble: boolean = true
): number[] {
  const compatible: number[] = [];
  
  // Add BPMs within tolerance
  for (let i = -tolerance; i <= tolerance; i++) {
    if (i !== 0) {
      compatible.push(baseBPM + i);
    }
  }
  
  if (allowHalfDouble) {
    // Add half-time and double-time
    compatible.push(baseBPM / 2);
    compatible.push(baseBPM * 2);
  }
  
  return compatible.filter(bpm => bpm > 0);
}

/**
 * Calculate BPM drift over time (for long mixes)
 */
export function calculateBPMDrift(
  startBPM: number,
  endBPM: number,
  durationSeconds: number
): number {
  const driftPerSecond = (endBPM - startBPM) / durationSeconds;
  return driftPerSecond;
}

/**
 * Get recommended BPM transition curve
 */
export function getBPMTransitionCurve(
  startBPM: number,
  endBPM: number,
  durationSeconds: number,
  curveType: 'linear' | 'exponential' | 'logarithmic' = 'linear'
): (time: number) => number {
  return (time: number) => {
    const progress = Math.min(time / durationSeconds, 1);
    
    switch (curveType) {
      case 'exponential':
        return startBPM + (endBPM - startBPM) * (progress * progress);
      case 'logarithmic':
        return startBPM + (endBPM - startBPM) * Math.sqrt(progress);
      case 'linear':
      default:
        return startBPM + (endBPM - startBPM) * progress;
    }
  };
}
