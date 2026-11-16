export type MediaType = 'anime' | 'movie' | 'book';

export type DecisionStatus = 'SEEN' | 'NOT_SEEN' | 'UNDECIDED';

export type AnimeFormat = 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special';

export type Demographic = 'Shounen' | 'Shoujo' | 'Seinen' | 'Josei' | 'Kids';

export interface ExternalIds {
  mal?: number;
  anilist?: number;
  kitsu?: number;
  anidb?: number;
  imdb?: string;
  tmdb?: number;
  goodreads?: string;
  openlibrary?: string;
}

export interface UnifiedMediaItem {
  id: string;
  mediaType: MediaType;
  title: {
    romaji: string;
    english: string;
    native?: string;
  };
  format: AnimeFormat;
  year: number;
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  episodes?: number;
  durationMinutes?: number;
  studios: string[];
  genres: string[];
  demographics: Demographic[];
  score: number;
  rank: number;
  popularity: number;
  posterImage: string;
  bannerImage?: string;
  synopsis: string;
  externalIds: ExternalIds;
  isAdult?: boolean;
}

export interface UserDecision {
  mediaId: string;
  mediaType: MediaType;
  status: 'SEEN' | 'NOT_SEEN';
  decidedAt: string;
  rating?: number;
}

export type ViewMode = 'grid' | 'poll';

export interface FilterState {
  searchQuery: string;
  status: 'ALL' | 'UNDECIDED' | 'SEEN' | 'NOT_SEEN';
  formats: AnimeFormat[];
  genres: string[];
  genreMatchMode: 'AND' | 'OR';
  demographics: Demographic[];
  yearMin: number;
  yearMax: number;
  studios: string[];
  sfwOnly: boolean;
  sortBy: 'popularity' | 'score' | 'year_desc' | 'year_asc' | 'title_asc';
}

export interface SyncConfig {
  anilistToken?: string;
  anilistUser?: string;
  malToken?: string;
  malUser?: string;
  lastSyncedAt?: string;
  isSyncing: boolean;
  syncProgress: {
    total: number;
    current: number;
    currentTitle: string;
  } | null;
}
