import React, { useState } from 'react';
import { Send, X, Check } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please enter a message.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/xldleqja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (!response.ok) {
        throw new Error('Network error sending feedback');
      }

      setStatus('success');
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setStatus('idle');
        onClose();
      }, 2000);
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send feedback. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#0E141D] border-2 border-[#1F2B3B] rounded-2xl shadow-2xl overflow-hidden flex flex-col manga-screentone-dark animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#1F2B3B] flex items-center justify-between bg-[#070A0E]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-manga text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                Send Feedback
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                We would love to hear from you!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151E2B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {status === 'success' ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#00E5FF]/20 border-2 border-[#00E5FF] text-[#00E5FF] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-manga text-base font-bold text-white uppercase">
                Thank You!
              </h4>
              <p className="text-xs font-mono text-[#00E5FF]">
                Your feedback has been sent successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-[#FF334B]/10 border border-[#FF334B]/40 text-[#FF334B] text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151E2B] border-2 border-[#243348] text-white text-xs sm:text-sm focus:border-[#00E5FF] focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151E2B] border-2 border-[#243348] text-white text-xs sm:text-sm focus:border-[#00E5FF] focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                  Message <span className="text-[#00E5FF]">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                  placeholder="Share your thoughts, suggestions, or issues..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151E2B] border-2 border-[#243348] text-white text-xs sm:text-sm focus:border-[#00E5FF] focus:outline-hidden transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-manga text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="px-5 py-2 rounded-xl bg-[#00E5FF] text-black font-manga font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.6)] flex items-center space-x-1.5"
                >
                  {status === 'sending' ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
