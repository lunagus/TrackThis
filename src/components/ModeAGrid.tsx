import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCheck, 
  RotateCcw,
  Star,
  Tv,
  Film
} from 'lucide-react';
import { UnifiedMediaItem, UserDecision } from '../types/media';
import { useMediaTrackerStore } from '../store/useMediaTrackerStore';

interface ModeAGridProps {
  filteredItems: UnifiedMediaItem[];
}

export const ModeAGrid: React.FC<ModeAGridProps> = ({ filteredItems }) => {
  const {
    decisions,
    setDecision,
    setDecisionBatch,
    clearDecision,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize
  } = useMediaTrackerStore();

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const pageItems = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, validCurrentPage, pageSize]);

  // Identify undecided items on current page for the Sweep action
  const undecidedOnPage = useMemo(() => {
    return pageItems.filter(item => !decisions[item.id]);
  }, [pageItems, decisions]);

  const handleSweepAction = () => {
    if (undecidedOnPage.length === 0) return;

    const batch = undecidedOnPage.map(item => ({
      mediaId: item.id,
      status: 'NOT_SEEN' as const
    }));

    setDecisionBatch(batch);

    // Confetti effect (no emojis)
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#00E5FF', '#FFFFFF', '#263238']
    });

    // Advance to next page if available
    if (validCurrentPage < totalPages) {
      setCurrentPage(validCurrentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-32">
      
      {/* Top Page Sub-Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#121820]/70 border-b border-[#263238] rounded-t-lg">
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="font-bold text-white">{pageItems.length}</span> of{' '}
          <span className="font-bold text-[#00E5FF]">{filteredItems.length}</span> titles
          (Page {validCurrentPage} of {totalPages})
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Page size:</span>
          {[24, 48, 100, 250, 500].map(size => (
            <button
              key={size}
              onClick={() => setPageSize(size)}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                pageSize === size
                  ? 'bg-[#00E5FF] text-black'
                  : 'bg-[#1A222D] text-slate-400 hover:text-white border border-[#263238]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-[#121820] border-2 border-[#263238] flex items-center justify-center text-slate-500 mb-4">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-manga text-white mb-1">NO TITLES FOUND</h3>
          <p className="text-xs font-mono text-slate-400 max-w-sm">
            Try adjusting your search query, genre tags, or active demographic filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4">
          {pageItems.map(item => {
            const decision: UserDecision | undefined = decisions[item.id];
            const isSeen = decision?.status === 'SEEN';
            const isNotSeen = decision?.status === 'NOT_SEEN';
            const isUndecided = !decision;

            let cardBorderClass = 'manga-panel';
            if (isSeen) cardBorderClass = 'manga-panel manga-panel-selected-yes';
            if (isNotSeen) cardBorderClass = 'manga-panel manga-panel-selected-no';

            return (
              <div
                key={item.id}
                className={`relative rounded-lg overflow-hidden flex flex-col group ${cardBorderClass}`}
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.posterImage}
                    alt={item.title.english || item.title.romaji}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder SVG poster
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%23121820"/><text x="100" y="150" fill="%2300E5FF" font-family="sans-serif" font-size="14" text-anchor="middle">TrackThis</text></svg>';
                    }}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Format & Score Badges */}
                  <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[#00E5FF] border border-[#00E5FF]/40 flex items-center space-x-0.5">
                      {item.format === 'Movie' ? (
                        <Film className="w-2.5 h-2.5 inline mr-0.5" />
                      ) : (
                        <Tv className="w-2.5 h-2.5 inline mr-0.5" />
                      )}
                      <span>{item.format}</span>
                    </span>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-amber-400 border border-amber-400/40 flex items-center space-x-0.5">
                      <Star className="w-2.5 h-2.5 inline fill-amber-400 mr-0.5" />
                      <span>{item.score.toFixed(1)}</span>
                    </span>
                  </div>

                  {/* Year Tag */}
                  <div className="absolute top-1.5 right-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-slate-300 border border-slate-700">
                      {item.year}
                    </span>
                  </div>

                  {/* Decision Overlay Indicator */}
                  {!isUndecided && (
                    <div 
                      className={`absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center transition-opacity pointer-events-none`}
                    >
                      {isSeen && (
                        <div className="w-12 h-12 rounded-full bg-[#00E5FF] text-black flex items-center justify-center shadow-[0_0_15px_#00E5FF] border-2 border-white">
                          <Check className="w-7 h-7 stroke-[3]" />
                        </div>
                      )}
                      {isNotSeen && (
                        <div className="w-12 h-12 rounded-full bg-[#FF5252] text-white flex items-center justify-center shadow-[0_0_15px_#FF5252] border-2 border-white">
                          <X className="w-7 h-7 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reset pill on card hover if already decided */}
                  {!isUndecided && (
                    <button
                      onClick={() => clearDecision(item.id)}
                      className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700 z-10 opacity-0 group-hover:opacity-100"
                      title="Reset to undecided"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between bg-[#121820]">
                  <div>
                    {/* Demographics Pill */}
                    {item.demographics.length > 0 && (
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[#00E5FF] mb-0.5 block truncate">
                        {item.demographics.join(' / ')}
                      </span>
                    )}

                    {/* Title */}
                    <h4 
                      className="text-xs sm:text-sm font-bold font-manga text-white line-clamp-1 group-hover:text-[#00E5FF] transition-colors"
                      title={item.title.english || item.title.romaji}
                    >
                      {item.title.english || item.title.romaji}
                    </h4>
                    <p 
                      className="text-[10px] text-slate-400 font-mono truncate mb-1"
                      title={item.title.romaji}
                    >
                      {item.title.romaji}
                    </p>

                    {/* Genre tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.genres.slice(0, 2).map(genre => (
                        <span 
                          key={genre}
                          className="text-[9px] px-1 py-0.2 rounded bg-[#1A222D] text-slate-300 border border-slate-800"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dual Action Decision Pills */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#263238]">
                    <button
                      onClick={() => setDecision(item.id, 'SEEN')}
                      className={`pill-button py-1.5 px-2 text-[11px] rounded flex items-center justify-center space-x-1 border transition-all ${
                        isSeen
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF] font-black shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                          : 'bg-[#1A222D] text-slate-300 border-[#263238] hover:border-[#00E5FF] hover:text-[#00E5FF]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>YES</span>
                    </button>

                    <button
                      onClick={() => setDecision(item.id, 'NOT_SEEN')}
                      className={`pill-button py-1.5 px-2 text-[11px] rounded flex items-center justify-center space-x-1 border transition-all ${
                        isNotSeen
                          ? 'bg-[#FF5252] text-white border-[#FF5252] font-black shadow-[0_0_8px_rgba(255,82,82,0.6)]'
                          : 'bg-[#1A222D] text-slate-300 border-[#263238] hover:border-[#FF5252] hover:text-[#FF5252]'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>NO</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Action Bar (Sweep Mode + Pagination) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0B0F14]/95 backdrop-blur-md border-t-2 border-[#263238] p-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Sweep Action Button */}
          <div className="w-full sm:w-auto">
            <button
              onClick={handleSweepAction}
              disabled={undecidedOnPage.length === 0}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-manga font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border-2 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.6)] ${
                undecidedOnPage.length > 0
                  ? 'bg-[#121820] text-[#00E5FF] border-[#00E5FF] hover:bg-[#00E5FF] hover:text-black shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                  : 'bg-[#121820] text-slate-500 border-[#263238] opacity-50 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark Remaining on Page as No & Advance</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/40 border border-current">
                {undecidedOnPage.length} left
              </span>
            </button>
          </div>

          {/* Pagination Navigation */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => handlePageChange(validCurrentPage - 1)}
              disabled={validCurrentPage <= 1}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#263238] bg-[#121820] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 text-xs font-mono"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Quick Page Indicator */}
            <div className="px-3 py-1 rounded bg-[#121820] border border-[#263238] text-xs font-mono text-slate-300">
              <span className="font-bold text-[#00E5FF]">{validCurrentPage}</span>
              <span className="text-slate-500"> / </span>
              <span>{totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(validCurrentPage + 1)}
              disabled={validCurrentPage >= totalPages}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#263238] bg-[#121820] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 text-xs font-mono"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
