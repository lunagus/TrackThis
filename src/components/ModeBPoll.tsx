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
  Layers
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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

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

  // Handle keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
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
    setSwipeDirection(status === 'SEEN' ? 'right' : 'left');
    await setDecision(currentItem.id, status);

    setTimeout(() => {
      setSwipeDirection(null);
      if (safeIndex < total - 1) {
        advancePoll();
      }
    }, 120);
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
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#121820] border-2 border-[#263238] flex items-center justify-center text-slate-500 mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-manga text-white mb-2">POLL COMPLETED</h3>
        <p className="text-xs font-mono text-slate-400 max-w-sm mb-4">
          You have reviewed all available titles in the current filtered selection.
        </p>
        <button
          onClick={() => setPollIndex(0)}
          className="px-4 py-2 rounded-lg bg-[#00E5FF] text-black font-manga font-bold text-xs uppercase"
        >
          Review From Beginning
        </button>
      </div>
    );
  }

  const currentDecision = decisions[currentItem.id];
  const isSeen = currentDecision?.status === 'SEEN';
  const isNotSeen = currentDecision?.status === 'NOT_SEEN';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
      
      {/* Top Poll Progress Bar */}
      <div className="w-full mb-4 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold">TITLE #{safeIndex + 1}</span>
          <span>of {total}</span>
        </div>

        {/* Hotkey Guide Pills */}
        <div className="hidden sm:flex items-center space-x-2 text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-[#121820] border border-[#263238] text-[#00E5FF]">
            Y / Right = Seen
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#121820] border border-[#263238] text-[#FF5252]">
            N / Left = No
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#121820] border border-[#263238] text-slate-400">
            Space = Skip
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#121820] border border-[#263238] text-slate-400">
            Z = Undo
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (undoStack.length > 0) {
                undoLastDecision();
                previousPoll();
              }
            }}
            disabled={undoStack.length === 0}
            className="px-2 py-0.5 rounded bg-[#121820] border border-[#263238] text-slate-300 hover:text-white disabled:opacity-40 flex items-center space-x-1"
          >
            <Undo2 className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      </div>

      {/* Main Single Manga Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full rounded-2xl overflow-hidden bg-[#121820] border-2 transition-all duration-150 relative shadow-2xl ${
          swipeDirection === 'right' || isSeen
            ? 'border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.3)]'
            : swipeDirection === 'left' || isNotSeen
            ? 'border-[#FF5252] shadow-[0_0_30px_rgba(255,82,82,0.3)]'
            : 'border-[#263238]'
        }`}
      >
        {/* Banner Backdrop with Gradient Overlay */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-slate-900">
          <img
            src={currentItem.bannerImage || currentItem.posterImage}
            alt="Backdrop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 filter blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121820] via-[#121820]/70 to-transparent"></div>
          
          {/* Tag Badges in Backdrop */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#00E5FF] text-xs font-mono font-bold border border-[#00E5FF]/40 flex items-center space-x-1">
              {currentItem.format === 'Movie' ? (
                <Film className="w-3.5 h-3.5" />
              ) : (
                <Tv className="w-3.5 h-3.5" />
              )}
              <span>{currentItem.format}</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-amber-400 text-xs font-mono font-bold border border-amber-400/40 flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{currentItem.score.toFixed(2)} Score</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-slate-300 text-xs font-mono border border-slate-700 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentItem.year} ({currentItem.season})</span>
            </span>
          </div>

          {/* Decision Status Watermark Badge */}
          {currentDecision && (
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-md text-xs font-manga font-bold uppercase tracking-wider flex items-center space-x-1 border shadow-lg ${
                isSeen 
                  ? 'bg-[#00E5FF] text-black border-white' 
                  : 'bg-[#FF5252] text-white border-white'
              }`}>
                {isSeen ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{isSeen ? 'Marked as Seen' : 'Marked as Not Seen'}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 -mt-16 sm:-mt-20 relative z-10 flex flex-col md:flex-row gap-6">
          
          {/* Big Poster Thumbnail */}
          <div className="w-36 sm:w-48 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-[4px_4px_0px_rgba(0,0,0,0.8)] mx-auto md:mx-0 bg-slate-900">
            <img
              src={currentItem.posterImage}
              alt={currentItem.title.english}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%23121820"/><rect x="10" y="10" width="180" height="280" rx="8" fill="none" stroke="%23263238" stroke-width="2"/><text x="100" y="145" fill="%2300E5FF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">TRACKTHIS</text><text x="100" y="170" fill="%2394a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">No Image</text></svg>';
              }}
            />
          </div>

          {/* Details & Metadata */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Demographics */}
              {currentItem.demographics.length > 0 && (
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#00E5FF]">
                    {currentItem.demographics.join(' • ')}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{currentItem.studios.join(', ')}</span>
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold font-manga text-white tracking-tight leading-tight mb-1">
                {currentItem.title.english || currentItem.title.romaji}
              </h2>
              <div className="text-xs font-mono text-slate-400 mb-3">
                {currentItem.title.romaji} {currentItem.title.native ? `(${currentItem.title.native})` : ''}
              </div>

              {/* Genres Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {currentItem.genres.map(genre => (
                  <span
                    key={genre}
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#1A222D] text-slate-300 border border-[#263238]"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans line-clamp-4 sm:line-clamp-6 mb-4">
                {currentItem.synopsis}
              </div>
            </div>

            {/* Quick External Links / Info */}
            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400 pt-3 border-t border-[#263238]">
              <span>Episodes: {currentItem.episodes || 'N/A'}</span>
              <span>•</span>
              <span>MAL ID: {currentItem.externalIds.mal}</span>
              <span>•</span>
              <span>AniList ID: {currentItem.externalIds.anilist}</span>
            </div>
          </div>
        </div>

        {/* Fast Action Buttons Bar */}
        <div className="p-4 sm:p-6 bg-[#0B0F14] border-t-2 border-[#263238] grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* NO Button */}
          <button
            onClick={() => handleDecision('NOT_SEEN')}
            className={`py-3.5 px-6 rounded-xl font-manga font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 border-2 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.6)] active:translate-y-0.5 active:shadow-none ${
              isNotSeen
                ? 'bg-[#FF5252] text-white border-[#FF5252]'
                : 'bg-[#121820] text-[#FF5252] border-[#FF5252] hover:bg-[#FF5252] hover:text-white'
            }`}
          >
            <X className="w-5 h-5 stroke-[3]" />
            <span>NO / NOT SEEN</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-current font-mono">
              N / Left
            </span>
          </button>

          {/* SKIP Button */}
          <button
            onClick={handleSkip}
            className="py-3.5 px-4 rounded-xl font-manga font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 bg-[#121820] text-slate-300 border-2 border-[#263238] hover:text-white hover:border-slate-500 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.6)]"
          >
            <SkipForward className="w-4 h-4" />
            <span>SKIP TITLE</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400 font-mono">
              Space
            </span>
          </button>

          {/* YES Button */}
          <button
            onClick={() => handleDecision('SEEN')}
            className={`py-3.5 px-6 rounded-xl font-manga font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 border-2 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.6)] active:translate-y-0.5 active:shadow-none ${
              isSeen
                ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                : 'bg-[#121820] text-[#00E5FF] border-[#00E5FF] hover:bg-[#00E5FF] hover:text-black'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>YES / I HAVE SEEN THIS</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-current font-mono">
              Y / Right
            </span>
          </button>

        </div>

      </div>

    </div>
  );
};
