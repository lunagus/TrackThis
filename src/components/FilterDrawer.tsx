import React from 'react';
import { 
  X, 
  RotateCcw, 
  Search, 
  SlidersHorizontal, 
  ShieldCheck,
  Calendar,
  ArrowDownUp,
  Sparkles,
  Check
} from 'lucide-react';
import { 
  ALL_GENRES, 
  ALL_DEMOGRAPHICS, 
  ALL_FORMATS 
} from '../data/animeCatalog';
import { useMediaTrackerStore } from '../store/useMediaTrackerStore';
import { AnimeFormat, Demographic } from '../types/media';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilter, setFilters, resetFilters } = useMediaTrackerStore();

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    const next = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    setFilter('genres', next);
  };

  const toggleDemographic = (demo: Demographic) => {
    const next = filters.demographics.includes(demo)
      ? filters.demographics.filter(d => d !== demo)
      : [...filters.demographics, demo];
    setFilter('demographics', next);
  };

  const toggleFormat = (fmt: AnimeFormat) => {
    const next = filters.formats.includes(fmt)
      ? filters.formats.filter(f => f !== fmt)
      : [...filters.formats, fmt];
    setFilter('formats', next);
  };

  const setDecade = (min: number, max: number) => {
    setFilters({ yearMin: min, yearMax: max });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0E141D] border-l-2 border-[#1F2B3B] shadow-2xl flex flex-col manga-screentone-dark animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b-2 border-[#1F2B3B] flex items-center justify-between bg-[#070A0E]">
            <div className="flex items-center space-x-2.5">
              <SlidersHorizontal className="w-5 h-5 text-[#00E5FF]" />
              <h3 className="font-manga text-lg font-bold text-white uppercase tracking-wider">
                Filter & Sort
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={resetFilters}
                className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1 border border-[#1F2B3B] bg-[#151E2B]"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Filter Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Search Input */}
            <div>
              <label className="block text-xs font-manga uppercase font-bold text-slate-300 mb-1.5">
                Search Catalog
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilter('searchQuery', e.target.value)}
                  placeholder="Title in English, Romaji, or Japanese..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#070A0E] border border-[#1F2B3B] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] transition-colors font-mono"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => setFilter('searchQuery', '')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Review Status Filter */}
            <div>
              <label className="block text-xs font-manga uppercase font-bold text-slate-300 mb-1.5">
                Review Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ALL', label: 'All Titles' },
                  { id: 'UNDECIDED', label: 'Undecided Only' },
                  { id: 'SEEN', label: 'Watched (Yes)' },
                  { id: 'NOT_SEEN', label: 'Not Seen (No)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFilter('status', opt.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all border ${
                      filters.status === opt.id
                        ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                        : 'bg-[#070A0E] text-slate-300 border-[#1F2B3B] hover:border-slate-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-manga uppercase font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <ArrowDownUp className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Sort Ordering</span>
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070A0E] border border-[#1F2B3B] text-white text-xs focus:outline-none focus:border-[#00E5FF] font-mono cursor-pointer"
              >
                <option value="popularity">Popularity (Most Popular First)</option>
                <option value="score">Rating (Highest Score First)</option>
                <option value="year_desc">Release Year (Newest First)</option>
                <option value="year_asc">Release Year (Oldest First)</option>
                <option value="title_asc">Title (Alphabetical A to Z)</option>
              </select>
            </div>

            {/* Target Demographics */}
            <div>
              <label className="block text-xs font-manga uppercase font-bold text-slate-300 mb-1.5">
                Demographic Facets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DEMOGRAPHICS.map(demo => {
                  const active = filters.demographics.includes(demo);
                  return (
                    <button
                      key={demo}
                      onClick={() => toggleDemographic(demo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        active
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                          : 'bg-[#070A0E] text-slate-400 border-[#1F2B3B] hover:border-slate-500'
                      }`}
                    >
                      {demo}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media Formats */}
            <div>
              <label className="block text-xs font-manga uppercase font-bold text-slate-300 mb-1.5">
                Media Format
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_FORMATS.map(fmt => {
                  const active = filters.formats.includes(fmt);
                  return (
                    <button
                      key={fmt}
                      onClick={() => toggleFormat(fmt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        active
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                          : 'bg-[#070A0E] text-slate-400 border-[#1F2B3B] hover:border-slate-500'
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Decade Quick Selectors & Year Range */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-manga uppercase font-bold text-slate-300 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Release Decade / Year</span>
                </label>
                <span className="text-xs font-mono text-[#00E5FF] font-bold">
                  {filters.yearMin} - {filters.yearMax}
                </span>
              </div>

              {/* Decade Presets */}
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {[
                  { label: "80s", min: 1980, max: 1989 },
                  { label: "90s", min: 1990, max: 1999 },
                  { label: "00s", min: 2000, max: 2009 },
                  { label: "10s", min: 2010, max: 2019 },
                  { label: "20s+", min: 2020, max: 2025 },
                  { label: "All", min: 1980, max: 2025 },
                ].map(dec => {
                  const isActive = filters.yearMin === dec.min && filters.yearMax === dec.max;
                  return (
                    <button
                      key={dec.label}
                      onClick={() => setDecade(dec.min, dec.max)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                        isActive
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                          : 'bg-[#070A0E] border-[#1F2B3B] text-slate-400 hover:text-white hover:border-[#00E5FF]'
                      }`}
                    >
                      {dec.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#070A0E] p-3 rounded-xl border border-[#1F2B3B]">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">From Year: {filters.yearMin}</span>
                  <input
                    type="range"
                    min="1980"
                    max="2025"
                    value={filters.yearMin}
                    onChange={(e) => setFilter('yearMin', Math.min(Number(e.target.value), filters.yearMax))}
                    className="w-full accent-[#00E5FF] cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">To Year: {filters.yearMax}</span>
                  <input
                    type="range"
                    min="1980"
                    max="2025"
                    value={filters.yearMax}
                    onChange={(e) => setFilter('yearMax', Math.max(Number(e.target.value), filters.yearMin))}
                    className="w-full accent-[#00E5FF] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Genres & Boolean Match Mode */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-manga uppercase font-bold text-slate-300">
                  Genres ({filters.genres.length} selected)
                </label>
                <div className="flex items-center space-x-1 bg-[#070A0E] p-0.5 rounded-lg border border-[#1F2B3B] text-[10px] font-mono">
                  <button
                    onClick={() => setFilter('genreMatchMode', 'OR')}
                    className={`px-2 py-0.5 rounded-md ${
                      filters.genreMatchMode === 'OR'
                        ? 'bg-[#00E5FF] text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ANY (OR)
                  </button>
                  <button
                    onClick={() => setFilter('genreMatchMode', 'AND')}
                    className={`px-2 py-0.5 rounded-md ${
                      filters.genreMatchMode === 'AND'
                        ? 'bg-[#00E5FF] text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ALL (AND)
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-[#070A0E] rounded-xl border border-[#1F2B3B]">
                {ALL_GENRES.map(genre => {
                  const active = filters.genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                        active
                          ? 'bg-[#00E5FF] text-black font-bold border-[#00E5FF]'
                          : 'bg-[#151E2B] text-slate-400 border-[#1F2B3B] hover:text-slate-200'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SFW Safe for Work Toggle */}
            <div className="pt-3 border-t border-[#1F2B3B] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                <div>
                  <div className="text-xs font-manga uppercase font-bold text-slate-200">
                    SFW Safe Filter
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Filter out explicit adult titles
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFilter('sfwOnly', !filters.sfwOnly)}
                className={`w-12 h-6 rounded-full transition-colors p-1 border ${
                  filters.sfwOnly
                    ? 'bg-[#00E5FF] border-[#00E5FF]'
                    : 'bg-[#070A0E] border-[#1F2B3B]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    filters.sfwOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Footer Action */}
          <div className="p-4 border-t-2 border-[#1F2B3B] bg-[#070A0E]">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#00E5FF] text-black font-manga font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
            >
              Apply Criteria & Return
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
