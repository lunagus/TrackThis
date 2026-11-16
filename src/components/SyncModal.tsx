import React, { useState, useRef } from 'react';
import { RefreshCw, X, CheckCircle2, Play, Square } from 'lucide-react';
import { useMediaTrackerStore } from '../store/useMediaTrackerStore';
import { ThrottledSyncService } from '../services/exportSync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const { decisions, catalog, unsyncedChangesCount, resetUnsyncedCount } = useMediaTrackerStore();
  
  const [provider, setProvider] = useState<'anilist' | 'mal'>('anilist');
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<{ total: number; current: number; currentTitle: string } | null>(null);
  const [syncComplete, setSyncComplete] = useState(false);
  
  const syncServiceRef = useRef<ThrottledSyncService | null>(null);

  if (!isOpen) return null;

  const seenCount = Object.values(decisions).filter(d => d.status === 'SEEN').length;

  const handleStartSync = async () => {
    setIsSyncing(true);
    setSyncComplete(false);
    setProgress({ total: seenCount, current: 0, currentTitle: 'Connecting...' });

    const service = new ThrottledSyncService();
    syncServiceRef.current = service;

    try {
      await service.syncWithAniList(decisions, catalog, (p) => {
        setProgress(p);
      });

      setIsSyncing(false);
      setSyncComplete(true);
      resetUnsyncedCount();
    } catch (err) {
      setIsSyncing(false);
    }
  };

  const handleCancelSync = () => {
    if (syncServiceRef.current) {
      syncServiceRef.current.cancel();
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#121820] border-2 border-[#263238] rounded-2xl shadow-2xl overflow-hidden manga-screentone-dark">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#263238] flex items-center justify-between bg-[#0B0F14]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-manga text-lg font-bold text-white uppercase tracking-wider">
              Cloud Background Sync
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSyncing}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Synchronize your local watched list with external anime tracking services. The sync worker adheres to official API rate limits (e.g. AniList 24 requests/min) to prevent throttling.
          </p>

          {/* Provider Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setProvider('anilist')}
              className={`p-3 rounded-xl border text-left transition-all ${
                provider === 'anilist'
                  ? 'bg-[#1A222D] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'bg-[#0B0F14] border-[#263238] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="text-xs font-manga font-bold text-white uppercase mb-1">
                AniList GraphQL
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Rate-limited queue (2.5s / 24 req/min)
              </div>
            </button>

            <button
              onClick={() => setProvider('mal')}
              className={`p-3 rounded-xl border text-left transition-all ${
                provider === 'mal'
                  ? 'bg-[#1A222D] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'bg-[#0B0F14] border-[#263238] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="text-xs font-manga font-bold text-white uppercase mb-1">
                MyAnimeList v2
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                OAuth2 PKCE flow (350ms delay)
              </div>
            </button>
          </div>

          {/* Sync Status Box */}
          <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#263238]">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-400">Titles to Sync:</span>
              <span className="font-bold text-[#00E5FF]">{seenCount} Watched Titles</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono mb-3">
              <span className="text-slate-400">Unsynced Local Changes:</span>
              <span className="font-bold text-amber-400">{unsyncedChangesCount} actions</span>
            </div>

            {/* Live Progress Bar */}
            {progress && (
              <div className="space-y-2 mt-4 pt-4 border-t border-[#263238]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 truncate max-w-[240px]">
                    {progress.currentTitle}
                  </span>
                  <span className="text-[#00E5FF] font-bold">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-[#00E5FF] h-full transition-all duration-300"
                    style={{
                      width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            )}

            {syncComplete && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500 text-xs font-mono text-emerald-400 text-center mt-3 flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sync finished successfully!</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {!isSyncing ? (
              <button
                onClick={handleStartSync}
                disabled={seenCount === 0}
                className="flex-1 py-3 rounded-lg bg-[#00E5FF] text-black font-manga font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Start Background Sync</span>
              </button>
            ) : (
              <button
                onClick={handleCancelSync}
                className="flex-1 py-3 rounded-lg bg-[#FF5252] text-white font-manga font-bold text-xs uppercase tracking-wider hover:bg-red-600 flex items-center justify-center space-x-2"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Cancel Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-[#263238] bg-[#0B0F14] flex justify-end">
          <button
            onClick={onClose}
            disabled={isSyncing}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-manga text-xs uppercase hover:bg-slate-700 disabled:opacity-40"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
