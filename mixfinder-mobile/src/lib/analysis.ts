import { Track, TransitionPlan } from '../types/domain';
import { compatScore } from './scoring';
import { toCamelot } from './camelot';

/**
 * Find intro and outro points in audio analysis
 */
export function findIntroOutro(analysis: any): {
  intro: { start: number; end: number; confidence: number };
  outro: { start: number; end: number; confidence: number };
} {
  const sections = analysis.sections || [];
  const bars = analysis.bars || [];
  const beats = analysis.beats || [];
  
  // Find intro (first 30 seconds or first section)
  const introSection = sections.find((s: any) => s.start < 30);
  const introStart = introSection ? introSection.start : 0;
  const introEnd = introSection ? introSection.start + introSection.duration : 30;
  
  // Find outro (last 30 seconds or last section)
  const outroSection = sections[sections.length - 1];
  const outroStart = outroSection ? outroSection.start : Math.max(0, analysis.track.duration - 30);
  const outroEnd = outroSection ? outroSection.start + outroSection.duration : analysis.track.duration;
  
  return {
    intro: {
      start: introStart,
      end: introEnd,
      confidence: introSection ? introSection.confidence : 0.5,
    },
    outro: {
      start: outroStart,
      end: outroEnd,
      confidence: outroSection ? outroSection.confidence : 0.5,
    },
  };
}

/**
 * Get optimal transition points between two tracks
 */
export function getOptimalTransitionPoints(
  track1: Track,
  track2: Track
): {
  track1Outro: number;
  track2Intro: number;
  confidence: number;
} {
  const analysis1 = track1.audio_analysis;
  const analysis2 = track2.audio_analysis;
  
  if (!analysis1 || !analysis2) {
    // Fallback to simple timing
    const track1Duration = track1.audio_features?.duration_ms || track1.duration_ms;
    const track2Duration = track2.audio_features?.duration_ms || track2.duration_ms;
    
    return {
      track1Outro: track1Duration * 0.8, // 80% through track 1
      track2Intro: track2Duration * 0.1, // 10% through track 2
      confidence: 0.3,
    };
  }
  
  const track1Outro = findIntroOutro(analysis1).outro;
  const track2Intro = findIntroOutro(analysis2).intro;
  
  return {
    track1Outro: track1Outro.start,
    track2Intro: track2Intro.start,
    confidence: (track1Outro.confidence + track2Intro.confidence) / 2,
  };
}

/**
 * Calculate number of bars for transition
 */
export function calculateTransitionBars(
  track: Track,
  startTime: number,
  endTime: number
): number {
  const analysis = track.audio_analysis;
  if (!analysis || !analysis.bars) return 0;
  
  const bars = analysis.bars.filter((bar: any) => 
    bar.start >= startTime && bar.start <= endTime
  );
  
  return bars.length;
}

/**
 * Get musical key information for transition
 */
export function getTransitionKeyInfo(track: Track): {
  camelot: string;
  confidence: number;
  mode: string;
} {
  const features = track.audio_features;
  if (!features) {
    return {
      camelot: 'Unknown',
      confidence: 0,
      mode: 'Unknown',
    };
  }
  
  const camelot = toCamelot(features.key, features.mode as 0 | 1);
  const analysis = track.audio_analysis;
  const confidence = analysis?.track?.key_confidence || 0.5;
  const mode = features.mode === 1 ? 'Major' : 'Minor';
  
  return {
    camelot,
    confidence,
    mode,
  };
}

/**
 * Order tracks for optimal mixing sequence
 */
