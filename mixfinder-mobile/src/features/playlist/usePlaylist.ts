import { useState, useCallback, useEffect } from 'react';
import { useCreatePlaylist, useAddTracksToPlaylist, useUpdatePlaylist } from '../../api/hooks';
import { useAuth } from '../../auth/auth-context';
import { useAppStore } from '../../state/app-store';
import { Track, Playlist, TransitionPlan } from '../../types/domain';
import { orderTracks } from '../../lib/analysis';

export function usePlaylist(initialPlaylist?: Playlist) {
  const { user } = useAuth();
  const { mixConfig, setPlaylist, setTransitionPlans } = useAppStore();
  
  const [playlist, setPlaylistState] = useState<Playlist>(
    initialPlaylist || {
      id: '',
      name: '',
      description: '',
      tracks: [],
      transitions: [],
      created_at: new Date().toISOString(),
      spotify_url: '',
    }
  );
  
  const [orderedTracks, setOrderedTracks] = useState<Track[]>([]);
  const [transitions, setTransitions] = useState<TransitionPlan[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const createPlaylistMutation = useCreatePlaylist();
  const addTracksMutation = useAddTracksToPlaylist();
  const updatePlaylistMutation = useUpdatePlaylist();

  // Order tracks for optimal mixing
  useEffect(() => {
    if (playlist.tracks.length > 1) {
      const baseTrack = playlist.tracks[0];
      const candidates = playlist.tracks.slice(1);
      
      const { ordered, transitions: transitionPlans } = orderTracks(
        baseTrack,
        candidates,
        mixConfig
      );
      
      setOrderedTracks(ordered);
      setTransitions(transitionPlans);
      setTransitionPlans(transitionPlans);
    } else {
      setOrderedTracks(playlist.tracks);
      setTransitions([]);
    }
  }, [playlist.tracks, mixConfig, setTransitionPlans]);

  const createPlaylist = useCallback(async (name: string, description?: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newPlaylist = await createPlaylistMutation.mutateAsync({
      userId: user.id,
      name,
      description: description || '',
      isPublic: true,
    });

    return newPlaylist;
  }, [user, createPlaylistMutation]);

  const addTracksToPlaylist = useCallback(async (playlistId: string, tracks: Track[]) => {
    const trackUris = tracks.map(track => track.uri);
    await addTracksMutation.mutateAsync({
      playlistId,
      trackUris,
    });
  }, [addTracksMutation]);

  const updatePlaylistDetails = useCallback(async (
    playlistId: string,
    name?: string,
    description?: string,
    isPublic?: boolean
  ) => {
    await updatePlaylistMutation.mutateAsync({
      playlistId,
      name,
      description,
      isPublic,
    });
  }, [updatePlaylistMutation]);

  const createSpotifyPlaylist = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsCreating(true);

      // Create playlist
      const newPlaylist = await createPlaylist(playlist.name, playlist.description);

      // Add tracks in order
      await addTracksToPlaylist(newPlaylist.id, orderedTracks);

      // Update playlist with Spotify data
      const updatedPlaylist: Playlist = {
        ...playlist,
        id: newPlaylist.id,
        spotify_url: newPlaylist.external_urls.spotify,
        tracks: orderedTracks,
        transitions,
      };

      setPlaylist(updatedPlaylist);
      setPlaylistState(updatedPlaylist);

      return updatedPlaylist;
    } finally {
      setIsCreating(false);
    }
  }, [user, playlist, orderedTracks, transitions, createPlaylist, addTracksToPlaylist, setPlaylist]);

  const addTrack = useCallback((track: Track) => {
    setPlaylistState(prev => ({
      ...prev,
      tracks: [...prev.tracks, track],
    }));
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    setPlaylistState(prev => ({
      ...prev,
      tracks: prev.tracks.filter(track => track.id !== trackId),
    }));
  }, []);

  const updatePlaylistInfo = useCallback((updates: Partial<Pick<Playlist, 'name' | 'description'>>) => {
    setPlaylistState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylistState({
      id: '',
      name: '',
      description: '',
      tracks: [],
      transitions: [],
      created_at: new Date().toISOString(),
      spotify_url: '',
    });
    setOrderedTracks([]);
    setTransitions([]);
  }, []);

  const playlistSummary = {
    trackCount: orderedTracks.length,
    totalDuration: orderedTracks.reduce((sum, track) => sum + track.duration_ms, 0),
    avgBPM: orderedTracks
      .filter(track => track.audio_features?.tempo)
      .reduce((sum, track, _, arr) => sum + (track.audio_features!.tempo / arr.length), 0),
    genres: Array.from(new Set(
      orderedTracks.flatMap(track => track.artist_genres || [])
    )),
    transitionCount: transitions.length,
    avgCompatibilityScore: transitions.length > 0 
      ? transitions.reduce((sum, t) => sum + t.compatibility_score, 0) / transitions.length
      : 0,
  };

  return {
    playlist,
    orderedTracks,
    transitions,
    isCreating,
    playlistSummary,
    createSpotifyPlaylist,
    addTrack,
    removeTrack,
    updatePlaylistInfo,
    clearPlaylist,
    createPlaylist,
    addTracksToPlaylist,
    updatePlaylistDetails,
  };
}
