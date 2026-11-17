import React, { useMemo, useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCheck, 
  RotateCcw,
  Star,
  Tv,
  Film,
  Info,
  Calendar,
  Building2,
  ExternalLink
} from 'lucide-react';
import { triggerMangaBurst } from '../utils/particles';
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

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<UnifiedMediaItem | null>(null);

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
    triggerMangaBurst();

    if (validCurrentPage < totalPages) {
      setCurrentPage(validCurrentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setFocusedIndex(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Spatial Keyboard Navigation across Grid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Sweep shortcut: Shift + S
      if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        handleSweepAction();
        return;
      }

      if (pageItems.length === 0) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex(prev => (prev === null ? 0 : Math.min(pageItems.length - 1, prev + 1)));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex(prev => (prev === null ? 0 : Math.max(0, prev - 1)));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Assuming ~4-6 items per row, jump by 4 or to bottom
        setFocusedIndex(prev => (prev === null ? 0 : Math.min(pageItems.length - 1, prev + 4)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev === null ? 0 : Math.max(0, prev - 4)));
      } else if ((e.key === 'y' || e.key === 'Y') && focusedIndex !== null) {
        e.preventDefault();
        const target = pageItems[focusedIndex];
        if (target) {
          setDecision(target.id, 'SEEN');
          // auto advance focus
          setFocusedIndex(prev => (prev !== null && prev < pageItems.length - 1 ? prev + 1 : prev));
        }
      } else if ((e.key === 'n' || e.key === 'N') && focusedIndex !== null) {
        e.preventDefault();
        const target = pageItems[focusedIndex];
        if (target) {
          setDecision(target.id, 'NOT_SEEN');
          setFocusedIndex(prev => (prev !== null && prev < pageItems.length - 1 ? prev + 1 : prev));
        }
      } else if (e.key === ' ' && focusedIndex !== null) {
        e.preventDefault();
        const target = pageItems[focusedIndex];
        if (target) {
          setPreviewItem(target);
        }
      } else if (e.key === 'Escape') {
        setPreviewItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageItems, focusedIndex, undecidedOnPage, validCurrentPage, totalPages]);

  return (
    <div className="flex flex-col min-h-full pb-6">
      
      {/* Sub-Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0E141D]/80 backdrop-blur-md border border-[#1F2B3B] rounded-2xl mb-4">
        <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
          <span>Catalog Pool:</span>
          <span className="font-bold text-white font-mono">{filteredItems.length} titles</span>
          <span className="text-slate-600">•</span>
          <span>Page <strong className="text-[#00E5FF]">{validCurrentPage}</strong> of {totalPages}</span>
        </div>

        {/* Keyboard Hint Pill */}
        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span className="text-slate-500">Keyboard Triage:</span>
          <span className="px-1.5 py-0.5 rounded bg-[#151E2B] text-slate-300 border border-slate-700">Arrows: Navigate</span>
          <span className="px-1.5 py-0.5 rounded bg-[#151E2B] text-[#00E5FF] border border-cyan-800">Y: Seen</span>
          <span className="px-1.5 py-0.5 rounded bg-[#151E2B] text-[#FF334B] border border-red-800">N: No</span>
          <span className="px-1.5 py-0.5 rounded bg-[#151E2B] text-slate-300 border border-slate-700">Shift+S: Sweep</span>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <span className="text-slate-400 hidden sm:inline">Per page:</span>
          {[24, 48, 100, 250, 500].map(size => (
            <button
              key={size}
              onClick={() => setPageSize(size)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                pageSize === size
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'bg-[#151E2B] text-slate-400 hover:text-white border border-[#1F2B3B]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center px-4 bg-[#0E141D]/40 rounded-2xl border-2 border-dashed border-[#1F2B3B]">
          <div className="w-16 h-16 rounded-full bg-[#151E2B] border-2 border-[#1F2B3B] flex items-center justify-center text-slate-500 mb-4">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-manga text-white uppercase tracking-wider mb-2">
            No Titles Matched Filters
          </h3>
          <p className="text-xs font-mono text-slate-400 max-w-md">
            No media entries found matching your active criteria. Try loosening search terms or demographic filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {pageItems.map((item, index) => {
            const decision: UserDecision | undefined = decisions[item.id];
            const isSeen = decision?.status === 'SEEN';
            const isNotSeen = decision?.status === 'NOT_SEEN';
            const isUndecided = !decision;
            const isFocused = focusedIndex === index;

            let cardStateClass = 'manga-card';
            if (isSeen) cardStateClass += ' manga-card-seen';
            if (isNotSeen) cardStateClass += ' manga-card-not-seen';
            if (isFocused) cardStateClass += ' ring-2 ring-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]';

            return (
              <div
                key={item.id}
                tabIndex={0}
                onFocus={() => setFocusedIndex(index)}
                className={`rounded-xl overflow-hidden flex flex-col group cursor-pointer ${cardStateClass}`}
              >
                {/* Poster Container - Clean artwork without redundant hover overlay */}
                <div 
                  onClick={() => setPreviewItem(item)}
                  className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 cursor-pointer"
                  title="Click to view full details"
                >
                  <img
                    src={item.posterImage}
                    alt={item.title.english || item.title.romaji}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%230E141D"/><rect x="10" y="10" width="180" height="280" rx="8" fill="none" stroke="%231F2B3B" stroke-width="2"/><text x="100" y="145" fill="%2300E5FF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">TRACKTHIS</text><text x="100" y="170" fill="%2394a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">No Image</text></svg>';
                    }}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Top Badges (Format & Rating) */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1 pointer-events-none">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-black/90 text-[#00E5FF] border border-[#00E5FF]/40 flex items-center space-x-1 shadow-sm">
                      {item.format === 'Movie' ? (
                        <Film className="w-2.5 h-2.5 mr-0.5" />
                      ) : (
                        <Tv className="w-2.5 h-2.5 mr-0.5" />
                      )}
                      <span>{item.format}</span>
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-black/90 text-amber-300 border border-amber-400/40 flex items-center space-x-0.5 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-amber-300 mr-0.5" />
                      <span>{item.score.toFixed(1)}</span>
                    </span>
                  </div>

                  {/* Year Tag */}
                  <div className="absolute top-2 right-2 pointer-events-none">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/90 text-slate-200 border border-slate-700 shadow-sm">
                      {item.year}
                    </span>
                  </div>

                  {/* Decided Solid Material Ribbon Badges */}
                  {isSeen && (
                    <div className="absolute bottom-2 left-2 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md bg-[#00E5FF] text-black text-[11px] font-black font-manga uppercase tracking-wider flex items-center space-x-1 shadow-md border border-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>SEEN</span>
                      </span>
                    </div>
                  )}

                  {isNotSeen && (
                    <div className="absolute bottom-2 left-2 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md bg-[#FF334B] text-white text-[11px] font-black font-manga uppercase tracking-wider flex items-center space-x-1 shadow-md border border-white">
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>NO</span>
                      </span>
                    </div>
                  )}

                  {/* Reset pill on card if already decided */}
                  {!isUndecided && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDecision(item.id);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/90 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700 shadow-md text-xs"
                      title="Reset to undecided"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Info Footer */}
                <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between bg-[#131C2A]">
                  <div>
                    {/* Demographics Tag */}
                    {item.demographics.length > 0 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#00E5FF] mb-1 block truncate">
                        {item.demographics.join(' / ')}
                      </span>
                    )}

                    {/* Title */}
                    <h4 
                      onClick={() => setPreviewItem(item)}
                      className="text-xs sm:text-sm font-bold font-manga text-white line-clamp-1 hover:text-[#00E5FF] transition-colors cursor-pointer"
                      title={item.title.english || item.title.romaji}
                    >
                      {item.title.english || item.title.romaji}
                    </h4>
                    <p 
                      className="text-[11px] text-slate-400 font-mono truncate mb-2.5"
                      title={item.title.romaji}
                    >
                      {item.title.romaji}
                    </p>
                  </div>

                  {/* Highly Visible Tactile Material Decision Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#243348]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSeen) {
                          clearDecision(item.id);
                        } else {
                          setDecision(item.id, 'SEEN');
                        }
                      }}
                      className={`tactile-pill py-2 sm:py-2.5 px-2 text-xs sm:text-sm rounded-lg flex items-center justify-center space-x-1.5 border-2 transition-all ${
                        isSeen
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF] font-black shadow-md'
                          : 'bg-[#182332] text-slate-100 border-[#2C3E56] hover:border-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10'
                      }`}
                      title={isSeen ? "Click to reset to undecided" : "Mark as Seen (Y)"}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>YES</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isNotSeen) {
                          clearDecision(item.id);
                        } else {
                          setDecision(item.id, 'NOT_SEEN');
                        }
                      }}
                      className={`tactile-pill py-2 sm:py-2.5 px-2 text-xs sm:text-sm rounded-lg flex items-center justify-center space-x-1.5 border-2 transition-all ${
                        isNotSeen
                          ? 'bg-[#FF334B] text-white border-[#FF334B] font-black shadow-md'
                          : 'bg-[#182332] text-slate-100 border-[#2C3E56] hover:border-[#FF334B] hover:text-[#FF334B] hover:bg-[#FF334B]/10'
                      }`}
                      title={isNotSeen ? "Click to reset to undecided" : "Mark as Not Seen (N)"}
                    >
                      <X className="w-4 h-4 stroke-[3]" />
                      <span>NO</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Tactical Command Dock (Sweep Mode + Pagination) - Sticky so it never blocks footer */}
      <div className="sticky bottom-3 sm:bottom-4 left-0 right-0 max-w-5xl w-full mx-auto z-30 px-2 sm:px-4 my-4">
        <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#070A0E]/95 backdrop-blur-xl border-2 border-[#1F2B3B] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          
          {/* Sweep Mode Action */}
          <div className="w-full sm:w-auto">
            <button
              onClick={handleSweepAction}
              disabled={undecidedOnPage.length === 0}
              className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-manga font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 sm:space-x-2 border-2 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.6)] active:translate-y-0.5 ${
                undecidedOnPage.length > 0
                  ? 'bg-[#0E141D] text-[#00E5FF] border-[#00E5FF] hover:bg-[#00E5FF] hover:text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                  : 'bg-[#0E141D] text-slate-600 border-[#1F2B3B] opacity-50 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Sweep Remaining as No</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/50 border border-current">
                {undecidedOnPage.length} left
              </span>
            </button>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={() => handlePageChange(validCurrentPage - 1)}
              disabled={validCurrentPage <= 1}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-[#1F2B3B] bg-[#0E141D] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 text-xs font-mono"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Current Page Pill */}
            <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#0E141D] border-2 border-[#1F2B3B] text-xs font-mono text-slate-300">
              <span className="font-bold text-[#00E5FF] text-xs sm:text-sm">{validCurrentPage}</span>
              <span className="text-slate-500"> / </span>
              <span className="font-bold text-slate-300 text-xs sm:text-sm">{totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(validCurrentPage + 1)}
              disabled={validCurrentPage >= totalPages}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-[#1F2B3B] bg-[#0E141D] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 text-xs font-mono"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Quick Details Modal Popover */}
      {previewItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0E141D] border-2 border-[#1F2B3B] rounded-2xl shadow-2xl overflow-hidden flex flex-col manga-screentone-dark animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header Banner */}
            <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
              <img
                src={previewItem.bannerImage || previewItem.posterImage}
                alt="Banner"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-30 filter blur-xs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E141D] to-transparent" />
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-slate-400 hover:text-white border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 -mt-20 relative z-10 flex flex-col sm:flex-row gap-5">
              <div className="w-32 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-xl bg-slate-900 mx-auto sm:mx-0">
                <img
                  src={previewItem.posterImage}
                  alt={previewItem.title.english}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 text-xs font-mono text-[#00E5FF] mb-1">
                  <span>{previewItem.demographics.join(' • ')}</span>
                  <span>•</span>
                  <span>{previewItem.format}</span>
                  <span>•</span>
                  <span>Score: {previewItem.score.toFixed(1)}</span>
                </div>

                <h3 className="text-xl font-extrabold font-manga text-white mb-1">
                  {previewItem.title.english || previewItem.title.romaji}
                </h3>
                <div className="text-xs font-mono text-slate-400 mb-3">
                  {previewItem.title.romaji}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-6 mb-4">
                  {previewItem.synopsis}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {previewItem.genres.map(genre => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 rounded bg-[#151E2B] text-slate-300 text-[10px] font-mono border border-slate-800"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#1F2B3B] text-xs font-mono text-slate-400">
                  <span>Studio: {previewItem.studios.join(', ')}</span>
                  <span>Year: {previewItem.year}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t-2 border-[#1F2B3B] bg-[#070A0E] flex flex-wrap items-center justify-between gap-3">
              <div>
                {(decisions[previewItem.id]?.status === 'SEEN' || decisions[previewItem.id]?.status === 'NOT_SEEN') && (
                  <button
                    onClick={() => {
                      clearDecision(previewItem.id);
                      setPreviewItem(null);
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset Decision
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (decisions[previewItem.id]?.status === 'NOT_SEEN') {
                      clearDecision(previewItem.id);
                    } else {
                      setDecision(previewItem.id, 'NOT_SEEN');
                    }
                    setPreviewItem(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-manga font-bold text-xs uppercase transition-all flex items-center space-x-1.5 border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.6)] cursor-pointer ${
                    decisions[previewItem.id]?.status === 'NOT_SEEN'
                      ? 'bg-[#FF334B] text-white border-[#FF334B] font-black'
                      : 'bg-[#0E141D] text-[#FF334B] border-[#FF334B] hover:bg-[#FF334B] hover:text-white hover:shadow-[0_0_20px_rgba(255,51,75,0.4)]'
                  }`}
                  title="Mark as Not Seen"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Mark as Not Seen</span>
                </button>

                <button
                  onClick={() => {
                    if (decisions[previewItem.id]?.status === 'SEEN') {
                      clearDecision(previewItem.id);
                    } else {
                      setDecision(previewItem.id, 'SEEN');
                    }
                    setPreviewItem(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-manga font-bold text-xs uppercase transition-all flex items-center space-x-1.5 border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.6)] cursor-pointer ${
                    decisions[previewItem.id]?.status === 'SEEN'
                      ? 'bg-[#00E5FF] text-black border-[#00E5FF] font-black'
                      : 'bg-[#0E141D] text-[#00E5FF] border-[#00E5FF] hover:bg-[#00E5FF] hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  }`}
                  title="Mark as Seen"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Mark as Seen</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
