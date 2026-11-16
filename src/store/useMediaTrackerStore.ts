import { create } from 'zustand';
import { 
  UnifiedMediaItem, 
  UserDecision, 
  ViewMode, 
  FilterState 
} from '../types/media';
import { ANIME_CATALOG } from '../data/animeCatalog';
import { 
  dbGetAllDecisions, 
  dbSaveDecision, 
  dbSaveDecisionsBatch, 
  dbDeleteDecision, 
  dbClearAllDecisions,
  dbSaveMetadata,
  dbGetMetadata
} from '../services/db';

export const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  status: 'ALL',
  formats: [],
  genres: [],
  genreMatchMode: 'AND',
  demographics: [],
  yearMin: 1980,
  yearMax: 2025,
  studios: [],
  sfwOnly: true,
  sortBy: 'popularity'
};

interface UndoAction {
  type: 'single' | 'batch';
  decisions: Array<{
    mediaId: string;
    previous?: UserDecision;
  }>;
}

interface MediaTrackerState {
  // Catalog & Decisions
  catalog: UnifiedMediaItem[];
  decisions: Record<string, UserDecision>;
  isLoading: boolean;
  isInitialized: boolean;

  // View & Pagination
  viewMode: ViewMode;
  currentPage: number;
  pageSize: number;
  currentPollIndex: number;

  // History & Session
  undoStack: UndoAction[];
  unsyncedChangesCount: number;
  lastSessionBannerVisible: boolean;
  lastSessionInfo: {
    page: number;
    totalDecided: number;
    lastActive: string;
  } | null;

  // Filters
  filters: FilterState;

  // Computed helper stats
  stats: {
    total: number;
    seen: number;
    notSeen: number;
    undecided: number;
    completionPercentage: number;
  };

  // Actions
  initializeStore: () => Promise<void>;
  setDecision: (mediaId: string, status: 'SEEN' | 'NOT_SEEN') => Promise<void>;
  setDecisionBatch: (batch: Array<{ mediaId: string; status: 'SEEN' | 'NOT_SEEN' }>) => Promise<void>;
  undoLastDecision: () => Promise<void>;
  clearDecision: (mediaId: string) => Promise<void>;
  resetAllDecisions: () => Promise<void>;
  
  // Navigation & View Mode
  setViewMode: (mode: ViewMode) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setPollIndex: (index: number) => void;
  advancePoll: () => void;
  previousPoll: () => void;

  // Filters
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Session
  dismissSessionBanner: () => void;
  resumeLastSession: () => void;
  resetUnsyncedCount: () => void;
  importDecisions: (decisionsList: UserDecision[]) => Promise<void>;
}

function calculateStats(totalItems: number, decisions: Record<string, UserDecision>) {
  const values = Object.values(decisions);
  const seen = values.filter(d => d.status === 'SEEN').length;
  const notSeen = values.filter(d => d.status === 'NOT_SEEN').length;
  const decided = seen + notSeen;
  const undecided = Math.max(0, totalItems - decided);
  const completionPercentage = totalItems > 0 ? Math.round((decided / totalItems) * 100) : 0;

  return {
    total: totalItems,
    seen,
    notSeen,
    undecided,
    completionPercentage
  };
}

