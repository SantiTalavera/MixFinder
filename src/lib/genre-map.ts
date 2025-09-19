/**
 * Genre mapping and classification utilities
 */

export interface GenreFamily {
  name: string;
  genres: string[];
  energy: number; // 0-1
  danceability: number; // 0-1
  valence: number; // 0-1
}

export const GENRE_FAMILIES: Record<string, GenreFamily> = {
  electronic: {
    name: 'Electronic',
    genres: [
      'house', 'techno', 'trance', 'dubstep', 'drum and bass', 'drum & bass',
      'ambient', 'synthwave', 'electro', 'progressive house', 'deep house',
      'tech house', 'minimal', 'garage', 'breakbeat', 'downtempo',
      'electronic', 'edm', 'electronic dance music'
    ],
    energy: 0.8,
    danceability: 0.9,
    valence: 0.7,
  },
  rock: {
    name: 'Rock',
    genres: [
      'rock', 'alternative', 'indie', 'punk', 'metal', 'grunge',
      'progressive rock', 'hard rock', 'soft rock', 'classic rock',
      'indie rock', 'alternative rock', 'post-rock', 'math rock',
      'garage rock', 'psychedelic rock', 'folk rock'
    ],
    energy: 0.7,
    danceability: 0.6,
    valence: 0.6,
  },
  pop: {
    name: 'Pop',
    genres: [
      'pop', 'dance pop', 'indie pop', 'synthpop', 'electropop',
      'bubblegum pop', 'teen pop', 'power pop', 'art pop',
      'dream pop', 'shoegaze', 'new wave', 'post-punk'
    ],
    energy: 0.7,
    danceability: 0.8,
    valence: 0.8,
  },
  hip_hop: {
    name: 'Hip Hop',
    genres: [
      'hip hop', 'rap', 'trap', 'drill', 'conscious hip hop',
      'gangsta rap', 'alternative hip hop', 'underground hip hop',
      'old school hip hop', 'new school hip hop', 'southern hip hop',
      'west coast hip hop', 'east coast hip hop'
    ],
    energy: 0.6,
    danceability: 0.7,
    valence: 0.5,
  },
  jazz: {
    name: 'Jazz',
    genres: [
      'jazz', 'bebop', 'fusion', 'smooth jazz', 'acid jazz',
      'free jazz', 'modal jazz', 'cool jazz', 'hard bop',
      'post-bop', 'jazz fusion', 'latin jazz', 'afro-cuban jazz'
    ],
    energy: 0.5,
    danceability: 0.6,
    valence: 0.7,
  },
  classical: {
    name: 'Classical',
    genres: [
      'classical', 'orchestral', 'chamber', 'baroque', 'romantic',
      'modern classical', 'contemporary classical', 'opera',
      'symphony', 'concerto', 'sonata', 'chamber music'
    ],
    energy: 0.4,
    danceability: 0.3,
    valence: 0.6,
  },
  country: {
    name: 'Country',
    genres: [
      'country', 'folk', 'bluegrass', 'country pop', 'alt-country',
      'country rock', 'honky tonk', 'outlaw country', 'country blues',
      'western', 'cowboy', 'americana'
    ],
    energy: 0.5,
    danceability: 0.5,
    valence: 0.7,
  },
  r_b: {
    name: 'R&B',
    genres: [
      'r&b', 'soul', 'funk', 'neo soul', 'contemporary r&b',
      'rhythm and blues', 'urban contemporary', 'quiet storm',
      'new jack swing', 'hip hop soul', 'alternative r&b'
    ],
    energy: 0.6,
    danceability: 0.8,
    valence: 0.7,
  },
  reggae: {
    name: 'Reggae',
    genres: [
      'reggae', 'dancehall', 'ska', 'rocksteady', 'dub',
      'roots reggae', 'lovers rock', 'ragga', 'reggaeton'
    ],
    energy: 0.6,
    danceability: 0.8,
    valence: 0.8,
  },
  blues: {
    name: 'Blues',
    genres: [
      'blues', 'delta blues', 'chicago blues', 'electric blues',
      'rhythm and blues', 'soul blues', 'country blues',
      'acoustic blues', 'blues rock'
    ],
    energy: 0.5,
    danceability: 0.5,
    valence: 0.4,
  },
  latin: {
    name: 'Latin',
    genres: [
      'latin', 'salsa', 'merengue', 'bachata', 'cumbia',
      'reggaeton', 'latin pop', 'latin rock', 'latin jazz',
      'flamenco', 'tango', 'bolero', 'ranchera'
    ],
    energy: 0.7,
    danceability: 0.9,
    valence: 0.8,
  },
  world: {
    name: 'World',
    genres: [
      'world', 'world music', 'ethnic', 'traditional',
      'african', 'asian', 'middle eastern', 'celtic',
      'indian classical', 'gamelan', 'klezmer'
    ],
    energy: 0.5,
    danceability: 0.6,
    valence: 0.6,
  },
};

