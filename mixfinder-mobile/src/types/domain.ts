import { SpotifyTrack, SpotifyAudioFeatures, SpotifyAudioAnalysis } from './spotify';

// Domain types for our application
export interface Track {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  uri: string;
  audio_features?: AudioFeatures;
  audio_analysis?: AudioAnalysis;
  artist_genres?: string[];
}

export interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  key: number; // 0-11, -1 if no key detected
  loudness: number;
  mode: number; // 0 = minor, 1 = major
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
}

export interface AudioAnalysis {
  track: {
    duration: number;
    sample_md5: string;
    offset_seconds: number;
    window_seconds: number;
    analysis_sample_rate: number;
    analysis_channels: number;
    end_of_fade_in: number;
    start_of_fade_out: number;
    loudness: number;
    tempo: number;
    tempo_confidence: number;
    time_signature: number;
    time_signature_confidence: number;
    key: number;
    key_confidence: number;
    mode: number;
    mode_confidence: number;
    codestring: string;
    code_version: number;
    echoprintstring: string;
    echoprint_version: number;
    synchstring: string;
    synch_version: number;
    rhythmstring: string;
    rhythm_version: number;
  };
  bars: Array<{
    start: number;
    duration: number;
    confidence: number;
  }>;
  beats: Array<{
    start: number;
    duration: number;
    confidence: number;
  }>;
  sections: Array<{
    start: number;
    duration: number;
    confidence: number;
    loudness: number;
    tempo: number;
    tempo_confidence: number;
    key: number;
    key_confidence: number;
    mode: number;
    mode_confidence: number;
    time_signature: number;
    time_signature_confidence: number;
  }>;
  segments: Array<{
    start: number;
    duration: number;
    confidence: number;
    loudness_start: number;
    loudness_max: number;
    loudness_max_time: number;
    loudness_end: number;
    pitches: number[];
    timbre: number[];
  }>;
  tatums: Array<{
    start: number;
    duration: number;
    confidence: number;
  }>;
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
  from: Track;
  to: Track;
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

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  tracks: Track[];
  transitions: TransitionPlan[];
  created_at: string;
  spotify_url: string;
}

export interface SearchResult {
  tracks: Track[];
  total: number;
  query: string;
}

export interface RecommendationRequest {
  seed_tracks: string[];
  target_tempo?: number;
  min_energy?: number;
  max_energy?: number;
  min_danceability?: number;
  max_danceability?: number;
  target_key?: number;
  target_mode?: number;
  seed_genres?: string[];
  limit?: number;
}

export interface RecommendationResult {
  tracks: Track[];
  seeds: Array<{
    initialPoolSize: number;
    afterFilteringSize: number;
    afterRelinkingSize: number;
    id: string;
    type: string;
    href: string;
  }>;
}

// UI State types
export interface AppState {
  isAuthenticated: boolean;
  user: {
    id: string;
    display_name: string | null;
    email?: string;
  } | null;
  currentTrack: Track | null;
  searchResults: SearchResult | null;
  recommendations: RecommendationResult | null;
  playlist: Playlist | null;
  mixConfig: MixConfig;
  loading: {
    search: boolean;
    recommendations: boolean;
    playlist: boolean;
  };
  error: string | null;
}

// Navigation types
export type RootStackParamList = {
  Search: undefined;
  Suggestions: {
    baseTrack: Track;
  };
  MixConfig: {
    playlist: Playlist;
  };
  Settings: undefined;
};

export type TabParamList = {
  SearchTab: undefined;
  PlaylistTab: undefined;
  SettingsTab: undefined;
};
