import { Track, CompatibilityScore, MixConfig } from '../types/domain';
import { toCamelot, getHarmonicScore } from './camelot';
import { getBPMScore } from './bpm';

export interface ScoringWeights {
  tempo: number;
  key: number;
  energy: number;
  danceability: number;
  genre: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  tempo: 0.3,
  key: 0.25,
  energy: 0.2,
  danceability: 0.15,
  genre: 0.1,
};

/**
 * Calculate compatibility score between two tracks
 */
export function compatScore(
  track1: Track,
  track2: Track,
  config: MixConfig,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): CompatibilityScore {
  const features1 = track1.audio_features;
  const features2 = track2.audio_features;
  
  if (!features1 || !features2) {
    return {
      overall: 0,
      tempo: 0,
      key: 0,
      energy: 0,
      danceability: 0,
      genre: 0,
    };
  }
  
  // BPM/Tempo score
  const tempoScore = getBPMScore(
    features1.tempo,
    features2.tempo,
    config.bpm_tolerance,
    config.allow_half_double_time
  );
  
  // Key/Harmonic score
  const keyScore = config.harmonic_matching
    ? getHarmonicScore(
        toCamelot(features1.key, features1.mode as 0 | 1),
        toCamelot(features2.key, features2.mode as 0 | 1)
      )
    : 1; // If harmonic matching is disabled, give full score
  
  // Energy score
  const energyScore = config.maintain_energy
    ? 1 - Math.abs(features1.energy - features2.energy)
    : 1;
  
  // Danceability score
  const danceabilityScore = 1 - Math.abs(features1.danceability - features2.danceability);
  
  // Genre score
  const genreScore = config.same_genre
    ? calculateGenreScore(track1.artist_genres || [], track2.artist_genres || [])
    : 1;
  
  // Calculate weighted overall score
  const overall = 
    tempoScore * weights.tempo +
    keyScore * weights.key +
    energyScore * weights.energy +
    danceabilityScore * weights.danceability +
    genreScore * weights.genre;
  
  return {
    overall: Math.max(0, Math.min(1, overall)),
    tempo: tempoScore,
    key: keyScore,
    energy: energyScore,
    danceability: danceabilityScore,
    genre: genreScore,
  };
}

/**
 * Calculate genre compatibility score
 */
function calculateGenreScore(genres1: string[], genres2: string[]): number {
  if (genres1.length === 0 || genres2.length === 0) return 0.5; // Neutral score if no genres
  
  // Check for exact matches
  const commonGenres = genres1.filter(genre => genres2.includes(genre));
  if (commonGenres.length > 0) return 1;
  
  // Check for genre family matches
  const familyScore = calculateGenreFamilyScore(genres1, genres2);
  return familyScore;
}

/**
 * Calculate genre family compatibility
 */
function calculateGenreFamilyScore(genres1: string[], genres2: string[]): number {
  const genreFamilies: Record<string, string[]> = {
    electronic: ['house', 'techno', 'trance', 'dubstep', 'drum and bass', 'ambient', 'synthwave'],
    rock: ['alternative', 'indie', 'punk', 'metal', 'grunge', 'progressive'],
    pop: ['dance pop', 'indie pop', 'synthpop', 'electropop'],
    hip_hop: ['rap', 'trap', 'drill', 'conscious hip hop'],
    jazz: ['bebop', 'fusion', 'smooth jazz', 'acid jazz'],
    classical: ['orchestral', 'chamber', 'baroque', 'romantic'],
    country: ['folk', 'bluegrass', 'country pop'],
    r_b: ['soul', 'funk', 'neo soul', 'contemporary r&b'],
  };
  
  for (const [family, subgenres] of Object.entries(genreFamilies)) {
    const hasFamily1 = genres1.some(genre => 
      subgenres.some(sub => genre.toLowerCase().includes(sub.toLowerCase()))
    );
    const hasFamily2 = genres2.some(genre => 
      subgenres.some(sub => genre.toLowerCase().includes(sub.toLowerCase()))
    );
    
    if (hasFamily1 && hasFamily2) return 0.7;
  }
  
  return 0.3; // Low score for unrelated genres
}

