import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  SlidersHorizontal, 
  LayoutGrid, 
  Layers, 
  Undo2, 
  Trash2,
  ChevronDown,
  Check,
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useMediaTrackerStore } from '../store/useMediaTrackerStore';
import { 
  exportStateJSON, 
  exportMALXML, 
  exportDecisionsCSV, 
  exportSeenTXT, 
  exportLetterboxdCSV, 
  exportGoodreadsCSV 
} from '../services/exportSync';

interface HeaderProps {
  onOpenFilters: () => void;
  onOpenSync: () => void;
  onOpenImport: () => void;
  activeFilterCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFilters,
  onOpenSync,
  onOpenImport,
  activeFilterCount
}) => {
  const {
    viewMode,
    setViewMode,
    stats,
    undoStack,
    undoLastDecision,
    resetAllDecisions,
    decisions,
    catalog,
    unsyncedChangesCount
  } = useMediaTrackerStore();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#070A0E]/95 backdrop-blur-xl border-b-2 border-[#1F2B3B] shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Left: Branding & Category Selector */}
          <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
            <div className="flex items-center space-x-2.5 sm:space-x-3 group cursor-pointer">
              {/* Cyan Heart + Plus Logo (Crisp free-to-use vector without glossy gradient) */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 group-hover:scale-105 transition-transform">
                <img src="/icon.svg" alt="TrackThis Logo" className="w-full h-full object-contain" />
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-manga text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-[#00E5FF] transition-colors">
                    TRACK<span className="text-[#00E5FF]">THIS</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#151E2B] text-[#00E5FF] border border-[#00E5FF]/40 hidden xs:inline">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                  trackthis.cc/<span className="text-[#00E5FF] font-semibold">anime</span>
                </div>
              </div>
            </div>

            {/* Category Switcher Tabs */}
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-[#1F2B3B]">
              <button 
                className="px-3 py-1.5 text-xs font-bold font-manga uppercase rounded-lg bg-[#0E141D] text-[#00E5FF] border-2 border-[#00E5FF] shadow-[2px_2px_0px_rgba(0,229,255,0.4)]"
              >
                Anime
              </button>
              <div className="relative group/tab">
                <button 
                  disabled
                  className="px-3 py-1.5 text-xs font-bold font-manga uppercase rounded-lg text-slate-500 hover:text-slate-400 cursor-not-allowed flex items-center space-x-1 opacity-50"
                >
                  <span>Movies</span>
                  <span className="text-[9px] px-1 py-0.2 bg-[#151E2B] text-slate-400 rounded border border-slate-700">Soon</span>
                </button>
              </div>
              <div className="relative group/tab">
                <button 
                  disabled
                  className="px-3 py-1.5 text-xs font-bold font-manga uppercase rounded-lg text-slate-500 hover:text-slate-400 cursor-not-allowed flex items-center space-x-1 opacity-50"
                >
                  <span>Books</span>
                  <span className="text-[9px] px-1 py-0.2 bg-[#151E2B] text-slate-400 rounded border border-slate-700">Soon</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Center: Live Triage HUD (Always visible on all screens) */}
          <div className="flex items-center space-x-2 sm:space-x-3 px-2.5 sm:px-4 py-1.5 rounded-xl bg-[#0E141D] border-2 border-[#1F2B3B] shadow-inner font-mono text-xs">
            {/* Seen Count */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 text-[#00E5FF]">
              <div className="w-4 h-4 rounded-full bg-[#00E5FF]/20 flex items-center justify-center border border-[#00E5FF]/40 shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-white">{stats.seen}</span>
              <span className="text-slate-400 text-[10px] sm:text-[11px] hidden xs:inline">Seen</span>
            </div>

            <span className="text-slate-700">/</span>

            {/* Not Seen Count */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 text-[#FF334B]">
              <div className="w-4 h-4 rounded-full bg-[#FF334B]/20 flex items-center justify-center border border-[#FF334B]/40 shrink-0">
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-white">{stats.notSeen}</span>
              <span className="text-slate-400 text-[10px] sm:text-[11px] hidden xs:inline">No</span>
            </div>

            <span className="text-slate-700">/</span>

            {/* Remaining Count */}
            <div className="flex items-center space-x-1 text-slate-400 text-[10px] sm:text-[11px]">
              <span className="font-bold text-xs sm:text-sm text-slate-200">{stats.undecided}</span>
              <span className="hidden xs:inline">Left</span>
            </div>

            {/* Mini Progress Track */}
            <div className="w-12 sm:w-20 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800 ml-1 sm:ml-2 relative hidden xs:block">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-[#00E5FF] h-full transition-all duration-300 rounded-full"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
            <span className="font-bold text-[11px] sm:text-xs text-[#00E5FF]">{stats.completionPercentage}%</span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#0E141D] p-1 rounded-xl border border-[#1F2B3B]">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-manga font-bold uppercase transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mode A: Batch Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('poll')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-manga font-bold uppercase transition-all ${
                  viewMode === 'poll'
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mode B: Fast-Pick Poll"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Poll</span>
              </button>
            </div>

            {/* Undo Button */}
            <button
              onClick={() => undoLastDecision()}
              disabled={undoStack.length === 0}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-[#1F2B3B] bg-[#0E141D] text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 text-xs"
              title="Undo last action (Hotkey: Z)"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden md:inline font-mono text-[10px] text-slate-400">Z</span>
            </button>

            {/* Filter Toggle */}
            <button
              onClick={onOpenFilters}
              className={`relative p-2 sm:px-2.5 sm:py-2 rounded-xl border bg-[#0E141D] transition-colors flex items-center space-x-1.5 text-xs ${
                activeFilterCount > 0 
                  ? 'border-[#00E5FF] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]' 
                  : 'border-[#1F2B3B] text-slate-300 hover:text-white hover:border-slate-500'
              }`}
              title="Filter & Sort"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#00E5FF] text-black text-[10px] font-bold flex items-center justify-center font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Export Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-2 rounded-xl border-2 border-[#1F2B3B] bg-[#0E141D] hover:border-[#00E5FF] text-slate-200 hover:text-white font-manga font-bold text-xs uppercase flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
              >
                <Download className="w-4 h-4 text-[#00E5FF]" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showExportMenu && (
                <div 
                  className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0E141D] border-2 border-[#1F2B3B] shadow-2xl py-2 z-50 manga-screentone-dark animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-[#1F2B3B]">
                    List Downloads
                  </div>

                  <button
                    onClick={() => {
                      exportMALXML(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#151E2B] hover:text-[#00E5FF] flex items-center justify-between"
                  >
                    <span>MyAnimeList / AniList</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950 text-[#00E5FF] rounded border border-cyan-800">XML</span>
                  </button>

                  <button
                    onClick={() => {
                      exportStateJSON(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#151E2B] hover:text-[#00E5FF] flex items-center justify-between"
                  >
                    <span>Full State Backup</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      exportDecisionsCSV(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#151E2B] hover:text-[#00E5FF] flex items-center justify-between"
                  >
                    <span>Decisions Spreadsheet</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      exportSeenTXT(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#151E2B] hover:text-[#00E5FF] flex items-center justify-between"
                  >
                    <span>Watched Plaintext</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">TXT</span>
                  </button>

                  <div className="my-1 border-t border-[#1F2B3B]" />

                  <div className="px-3.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Cross-Platform
                  </div>

                  <button
                    onClick={() => {
                      exportLetterboxdCSV(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs hover:bg-[#151E2B] text-slate-400 hover:text-slate-200 flex items-center justify-between"
                  >
                    <span>Letterboxd / IMDb</span>
                    <span className="text-[9px] font-mono text-slate-500">CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      exportGoodreadsCSV(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs hover:bg-[#151E2B] text-slate-400 hover:text-slate-200 flex items-center justify-between"
                  >
                    <span>Goodreads / StoryGraph</span>
                    <span className="text-[9px] font-mono text-slate-500">CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Import Trigger */}
            <button
              onClick={onOpenImport}
              className="p-2 sm:p-2.5 rounded-xl border border-[#1F2B3B] bg-[#0E141D] text-slate-300 hover:text-[#00E5FF] hover:border-slate-500 transition-colors"
              title="Import JSON, XML, or CSV"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Cloud Sync Trigger */}
            <button
              onClick={onOpenSync}
              className="px-2.5 sm:px-3 py-2 rounded-xl border-2 border-[#1F2B3B] bg-[#0E141D] hover:border-[#00E5FF] text-slate-200 hover:text-[#00E5FF] font-manga font-bold text-xs uppercase flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
              title="Cloud Sync (AniList / MAL)"
            >
              <RefreshCw className="w-4 h-4 text-[#00E5FF]" />
              <span className="hidden md:inline">Sync</span>
              {unsyncedChangesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
              )}
            </button>

            {/* Reset All Progress */}
            <div className="relative">
              <button
                onClick={() => setShowResetConfirm(!showResetConfirm)}
                className="p-2 sm:p-2.5 rounded-xl border border-[#1F2B3B] bg-[#0E141D] text-slate-400 hover:text-[#FF334B] hover:border-[#FF334B] transition-colors"
                title="Reset All Local Decisions"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {showResetConfirm && (
                <div className="absolute right-0 mt-2 w-72 p-4 rounded-xl bg-[#0E141D] border-2 border-[#FF334B] shadow-2xl z-50 text-xs animate-in fade-in duration-100">
                  <div className="font-manga font-bold text-white text-sm mb-1 uppercase">
                    Clear all decisions?
                  </div>
                  <div className="text-slate-400 text-xs mb-3 leading-relaxed">
                    This resets your local database completely. Make sure to download a backup first.
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        resetAllDecisions();
                        setShowResetConfirm(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FF334B] text-white font-manga font-bold uppercase hover:bg-red-600"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
