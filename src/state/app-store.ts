import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Track, MixConfig, Playlist, TransitionPlan, CompatibilityScore } from '../types/domain';

interface AppState {
  // Current track being analyzed
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  
  // Search results
  searchResults: Track[];
  setSearchResults: (results: Track[]) => void;
  
  // Recommendations
  recommendations: Track[];
  setRecommendations: (recommendations: Track[]) => void;
  
  // Current playlist
  playlist: Playlist | null;
  setPlaylist: (playlist: Playlist | null) => void;
  
  // Mix configuration
  mixConfig: MixConfig;
  updateMixConfig: (config: Partial<MixConfig>) => void;
  
  // Compatibility scores for current recommendations
  compatibilityScores: Map<string, CompatibilityScore>;
  setCompatibilityScore: (trackId: string, score: CompatibilityScore) => void;
  clearCompatibilityScores: () => void;
  
  // Transition plans
  transitionPlans: TransitionPlan[];
  setTransitionPlans: (plans: TransitionPlan[]) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  
  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Selected tracks for recommendations
  selectedTracks: Track[];
  addSelectedTrack: (track: Track) => void;
  removeSelectedTrack: (trackId: string) => void;
  clearSelectedTracks: () => void;
  
  // Reset all state
  reset: () => void;
}

const defaultMixConfig: MixConfig = {
  bpm_tolerance: 4,
  harmonic_matching: true,
  same_genre: true,
  maintain_energy: true,
  allow_half_double_time: true,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Current track
        currentTrack: null,
        setCurrentTrack: (track) => set({ currentTrack: track }),
        
        // Search results
        searchResults: [],
        setSearchResults: (results) => set({ searchResults: results }),
        
        // Recommendations
        recommendations: [],
        setRecommendations: (recommendations) => set({ recommendations }),
        
        // Playlist
        playlist: null,
        setPlaylist: (playlist) => set({ playlist }),
        
        // Mix configuration
        mixConfig: defaultMixConfig,
        updateMixConfig: (config) => 
          set((state) => ({ 
            mixConfig: { ...state.mixConfig, ...config } 
          })),
        
        // Compatibility scores
        compatibilityScores: new Map(),
        setCompatibilityScore: (trackId, score) =>
          set((state) => {
            const newScores = new Map(state.compatibilityScores);
            newScores.set(trackId, score);
            return { compatibilityScores: newScores };
          }),
        clearCompatibilityScores: () => set({ compatibilityScores: new Map() }),
        
        // Transition plans
        transitionPlans: [],
        setTransitionPlans: (plans) => set({ transitionPlans: plans }),
        
        // UI state
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),
        
        error: null,
        setError: (error) => set({ error }),
        
        // Search query
        searchQuery: '',
        setSearchQuery: (query) => set({ searchQuery: query }),
        
        // Selected tracks
        selectedTracks: [],
        addSelectedTrack: (track) =>
          set((state) => ({
            selectedTracks: [...state.selectedTracks, track],
          })),
        removeSelectedTrack: (trackId) =>
          set((state) => ({
            selectedTracks: state.selectedTracks.filter(t => t.id !== trackId),
          })),
        clearSelectedTracks: () => set({ selectedTracks: [] }),
        
        // Reset
        reset: () => set({
          currentTrack: null,
          searchResults: [],
          recommendations: [],
          playlist: null,
          mixConfig: defaultMixConfig,
          compatibilityScores: new Map(),
          transitionPlans: [],
          isLoading: false,
          error: null,
          searchQuery: '',
          selectedTracks: [],
        }),
      }),
      {
        name: 'mixfinder-app-store',
        // Only persist certain parts of the state
        partialize: (state) => ({
          mixConfig: state.mixConfig,
          searchQuery: state.searchQuery,
        }),
      }
    ),
    {
      name: 'mixfinder-app-store',
    }
  )
);
