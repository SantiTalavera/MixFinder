import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useRecommendations, useTrackWithFeatures } from '../api/hooks';
import { useAppStore } from '../state/app-store';
import { TrackCard } from '../components/TrackCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { Slider } from '../components/Slider';
import { Toggle } from '../components/Toggle';
import { SkeletonLoader, ListSkeleton } from '../components/SkeletonLoader';
import { theme } from '../theme/theme';
import { Track, MixConfig } from '../types/domain';
import { RootStackParamList } from '../types/domain';
import { compatScore } from '../lib/scoring';

type SuggestionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Suggestions'>;
type SuggestionsScreenRouteProp = RouteProp<RootStackParamList, 'Suggestions'>;

export function SuggestionsScreen() {
  const navigation = useNavigation<SuggestionsScreenNavigationProp>();
  const route = useRoute<SuggestionsScreenRouteProp>();
  const { baseTrack } = route.params;

  const {
    mixConfig,
    updateMixConfig,
    setRecommendations,
    setCompatibilityScore,
    clearCompatibilityScores,
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);

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

  // Update recommendations in store
  useEffect(() => {
    if (recommendationsData?.tracks) {
      setRecommendations(recommendationsData.tracks);
      clearCompatibilityScores();
      
      // Calculate compatibility scores
      recommendationsData.tracks.forEach(track => {
        const score = compatScore(baseTrack, track, mixConfig);
        setCompatibilityScore(track.id, score);
      });
    }
  }, [recommendationsData, baseTrack, mixConfig, setRecommendations, setCompatibilityScore, clearCompatibilityScores]);

  const handleGenerateSuggestions = useCallback(async () => {
    try {
      setIsGenerating(true);
      await refetchRecommendations();
    } catch (error) {
      Alert.alert('Error', 'Failed to generate suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [refetchRecommendations]);

  const handleTrackSelect = useCallback((track: Track) => {
    setSelectedTracks(prev => {
      const isSelected = prev.some(t => t.id === track.id);
      if (isSelected) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [...prev, track];
      }
    });
  }, []);

  const handleCreatePlaylist = useCallback(() => {
    if (selectedTracks.length === 0) {
      Alert.alert('No Tracks Selected', 'Please select at least one track to create a playlist.');
      return;
    }

    // Navigate to mix config screen with selected tracks
    navigation.navigate('MixConfig', {
      playlist: {
        id: '',
        name: `MixFinder - ${baseTrack.name}`,
        description: `Generated playlist based on ${baseTrack.name}`,
        tracks: [baseTrack, ...selectedTracks],
        transitions: [],
        created_at: new Date().toISOString(),
        spotify_url: '',
      },
    });
  }, [selectedTracks, baseTrack, navigation]);

  const renderTrack = useCallback(({ item }: { item: Track }) => {
    const isSelected = selectedTracks.some(t => t.id === item.id);
    const compatibilityScore = useAppStore.getState().compatibilityScores.get(item.id);
    
    return (
      <TrackCard
        track={item}
        compatibilityScore={compatibilityScore?.overall}
        onSelect={handleTrackSelect}
        isSelected={isSelected}
        showCompatibility={true}
        showAudioFeatures={true}
        style={styles.trackCard}
      />
    );
  }, [selectedTracks, handleTrackSelect]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.baseTrackInfo}>
        <Text style={styles.baseTrackTitle}>Base Track</Text>
        <Text style={styles.baseTrackName}>{baseTrack.name}</Text>
        <Text style={styles.baseTrackArtist}>
          {baseTrack.artists.map(artist => artist.name).join(', ')}
        </Text>
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configTitle}>Mix Configuration</Text>
        
        <Slider
          value={mixConfig.bpm_tolerance}
          minimumValue={1}
          maximumValue={20}
          step={1}
          onValueChange={(value) => updateMixConfig({ bpm_tolerance: value })}
          label="BPM Tolerance"
          unit="BPM"
        />

        <Toggle
          value={mixConfig.harmonic_matching}
          onValueChange={(value) => updateMixConfig({ harmonic_matching: value })}
          label="Harmonic Matching"
          description="Match tracks with compatible musical keys"
        />

        <Toggle
          value={mixConfig.same_genre}
          onValueChange={(value) => updateMixConfig({ same_genre: value })}
          label="Same Genre"
          description="Prefer tracks from similar genres"
        />

        <Toggle
          value={mixConfig.maintain_energy}
          onValueChange={(value) => updateMixConfig({ maintain_energy: value })}
          label="Maintain Energy"
          description="Keep similar energy levels"
        />

        <Toggle
          value={mixConfig.allow_half_double_time}
          onValueChange={(value) => updateMixConfig({ allow_half_double_time: value })}
          label="Allow Half/Double Time"
          description="Include tracks with 2:1 BPM ratios"
        />

        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerateSuggestions}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <LoadingSpinner size="small" color={theme.colors.white} />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color={theme.colors.white} />
              <Text style={styles.generateButtonText}>Generate Suggestions</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.suggestionsHeader}>
        <Text style={styles.suggestionsTitle}>
          Compatible Tracks ({selectedTracks.length} selected)
        </Text>
        {selectedTracks.length > 0 && (
          <TouchableOpacity
            style={styles.createPlaylistButton}
            onPress={handleCreatePlaylist}
          >
            <Text style={styles.createPlaylistButtonText}>Create Playlist</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (isLoadingRecommendations || isGenerating) {
      return <ListSkeleton count={5} />;
    }

    if (recommendationsError) {
      return (
        <ErrorView
          title="Failed to Load Suggestions"
          message="Unable to get track suggestions. Please try again."
          onRetry={handleGenerateSuggestions}
        />
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="musical-notes" size={64} color={theme.colors.text.tertiary} />
        <Text style={styles.emptyStateTitle}>No Suggestions Yet</Text>
        <Text style={styles.emptyStateMessage}>
          Tap "Generate Suggestions" to find compatible tracks for your mix.
        </Text>
      </View>
    );
  };

  if (isLoadingTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading track details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (trackError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView
          title="Failed to Load Track"
          message="Unable to load track details. Please try again."
          onRetry={() => navigation.goBack()}
          retryText="Go Back"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recommendationsData?.tracks || []}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  listContainer: {
    flexGrow: 1,
  },
  header: {
    padding: theme.spacing.md,
  },
  baseTrackInfo: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  baseTrackTitle: {
    ...theme.typography.textStyles.label,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  baseTrackName: {
    ...theme.typography.textStyles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  baseTrackArtist: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
  configSection: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  configTitle: {
    ...theme.typography.textStyles.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  generateButton: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  suggestionsTitle: {
    ...theme.typography.textStyles.h5,
    color: theme.colors.text.primary,
  },
  createPlaylistButton: {
    backgroundColor: theme.colors.accent.blue,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  createPlaylistButtonText: {
    ...theme.typography.textStyles.buttonSmall,
    color: theme.colors.white,
  },
  trackCard: {
    marginHorizontal: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateTitle: {
    ...theme.typography.textStyles.h4,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
