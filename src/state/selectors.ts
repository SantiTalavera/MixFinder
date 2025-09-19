import { useAppStore } from './app-store';
import { Track, CompatibilityScore, TransitionPlan } from '../types/domain';

// Basic selectors
export const useCurrentTrack = () => useAppStore((state) => state.currentTrack);
export const useSearchResults = () => useAppStore((state) => state.searchResults);
export const useRecommendations = () => useAppStore((state) => state.recommendations);
export const usePlaylist = () => useAppStore((state) => state.playlist);
export const useMixConfig = () => useAppStore((state) => state.mixConfig);
export const useTransitionPlans = () => useAppStore((state) => state.transitionPlans);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useSearchQuery = () => useAppStore((state) => state.searchQuery);
export const useSelectedTracks = () => useAppStore((state) => state.selectedTracks);

// Action selectors
export const useAppActions = () => useAppStore((state) => ({
  setCurrentTrack: state.setCurrentTrack,
  setSearchResults: state.setSearchResults,
  setRecommendations: state.setRecommendations,
  setPlaylist: state.setPlaylist,
  updateMixConfig: state.updateMixConfig,
  setCompatibilityScore: state.setCompatibilityScore,
  clearCompatibilityScores: state.clearCompatibilityScores,
  setTransitionPlans: state.setTransitionPlans,
  setIsLoading: state.setIsLoading,
  setError: state.setError,
  setSearchQuery: state.setSearchQuery,
  addSelectedTrack: state.addSelectedTrack,
  removeSelectedTrack: state.removeSelectedTrack,
  clearSelectedTracks: state.clearSelectedTracks,
  reset: state.reset,
}));

// Computed selectors
export const useCompatibilityScores = () => useAppStore((state) => state.compatibilityScores);

export const useTrackCompatibilityScore = (trackId: string) => 
  useAppStore((state) => state.compatibilityScores.get(trackId));

export const useSortedRecommendations = () => 
  useAppStore((state) => {
    const recommendations = state.recommendations;
    const scores = state.compatibilityScores;
    
    return recommendations
      .map(track => ({
        track,
        score: scores.get(track.id)?.overall || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.track);
  });

export const useBestRecommendations = (limit: number = 10) => 
  useAppStore((state) => {
    const recommendations = state.recommendations;
    const scores = state.compatibilityScores;
    
    return recommendations
      .map(track => ({
        track,
        score: scores.get(track.id)?.overall || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.track);
  });

export const useRecommendationsWithScores = () => 
  useAppStore((state) => {
    const recommendations = state.recommendations;
    const scores = state.compatibilityScores;
    
    return recommendations.map(track => ({
      track,
      score: scores.get(track.id) || {
        overall: 0,
        tempo: 0,
        key: 0,
        energy: 0,
        danceability: 0,
        genre: 0,
      },
    }));
  });

export const usePlaylistTracks = () => 
  useAppStore((state) => state.playlist?.tracks || []);

export const usePlaylistTransitions = () => 
  useAppStore((state) => state.playlist?.transitions || []);

export const useHasCurrentTrack = () => 
  useAppStore((state) => state.currentTrack !== null);

export const useHasRecommendations = () => 
  useAppStore((state) => state.recommendations.length > 0);

export const useHasPlaylist = () => 
  useAppStore((state) => state.playlist !== null);

export const useSelectedTrackIds = () => 
  useAppStore((state) => state.selectedTracks.map(track => track.id));

export const useIsTrackSelected = (trackId: string) => 
  useAppStore((state) => state.selectedTracks.some(track => track.id === trackId));

export const useSelectedTracksCount = () => 
  useAppStore((state) => state.selectedTracks.length);

// Complex selectors
export const usePlaylistSummary = () => 
  useAppStore((state) => {
    const playlist = state.playlist;
    if (!playlist) return null;
    
    const tracks = playlist.tracks;
    const transitions = playlist.transitions;
    
    const totalDuration = tracks.reduce((sum, track) => sum + track.duration_ms, 0);
    const avgBPM = tracks
      .filter(track => track.audio_features?.tempo)
      .reduce((sum, track, _, arr) => sum + (track.audio_features!.tempo / arr.length), 0);
    
    const genres = new Set<string>();
    tracks.forEach(track => {
      track.artist_genres?.forEach(genre => genres.add(genre));
    });
    
    return {
      trackCount: tracks.length,
      totalDuration,
      avgBPM: Math.round(avgBPM),
      genres: Array.from(genres),
      transitionCount: transitions.length,
      avgCompatibilityScore: transitions.length > 0 
        ? transitions.reduce((sum, t) => sum + t.compatibility_score, 0) / transitions.length
        : 0,
    };
  });

export const useMixConfigSummary = () => 
  useAppStore((state) => {
    const config = state.mixConfig;
    
    return {
      bpmTolerance: `${config.bpm_tolerance} BPM`,
      harmonicMatching: config.harmonic_matching ? 'Enabled' : 'Disabled',
      sameGenre: config.same_genre ? 'Required' : 'Optional',
      maintainEnergy: config.maintain_energy ? 'Yes' : 'No',
      allowHalfDoubleTime: config.allow_half_double_time ? 'Yes' : 'No',
    };
  });

export const useAppStatus = () => 
  useAppStore((state) => ({
    hasCurrentTrack: state.currentTrack !== null,
    hasSearchResults: state.searchResults.length > 0,
    hasRecommendations: state.recommendations.length > 0,
    hasPlaylist: state.playlist !== null,
    hasSelectedTracks: state.selectedTracks.length > 0,
    isLoading: state.isLoading,
    hasError: state.error !== null,
  }));

// Filter selectors
export const useFilteredRecommendations = (minScore: number = 0) => 
  useAppStore((state) => {
    const recommendations = state.recommendations;
    const scores = state.compatibilityScores;
    
    return recommendations.filter(track => {
      const score = scores.get(track.id)?.overall || 0;
      return score >= minScore;
    });
  });

export const useRecommendationsByGenre = (genre: string) => 
  useAppStore((state) => {
    const recommendations = state.recommendations;
    
    return recommendations.filter(track => 
      track.artist_genres?.some(g => 
        g.toLowerCase().includes(genre.toLowerCase())
      )
    );
  });

export const useRecommendationsByBPM = (targetBPM: number, tolerance: number = 4) => 
  useAppStore((state) => {
    const recommendations = state.recommendations;
    
    return recommendations.filter(track => {
      const trackBPM = track.audio_features?.tempo;
      if (!trackBPM) return false;
      
      const diff = Math.abs(trackBPM - targetBPM);
      return diff <= tolerance;
    });
  });
