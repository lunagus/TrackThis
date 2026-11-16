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
  ChevronDown
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
    <header className="sticky top-0 z-40 bg-[#0B0F14]/95 backdrop-blur-md border-b-2 border-[#263238] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Category Tabs */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer group">
              {/* Cyan Heart + White Plus Logo */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#00E5FF] to-white/40 shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-transform">
                <img src="/icon.svg" alt="TrackThis Logo" className="w-full h-full object-contain" />
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-manga text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-[#00E5FF] transition-colors">
                    TRACK<span className="text-[#00E5FF]">THIS</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#1A222D] text-[#00E5FF] border border-[#00E5FF]/30">
                    V1.0
                  </span>
                </div>
                <div className="hidden sm:block text-[11px] font-mono text-slate-400">
                  trackthis.cc/<span className="text-white font-semibold">anime</span>
                </div>
              </div>
            </div>

            {/* Media Tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#263238]">
              <button 
                className="px-3 py-1.5 text-xs font-bold font-manga uppercase rounded-md bg-[#121820] text-[#00E5FF] border-2 border-[#00E5FF] shadow-[2px_2px_0px_rgba(0,229,255,0.4)]"
              >
                Anime
              </button>
              <div className="relative group/tab">
                <button 
                  disabled
                  className="px-3 py-1.5 text-xs font-bold font-manga uppercase rounded-md text-slate-500 hover:text-slate-400 cursor-not-allowed flex items-center space-x-1.5 opacity-60"
                >
                  <span>Movies</span>
                  <span className="text-[9px] px-1 bg-[#1A222D] text-slate-400 rounded border border-slate-700">Soon</span>
                </button>
              </div>
              <div className="relative group/tab">
                <button 
                  disabled
                  className="px-3 py-1.5 text-xs font-bold font-manga uppercase rounded-md text-slate-500 hover:text-slate-400 cursor-not-allowed flex items-center space-x-1.5 opacity-60"
                >
                  <span>Books</span>
                  <span className="text-[9px] px-1 bg-[#1A222D] text-slate-400 rounded border border-slate-700">Soon</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center space-x-3 px-3.5 py-1.5 rounded-lg bg-[#121820] border border-[#263238] shadow-inner font-mono text-xs">
            <div className="flex items-center space-x-1 text-[#00E5FF]">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
              <span className="font-bold">{stats.seen}</span>
              <span className="text-slate-400">Seen</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1 text-[#FF5252]">
              <span className="font-bold">{stats.notSeen}</span>
              <span className="text-slate-400">No</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1 text-slate-300">
              <span className="font-bold">{stats.undecided}</span>
              <span className="text-slate-500">Left</span>
            </div>
            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700 ml-2">
              <div 
                className="bg-[#00E5FF] h-full transition-all duration-300"
                style={{ width: `${stats.completionPercentage}%` }}
              ></div>
            </div>
            <span className="font-bold text-[#00E5FF]">{stats.completionPercentage}%</span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#121820] p-1 rounded-lg border border-[#263238]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md flex items-center space-x-1 text-xs font-manga uppercase transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mode A: Batch Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('poll')}
                className={`p-1.5 rounded-md flex items-center space-x-1 text-xs font-manga uppercase transition-all ${
                  viewMode === 'poll'
                    ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mode B: 1-by-1 Fast-Pick Poll"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Poll</span>
              </button>
            </div>

            {/* Undo Button */}
            <button
              onClick={() => undoLastDecision()}
              disabled={undoStack.length === 0}
              className={`p-2 rounded-lg border border-[#263238] bg-[#121820] text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
              title="Undo last action (Hotkey: Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={onOpenFilters}
              className={`relative p-2 rounded-lg border bg-[#121820] transition-colors flex items-center space-x-1.5 ${
                activeFilterCount > 0 
                  ? 'border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                  : 'border-[#263238] text-slate-300 hover:text-white hover:border-slate-500'
              }`}
              title="Filters & Search"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#00E5FF] text-black text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border-2 border-[#263238] bg-[#121820] hover:border-[#00E5FF] text-slate-200 hover:text-white font-manga font-bold text-xs uppercase flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
              >
                <Download className="w-4 h-4 text-[#00E5FF]" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showExportMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-lg bg-[#121820] border-2 border-[#263238] shadow-2xl py-2 z-50 manga-screentone-dark animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 border-b border-[#263238]">
                    Client-Side Downloads
                  </div>

                  <button
                    onClick={() => {
                      exportMALXML(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1A222D] hover:text-[#00E5FF] flex items-center justify-between"
                  >
                    <span>MyAnimeList / AniList XML</span>
                    <span className="text-[10px] font-mono px-1 bg-cyan-950 text-[#00E5FF] rounded">XML</span>
                  </button>

                  <button
                    onClick={() => {
                      exportStateJSON(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1A222D] hover:text-[#00E5FF] flex items-center justify-between"
                  >
                    <span>Full State Backup</span>
                    <span className="text-[10px] font-mono px-1 bg-slate-800 text-slate-300 rounded">JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      exportDecisionsCSV(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1A222D] hover:text-[#00E5FF] flex items-center justify-between"
                  >
                    <span>Decisions Spreadsheet</span>
                    <span className="text-[10px] font-mono px-1 bg-slate-800 text-slate-300 rounded">CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      exportSeenTXT(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1A222D] hover:text-[#00E5FF] flex items-center justify-between"
                  >
                    <span>Seen Titles Plaintext</span>
                    <span className="text-[10px] font-mono px-1 bg-slate-800 text-slate-300 rounded">TXT</span>
                  </button>

                  <div className="my-1 border-t border-[#263238]"></div>

                  <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-500">
                    Cross-Platform Formats
                  </div>

                  <button
                    onClick={() => {
                      exportLetterboxdCSV(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#1A222D] hover:text-slate-200 text-slate-400 flex items-center justify-between"
                  >
                    <span>Letterboxd / IMDb</span>
                    <span className="text-[9px] font-mono text-slate-500">CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      exportGoodreadsCSV(decisions, catalog);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#1A222D] hover:text-slate-200 text-slate-400 flex items-center justify-between"
                  >
                    <span>Goodreads / StoryGraph</span>
                    <span className="text-[9px] font-mono text-slate-500">CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Import Button */}
            <button
              onClick={onOpenImport}
              className="p-2 rounded-lg border border-[#263238] bg-[#121820] text-slate-300 hover:text-[#00E5FF] hover:border-slate-500 transition-colors"
              title="Import JSON, XML, or CSV"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Sync Button */}
            <button
              onClick={onOpenSync}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border-2 border-[#263238] bg-[#121820] hover:border-[#00E5FF] text-slate-200 hover:text-[#00E5FF] font-manga font-bold text-xs uppercase flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
              title="Cloud Sync (AniList / MAL)"
            >
              <RefreshCw className="w-4 h-4 text-[#00E5FF]" />
              <span className="hidden sm:inline">Sync</span>
              {unsyncedChangesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"></span>
              )}
            </button>

            {/* Reset All Button (with confirmation) */}
            <div className="relative">
              <button
                onClick={() => setShowResetConfirm(!showResetConfirm)}
                className="p-2 rounded-lg border border-[#263238] bg-[#121820] text-slate-400 hover:text-[#FF5252] hover:border-[#FF5252] transition-colors"
                title="Reset All Progress"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {showResetConfirm && (
                <div className="absolute right-0 mt-2 w-64 p-3 rounded-lg bg-[#121820] border-2 border-[#FF5252] shadow-2xl z-50 text-xs">
                  <div className="font-bold text-white mb-1">Clear all decisions?</div>
                  <div className="text-slate-400 text-[11px] mb-3">
                    This will reset your local database. Be sure to export your backup first.
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        resetAllDecisions();
                        setShowResetConfirm(false);
                      }}
                      className="px-2 py-1 rounded bg-[#FF5252] text-white font-bold hover:bg-red-600"
                    >
                      Reset All
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
