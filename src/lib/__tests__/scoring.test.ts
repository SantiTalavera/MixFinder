import { compatScore, getScoreDescription } from '../scoring';
import { Track, MixConfig } from '../../types/domain';

const createMockTrack = (overrides: Partial<Track> = {}): Track => ({
  id: '1',
  name: 'Test Track',
  artists: [{ id: '1', name: 'Test Artist' }],
  album: {
    id: '1',
    name: 'Test Album',
    images: [{ url: 'test.jpg', height: 300, width: 300 }],
  },
  duration_ms: 180000,
  preview_url: null,
  external_urls: { spotify: 'https://spotify.com/track/1' },
  uri: 'spotify:track:1',
  audio_features: {
    id: '1',
    danceability: 0.5,
    energy: 0.5,
    key: 0,
    loudness: -10,
    mode: 1,
    speechiness: 0.1,
    acousticness: 0.1,
    instrumentalness: 0.1,
    liveness: 0.1,
    valence: 0.5,
    tempo: 120,
    duration_ms: 180000,
    time_signature: 4,
  },
  ...overrides,
});

const defaultConfig: MixConfig = {
  bpm_tolerance: 4,
  harmonic_matching: true,
  same_genre: true,
  maintain_energy: true,
  allow_half_double_time: true,
};

describe('Compatibility Scoring', () => {
  describe('compatScore', () => {
    it('should return high score for identical tracks', () => {
      const track1 = createMockTrack();
      const track2 = createMockTrack({ id: '2' });
      
      const score = compatScore(track1, track2, defaultConfig);
      
      expect(score.overall).toBeGreaterThan(0.8);
      expect(score.tempo).toBe(1);
      expect(score.key).toBe(1);
    });

    it('should return lower score for different BPM', () => {
      const track1 = createMockTrack();
      const track2 = createMockTrack({
        id: '2',
        audio_features: {
          ...track1.audio_features!,
          tempo: 140,
        },
      });
      
      const score = compatScore(track1, track2, defaultConfig);
      
      expect(score.tempo).toBeLessThan(1);
    });

    it('should return lower score for different keys', () => {
      const track1 = createMockTrack();
      const track2 = createMockTrack({
        id: '2',
        audio_features: {
          ...track1.audio_features!,
          key: 7, // G major vs C major
        },
      });
      
      const score = compatScore(track1, track2, defaultConfig);
      
      expect(score.key).toBeLessThan(1);
    });

    it('should return lower score for different energy', () => {
      const track1 = createMockTrack();
      const track2 = createMockTrack({
        id: '2',
        audio_features: {
          ...track1.audio_features!,
          energy: 0.9,
        },
      });
      
      const score = compatScore(track1, track2, defaultConfig);
      
      expect(score.energy).toBeLessThan(1);
    });

    it('should handle missing audio features', () => {
      const track1 = createMockTrack();
      const track2 = createMockTrack({ audio_features: undefined });
      
      const score = compatScore(track1, track2, defaultConfig);
      
      expect(score.overall).toBe(0);
    });
  });

  describe('getScoreDescription', () => {
    it('should return excellent for high scores', () => {
      const result = getScoreDescription(0.95);
      expect(result.label).toBe('Excellent');
      expect(result.color).toBe('#4CAF50');
    });

    it('should return very good for good scores', () => {
      const result = getScoreDescription(0.85);
      expect(result.label).toBe('Very Good');
      expect(result.color).toBe('#8BC34A');
    });

    it('should return good for decent scores', () => {
      const result = getScoreDescription(0.75);
      expect(result.label).toBe('Good');
      expect(result.color).toBe('#CDDC39');
    });

    it('should return fair for mediocre scores', () => {
      const result = getScoreDescription(0.65);
      expect(result.label).toBe('Fair');
      expect(result.color).toBe('#FFC107');
    });

    it('should return poor for low scores', () => {
      const result = getScoreDescription(0.45);
      expect(result.label).toBe('Poor');
      expect(result.color).toBe('#FF9800');
    });

    it('should return very poor for very low scores', () => {
      const result = getScoreDescription(0.25);
      expect(result.label).toBe('Very Poor');
      expect(result.color).toBe('#F44336');
    });
  });
});
