import { spotifyAuth } from '../auth/spotify-auth';
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

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

class SpotifyClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const accessToken = await spotifyAuth.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const url = `${SPOTIFY_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Search for tracks
   */
  async searchTracks(
    query: string,
    limit: number = 20,
    offset: number = 0,
    market?: string
  ): Promise<SpotifySearchResponse> {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (market) {
      params.append('market', market);
    }

    return this.makeRequest<SpotifySearchResponse>(`/search?${params}`);
  }

  /**
   * Get track by ID
   */
  async getTrack(trackId: string, market?: string): Promise<SpotifyTrack> {
    const params = market ? `?market=${market}` : '';
    return this.makeRequest<SpotifyTrack>(`/tracks/${trackId}${params}`);
  }

  /**
   * Get multiple tracks by IDs
   */
  async getTracks(trackIds: string[], market?: string): Promise<{ tracks: SpotifyTrack[] }> {
    const params = new URLSearchParams({
      ids: trackIds.join(','),
    });

    if (market) {
      params.append('market', market);
    }

    return this.makeRequest<{ tracks: SpotifyTrack[] }>(`/tracks?${params}`);
  }

  /**
   * Get audio features for a track
   */
  async getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures> {
    return this.makeRequest<SpotifyAudioFeatures>(`/audio-features/${trackId}`);
  }

  /**
   * Get audio features for multiple tracks
   */
  async getMultipleAudioFeatures(trackIds: string[]): Promise<{ audio_features: SpotifyAudioFeatures[] }> {
    const params = new URLSearchParams({
      ids: trackIds.join(','),
    });

    return this.makeRequest<{ audio_features: SpotifyAudioFeatures[] }>(`/audio-features?${params}`);
  }

  /**
   * Get audio analysis for a track
   */
  async getAudioAnalysis(trackId: string): Promise<SpotifyAudioAnalysis> {
    return this.makeRequest<SpotifyAudioAnalysis>(`/audio-analysis/${trackId}`);
  }

  /**
   * Get artist by ID
   */
  async getArtist(artistId: string): Promise<SpotifyArtist> {
    return this.makeRequest<SpotifyArtist>(`/artists/${artistId}`);
  }

  /**
   * Get multiple artists by IDs
   */
  async getArtists(artistIds: string[]): Promise<{ artists: SpotifyArtist[] }> {
    const params = new URLSearchParams({
      ids: artistIds.join(','),
    });

    return this.makeRequest<{ artists: SpotifyArtist[] }>(`/artists?${params}`);
  }

  /**
   * Get track recommendations
   */
  async getRecommendations(params: {
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
  }): Promise<SpotifyRecommendationsResponse> {
    const searchParams = new URLSearchParams();

    // Add seed parameters
    if (params.seed_tracks?.length) {
      searchParams.append('seed_tracks', params.seed_tracks.join(','));
    }
    if (params.seed_artists?.length) {
      searchParams.append('seed_artists', params.seed_artists.join(','));
    }
    if (params.seed_genres?.length) {
      searchParams.append('seed_genres', params.seed_genres.join(','));
    }

    // Add target parameters
    if (params.target_tempo !== undefined) {
      searchParams.append('target_tempo', params.target_tempo.toString());
    }
    if (params.min_tempo !== undefined) {
      searchParams.append('min_tempo', params.min_tempo.toString());
    }
    if (params.max_tempo !== undefined) {
      searchParams.append('max_tempo', params.max_tempo.toString());
    }
    if (params.target_energy !== undefined) {
      searchParams.append('target_energy', params.target_energy.toString());
    }
    if (params.min_energy !== undefined) {
      searchParams.append('min_energy', params.min_energy.toString());
    }
    if (params.max_energy !== undefined) {
      searchParams.append('max_energy', params.max_energy.toString());
    }
    if (params.target_danceability !== undefined) {
      searchParams.append('target_danceability', params.target_danceability.toString());
    }
    if (params.min_danceability !== undefined) {
      searchParams.append('min_danceability', params.min_danceability.toString());
    }
    if (params.max_danceability !== undefined) {
      searchParams.append('max_danceability', params.max_danceability.toString());
    }
    if (params.target_key !== undefined) {
      searchParams.append('target_key', params.target_key.toString());
    }
    if (params.target_mode !== undefined) {
      searchParams.append('target_mode', params.target_mode.toString());
    }
    if (params.target_valence !== undefined) {
      searchParams.append('target_valence', params.target_valence.toString());
    }
    if (params.min_valence !== undefined) {
      searchParams.append('min_valence', params.min_valence.toString());
    }
    if (params.max_valence !== undefined) {
      searchParams.append('max_valence', params.max_valence.toString());
    }

    // Add other parameters
    if (params.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.market) {
      searchParams.append('market', params.market);
    }

    return this.makeRequest<SpotifyRecommendationsResponse>(`/recommendations?${searchParams}`);
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<SpotifyUser> {
    return this.makeRequest<SpotifyUser>('/me');
  }

  /**
   * Create a playlist
   */
  async createPlaylist(
    userId: string,
    name: string,
    description?: string,
    isPublic: boolean = true
  ): Promise<SpotifyPlaylist> {
    return this.makeRequest<SpotifyPlaylist>(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: description || '',
        public: isPublic,
      }),
    });
  }

  /**
   * Add tracks to playlist
   */
  async addTracksToPlaylist(
    playlistId: string,
    trackUris: string[],
    position?: number
  ): Promise<{ snapshot_id: string }> {
    const body: any = {
      uris: trackUris,
    };

    if (position !== undefined) {
      body.position = position;
    }

    return this.makeRequest<{ snapshot_id: string }>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get playlist
   */
  async getPlaylist(playlistId: string, market?: string): Promise<SpotifyPlaylist> {
    const params = market ? `?market=${market}` : '';
    return this.makeRequest<SpotifyPlaylist>(`/playlists/${playlistId}${params}`);
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: SpotifyPlaylist[]; total: number }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.makeRequest<{ items: SpotifyPlaylist[]; total: number }>(
      `/users/${userId}/playlists?${params}`
    );
  }

  /**
   * Get current user's playlists
   */
  async getMyPlaylists(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: SpotifyPlaylist[]; total: number }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.makeRequest<{ items: SpotifyPlaylist[]; total: number }>(
      `/me/playlists?${params}`
    );
  }

  /**
   * Update playlist details
   */
  async updatePlaylist(
    playlistId: string,
    name?: string,
    description?: string,
    isPublic?: boolean
  ): Promise<void> {
    const body: any = {};

    if (name !== undefined) body.name = name;
    if (description !== undefined) body.description = description;
    if (isPublic !== undefined) body.public = isPublic;

    await this.makeRequest(`/playlists/${playlistId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * Remove tracks from playlist
   */
  async removeTracksFromPlaylist(
    playlistId: string,
    trackUris: string[]
  ): Promise<{ snapshot_id: string }> {
    return this.makeRequest<{ snapshot_id: string }>(`/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      body: JSON.stringify({
        tracks: trackUris.map(uri => ({ uri })),
      }),
    });
  }
}

// Export singleton instance
export const spotifyClient = new SpotifyClient();
