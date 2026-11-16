import React, { useState } from 'react';
import { Shield, FileText, Award, X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'attributions' | 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'attributions'
}) => {
  const [tab, setTab] = useState<'attributions' | 'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#121820] border-2 border-[#263238] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] manga-screentone-dark">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#263238] flex items-center justify-between bg-[#0B0F14]">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-manga text-lg font-bold text-white uppercase tracking-wider">
              Legal & Open-Source Attributions
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#263238] bg-[#0B0F14]/70 px-4">
          <button
            onClick={() => setTab('attributions')}
            className={`py-3 px-4 font-manga text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 ${
              tab === 'attributions'
                ? 'border-[#00E5FF] text-[#00E5FF]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Data Attributions</span>
          </button>

          <button
            onClick={() => setTab('privacy')}
            className={`py-3 px-4 font-manga text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 ${
              tab === 'privacy'
                ? 'border-[#00E5FF] text-[#00E5FF]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setTab('terms')}
            className={`py-3 px-4 font-manga text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 ${
              tab === 'terms'
                ? 'border-[#00E5FF] text-[#00E5FF]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono text-slate-300 leading-relaxed">
          
          {tab === 'attributions' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-manga text-sm font-bold text-white uppercase mb-1">
                  Open Database License (ODbL) v1.0
                </h4>
                <p className="text-slate-400">
                  TrackThis utilizes dataset compilation and metadata mapping adapted from the <strong className="text-slate-200">manami-project/anime-offline-database</strong> and cross-referenced with <strong className="text-slate-200">Fribb/anime-lists</strong>. This data is made available under the Open Database License (ODbL) v1.0. Any rights in individual contents of the database are licensed under the Database Contents License (DbCL) v1.0.
                </p>
              </div>

              <div className="pt-3 border-t border-[#263238]">
                <h4 className="font-manga text-sm font-bold text-white uppercase mb-1">
                  The Movie Database (TMDB) Notice
                </h4>
                <p className="text-slate-400">
                  This product uses the TMDB API and media identifiers for movie and cross-media references, but is not endorsed or certified by TMDB. All movie imagery and descriptions are property of their respective creators and distributors.
                </p>
              </div>

              <div className="pt-3 border-t border-[#263238]">
                <h4 className="font-manga text-sm font-bold text-white uppercase mb-1">
                  Open Library & Community Metadata
                </h4>
                <p className="text-slate-400">
                  Book catalog schemas and identifiers are adapted under Creative Commons Zero (CC0) and public domain records curated by the Open Library / Internet Archive project.
                </p>
              </div>

              <div className="pt-3 border-t border-[#263238]">
                <h4 className="font-manga text-sm font-bold text-white uppercase mb-1">
                  MyAnimeList & AniList
                </h4>
                <p className="text-slate-400">
                  MyAnimeList and AniList names, trademarks, and associated APIs remain the intellectual property of their respective owners. TrackThis is an independent open-source utility designed to export and sync interoperable data lists.
                </p>
              </div>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-manga text-sm font-bold text-[#00E5FF] uppercase mb-1">
                  Strict Local-First Architecture
                </h4>
                <p className="text-slate-300">
                  TrackThis is architected entirely around local-first data storage. Your decisions, watched lists, and session states are written exclusively to your web browser's local IndexedDB instance.
                </p>
              </div>

              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong className="text-slate-200">Zero Server-Side Storage:</strong> We do not operate a remote database storing your personal anime or media lists.</li>
                <li><strong className="text-slate-200">No Analytics or Ad Trackers:</strong> No third-party tracking scripts, advertising SDKs, or user fingerprinting cookies are loaded.</li>
                <li><strong className="text-slate-200">OAuth Credentials:</strong> Any authorization tokens provided for AniList or MAL remain stored inside your browser storage and are dispatched strictly to official API endpoints.</li>
                <li><strong className="text-slate-200">Exit Guard:</strong> An unsaved change detection guard prompts before tab unload to ensure you never lose decisions before completing a client-side export or sync.</li>
              </ul>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-manga text-sm font-bold text-white uppercase mb-1">
                  Acceptance of Terms
                </h4>
                <p className="text-slate-400">
                  By accessing and using TrackThis (trackthis.cc), you agree to utilize the platform for personal, non-commercial media tracking and backup purposes.
                </p>
              </div>

              <div>
                <h4 className="font-manga text-sm font-bold text-white uppercase mb-1">
                  API Rate Limits and Acceptable Use
                </h4>
                <p className="text-slate-400">
                  When connecting your personal account to third-party APIs (such as AniList or MyAnimeList), you acknowledge that rate-limiting delays are enforced by design to comply with each platform's API Terms of Service.
                </p>
              </div>

              <div>
                <h4 className="font-manga text-sm font-bold text-white uppercase mb-1">
                  Disclaimer of Warranty
                </h4>
                <p className="text-slate-400">
                  The software is provided &quot;as is&quot;, without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-[#263238] bg-[#0B0F14] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#00E5FF] text-black font-manga font-bold text-xs uppercase hover:bg-cyan-300"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
