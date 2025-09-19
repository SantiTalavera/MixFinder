# MixFinder Mobile

A React Native app that helps DJs and music enthusiasts find compatible tracks for seamless mixing using Spotify's audio features and the Camelot wheel system.

## Features

- **Track Search**: Search for tracks by name, artist, or album
- **Audio Analysis**: Analyze BPM, key, energy, danceability, and other audio features
- **Compatibility Scoring**: Calculate compatibility scores between tracks using multiple factors
- **Camelot Wheel Integration**: Use harmonic mixing with the Camelot wheel system
- **Smart Recommendations**: Get track suggestions based on audio features and compatibility
- **Playlist Creation**: Create optimized playlists in Spotify with transition plans
- **Mix Configuration**: Customize BPM tolerance, harmonic matching, and other parameters

## Tech Stack

- **React Native** with **Expo** (SDK 49)
- **TypeScript** for type safety
- **Zustand** for state management
- **React Query** for data fetching and caching
- **React Navigation** for navigation
- **Reanimated** for smooth animations
- **Expo Auth Session** for Spotify OAuth (PKCE)
- **Zod** for data validation

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Spotify Developer Account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mixfinder-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` with your Spotify app credentials:
```
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
REDIRECT_URI=mixfinder://callback
VERCEL_REDIRECT_URI=https://your-vercel-domain.vercel.app/callback
SCHEME=mixfinder
```

4. Start the development server:
```bash
npm start
```

### Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URIs:
   - `mixfinder://callback` (for mobile)
   - `https://your-vercel-domain.vercel.app/callback` (for web)
4. Copy the Client ID to your `.env` file

## Project Structure

```
src/
├── auth/                 # Authentication logic
├── api/                  # API client and hooks
├── features/             # Feature-specific logic
│   ├── search/          # Search functionality
│   ├── recommend/       # Recommendations
│   └── playlist/        # Playlist management
├── lib/                  # Utility libraries
│   ├── camelot.ts       # Camelot wheel system
│   ├── bpm.ts           # BPM compatibility
│   ├── scoring.ts       # Compatibility scoring
│   ├── analysis.ts      # Audio analysis
│   └── genre-map.ts     # Genre classification
├── components/           # Reusable UI components
├── screens/              # Screen components
├── navigation/           # Navigation configuration
├── state/                # State management
├── theme/                # Theme and styling
└── types/                # TypeScript type definitions
```

## Key Algorithms

### Compatibility Scoring

The app calculates compatibility between tracks using multiple factors:

- **BPM Compatibility**: Exact match, tolerance range, or half/double time ratios
- **Harmonic Matching**: Camelot wheel compatibility (same key, adjacent keys, relative major/minor)
- **Energy Level**: Similar energy levels for smooth transitions
- **Danceability**: Matching danceability scores
- **Genre**: Same or related genres

### Track Ordering

Uses a greedy algorithm to find the optimal order of tracks that maximizes overall compatibility scores.

### Camelot Wheel System

Implements the Camelot wheel for harmonic mixing:
- Maps Spotify's key (0-11) + mode (0=minor, 1=major) to Camelot notation
- Supports same key, adjacent keys, and relative major/minor matches
- Provides compatibility scoring for harmonic relationships

## Usage

1. **Search**: Use the search screen to find tracks
2. **Select Base Track**: Choose a track to build your mix around
3. **Configure**: Adjust BPM tolerance, harmonic matching, and other settings
4. **Generate Suggestions**: Get compatible track recommendations
5. **Select Tracks**: Choose tracks for your playlist
6. **Create Playlist**: Generate an optimized playlist in Spotify
7. **Mix Guide**: Follow the in-app guide to set up Spotify for optimal mixing

## Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style

- Use TypeScript for all new code
- Follow the existing component structure
- Use the theme system for consistent styling
- Write tests for utility functions
- Use meaningful commit messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Spotify Web API for music data and audio features
- Camelot wheel system for harmonic mixing
- React Native and Expo communities