/**
 * Get score description for UI
 */
export function getScoreDescription(score: number): { label: string; color: string } {
  if (score >= 0.9) return { label: 'Excellent', color: '#4CAF50' };
  if (score >= 0.8) return { label: 'Very Good', color: '#8BC34A' };
  if (score >= 0.7) return { label: 'Good', color: '#CDDC39' };
  if (score >= 0.6) return { label: 'Fair', color: '#FFC107' };
  if (score >= 0.5) return { label: 'Poor', color: '#FF9800' };
  return { label: 'Very Poor', color: '#F44336' };
}

/**
 * Calculate transition difficulty score
 */
export function calculateTransitionDifficulty(
  track1: Track,
  track2: Track,
  config: MixConfig
): number {
  const score = compatScore(track1, track2, config);
  
  // Higher difficulty for lower compatibility
  const difficulty = 1 - score.overall;
  
  // Additional difficulty factors
  const features1 = track1.audio_features;
  const features2 = track2.audio_features;
  
  if (features1 && features2) {
    // Large tempo differences increase difficulty
    const tempoDiff = Math.abs(features1.tempo - features2.tempo);
    if (tempoDiff > 20) difficulty += 0.2;
    
    // Large energy differences increase difficulty
    const energyDiff = Math.abs(features1.energy - features2.energy);
    if (energyDiff > 0.5) difficulty += 0.1;
  }
  
  return Math.min(1, difficulty);
}

/**
 * Get transition difficulty description
 */
export function getTransitionDifficultyDescription(difficulty: number): string {
  if (difficulty <= 0.2) return 'Easy';
  if (difficulty <= 0.4) return 'Moderate';
  if (difficulty <= 0.6) return 'Challenging';
  if (difficulty <= 0.8) return 'Difficult';
  return 'Expert';
}

/**
 * Calculate optimal transition point score
 */
export function calculateTransitionPointScore(
  track1: Track,
  track2: Track,
  transitionTime: number
): number {
  const analysis1 = track1.audio_analysis;
  const analysis2 = track2.audio_analysis;
  
  if (!analysis1 || !analysis2) return 0.5;
  
  // Find the best transition points based on musical structure
  const track1Outro = findOptimalOutro(analysis1, transitionTime);
  const track2Intro = findOptimalIntro(analysis2, transitionTime);
  
  return (track1Outro.score + track2Intro.score) / 2;
}

/**
 * Find optimal outro point in track
 */
function findOptimalOutro(analysis: any, targetTime: number): { time: number; score: number } {
  const sections = analysis.sections || [];
  const bars = analysis.bars || [];
  
  // Look for sections near the end
  const outroSections = sections.filter((s: any) => s.start > targetTime - 30);
  
  if (outroSections.length > 0) {
    const bestSection = outroSections[0];
    return {
      time: bestSection.start,
      score: 0.9,
    };
  }
  
  // Fallback to bar-based detection
  const outroBars = bars.filter((b: any) => b.start > targetTime - 20);
  if (outroBars.length > 0) {
    return {
      time: outroBars[0].start,
      score: 0.7,
    };
  }
  
  return {
    time: targetTime,
    score: 0.5,
  };
}

/**
 * Find optimal intro point in track
 */
function findOptimalIntro(analysis: any, targetTime: number): { time: number; score: number } {
  const sections = analysis.sections || [];
  const bars = analysis.bars || [];
  
  // Look for sections near the beginning
  const introSections = sections.filter((s: any) => s.start < targetTime + 30);
  
  if (introSections.length > 0) {
    const bestSection = introSections[0];
    return {
      time: bestSection.start,
      score: 0.9,
    };
  }
  
  // Fallback to bar-based detection
  const introBars = bars.filter((b: any) => b.start < targetTime + 20);
  if (introBars.length > 0) {
    return {
      time: introBars[0].start,
      score: 0.7,
    };
  }
  
  return {
    time: targetTime,
    score: 0.5,
  };
}
