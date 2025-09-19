import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useCreatePlaylist, useAddTracksToPlaylist } from '../api/hooks';
import { useAppStore } from '../state/app-store';
import { useAuth } from '../auth/auth-context';
import { TrackCard } from '../components/TrackCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { theme } from '../theme/theme';
import { Track, Playlist, TransitionPlan } from '../types/domain';
import { RootStackParamList } from '../types/domain';
import { orderTracks } from '../lib/analysis';
import { toCamelot } from '../lib/camelot';

type MixConfigScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MixConfig'>;
type MixConfigScreenRouteProp = RouteProp<RootStackParamList, 'MixConfig'>;

export function MixConfigScreen() {
  const navigation = useNavigation<MixConfigScreenNavigationProp>();
  const route = useRoute<MixConfigScreenRouteProp>();
  const { playlist: initialPlaylist } = route.params;

  const { user } = useAuth();
  const { mixConfig, setPlaylist, setTransitionPlans } = useAppStore();
  
  const [playlist, setPlaylistState] = useState<Playlist>(initialPlaylist);
  const [orderedTracks, setOrderedTracks] = useState<Track[]>([]);
  const [transitions, setTransitions] = useState<TransitionPlan[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const createPlaylistMutation = useCreatePlaylist();
  const addTracksMutation = useAddTracksToPlaylist();

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

  const handleCreateSpotifyPlaylist = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsCreating(true);

      // Create playlist
      const newPlaylist = await createPlaylistMutation.mutateAsync({
        userId: user.id,
        name: playlist.name,
        description: playlist.description || '',
        isPublic: true,
      });

      // Add tracks in order
      const trackUris = orderedTracks.map(track => track.uri);
      await addTracksMutation.mutateAsync({
        playlistId: newPlaylist.id,
        trackUris,
      });

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

      Alert.alert(
        'Success!',
        'Playlist created successfully in Spotify!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create playlist in Spotify. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  }, [user, playlist, orderedTracks, transitions, createPlaylistMutation, addTracksMutation, setPlaylist, navigation]);

  const renderTrack = useCallback(({ item, index }: { item: Track; index: number }) => (
    <View style={styles.trackContainer}>
      <View style={styles.trackNumber}>
        <Text style={styles.trackNumberText}>{index + 1}</Text>
      </View>
      <TrackCard
        track={item}
        showAudioFeatures={true}
        style={styles.trackCard}
      />
    </View>
  ), []);

  const renderTransition = useCallback(({ item, index }: { item: TransitionPlan; index: number }) => (
    <View style={styles.transitionContainer}>
      <View style={styles.transitionHeader}>
        <Text style={styles.transitionTitle}>
          Transition {index + 1}: {item.from.name} → {item.to.name}
        </Text>
        <View style={styles.compatibilityBadge}>
          <Text style={styles.compatibilityText}>
            {Math.round(item.compatibility_score * 100)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.transitionDetails}>
        <View style={styles.transitionDetail}>
          <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.transitionDetailText}>
            Start at {Math.round(item.offset_seconds)}s
          </Text>
        </View>
        
        <View style={styles.transitionDetail}>
          <Ionicons name="musical-notes" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.transitionDetailText}>
            {item.bars} bars
          </Text>
        </View>
        
        <View style={styles.transitionDetail}>
          <Ionicons name="key" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.transitionDetailText}>
            Key: {item.key_note}
          </Text>
        </View>
      </View>
    </View>
  ), []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{playlist.name}</Text>
        <Text style={styles.playlistDescription}>{playlist.description}</Text>
        <Text style={styles.playlistStats}>
          {orderedTracks.length} tracks • {Math.round(playlist.tracks.reduce((sum, track) => sum + track.duration_ms, 0) / 1000 / 60)} min
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.createButton, isCreating && styles.createButtonDisabled]}
        onPress={handleCreateSpotifyPlaylist}
        disabled={isCreating}
      >
        {isCreating ? (
          <LoadingSpinner size="small" color={theme.colors.white} />
        ) : (
          <>
            <Ionicons name="add-circle" size={20} color={theme.colors.white} />
            <Text style={styles.createButtonText}>Create in Spotify</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderMixGuide = () => (
    <View style={styles.mixGuide}>
      <Text style={styles.mixGuideTitle}>Spotify Mix Setup Guide</Text>
      
      <View style={styles.guideStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>1</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Enable Crossfade</Text>
          <Text style={styles.stepDescription}>
            Go to Settings → Playback → Crossfade and set it to 6-12 seconds
          </Text>
        </View>
      </View>

      <View style={styles.guideStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Enable Gapless Playback</Text>
          <Text style={styles.stepDescription}>
            Make sure "Gapless Playback" is enabled in Settings → Playback
          </Text>
        </View>
      </View>

      <View style={styles.guideStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>3</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Use Automix (if available)</Text>
          <Text style={styles.stepDescription}>
            Enable "Automix" in playlist settings for smoother transitions
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track Order</Text>
          <FlatList
            data={orderedTracks}
            renderItem={renderTrack}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        {transitions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transition Plan</Text>
            <FlatList
              data={transitions}
              renderItem={renderTransition}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        )}

        {renderMixGuide()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  playlistInfo: {
    marginBottom: theme.spacing.md,
  },
  playlistName: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  playlistDescription: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  playlistStats: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.tertiary,
  },
  createButton: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.textStyles.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  trackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  trackNumberText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.white,
  },
  trackCard: {
    flex: 1,
  },
  separator: {
    height: theme.spacing.sm,
  },
  transitionContainer: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  transitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  transitionTitle: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    flex: 1,
  },
  compatibilityBadge: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  compatibilityText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.white,
    fontWeight: '600',
  },
  transitionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transitionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transitionDetailText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  mixGuide: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  mixGuideTitle: {
    ...theme.typography.textStyles.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  stepNumberText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.white,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
});