export function orderTracks(
  baseTrack: Track,
  candidates: Track[],
  config: any
): {
  ordered: Track[];
  transitions: TransitionPlan[];
} {
  if (candidates.length === 0) {
    return {
      ordered: [baseTrack],
      transitions: [],
    };
  }
  
  const ordered: Track[] = [baseTrack];
  const transitions: TransitionPlan[] = [];
  const remaining = [...candidates];
  
  let currentTrack = baseTrack;
  
  // Greedy algorithm to find best next track
  while (remaining.length > 0) {
    let bestTrack = remaining[0];
    let bestScore = 0;
    let bestIndex = 0;
    
    // Find the track with best compatibility score
    for (let i = 0; i < remaining.length; i++) {
      const track = remaining[i];
      const score = compatScore(currentTrack, track, config);
      
      if (score.overall > bestScore) {
        bestScore = score.overall;
        bestTrack = track;
        bestIndex = i;
      }
    }
    
    // Add best track to ordered list
    ordered.push(bestTrack);
    remaining.splice(bestIndex, 1);
    
    // Create transition plan
    const transitionPoints = getOptimalTransitionPoints(currentTrack, bestTrack);
    const keyInfo = getTransitionKeyInfo(bestTrack);
    const bars = calculateTransitionBars(
      currentTrack,
      transitionPoints.track1Outro - 10,
      transitionPoints.track1Outro + 10
    );
    
    transitions.push({
      from: currentTrack,
      to: bestTrack,
      offset_seconds: transitionPoints.track1Outro,
      bars: Math.max(1, bars),
      key_note: keyInfo.camelot,
      compatibility_score: bestScore,
    });
    
    currentTrack = bestTrack;
  }
  
  return { ordered, transitions };
}

/**
 * Analyze track structure for mixing
 */
export function analyzeTrackStructure(track: Track): {
  intro: { start: number; duration: number };
  outro: { start: number; duration: number };
  breakdown: { start: number; duration: number } | null;
  build: { start: number; duration: number } | null;
  drop: { start: number; duration: number } | null;
} {
  const analysis = track.audio_analysis;
  if (!analysis) {
    // Fallback analysis
    const duration = track.duration_ms / 1000;
    return {
      intro: { start: 0, duration: Math.min(30, duration * 0.1) },
      outro: { start: duration * 0.8, duration: Math.min(30, duration * 0.2) },
      breakdown: null,
      build: null,
      drop: null,
    };
  }
  
  const sections = analysis.sections || [];
  const duration = analysis.track.duration;
  
  // Find intro (first section or first 30 seconds)
  const introSection = sections.find((s: any) => s.start < 30);
  const intro = introSection 
    ? { start: introSection.start, duration: introSection.duration }
    : { start: 0, duration: Math.min(30, duration * 0.1) };
  
  // Find outro (last section or last 30 seconds)
  const outroSection = sections[sections.length - 1];
  const outro = outroSection
    ? { start: outroSection.start, duration: outroSection.duration }
    : { start: duration * 0.8, duration: Math.min(30, duration * 0.2) };
  
  // Find breakdown (section with lowest energy)
  const breakdownSection = sections.reduce((lowest: any, current: any) => {
    if (!lowest || current.loudness < lowest.loudness) {
      return current;
    }
    return lowest;
  }, null);
  
  const breakdown = breakdownSection && breakdownSection.loudness < -20
    ? { start: breakdownSection.start, duration: breakdownSection.duration }
    : null;
  
  // Find build (section with increasing energy)
  const buildSection = sections.find((s: any, index: number) => {
    const next = sections[index + 1];
    return next && s.loudness < next.loudness && s.loudness < -15;
  });
  
  const build = buildSection
    ? { start: buildSection.start, duration: buildSection.duration }
    : null;
  
  // Find drop (section with highest energy)
  const dropSection = sections.reduce((highest: any, current: any) => {
    if (!highest || current.loudness > highest.loudness) {
      return current;
    }
    return highest;
  }, null);
  
  const drop = dropSection && dropSection.loudness > -10
    ? { start: dropSection.start, duration: dropSection.duration }
    : null;
  
  return {
    intro,
    outro,
    breakdown,
    build,
    drop,
  };
}

/**
 * Get transition recommendations
 */
export function getTransitionRecommendations(
  track1: Track,
  track2: Track
): {
  type: 'intro_outro' | 'breakdown_build' | 'drop_drop' | 'simple';
  confidence: number;
  description: string;
} {
  const structure1 = analyzeTrackStructure(track1);
  const structure2 = analyzeTrackStructure(track2);
  
  // Check for breakdown -> build transition
  if (structure1.breakdown && structure2.build) {
    return {
      type: 'breakdown_build',
      confidence: 0.9,
      description: 'Breakdown to build transition - perfect for energy building',
    };
  }
  
  // Check for drop -> drop transition
  if (structure1.drop && structure2.drop) {
    return {
      type: 'drop_drop',
      confidence: 0.8,
      description: 'Drop to drop transition - high energy maintained',
    };
  }
  
  // Default to intro -> outro
  return {
    type: 'intro_outro',
    confidence: 0.7,
    description: 'Standard intro to outro transition',
  };
}
