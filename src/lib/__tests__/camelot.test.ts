import { toCamelot, isHarmonicMatch, getHarmonicScore } from '../camelot';

describe('Camelot Wheel System', () => {
  describe('toCamelot', () => {
    it('should convert C major to 8B', () => {
      expect(toCamelot(0, 1)).toBe('8B');
    });

    it('should convert C minor to 5A', () => {
      expect(toCamelot(0, 0)).toBe('5A');
    });

    it('should convert G major to 9B', () => {
      expect(toCamelot(7, 1)).toBe('9B');
    });

    it('should convert G minor to 6A', () => {
      expect(toCamelot(7, 0)).toBe('6A');
    });

    it('should handle unknown key', () => {
      expect(toCamelot(-1, 1)).toBe('Unknown');
    });
  });

  describe('isHarmonicMatch', () => {
    it('should match same key', () => {
      expect(isHarmonicMatch('8B', '8B')).toBe(true);
    });

    it('should match relative major/minor', () => {
      expect(isHarmonicMatch('8B', '8A')).toBe(true);
      expect(isHarmonicMatch('5A', '5B')).toBe(true);
    });

    it('should match adjacent keys', () => {
      expect(isHarmonicMatch('8B', '9B')).toBe(true);
      expect(isHarmonicMatch('8B', '7B')).toBe(true);
    });

    it('should not match incompatible keys', () => {
      expect(isHarmonicMatch('8B', '1B')).toBe(false);
      expect(isHarmonicMatch('5A', '10A')).toBe(false);
    });

    it('should handle unknown keys', () => {
      expect(isHarmonicMatch('Unknown', '8B')).toBe(false);
      expect(isHarmonicMatch('8B', 'Unknown')).toBe(false);
    });
  });

  describe('getHarmonicScore', () => {
    it('should return 1 for exact match', () => {
      expect(getHarmonicScore('8B', '8B')).toBe(1);
    });

    it('should return 0.8 for relative major/minor', () => {
      expect(getHarmonicScore('8B', '8A')).toBe(0.8);
    });

    it('should return 0.6 for adjacent keys', () => {
      expect(getHarmonicScore('8B', '9B')).toBe(0.6);
    });

    it('should return 0 for incompatible keys', () => {
      expect(getHarmonicScore('8B', '1B')).toBe(0);
    });
  });
});