export const useMediaTrackerStore = create<MediaTrackerState>((set, get) => ({
  catalog: ANIME_CATALOG,
  decisions: {},
  isLoading: true,
  isInitialized: false,

  viewMode: 'grid',
  currentPage: 1,
  pageSize: 48,
  currentPollIndex: 0,

  undoStack: [],
  unsyncedChangesCount: 0,
  lastSessionBannerVisible: false,
  lastSessionInfo: null,

  filters: INITIAL_FILTERS,

  stats: calculateStats(ANIME_CATALOG.length, {}),

  initializeStore: async () => {
    if (get().isInitialized) return;
    try {
      const storedDecisions = await dbGetAllDecisions();
      const lastSession = await dbGetMetadata<{
        page: number;
        totalDecided: number;
        lastActive: string;
        pollIndex?: number;
      }>('lastSession');

      const decidedCount = Object.keys(storedDecisions).length;
      const stats = calculateStats(ANIME_CATALOG.length, storedDecisions);

      const hasPreviousSession = Boolean(lastSession && decidedCount > 0);

      set({
        decisions: storedDecisions,
        isLoading: false,
        isInitialized: true,
        stats,
        lastSessionBannerVisible: hasPreviousSession,
        lastSessionInfo: hasPreviousSession && lastSession ? {
          page: lastSession.page || 1,
          totalDecided: decidedCount,
          lastActive: lastSession.lastActive || new Date().toISOString()
        } : null,
      });

      // Save initial lastActive timestamp
      await dbSaveMetadata('lastSession', {
        page: get().currentPage,
        totalDecided: decidedCount,
        lastActive: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to initialize IndexedDB:', err);
      set({ isLoading: false, isInitialized: true });
    }
  },

  setDecision: async (mediaId, status) => {
    const prevDecision = get().decisions[mediaId];
    const newDecision: UserDecision = {
      mediaId,
      mediaType: 'anime',
      status,
      decidedAt: new Date().toISOString()
    };

    const updatedDecisions = {
      ...get().decisions,
      [mediaId]: newDecision
    };

    const newUndoItem: UndoAction = {
      type: 'single',
      decisions: [{
        mediaId,
        previous: prevDecision
      }]
    };

    const nextUndoStack = [newUndoItem, ...get().undoStack].slice(0, 50);
    const unsynced = get().unsyncedChangesCount + 1;
    const stats = calculateStats(get().catalog.length, updatedDecisions);

    set({
      decisions: updatedDecisions,
      undoStack: nextUndoStack,
      unsyncedChangesCount: unsynced,
      stats
    });

    // Asynchronous IndexedDB storage
    await dbSaveDecision(newDecision);
    await dbSaveMetadata('lastSession', {
      page: get().currentPage,
      totalDecided: Object.keys(updatedDecisions).length,
      lastActive: new Date().toISOString(),
      pollIndex: get().currentPollIndex
    });
  },

  setDecisionBatch: async (batch) => {
    if (batch.length === 0) return;

    const timestamp = new Date().toISOString();
    const updatedDecisions = { ...get().decisions };
    const undoItems: Array<{ mediaId: string; previous?: UserDecision }> = [];
    const newDecisionsToSave: UserDecision[] = [];

    for (const item of batch) {
      const prev = updatedDecisions[item.mediaId];
      const newD: UserDecision = {
        mediaId: item.mediaId,
        mediaType: 'anime',
        status: item.status,
        decidedAt: timestamp
      };
      undoItems.push({ mediaId: item.mediaId, previous: prev });
      newDecisionsToSave.push(newD);
      updatedDecisions[item.mediaId] = newD;
    }

    const newUndoItem: UndoAction = {
      type: 'batch',
      decisions: undoItems
    };

    const nextUndoStack = [newUndoItem, ...get().undoStack].slice(0, 50);
    const unsynced = get().unsyncedChangesCount + batch.length;
    const stats = calculateStats(get().catalog.length, updatedDecisions);

    set({
      decisions: updatedDecisions,
      undoStack: nextUndoStack,
      unsyncedChangesCount: unsynced,
      stats
    });

    await dbSaveDecisionsBatch(newDecisionsToSave);
    await dbSaveMetadata('lastSession', {
      page: get().currentPage,
      totalDecided: Object.keys(updatedDecisions).length,
      lastActive: timestamp
    });
  },

  undoLastDecision: async () => {
    const [actionToUndo, ...remainingUndoStack] = get().undoStack;
    if (!actionToUndo) return;

    const updatedDecisions = { ...get().decisions };

    for (const item of actionToUndo.decisions) {
      if (item.previous) {
        updatedDecisions[item.mediaId] = item.previous;
        await dbSaveDecision(item.previous);
      } else {
        delete updatedDecisions[item.mediaId];
        await dbDeleteDecision(item.mediaId);
      }
    }

    const stats = calculateStats(get().catalog.length, updatedDecisions);

    set({
      decisions: updatedDecisions,
      undoStack: remainingUndoStack,
      stats
    });
  },

  clearDecision: async (mediaId) => {
    const prev = get().decisions[mediaId];
    if (!prev) return;

    const updatedDecisions = { ...get().decisions };
    delete updatedDecisions[mediaId];

    const newUndoItem: UndoAction = {
      type: 'single',
      decisions: [{ mediaId, previous: prev }]
    };

    const nextUndoStack = [newUndoItem, ...get().undoStack].slice(0, 50);
    const stats = calculateStats(get().catalog.length, updatedDecisions);

    set({
      decisions: updatedDecisions,
      undoStack: nextUndoStack,
      stats
    });

    await dbDeleteDecision(mediaId);
  },

  resetAllDecisions: async () => {
    await dbClearAllDecisions();
    set({
      decisions: {},
      undoStack: [],
      unsyncedChangesCount: 0,
      stats: calculateStats(get().catalog.length, {})
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
  setPollIndex: (index) => set({ currentPollIndex: index }),

  advancePoll: () => {
    set(state => ({
      currentPollIndex: Math.min(state.catalog.length - 1, state.currentPollIndex + 1)
    }));
  },

  previousPoll: () => {
    set(state => ({
      currentPollIndex: Math.max(0, state.currentPollIndex - 1)
    }));
  },

  setFilter: (key, value) => {
    set(state => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1
    }));
  },

  setFilters: (partial) => {
    set(state => ({
      filters: { ...state.filters, ...partial },
      currentPage: 1
    }));
  },

  resetFilters: () => {
    set({
      filters: INITIAL_FILTERS,
      currentPage: 1
    });
  },

  dismissSessionBanner: () => {
    set({ lastSessionBannerVisible: false });
  },

  resumeLastSession: () => {
    const session = get().lastSessionInfo;
    if (session) {
      set({
        currentPage: session.page || 1,
        lastSessionBannerVisible: false
      });
    }
  },

  resetUnsyncedCount: () => {
    set({ unsyncedChangesCount: 0 });
  },

  importDecisions: async (decisionsList) => {
    const merged = { ...get().decisions };
    for (const d of decisionsList) {
      merged[d.mediaId] = d;
    }
    const stats = calculateStats(get().catalog.length, merged);

    set({
      decisions: merged,
      unsyncedChangesCount: 0,
      stats
    });

    await dbSaveDecisionsBatch(decisionsList);
  }
}));
