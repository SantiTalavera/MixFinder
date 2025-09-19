import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useSearchTracks, useTrackWithFeatures } from '../api/hooks';
import { useAppStore } from '../state/app-store';
import { TrackCard } from '../components/TrackCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { SkeletonLoader, ListSkeleton } from '../components/SkeletonLoader';
import { theme } from '../theme/theme';
import { Track } from '../types/domain';
import { RootStackParamList } from '../types/domain';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

export function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const { setCurrentTrack, setSearchResults } = useAppStore();

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search tracks
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchTracks(debouncedQuery, 20, 0);

  // Update search results in store
  React.useEffect(() => {
    if (searchData?.tracks?.items) {
      setSearchResults(searchData.tracks.items);
    }
  }, [searchData, setSearchResults]);

  const handleTrackPress = useCallback((track: Track) => {
    setCurrentTrack(track);
    navigation.navigate('Suggestions', { baseTrack: track });
  }, [navigation, setCurrentTrack]);

  const handleTrackSelect = useCallback((track: Track) => {
    // For now, just navigate to suggestions
    // In the future, this could add to a selection list
    handleTrackPress(track);
  }, [handleTrackPress]);

  const renderTrack = useCallback(({ item }: { item: Track }) => (
    <TrackCard
      track={item}
      onPress={handleTrackPress}
      onSelect={handleTrackSelect}
      showAudioFeatures={false}
      style={styles.trackCard}
    />
  ), [handleTrackPress, handleTrackSelect]);

  const renderEmptyState = () => {
    if (isSearching) {
      return <ListSkeleton count={5} />;
    }

    if (searchError) {
      return (
        <ErrorView
          title="Search Failed"
          message="Unable to search for tracks. Please check your connection and try again."
          onRetry={() => refetchSearch()}
        />
      );
    }

    if (debouncedQuery && !searchData?.tracks?.items?.length) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color={theme.colors.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No tracks found</Text>
          <Text style={styles.emptyStateMessage}>
            Try searching with different keywords or check the spelling.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="musical-notes" size={64} color={theme.colors.text.tertiary} />
        <Text style={styles.emptyStateTitle}>Find Your Perfect Mix</Text>
        <Text style={styles.emptyStateMessage}>
          Search for a track to get started with finding compatible songs for seamless mixing.
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Search Tracks</Text>
      <Text style={styles.headerSubtitle}>
        Find a track to start building your mix
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons 
              name="search" 
              size={20} 
              color={theme.colors.text.tertiary} 
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for tracks, artists, or albums..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <FlatList
          data={searchData?.tracks?.items || []}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
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
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
  },
  listContainer: {
    flexGrow: 1,
  },
  header: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
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
