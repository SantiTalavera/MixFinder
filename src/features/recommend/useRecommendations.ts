import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRecommendations, useTrackWithFeatures } from '../../api/hooks';
import { useAppStore } from '../state/app-store';
import { Track, MixConfig } from '../../types/domain';
import { compatScore } from '../../lib/scoring';

export function useRecommendations(baseTrack: Track, config: MixConfig) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);

  const {
    setRecommendations,
    setCompatibilityScore,
    clearCompatibilityScores,
  } = useAppStore();

  // Get base track with features
  const {
    data: trackData,
    isLoading: isLoadingTrack,
    error: trackError,
  } = useTrackWithFeatures(baseTrack.id);

  // Get recommendations
  const {
    data: recommendationsData,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useRecommendations({
    seed_tracks: [baseTrack.id],
    target_tempo: baseTrack.audio_features?.tempo,
    target_energy: baseTrack.audio_features?.energy,
    target_danceability: baseTrack.audio_features?.danceability,
    target_key: baseTrack.audio_features?.key,
    target_mode: baseTrack.audio_features?.mode,
    limit: 20,
  });

  // Update recommendations in store and calculate scores
  useEffect(() => {
    if (recommendationsData?.tracks) {
      setRecommendations(recommendationsData.tracks);
      clearCompatibilityScores();
      
      // Calculate compatibility scores for each track
      recommendationsData.tracks.forEach(track => {
        const score = compatScore(baseTrack, track, config);
        setCompatibilityScore(track.id, score);
      });
    }
  }, [recommendationsData, baseTrack, config, setRecommendations, setCompatibilityScore, clearCompatibilityScores]);

  const generateRecommendations = useCallback(async () => {
    try {
      setIsGenerating(true);
      await refetchRecommendations();
    } catch (error) {
      throw new Error('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  }, [refetchRecommendations]);

  const selectTrack = useCallback((track: Track) => {
    setSelectedTracks(prev => {
      const isSelected = prev.some(t => t.id === track.id);
      if (isSelected) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [...prev, track];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTracks([]);
  }, []);

  const recommendations = useMemo(() => {
    return recommendationsData?.tracks || [];
  }, [recommendationsData]);

  const sortedRecommendations = useMemo(() => {
    const scores = useAppStore.getState().compatibilityScores;
    return recommendations
      .map(track => ({
        track,
        score: scores.get(track.id)?.overall || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.track);
  }, [recommendations]);

  const bestRecommendations = useMemo(() => {
    return sortedRecommendations.slice(0, 10);
  }, [sortedRecommendations]);

  const isLoading = isLoadingTrack || isLoadingRecommendations || isGenerating;
  const hasError = trackError || recommendationsError;
  const hasRecommendations = recommendations.length > 0;

  return {
    recommendations: sortedRecommendations,
    bestRecommendations,
    selectedTracks,
    isLoading,
    hasError,
    hasRecommendations,
    generateRecommendations,
    selectTrack,
    clearSelection,
    refetch: refetchRecommendations,
  };
}
