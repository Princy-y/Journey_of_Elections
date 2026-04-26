import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from '../ui/ProgressBar.jsx';
import CampaignManager from '../ui/CampaignManager.jsx';
import ReportCard from '../ui/ReportCard.jsx';
import { calculateVotes } from '../../engine/VoteCalculator.js';
import { generateReportCard } from '../../engine/ScoreTracker.js';
import { saveGameSession, saveToLeaderboard } from '../../services/firebaseService.js';
import { analyticsService } from '../../services/analyticsService.js';

export default function Scene7_Certification({ gameState, markTopicLearned, resetGame }) {
  const [results, setResults] = useState(null);
  const [report, setReport] = useState(null);
  const [step, setStep] = useState(0);

  // Calculate final results again (deterministic)
  const finalResults = React.useMemo(() => calculateVotes(gameState), [gameState]);
  
  // Generate Report Card
  const finalReport = React.useMemo(() => generateReportCard(gameState, finalResults), [gameState, finalResults]);

  useEffect(() => {
    setResults(finalResults);
    setReport(finalReport);

    markTopicLearned('certification');

    // Save to Firebase
    saveGameSession(gameState, finalResults, finalReport);
    saveToLeaderboard(gameState.player.name, finalReport.civicScore, finalResults.winner === 'player', gameState.constituency.name, gameState.player.party);

    // Google Analytics
    analyticsService.gameCompleted({
      winner: finalResults.winner === 'player',
      final_approval: gameState.resources.approvalRating,
      civic_score: finalReport.civicScore,
      margin: finalResults.margin
    });

    // Auto advance certification steps
    const timers = [
      setTimeout(() => setStep(1), 2000),
      setTimeout(() => setStep(2), 4000),
      setTimeout(() => setStep(3), 6000),
      setTimeout(() => setStep(4), 8000),
      setTimeout(() => setStep(5), 10000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [gameState, markTopicLearned]);

  if (!results || !report) return null;

  const isWin = results.winner === 'player';

  const steps = [
    "Step 1: Returning Officer counts and verifies all rounds...",
    "Step 2: Declaration of result — winning candidate announced...",
    "Step 3: Election certificate (Form 20) issued to winner...",
    "Step 4: Result uploaded to ECI website within 24 hours...",
    results.isRecount ? "Step 5: Margin < 1000. Recount demanded and verified..." : "Step 5: Process concluded."
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto pb-24"
    >
      <ProgressBar current={7} total={7} />
      
      {step < 5 ? (
        <div className="bg-white p-12 rounded-2xl shadow-2xl border border-slate-200 text-center min-h-[60vh] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-primary"></div>
          <h2 className="text-3xl font-heading font-bold mb-8 text-secondary flex items-center justify-center gap-3">
            <span className="material-icons text-4xl text-slate-400">gavel</span>
            The Returning Officer rises to declare the result
          </h2>
          
          <div className="space-y-4 max-w-lg mx-auto text-left bg-slate-50 p-6 rounded-lg border border-slate-100">
            {steps.map((s, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: step >= idx ? 1 : 0, x: step >= idx ? 0 : -20 }}
                className={`flex items-center gap-3 ${step === idx ? 'text-primary font-bold' : 'text-slate-500'}`}
              >
                {step >= idx && (
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {s}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className={`p-12 rounded-2xl shadow-2xl text-center text-white mb-8 relative overflow-hidden ${isWin ? 'bg-gradient-to-br from-orange-500 to-primary' : 'bg-gradient-to-br from-slate-700 to-secondary'}`}>
            
            {/* Confetti effect for win */}
            {isWin && (
              <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxjaXJjbGUgY3g9IjEwJSIgY3k9IjEwJSIgcj0iMiIgZmlsbD0id2hpdGUiIC8+PGNpcmNsZSBjeD0iNDAlIiBjeT0iMzAlIiByPSIyIiBmaWxsPSJ3aGl0ZSIgLz48Y2lyY2xlIGN4PSI4MCUiIGN5PSIyMCUiIHI9IjIiIGZpbGw9IndoaXRlIiAvPjwvc3ZnPg==')]"></div>
            )}

            <h1 className="text-6xl font-heading font-bold mb-4">{isWin ? 'VICTORY!' : 'DEFEAT'}</h1>
            {isWin ? (
              <p className="text-2xl font-body">You are declared elected from {gameState.constituency.name} with a margin of {results.margin.toLocaleString()} votes.</p>
            ) : (
              <p className="text-2xl font-body">A close fight. Democracy has spoken. The opponent won by a margin of {results.margin.toLocaleString()} votes.</p>
            )}
            
            <div className="mt-8 inline-block bg-white/20 backdrop-blur-md px-6 py-3 rounded-full">
              <p className="font-bold tracking-widest uppercase">Vote Share: {results.playerSharePercent}%</p>
            </div>
          </div>

          <ReportCard report={report} />

          <div className="text-center mt-12 mb-24">
            <button 
              onClick={resetGame}
              className="bg-slate-800 hover:bg-black text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all uppercase tracking-widest text-sm"
            >
              Start New Campaign
            </button>
          </div>
        </motion.div>
      )}

      <CampaignManager 
        scene="Scene 7: Certification"
        context="Player needs to understand Form 20 election certificate, election petition in High Court, EVM tampering allegations, oath-taking ceremony."
        playerDecision={isWin ? 'Player Won' : 'Player Lost'}
        gameState={gameState}
      />
    </motion.div>
  );
}
