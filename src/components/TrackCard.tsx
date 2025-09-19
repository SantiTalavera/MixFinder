import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Track } from '../types/domain';
import { theme } from '../theme/theme';
import { toCamelot } from '../lib/camelot';
import { getScoreDescription } from '../lib/scoring';

interface TrackCardProps {
  track: Track;
  compatibilityScore?: number;
  onPress?: (track: Track) => void;
  onSelect?: (track: Track) => void;
  isSelected?: boolean;
  showCompatibility?: boolean;
  showAudioFeatures?: boolean;
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = width - theme.spacing.screen.padding * 2;

export function TrackCard({
  track,
  compatibilityScore,
  onPress,
  onSelect,
  isSelected = false,
  showCompatibility = false,
  showAudioFeatures = false,
  style,
}: TrackCardProps) {
  const features = track.audio_features;
  const camelot = features ? toCamelot(features.key, features.mode as 0 | 1) : 'Unknown';
  const scoreInfo = compatibilityScore ? getScoreDescription(compatibilityScore) : null;

  const handlePress = () => {
    onPress?.(track);
  };

  const handleSelect = () => {
    onSelect?.(track);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Album Art */}
        <View style={styles.albumArtContainer}>
          <Image
            source={{ uri: track.album.images[0]?.url }}
            style={styles.albumArt}
            resizeMode="cover"
          />
          {isSelected && (
            <View style={styles.selectedOverlay}>
              <View style={styles.selectedIndicator} />
            </View>
          )}
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={2}>
            {track.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {track.artists.map(artist => artist.name).join(', ')}
          </Text>
          <Text style={styles.albumName} numberOfLines={1}>
            {track.album.name}
          </Text>
        </View>

        {/* Audio Features */}
        {showAudioFeatures && features && (
          <View style={styles.audioFeatures}>
            <View style={styles.featureRow}>
              <Text style={styles.bpmText}>{Math.round(features.tempo)} BPM</Text>
              <Text style={styles.camelotText}>{camelot}</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.energyText}>
                Energy: {Math.round(features.energy * 100)}%
              </Text>
              <Text style={styles.danceabilityText}>
                Dance: {Math.round(features.danceability * 100)}%
              </Text>
            </View>
          </View>
        )}

        {/* Compatibility Score */}
        {showCompatibility && scoreInfo && (
          <View style={styles.compatibilityContainer}>
            <View style={[styles.scoreBadge, { backgroundColor: scoreInfo.color }]}>
              <Text style={styles.scoreText}>
                {Math.round(compatibilityScore * 100)}%
              </Text>
            </View>
            <Text style={styles.scoreLabel}>{scoreInfo.label}</Text>
          </View>
        )}

        {/* Select Button */}
        {onSelect && (
          <TouchableOpacity
            style={[
              styles.selectButton,
              isSelected && styles.selectButtonSelected,
            ]}
            onPress={handleSelect}
          >
            <Text style={[
              styles.selectButtonText,
              isSelected && styles.selectButtonTextSelected,
            ]}>
              {isSelected ? '✓' : '+'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.md,
  },
  selected: {
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  content: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  albumArtContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay.medium,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  trackName: {
    ...theme.typography.textStyles.trackTitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  artistName: {
    ...theme.typography.textStyles.trackArtist,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  albumName: {
    ...theme.typography.textStyles.trackAlbum,
    color: theme.colors.text.tertiary,
  },
  audioFeatures: {
    marginRight: theme.spacing.sm,
    minWidth: 100,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  bpmText: {
    ...theme.typography.textStyles.bpm,
    color: theme.colors.text.primary,
  },
  camelotText: {
    ...theme.typography.textStyles.camelot,
    color: theme.colors.camelot.major,
  },
  energyText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
  },
  danceabilityText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
  },
  compatibilityContainer: {
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  scoreText: {
    ...theme.typography.textStyles.score,
    color: theme.colors.white,
  },
  scoreLabel: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  selectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonSelected: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  selectButtonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.text.primary,
  },
  selectButtonTextSelected: {
    color: theme.colors.white,
  },
});
