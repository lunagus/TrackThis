import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { parseImportFile } from '../services/exportSync';
import { useMediaTrackerStore } from '../store/useMediaTrackerStore';
import { UserDecision } from '../types/media';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { catalog, importDecisions } = useMediaTrackerStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<UserDecision[] | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg(null);
    setSuccessCount(null);
    setIsProcessing(true);

    try {
      const decisions = await parseImportFile(file, catalog);
      setParsedData(decisions);
      setIsProcessing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse file.');
      setParsedData(null);
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData) return;
    try {
      await importDecisions(parsedData);
      setSuccessCount(parsedData.length);
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setParsedData(null);
        setSuccessCount(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg('Error saving decisions to local storage.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#121820] border-2 border-[#263238] rounded-2xl shadow-2xl overflow-hidden manga-screentone-dark">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#263238] flex items-center justify-between bg-[#0B0F14]">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-manga text-lg font-bold text-white uppercase tracking-wider">
              Import Decisions
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Import your existing anime history from a <strong className="text-white">TrackThis JSON backup</strong>, an official <strong className="text-white">MyAnimeList / AniList XML export</strong>, or a <strong className="text-white">CSV spreadsheet</strong>.
          </p>

          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-[#263238] hover:border-[#00E5FF] rounded-xl p-6 text-center bg-[#0B0F14]/50 transition-colors group cursor-pointer">
            <input
              type="file"
              accept=".json,.xml,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 rounded-full bg-[#121820] border border-[#263238] group-hover:border-[#00E5FF] text-[#00E5FF] transition-colors">
                <FileCode className="w-6 h-6" />
              </div>
              <div className="text-xs font-manga uppercase font-bold text-slate-200 group-hover:text-[#00E5FF]">
                {selectedFile ? selectedFile.name : 'Click or drag file to upload'}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Supports: .json, .xml, .csv
              </div>
            </div>
          </div>

          {/* Status / Errors / Preview */}
          {isProcessing && (
            <div className="text-xs font-mono text-center text-[#00E5FF] py-2">
              Analyzing file structure...
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-[#FF5252]/60 text-xs text-[#FF5252] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedData && !successCount && (
            <div className="p-3 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-mono text-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
                <span>Found {parsedData.length} valid media entries.</span>
              </div>
              <button
                onClick={handleConfirmImport}
                className="px-3 py-1.5 rounded bg-[#00E5FF] text-black font-manga font-bold uppercase text-xs hover:bg-cyan-300"
              >
                Merge Into Library
              </button>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500 text-xs font-mono text-emerald-400 text-center">
              Successfully imported {successCount} decisions into your local database!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-[#263238] bg-[#0B0F14] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-manga text-xs uppercase hover:bg-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
