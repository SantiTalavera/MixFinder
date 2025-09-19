import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotifyClient } from './spotify-client';
import {
  SpotifyTrack,
  SpotifyAudioFeatures,
  SpotifyAudioAnalysis,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifySearchResponse,
  SpotifyRecommendationsResponse,
  SpotifyUser,
} from '../types/spotify';

// Query keys
export const queryKeys = {
  user: ['user'] as const,
  tracks: ['tracks'] as const,
  track: (id: string) => ['tracks', id] as const,
  audioFeatures: (id: string) => ['audio-features', id] as const,
  audioAnalysis: (id: string) => ['audio-analysis', id] as const,
  artists: ['artists'] as const,
  artist: (id: string) => ['artists', id] as const,
  search: (query: string, limit?: number, offset?: number) => 
    ['search', query, limit, offset] as const,
  recommendations: (params: any) => ['recommendations', params] as const,
  playlists: ['playlists'] as const,
  playlist: (id: string) => ['playlist', id] as const,
};

// User hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => spotifyClient.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Track hooks
export function useTrack(trackId: string, market?: string) {
  return useQuery({
    queryKey: [...queryKeys.track(trackId), market],
    queryFn: () => spotifyClient.getTrack(trackId, market),
    enabled: !!trackId,
  });
}

export function useTracks(trackIds: string[], market?: string) {
  return useQuery({
    queryKey: [...queryKeys.tracks, trackIds, market],
    queryFn: () => spotifyClient.getTracks(trackIds, market),
    enabled: trackIds.length > 0,
  });
}

export function useAudioFeatures(trackId: string) {
  return useQuery({
    queryKey: queryKeys.audioFeatures(trackId),
    queryFn: () => spotifyClient.getAudioFeatures(trackId),
    enabled: !!trackId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (audio features don't change)
  });
}

export function useAudioAnalysis(trackId: string) {
  return useQuery({
    queryKey: queryKeys.audioAnalysis(trackId),
    queryFn: () => spotifyClient.getAudioAnalysis(trackId),
    enabled: !!trackId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (audio analysis doesn't change)
  });
}

export function useMultipleAudioFeatures(trackIds: string[]) {
  return useQuery({
    queryKey: [...queryKeys.audioFeatures('multiple'), trackIds],
    queryFn: () => spotifyClient.getMultipleAudioFeatures(trackIds),
    enabled: trackIds.length > 0,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Artist hooks
export function useArtist(artistId: string) {
  return useQuery({
    queryKey: queryKeys.artist(artistId),
    queryFn: () => spotifyClient.getArtist(artistId),
    enabled: !!artistId,
  });
}

export function useArtists(artistIds: string[]) {
  return useQuery({
    queryKey: [...queryKeys.artists, artistIds],
    queryFn: () => spotifyClient.getArtists(artistIds),
    enabled: artistIds.length > 0,
  });
}

// Search hooks
export function useSearchTracks(
  query: string,
  limit: number = 20,
  offset: number = 0,
  market?: string
) {
  return useQuery({
    queryKey: queryKeys.search(query, limit, offset),
    queryFn: () => spotifyClient.searchTracks(query, limit, offset, market),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Recommendations hooks
export function useRecommendations(params: {
  seed_tracks?: string[];
  seed_artists?: string[];
  seed_genres?: string[];
  target_tempo?: number;
  min_tempo?: number;
  max_tempo?: number;
  target_energy?: number;
  min_energy?: number;
  max_energy?: number;
  target_danceability?: number;
  min_danceability?: number;
  max_danceability?: number;
  target_key?: number;
  target_mode?: number;
  target_valence?: number;
  min_valence?: number;
  max_valence?: number;
  limit?: number;
  market?: string;
}) {
  return useQuery({
    queryKey: queryKeys.recommendations(params),
    queryFn: () => spotifyClient.getRecommendations(params),
    enabled: !!(params.seed_tracks?.length || params.seed_artists?.length || params.seed_genres?.length),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Playlist hooks
export function usePlaylist(playlistId: string, market?: string) {
  return useQuery({
    queryKey: [...queryKeys.playlist(playlistId), market],
    queryFn: () => spotifyClient.getPlaylist(playlistId, market),
    enabled: !!playlistId,
  });
}

export function useMyPlaylists(limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: [...queryKeys.playlists, 'my', limit, offset],
    queryFn: () => spotifyClient.getMyPlaylists(limit, offset),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserPlaylists(userId: string, limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: [...queryKeys.playlists, 'user', userId, limit, offset],
    queryFn: () => spotifyClient.getUserPlaylists(userId, limit, offset),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutation hooks
export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      userId,
      name,
      description,
      isPublic = true,
    }: {
      userId: string;
      name: string;
      description?: string;
      isPublic?: boolean;
    }) => spotifyClient.createPlaylist(userId, name, description, isPublic),
    onSuccess: () => {
      // Invalidate playlists queries
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
    },
  });
}

export function useAddTracksToPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      playlistId,
      trackUris,
      position,
    }: {
      playlistId: string;
      trackUris: string[];
      position?: number;
    }) => spotifyClient.addTracksToPlaylist(playlistId, trackUris, position),
    onSuccess: (_, variables) => {
      // Invalidate specific playlist
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.playlist(variables.playlistId) 
      });
      // Invalidate playlists list
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      playlistId,
      name,
      description,
      isPublic,
    }: {
      playlistId: string;
      name?: string;
      description?: string;
      isPublic?: boolean;
    }) => spotifyClient.updatePlaylist(playlistId, name, description, isPublic),
    onSuccess: (_, variables) => {
      // Invalidate specific playlist
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.playlist(variables.playlistId) 
      });
      // Invalidate playlists list
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
    },
  });
}

export function useRemoveTracksFromPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      playlistId,
      trackUris,
    }: {
      playlistId: string;
      trackUris: string[];
    }) => spotifyClient.removeTracksFromPlaylist(playlistId, trackUris),
    onSuccess: (_, variables) => {
      // Invalidate specific playlist
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.playlist(variables.playlistId) 
      });
      // Invalidate playlists list
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
    },
  });
}

// Combined hooks for complex operations
export function useTrackWithFeatures(trackId: string) {
  const trackQuery = useTrack(trackId);
  const featuresQuery = useAudioFeatures(trackId);
  const analysisQuery = useAudioAnalysis(trackId);

  return {
    track: trackQuery.data,
    audioFeatures: featuresQuery.data,
    audioAnalysis: analysisQuery.data,
    isLoading: trackQuery.isLoading || featuresQuery.isLoading || analysisQuery.isLoading,
    isError: trackQuery.isError || featuresQuery.isError || analysisQuery.isError,
    error: trackQuery.error || featuresQuery.error || analysisQuery.error,
    refetch: () => {
      trackQuery.refetch();
      featuresQuery.refetch();
      analysisQuery.refetch();
    },
  };
}

export function useTracksWithFeatures(trackIds: string[]) {
  const tracksQuery = useTracks(trackIds);
  const featuresQuery = useMultipleAudioFeatures(trackIds);

  return {
    tracks: tracksQuery.data?.tracks,
    audioFeatures: featuresQuery.data?.audio_features,
    isLoading: tracksQuery.isLoading || featuresQuery.isLoading,
    isError: tracksQuery.isError || featuresQuery.isError,
    error: tracksQuery.error || featuresQuery.error,
    refetch: () => {
      tracksQuery.refetch();
      featuresQuery.refetch();
    },
  };
}
