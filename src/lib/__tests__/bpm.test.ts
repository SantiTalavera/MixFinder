import { tempoCompatible, getBPMScore, isHarmonicBPM } from '../bpm';

describe('BPM Compatibility', () => {
  describe('tempoCompatible', () => {
    it('should match exact BPM', () => {
      const result = tempoCompatible(120, 120, 4);
      expect(result.isCompatible).toBe(true);
      expect(result.score).toBe(1);
      expect(result.type).toBe('exact');
    });

    it('should match within tolerance', () => {
      const result = tempoCompatible(120, 122, 4);
      expect(result.isCompatible).toBe(true);
      expect(result.type).toBe('tolerance');
    });

    it('should not match outside tolerance', () => {
      const result = tempoCompatible(120, 130, 4);
      expect(result.isCompatible).toBe(false);
      expect(result.type).toBe('incompatible');
    });

    it('should match half-time', () => {
      const result = tempoCompatible(120, 60, 4, true);
      expect(result.isCompatible).toBe(true);
      expect(result.type).toBe('half-time');
      expect(result.ratio).toBe(2);
    });

    it('should match double-time', () => {
      const result = tempoCompatible(60, 120, 4, true);
      expect(result.isCompatible).toBe(true);
      expect(result.type).toBe('double-time');
      expect(result.ratio).toBe(0.5);
    });

    it('should not allow half/double time when disabled', () => {
      const result = tempoCompatible(120, 60, 4, false);
      expect(result.isCompatible).toBe(false);
    });
  });

  describe('getBPMScore', () => {
    it('should return 1 for exact match', () => {
      expect(getBPMScore(120, 120, 4)).toBe(1);
    });

    it('should return high score for close match', () => {
      const score = getBPMScore(120, 121, 4);
      expect(score).toBeGreaterThan(0.9);
    });

    it('should return 0 for incompatible BPM', () => {
      expect(getBPMScore(120, 200, 4)).toBe(0);
    });
  });

  describe('isHarmonicBPM', () => {
    it('should detect harmonic ratios', () => {
      expect(isHarmonicBPM(120, 60)).toBe(true); // 2:1
      expect(isHarmonicBPM(120, 80)).toBe(true); // 3:2
      expect(isHarmonicBPM(120, 90)).toBe(true); // 4:3
    });

    it('should not detect non-harmonic ratios', () => {
      expect(isHarmonicBPM(120, 130)).toBe(false);
      expect(isHarmonicBPM(120, 150)).toBe(false);
    });
  });
});
