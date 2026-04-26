import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusScope } from 'react-aria';
import { callCampaignManager } from '../../services/geminiAPI.js';

const MOOD_COLORS = {
  encouraging: 'border-green-500 bg-green-50',
  urgent: 'border-amber-500 bg-amber-50',
  warning: 'border-red-500 bg-red-50',
  celebrating: 'border-[#FF6B00] bg-orange-50', // saffron
  default: 'border-secondary bg-slate-50'
};

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
    
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

const AvatarSVG = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 rounded-full bg-slate-200 border-2 border-secondary shadow-sm" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="40" r="20" fill="#E8B99A" />
    {/* Hair/Face details */}
    <path d="M 30 40 Q 50 15 70 40 L 70 30 Q 50 10 30 30 Z" fill="#333" />
    <path d="M 35 40 Q 50 45 65 40" fill="none" stroke="#A67B5B" strokeWidth="2" />
    {/* Kurta */}
    <path d="M 20 100 Q 20 70 50 70 Q 80 70 80 100 Z" fill="#F4F4F4" />
    <path d="M 45 70 L 45 100 M 55 70 L 55 100" stroke="#DDD" strokeWidth="2" />
    <circle cx="50" cy="80" r="2" fill="#333" />
    <circle cx="50" cy="90" r="2" fill="#333" />
  </svg>
);

const CampaignManager = ({ scene, context, playerDecision, gameState }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchAdvice = async () => {
      setIsLoading(true);
      setIsOpen(true); // Auto-open when new scene loads
      const data = await callCampaignManager(scene, context, playerDecision, gameState);
      if (mounted) {
        setResponse(data);
        setIsLoading(false);
      }
    };

    if (scene) {
      fetchAdvice();
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);

    return () => { 
      mounted = false; 
      window.removeEventListener('keydown', handleEscape);
    };
  }, [scene, context, playerDecision, gameState]);

  const moodStyle = response ? MOOD_COLORS[response.mood] || MOOD_COLORS.default : MOOD_COLORS.default;

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-secondary text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-primary transition-transform hover:scale-105"
          aria-label="Open Campaign Manager"
        >
          <AvatarSVG />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[8px] flex items-center justify-center text-white font-bold">!</span>
          </span>
        </button>
      )}

      {/* Slide-in Panel */}
      <AnimatePresence>
        {isOpen && (
          <FocusScope contain restoreFocus autoFocus>
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 rounded-xl shadow-2xl border-t-4 bg-white overflow-hidden flex flex-col ${moodStyle}`}
              role="region"
              aria-label="Campaign Manager Advice"
            >
              <div className="p-4 flex items-start justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <AvatarSVG />
                  <div>
                    <h3 className="font-heading font-bold text-secondary text-lg">Star (Manager)</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Campaign Strategist</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary rounded-md p-1"
                  aria-label="Dismiss panel"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div 
                className="p-5 flex-1 overflow-y-auto max-h-[60vh] bg-white/95"
                aria-live="polite"
              >
                {isLoading ? (
                  <div className="space-y-4 animate-pulse" aria-busy="true" aria-live="polite">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="mt-4 h-16 bg-gray-100 rounded-lg w-full"></div>
                  </div>
                ) : response ? (
                  <div className="space-y-4 text-sm text-gray-800 font-body" aria-live="polite">
                    <div className="leading-relaxed">
                      <TypewriterText text={response.message} />
                    </div>
                    
                    {response.realWorldFact && (
                      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-secondary rounded-r-md">
                        <span className="block font-bold text-xs text-secondary mb-1 uppercase tracking-wide">Election Fact</span>
                        <p className="text-xs text-slate-700 italic">{response.realWorldFact}</p>
                      </div>
                    )}
                    
                    {response.tip && (
                      <div className="mt-2 flex items-start gap-2 text-primary font-medium">
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm">Tip: {response.tip}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-500">Could not connect to the strategist. Keep moving forward!</p>
                )}
              </div>
            </motion.div>
          </FocusScope>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(CampaignManager);
