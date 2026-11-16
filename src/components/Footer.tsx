import React from 'react';
import { Shield, Award, FileText, Database } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab: 'attributions' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="mt-auto border-t-2 border-[#263238] bg-[#0B0F14] text-slate-400 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        
        {/* Left: Branding & Local First Notice */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
          <div className="flex items-center space-x-2 text-white font-manga font-bold uppercase">
            <div className="w-5 h-5 shrink-0">
              <img src="/icon.svg" alt="TrackThis Icon" className="w-full h-full object-contain" />
            </div>
            <span>TRACKTHIS</span>
          </div>

          <span className="hidden sm:inline text-slate-600">|</span>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Local-First IndexedDB Engine</span>
          </div>
        </div>

        {/* Center: Legal & Attribution Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <button
            onClick={() => onOpenLegal('attributions')}
            className="hover:text-[#00E5FF] transition-colors flex items-center space-x-1"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Data Attributions (ODbL)</span>
          </button>

          <span className="text-slate-600">•</span>

          <button
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-[#00E5FF] transition-colors flex items-center space-x-1"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <span className="text-slate-600">•</span>

          <button
            onClick={() => onOpenLegal('terms')}
            className="hover:text-[#00E5FF] transition-colors flex items-center space-x-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Right: Copyright */}
        <div className="text-slate-500 text-[11px] text-center sm:text-right">
          trackthis.cc • High-Velocity Media Tracker
        </div>

      </div>
    </footer>
  );
};
