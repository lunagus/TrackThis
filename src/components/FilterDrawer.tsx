import React from 'react';
import { 
  X, 
  RotateCcw, 
  Search, 
  SlidersHorizontal, 
  ShieldCheck,
  Calendar,
  ArrowDownUp
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
  const { filters, setFilter, resetFilters } = useMediaTrackerStore();

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121820] border-l-2 border-[#263238] shadow-2xl flex flex-col manga-screentone-dark">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b-2 border-[#263238] flex items-center justify-between bg-[#0B0F14]">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-[#00E5FF]" />
              <h3 className="font-manga text-lg font-bold text-white uppercase tracking-wider">
                Filter & Sort
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={resetFilters}
                className="p-1.5 rounded text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1"
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
                Search Title
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilter('searchQuery', e.target.value)}
                  placeholder="e.g. Frieren, Steins;Gate, Attack on Titan..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F14] border border-[#263238] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] transition-colors font-mono"
                />
              </div>
            </div>

            {/* Decision Status Filter */}
            <div>
              <label className="block text-xs font-manga uppercase font-bold text-slate-300 mb-1.5">
                Review Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ALL', label: 'All Titles' },
                  { id: 'UNDECIDED', label: 'Undecided Only' },
                  { id: 'SEEN', label: 'Seen (Yes)' },
                  { id: 'NOT_SEEN', label: 'Not Seen (No)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFilter('status', opt.id as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all border ${
                      filters.status === opt.id
                        ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                        : 'bg-[#0B0F14] text-slate-300 border-[#263238] hover:border-slate-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-manga uppercase font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                <ArrowDownUp className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Sort By</span>
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F14] border border-[#263238] text-white text-xs focus:outline-none focus:border-[#00E5FF] font-mono"
              >
                <option value="popularity">Popularity (Most Popular)</option>
                <option value="score">Community Rating (Highest Score)</option>
                <option value="year_desc">Release Date (Newest First)</option>
                <option value="year_asc">Release Date (Oldest First)</option>
                <option value="title_asc">Title (Alphabetical A-Z)</option>
              </select>
            </div>

            {/* Target Demographics Facet */}
            <div>
              <label className="block text-xs font-manga uppercase font-bold text-slate-300 mb-1.5">
                Demographic Facet
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DEMOGRAPHICS.map(demo => {
                  const active = filters.demographics.includes(demo);
                  return (
                    <button
                      key={demo}
                      onClick={() => toggleDemographic(demo)}
                      className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all border ${
                        active
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                          : 'bg-[#0B0F14] text-slate-400 border-[#263238] hover:border-slate-500'
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
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all border ${
                        active
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                          : 'bg-[#0B0F14] text-slate-400 border-[#263238] hover:border-slate-500'
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Genres & Match Logic (AND vs OR) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-manga uppercase font-bold text-slate-300">
                  Genres ({filters.genres.length} active)
                </label>
                <div className="flex items-center space-x-1 bg-[#0B0F14] p-0.5 rounded border border-[#263238] text-[10px] font-mono">
                  <button
                    onClick={() => setFilter('genreMatchMode', 'OR')}
                    className={`px-2 py-0.5 rounded ${
                      filters.genreMatchMode === 'OR'
                        ? 'bg-[#00E5FF] text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Match ANY (OR)
                  </button>
                  <button
                    onClick={() => setFilter('genreMatchMode', 'AND')}
                    className={`px-2 py-0.5 rounded ${
                      filters.genreMatchMode === 'AND'
                        ? 'bg-[#00E5FF] text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Match ALL (AND)
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-[#0B0F14] rounded-lg border border-[#263238]">
                {ALL_GENRES.map(genre => {
                  const active = filters.genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-all border ${
                        active
                          ? 'bg-[#00E5FF] text-black font-bold border-[#00E5FF]'
                          : 'bg-[#121820] text-slate-400 border-[#263238] hover:text-slate-200'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year Range Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-manga uppercase font-bold text-slate-300 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Release Year Range</span>
                </label>
                <span className="text-xs font-mono text-[#00E5FF] font-bold">
                  {filters.yearMin} - {filters.yearMax}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">From:</span>
                  <input
                    type="range"
                    min="1980"
                    max="2025"
                    value={filters.yearMin}
                    onChange={(e) => setFilter('yearMin', Math.min(Number(e.target.value), filters.yearMax))}
                    className="w-full accent-[#00E5FF]"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">To:</span>
                  <input
                    type="range"
                    min="1980"
                    max="2025"
                    value={filters.yearMax}
                    onChange={(e) => setFilter('yearMax', Math.max(Number(e.target.value), filters.yearMin))}
                    className="w-full accent-[#00E5FF]"
                  />
                </div>
              </div>
            </div>

            {/* SFW Safe for Work Toggle */}
            <div className="pt-3 border-t border-[#263238] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                <div>
                  <div className="text-xs font-manga uppercase font-bold text-slate-200">
                    SFW Filter
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Hide adult and 18+ content
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFilter('sfwOnly', !filters.sfwOnly)}
                className={`w-12 h-6 rounded-full transition-colors p-1 border ${
                  filters.sfwOnly
                    ? 'bg-[#00E5FF] border-[#00E5FF]'
                    : 'bg-[#0B0F14] border-[#263238]'
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
          <div className="p-4 border-t-2 border-[#263238] bg-[#0B0F14]">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-[#00E5FF] text-black font-manga font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
            >
              Apply Filters & Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