/**
 * Find the genre family for a given genre
 */
export function findGenreFamily(genre: string): GenreFamily | null {
  const normalizedGenre = genre.toLowerCase().trim();
  
  for (const family of Object.values(GENRE_FAMILIES)) {
    if (family.genres.some(g => 
      normalizedGenre.includes(g.toLowerCase()) || 
      g.toLowerCase().includes(normalizedGenre)
    )) {
      return family;
    }
  }
  
  return null;
}

/**
 * Get all genre families for a list of genres
 */
export function getGenreFamilies(genres: string[]): GenreFamily[] {
  const families = new Set<GenreFamily>();
  
  for (const genre of genres) {
    const family = findGenreFamily(genre);
    if (family) {
      families.add(family);
    }
  }
  
  return Array.from(families);
}

/**
 * Calculate genre compatibility score between two genre lists
 */
export function calculateGenreCompatibility(genres1: string[], genres2: string[]): number {
  if (genres1.length === 0 || genres2.length === 0) return 0.5;
  
  const families1 = getGenreFamilies(genres1);
  const families2 = getGenreFamilies(genres2);
  
  // Check for exact family matches
  const commonFamilies = families1.filter(f1 => 
    families2.some(f2 => f1.name === f2.name)
  );
  
  if (commonFamilies.length > 0) return 1;
  
  // Check for compatible families (similar energy/danceability)
  let maxCompatibility = 0;
  for (const family1 of families1) {
    for (const family2 of families2) {
      const energyDiff = Math.abs(family1.energy - family2.energy);
      const danceabilityDiff = Math.abs(family1.danceability - family2.danceability);
      const valenceDiff = Math.abs(family1.valence - family2.valence);
      
      const compatibility = 1 - (energyDiff + danceabilityDiff + valenceDiff) / 3;
      maxCompatibility = Math.max(maxCompatibility, compatibility);
    }
  }
  
  return maxCompatibility;
}

/**
 * Get genre recommendations based on current genres
 */
export function getGenreRecommendations(currentGenres: string[]): string[] {
  const families = getGenreFamilies(currentGenres);
  const recommendations = new Set<string>();
  
  for (const family of families) {
    // Add genres from the same family
    family.genres.forEach(genre => recommendations.add(genre));
    
    // Add genres from compatible families
    for (const otherFamily of Object.values(GENRE_FAMILIES)) {
      if (otherFamily.name !== family.name) {
        const energyDiff = Math.abs(family.energy - otherFamily.energy);
        const danceabilityDiff = Math.abs(family.danceability - otherFamily.danceability);
        
        if (energyDiff < 0.3 && danceabilityDiff < 0.3) {
          otherFamily.genres.slice(0, 3).forEach(genre => recommendations.add(genre));
        }
      }
    }
  }
  
  return Array.from(recommendations);
}

/**
 * Normalize genre names
 */
export function normalizeGenre(genre: string): string {
  return genre
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Get genre display name
 */
export function getGenreDisplayName(genre: string): string {
  const normalized = normalizeGenre(genre);
  const family = findGenreFamily(normalized);
  
  if (family) {
    return family.name;
  }
  
  // Capitalize first letter of each word
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get genre color for UI
 */
export function getGenreColor(genre: string): string {
  const family = findGenreFamily(genre);
  
  if (!family) return '#9E9E9E'; // Default gray
  
  const colors: Record<string, string> = {
    electronic: '#E91E63',
    rock: '#F44336',
    pop: '#2196F3',
    hip_hop: '#FF9800',
    jazz: '#9C27B0',
    classical: '#607D8B',
    country: '#4CAF50',
    r_b: '#FF5722',
    reggae: '#8BC34A',
    blues: '#3F51B5',
    latin: '#FFC107',
    world: '#795548',
  };
  
  return colors[family.name.toLowerCase()] || '#9E9E9E';
}
