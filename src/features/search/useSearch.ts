import { useState, useCallback, useMemo } from 'react';
import { useSearchTracks } from '../../api/hooks';
import { useAppStore } from '../../state/app-store';
import { Track } from '../../types/domain';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { setSearchResults, setSearchQuery } = useAppStore();

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Search tracks
  const {
    data: searchData,
    isLoading,
    error,
    refetch,
  } = useSearchTracks(debouncedQuery, 20, 0);

  // Update search results in store
  React.useEffect(() => {
    if (searchData?.tracks?.items) {
      setSearchResults(searchData.tracks.items);
      setSearchQuery(debouncedQuery);
    }
  }, [searchData, debouncedQuery, setSearchResults, setSearchQuery]);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await refetch();
    } finally {
      setIsSearching(false);
    }
  }, [refetch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSearchResults([]);
    setSearchQuery('');
  }, [setSearchResults, setSearchQuery]);

  const results = useMemo(() => {
    return searchData?.tracks?.items || [];
  }, [searchData]);

  const hasResults = results.length > 0;
  const isEmpty = debouncedQuery && !isLoading && !hasResults;
  const isInitial = !debouncedQuery && !hasResults;

  return {
    query,
    setQuery,
    results,
    isLoading: isLoading || isSearching,
    error,
    hasResults,
    isEmpty,
    isInitial,
    search,
    clearSearch,
    refetch,
  };
}
