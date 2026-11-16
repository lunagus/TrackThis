import React from 'react';
import { Bookmark, X, ArrowRight } from 'lucide-react';
import { useMediaTrackerStore } from '../store/useMediaTrackerStore';

export const SessionBanner: React.FC = () => {
  const { 
    lastSessionBannerVisible, 
    lastSessionInfo, 
    resumeLastSession, 
    dismissSessionBanner 
  } = useMediaTrackerStore();

  if (!lastSessionBannerVisible || !lastSessionInfo) {
    return null;
  }

  const formattedDate = new Date(lastSessionInfo.lastActive).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-[#121820] border-b-2 border-[#00E5FF]/40 text-slate-200 py-2.5 px-4 sm:px-6 relative shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 text-xs sm:text-sm">
          <div className="p-1.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white font-manga tracking-wide uppercase">
              Welcome back!
            </span>{' '}
            <span className="text-slate-300">
              Resume your session from Page {lastSessionInfo.page} ({lastSessionInfo.totalDecided} decisions saved, last active {formattedDate}).
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center">
          <button
            onClick={resumeLastSession}
            className="px-3 py-1 rounded bg-[#00E5FF] text-black font-manga font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-colors flex items-center space-x-1 shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
          >
            <span>Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={dismissSessionBanner}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
