import { useEffect, useMemo, useState } from 'react';
import { useMediaTrackerStore, INITIAL_FILTERS } from './store/useMediaTrackerStore';
import { Header } from './components/Header';
import { SessionBanner } from './components/SessionBanner';
import { ModeAGrid } from './components/ModeAGrid';
import { ModeBPoll } from './components/ModeBPoll';
import { FilterDrawer } from './components/FilterDrawer';
import { ImportModal } from './components/ImportModal';
import { SyncModal } from './components/SyncModal';
import { LegalModal } from './components/LegalModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Footer } from './components/Footer';

export function App() {
  const {
    catalog,
    decisions,
    isLoading,
    isInitialized,
    initializeStore,
    viewMode,
    filters,
    unsyncedChangesCount
  } = useMediaTrackerStore();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [legalModalState, setLegalModalState] = useState<{
    isOpen: boolean;
    tab: 'attributions' | 'privacy' | 'terms';
  }>({
    isOpen: false,
    tab: 'attributions'
  });

  // Initialize IndexedDB on startup
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Beforeunload exit guard for unexported/unsynced changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsyncedChangesCount > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsyncedChangesCount]);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim().length > 0) count++;
    if (filters.status !== 'ALL') count++;
    if (filters.formats.length > 0) count += filters.formats.length;
    if (filters.demographics.length > 0) count += filters.demographics.length;
    if (filters.genres.length > 0) count += filters.genres.length;
    if (filters.yearMin !== INITIAL_FILTERS.yearMin || filters.yearMax !== INITIAL_FILTERS.yearMax) count++;
    if (filters.sortBy !== INITIAL_FILTERS.sortBy) count++;
    return count;
  }, [filters]);

  // Filter and sort catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      // 1. Search Query
      if (filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase();
        const enMatch = item.title.english?.toLowerCase().includes(q);
        const roMatch = item.title.romaji?.toLowerCase().includes(q);
        const jaMatch = item.title.native?.toLowerCase().includes(q);
        if (!enMatch && !roMatch && !jaMatch) return false;
      }

      // 2. Decision Status Filter
      const decision = decisions[item.id];
      if (filters.status === 'UNDECIDED' && decision) return false;
      if (filters.status === 'SEEN' && decision?.status !== 'SEEN') return false;
      if (filters.status === 'NOT_SEEN' && decision?.status !== 'NOT_SEEN') return false;

      // 3. Format Filter
      if (filters.formats.length > 0 && !filters.formats.includes(item.format)) {
        return false;
      }

      // 4. Demographics Filter
      if (filters.demographics.length > 0) {
        const hasDemo = item.demographics.some(d => filters.demographics.includes(d));
        if (!hasDemo) return false;
      }

      // 5. Genres Filter
      if (filters.genres.length > 0) {
        if (filters.genreMatchMode === 'AND') {
          const hasAll = filters.genres.every(g => item.genres.includes(g));
          if (!hasAll) return false;
        } else {
          const hasAny = filters.genres.some(g => item.genres.includes(g));
          if (!hasAny) return false;
        }
      }

      // 6. Year Range
      if (item.year < filters.yearMin || item.year > filters.yearMax) {
        return false;
      }

      // 7. SFW Filter
      if (filters.sfwOnly && item.isAdult) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return b.score - a.score;
        case 'year_desc':
          return b.year - a.year;
        case 'year_asc':
          return a.year - b.year;
        case 'title_asc': {
          const titleA = a.title.english || a.title.romaji;
          const titleB = b.title.english || b.title.romaji;
          return titleA.localeCompare(titleB);
        }
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [catalog, decisions, filters]);

  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#263238] border-t-[#00E5FF] animate-spin mb-4" />
        <div className="font-manga text-sm font-bold tracking-widest text-slate-300 uppercase">
          Initializing Local-First Database...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col selection:bg-[#00E5FF] selection:text-black manga-screentone">
      
      {/* Top Header */}
      <Header
        onOpenFilters={() => setIsFilterOpen(true)}
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Session Resume Notice */}
      <SessionBanner />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 pt-4">
        {viewMode === 'grid' ? (
          <ModeAGrid filteredItems={filteredCatalog} />
        ) : (
          <ModeBPoll filteredItems={filteredCatalog} />
        )}
      </main>

      {/* Slide-over Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Modals */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <SyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
      />

      <LegalModal
        isOpen={legalModalState.isOpen}
        initialTab={legalModalState.tab}
        onClose={() => setLegalModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setLegalModalState({ isOpen: true, tab: 'privacy' })}
        onOpenTerms={() => setLegalModalState({ isOpen: true, tab: 'terms' })}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

    </div>
  );
}

export default App;
