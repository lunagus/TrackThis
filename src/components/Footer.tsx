import React from 'react';
import { Shield, FileText } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenFeedback: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenFeedback
}) => {
  return (
    <footer className="mt-auto border-t-2 border-[#1F2B3B] bg-[#070A0E] text-slate-400 py-8 px-4 sm:px-6 relative z-20">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4 text-xs font-mono">
        
        {/* Top Centered Row: Logo & Action Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 px-2.5 py-1">
            <div className="w-5 h-5 shrink-0">
              <img src="/icon.svg" alt="TrackThis Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-manga text-sm font-black tracking-wider text-white uppercase">
              TRACK<span className="text-[#00E5FF]">THIS</span>
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* GitHub link with badge reading lunagus */}
          <a
            href="https://github.com/lunagus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121A24] text-slate-300 hover:text-white border border-[#1F2B3B] hover:border-[#00E5FF] transition-all group shadow-xs"
            title="GitHub: lunagus"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="font-bold">lunagus</span>
          </a>

          {/* Feedback Button */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121A24] text-slate-300 hover:text-[#00E5FF] border border-[#1F2B3B] hover:border-[#00E5FF] transition-all group shadow-xs cursor-pointer"
            title="Send Feedback"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-[#00E5FF]"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <span className="font-bold">Feedback</span>
          </button>

          {/* Buy Me a Coffee Donate Link */}
          <a
            href="https://coff.ee/lunagus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FFB300]/10 text-[#FFB300] hover:bg-[#FFB300]/20 border border-[#FFB300]/40 hover:border-[#FFB300] transition-all group font-bold shadow-xs"
            title="Support via Buy Me a Coffee"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-[#FFB300]"
            >
              <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
            </svg>
            <span>Donate</span>
          </a>

        </div>

        {/* Bottom Centered Row: Privacy & Terms Legal Links */}
        <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500 pt-1">
          <button
            onClick={onOpenPrivacy}
            className="hover:text-[#00E5FF] transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={onOpenTerms}
            className="hover:text-[#00E5FF] transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
