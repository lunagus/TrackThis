import React, { useEffect, useState } from 'react';
import { 
  Check, 
  X, 
  SkipForward, 
  Undo2, 
  Star, 
  Tv, 
  Film, 
  Building2, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { UnifiedMediaItem } from '../types/media';
import { useMediaTrackerStore } from '../store/useMediaTrackerStore';

interface ModeBPollProps {
  filteredItems: UnifiedMediaItem[];
}

export const ModeBPoll: React.FC<ModeBPollProps> = ({ filteredItems }) => {
  const {
    decisions,
    setDecision,
    undoStack,
    undoLastDecision,
    currentPollIndex,
    setPollIndex,
    advancePoll,
    previousPoll
  } = useMediaTrackerStore();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [cardAnimation, setCardAnimation] = useState<'slide-right' | 'slide-left' | null>(null);

  const total = filteredItems.length;
  const safeIndex = Math.min(Math.max(0, currentPollIndex), Math.max(0, total - 1));
  const currentItem: UnifiedMediaItem | undefined = filteredItems[safeIndex];

  // Preload next 3 images for <150ms transitions
  useEffect(() => {
    if (!filteredItems.length) return;
    for (let i = 1; i <= 3; i++) {
      const nextItem = filteredItems[safeIndex + i];
      if (nextItem?.posterImage) {
        const img = new Image();
        img.src = nextItem.posterImage;
      }
    }
  }, [safeIndex, filteredItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (!currentItem) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'y':
        case 'Y':
          e.preventDefault();
          handleDecision('SEEN');
          break;
        case 'ArrowLeft':
        case 'n':
        case 'N':
          e.preventDefault();
          handleDecision('NOT_SEEN');
          break;
        case ' ':
        case 'ArrowDown':
          e.preventDefault();
          handleSkip();
          break;
        case 'z':
        case 'Z':
        case 'ArrowUp':
          e.preventDefault();
          if (undoStack.length > 0) {
            undoLastDecision();
            previousPoll();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem, safeIndex, undoStack]);

  const handleDecision = async (status: 'SEEN' | 'NOT_SEEN') => {
    if (!currentItem) return;
    setCardAnimation(status === 'SEEN' ? 'slide-right' : 'slide-left');
    await setDecision(currentItem.id, status);

    setTimeout(() => {
      setCardAnimation(null);
      if (safeIndex < total - 1) {
        advancePoll();
      }
    }, 150);
  };

  const handleSkip = () => {
    if (safeIndex < total - 1) {
      advancePoll();
    }
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isRightSwipe) {
      handleDecision('SEEN');
    } else if (isLeftSwipe) {
      handleDecision('NOT_SEEN');
    }
  };

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4 bg-[#0E141D]/50 rounded-2xl border-2 border-[#1F2B3B] max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-[#151E2B] border-2 border-[#1F2B3B] flex items-center justify-center text-slate-500 mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-manga text-white uppercase tracking-wider mb-2">
          Poll Completed
        </h3>
        <p className="text-xs font-mono text-slate-400 max-w-sm mb-5">
          You have reviewed all available anime titles in the current filtered selection.
        </p>
        <button
          onClick={() => setPollIndex(0)}
          className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black font-manga font-bold text-xs uppercase hover:bg-cyan-300 shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
        >
          Restart From Beginning
        </button>
      </div>
    );
  }

  const currentDecision = decisions[currentItem.id];
  const isSeen = currentDecision?.status === 'SEEN';
  const isNotSeen = currentDecision?.status === 'NOT_SEEN';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
      
      {/* Top Bar HUD */}
      <div className="w-full mb-3 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="text-[#00E5FF] font-bold">TITLE #{safeIndex + 1}</span>
          <span>of {total}</span>
        </div>

        {/* Hotkey Guide Pills */}
        <div className="hidden sm:flex items-center space-x-2 text-[11px]">
          <span className="px-2 py-0.5 rounded-md bg-[#0E141D] border border-cyan-800 text-[#00E5FF]">
            Y / Right: Seen
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#0E141D] border border-red-800 text-[#FF334B]">
            N / Left: No
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#0E141D] border border-slate-700 text-slate-300">
            Space: Skip
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#0E141D] border border-slate-700 text-slate-300">
            Z: Undo
          </span>
        </div>

        <div>
          <button
            onClick={() => {
              if (undoStack.length > 0) {
                undoLastDecision();
                previousPoll();
              }
            }}
            disabled={undoStack.length === 0}
            className="px-2.5 py-1 rounded-lg bg-[#0E141D] border border-[#1F2B3B] text-slate-300 hover:text-white disabled:opacity-30 flex items-center space-x-1"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      </div>

      {/* Hero Manga Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full rounded-2xl overflow-hidden bg-[#0E141D] border-2 transition-all duration-150 relative shadow-2xl ${
          cardAnimation === 'slide-right' || isSeen
            ? 'border-[#00E5FF] shadow-[0_0_35px_rgba(0,229,255,0.35)]'
            : cardAnimation === 'slide-left' || isNotSeen
            ? 'border-[#FF334B] shadow-[0_0_35px_rgba(255,51,75,0.35)]'
            : 'border-[#1F2B3B]'
        }`}
      >
        {/* Banner Backdrop */}
        <div className="relative h-32 sm:h-64 w-full overflow-hidden bg-slate-950">
          <img
            src={currentItem.bannerImage || currentItem.posterImage}
            alt="Backdrop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 filter blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E141D] via-[#0E141D]/60 to-transparent" />
          
          {/* Tag Badges */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-black/85 backdrop-blur-md text-[#00E5FF] text-[10px] sm:text-xs font-mono font-bold border border-[#00E5FF]/40 flex items-center space-x-1">
              {currentItem.format === 'Movie' ? (
                <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <Tv className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              <span>{currentItem.format}</span>
            </span>
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-black/85 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-mono font-bold border border-amber-400/40 flex items-center space-x-1">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300" />
              <span>{currentItem.score.toFixed(2)}</span>
            </span>
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-black/85 backdrop-blur-md text-slate-300 text-[10px] sm:text-xs font-mono border border-slate-700 hidden xs:flex items-center space-x-1">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{currentItem.year}</span>
            </span>
          </div>

          {/* Decision Status Watermark Badge */}
          {currentDecision && (
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <span className={`px-2.5 sm:px-3.5 py-0.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-manga font-bold uppercase tracking-wider flex items-center space-x-1 border shadow-lg ${
                isSeen 
                  ? 'bg-[#00E5FF] text-black border-white' 
                  : 'bg-[#FF334B] text-white border-white'
              }`}>
                {isSeen ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{isSeen ? 'Seen' : 'Not Seen'}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-7 -mt-16 sm:-mt-24 relative z-10 flex flex-col md:flex-row gap-4 sm:gap-6">
          
          {/* Poster Thumbnail */}
          <div className="w-28 sm:w-52 aspect-[2/3] shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.9)] mx-auto md:mx-0 bg-slate-950">
            <img
              src={currentItem.posterImage}
              alt={currentItem.title.english}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%230E141D"/><rect x="10" y="10" width="180" height="280" rx="8" fill="none" stroke="%231F2B3B" stroke-width="2"/><text x="100" y="145" fill="%2300E5FF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">TRACKTHIS</text><text x="100" y="170" fill="%2394a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">No Image</text></svg>';
              }}
            />
          </div>

          {/* Details & Metadata */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Demographics & Studio */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                {currentItem.demographics.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] uppercase font-bold tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                    {currentItem.demographics.join(' • ')}
                  </span>
                )}
                <span className="text-[11px] sm:text-xs font-mono text-slate-400 flex items-center space-x-1">
                  <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                  <span>{currentItem.studios.join(', ')}</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-3xl font-extrabold font-manga text-white tracking-tight leading-tight mb-1 text-center md:text-left">
                {currentItem.title.english || currentItem.title.romaji}
              </h2>
              <div className="text-[11px] sm:text-xs font-mono text-slate-400 mb-2.5 text-center md:text-left">
                {currentItem.title.romaji} {currentItem.title.native ? `(${currentItem.title.native})` : ''}
              </div>

              {/* Genres Chips */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 justify-center md:justify-start">
                {currentItem.genres.map(genre => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-[#151E2B] text-slate-300 border border-[#1F2B3B]"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans line-clamp-3 sm:line-clamp-6 mb-3">
                {currentItem.synopsis}
              </div>
            </div>

            {/* External Info Bar */}
            <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs font-mono text-slate-400 pt-2 sm:pt-3 border-t border-[#1F2B3B]">
              <span>Episodes: {currentItem.episodes || 'N/A'}</span>
              <span>•</span>
              <span>MAL ID: {currentItem.externalIds.mal}</span>
              <span>•</span>
              <span>AniList ID: {currentItem.externalIds.anilist}</span>
            </div>
          </div>
        </div>

        {/* Triage Action Triggers Bar (Responsive 3-Column Thumb Dock) */}
        <div className="p-3 sm:p-6 bg-[#070A0E] border-t-2 border-[#1F2B3B] grid grid-cols-3 gap-2 sm:gap-3">
          
          {/* NO Button */}
          <button
            onClick={() => handleDecision('NOT_SEEN')}
            className={`py-3 sm:py-4 px-2 sm:px-6 rounded-xl sm:rounded-2xl font-manga font-black text-xs sm:text-sm uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1 sm:space-x-2 border-2 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.6)] sm:shadow-[4px_4px_0px_rgba(0,0,0,0.6)] active:translate-y-0.5 ${
              isNotSeen
                ? 'bg-[#FF334B] text-white border-[#FF334B]'
                : 'bg-[#0E141D] text-[#FF334B] border-[#FF334B] hover:bg-[#FF334B] hover:text-white'
            }`}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            <span className="text-[10px] sm:text-xs">NO</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/50 border border-current font-mono">
              Left
            </span>
          </button>

          {/* SKIP Button */}
          <button
            onClick={handleSkip}
            className="py-3 sm:py-4 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-manga font-bold text-xs uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1 sm:space-x-2 bg-[#0E141D] text-slate-300 border-2 border-[#1F2B3B] hover:text-white hover:border-slate-500 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.6)] sm:shadow-[4px_4px_0px_rgba(0,0,0,0.6)] active:translate-y-0.5"
          >
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">SKIP</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-slate-400 font-mono">
              Space
            </span>
          </button>

          {/* YES Button */}
          <button
            onClick={() => handleDecision('SEEN')}
            className={`py-3 sm:py-4 px-2 sm:px-6 rounded-xl sm:rounded-2xl font-manga font-black text-xs sm:text-sm uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1 sm:space-x-2 border-2 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.6)] sm:shadow-[4px_4px_0px_rgba(0,0,0,0.6)] active:translate-y-0.5 ${
              isSeen
                ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                : 'bg-[#0E141D] text-[#00E5FF] border-[#00E5FF] hover:bg-[#00E5FF] hover:text-black'
            }`}
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            <span className="text-[10px] sm:text-xs">SEEN</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/50 border border-current font-mono">
              Right
            </span>
          </button>

        </div>

      </div>

    </div>
  );
};
