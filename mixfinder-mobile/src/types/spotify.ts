import { z } from 'zod';

// Spotify API Response Schemas
export const SpotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  album: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(z.object({
      url: z.string(),
      height: z.number(),
      width: z.number(),
    })),
  }),
  duration_ms: z.number(),
  preview_url: z.string().nullable(),
  external_urls: z.object({
    spotify: z.string(),
  }),
  uri: z.string(),
});

export const SpotifyAudioFeaturesSchema = z.object({
  id: z.string(),
  danceability: z.number(),
  energy: z.number(),
  key: z.number(), // 0-11, -1 if no key detected
  loudness: z.number(),
  mode: z.number(), // 0 = minor, 1 = major
  speechiness: z.number(),
  acousticness: z.number(),
  instrumentalness: z.number(),
  liveness: z.number(),
  valence: z.number(),
  tempo: z.number(),
  duration_ms: z.number(),
  time_signature: z.number(),
});

export const SpotifyAudioAnalysisSchema = z.object({
  track: z.object({
    duration: z.number(),
    sample_md5: z.string(),
    offset_seconds: z.number(),
    window_seconds: z.number(),
    analysis_sample_rate: z.number(),
    analysis_channels: z.number(),
    end_of_fade_in: z.number(),
    start_of_fade_out: z.number(),
    loudness: z.number(),
    tempo: z.number(),
    tempo_confidence: z.number(),
    time_signature: z.number(),
    time_signature_confidence: z.number(),
    key: z.number(),
    key_confidence: z.number(),
    mode: z.number(),
    mode_confidence: z.number(),
    codestring: z.string(),
    code_version: z.number(),
    echoprintstring: z.string(),
    echoprint_version: z.number(),
    synchstring: z.string(),
    synch_version: z.number(),
    rhythmstring: z.string(),
    rhythm_version: z.number(),
  }),
  bars: z.array(z.object({
    start: z.number(),
    duration: z.number(),
    confidence: z.number(),
  })),
  beats: z.array(z.object({
    start: z.number(),
    duration: z.number(),
    confidence: z.number(),
  })),
  sections: z.array(z.object({
    start: z.number(),
    duration: z.number(),
    confidence: z.number(),
    loudness: z.number(),
    tempo: z.number(),
    tempo_confidence: z.number(),
    key: z.number(),
    key_confidence: z.number(),
    mode: z.number(),
    mode_confidence: z.number(),
    time_signature: z.number(),
    time_signature_confidence: z.number(),
  })),
  segments: z.array(z.object({
    start: z.number(),
    duration: z.number(),
    confidence: z.number(),
    loudness_start: z.number(),
    loudness_max: z.number(),
    loudness_max_time: z.number(),
    loudness_end: z.number(),
    pitches: z.array(z.number()),
    timbre: z.array(z.number()),
  })),
  tatums: z.array(z.object({
    start: z.number(),
    duration: z.number(),
    confidence: z.number(),
  })),
});

export const SpotifyArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  genres: z.array(z.string()),
  popularity: z.number(),
});

export const SpotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  external_urls: z.object({
    spotify: z.string(),
  }),
  tracks: z.object({
    total: z.number(),
  }),
});

export const SpotifySearchResponseSchema = z.object({
  tracks: z.object({
    items: z.array(SpotifyTrackSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
});

export const SpotifyRecommendationsResponseSchema = z.object({
  tracks: z.array(SpotifyTrackSchema),
  seeds: z.array(z.object({
    initialPoolSize: z.number(),
    afterFilteringSize: z.number(),
    afterRelinkingSize: z.number(),
    id: z.string(),
    type: z.string(),
    href: z.string(),
  })),
});

export const SpotifyUserSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  email: z.string().optional(),
  country: z.string(),
  product: z.string(),
});

// Type exports
export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;
export type SpotifyAudioFeatures = z.infer<typeof SpotifyAudioFeaturesSchema>;
export type SpotifyAudioAnalysis = z.infer<typeof SpotifyAudioAnalysisSchema>;
export type SpotifyArtist = z.infer<typeof SpotifyArtistSchema>;
export type SpotifyPlaylist = z.infer<typeof SpotifyPlaylistSchema>;
export type SpotifySearchResponse = z.infer<typeof SpotifySearchResponseSchema>;
export type SpotifyRecommendationsResponse = z.infer<typeof SpotifyRecommendationsResponseSchema>;
export type SpotifyUser = z.infer<typeof SpotifyUserSchema>;

// Extended types for our app
export interface TrackWithFeatures extends SpotifyTrack {
  audio_features?: SpotifyAudioFeatures;
  audio_analysis?: SpotifyAudioAnalysis;
  artist_genres?: string[];
}

export interface CompatibilityScore {
  overall: number;
  tempo: number;
  key: number;
  energy: number;
  danceability: number;
  genre: number;
}

export interface TransitionPlan {
  from: TrackWithFeatures;
  to: TrackWithFeatures;
  offset_seconds: number;
  bars: number;
  key_note: string;
  compatibility_score: number;
}

export interface MixConfig {
  bpm_tolerance: number;
  harmonic_matching: boolean;
  same_genre: boolean;
  maintain_energy: boolean;
  allow_half_double_time: boolean;
}
