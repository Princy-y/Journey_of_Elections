import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DecisionCard from '../ui/DecisionCard.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import CampaignManager from '../ui/CampaignManager.jsx';

export default function Scene5_PhaseVoting({ gameState, makeDecision, advanceScene, triggerScandal, activateSilencePeriod }) {
  const [scandal, setScandal] = useState(null);
  const [scandalResolved, setScandalResolved] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);

  useEffect(() => {
    // Trigger scandal once on mount
    const s = triggerScandal();
    if (s) {
      setScandal(s);
    }
    activateSilencePeriod();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mainDecisions = [
    {
      id: 'A',
      label: 'Final mega rally the day before silence period',
      impactLabel: '+8 approval if no violation',
      impact: { urbanSupport: 8, ruralSupport: 8 }
    },
    {
      id: 'B',
      label: 'Booth management — deploy agents to all booths',
      impactLabel: '+boothAgents count, crucial for counting day',
      impact: { boothAgents: 10 }
    },
    {
      id: 'C',
      label: 'National TV interview',
      impactLabel: '+10 approval, risk of gaffe',
      impact: { urbanSupport: 10 }
    }
  ];

  const scandalResponses = [
    {
      id: 'scandal_A',
      label: 'Call immediate press conference, deny with evidence',
      impactLabel: '+trust, costs 2 days',
      impact: { urbanSupport: 2 }
    },
    {
      id: 'scandal_B',
      label: 'File complaint against rival for fabrication',
      impactLabel: 'Aggressive, neutral approval',
      impact: {}
    },
    {
      id: 'scandal_C',
      label: 'Stay silent',
      impactLabel: '-10 approval, media cycle worsens for 5 days',
      impact: { urbanSupport: -10, ruralSupport: -10 }
    }
  ];

  const handleScandalResponse = (choice) => {
    setScandalResolved(true);
    makeDecision('scandal_response', {
      ...choice.impact,
      id: choice.id,
      label: choice.label,
      impactLabel: choice.impactLabel,
      explanation: 'Responded to unexpected campaign scandal.'
    });
  };

  const handleMainDecision = (choice) => {
    setSelectedDecision(choice.id);
    makeDecision('final_phase_decision', {
      ...choice.impact,
      id: choice.id,
      label: choice.label,
      impactLabel: choice.impactLabel,
      explanation: 'Final move before the silence period.'
    });
  };

  const handleNext = () => {
    if (selectedDecision && (!scandal || scandalResolved)) {
      advanceScene(6);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-3xl mx-auto pb-24"
    >
      <ProgressBar current={5} total={7} />
      
      <div className="bg-secondary text-white p-8 rounded-t-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Day 20</span>
          <span className="text-sm font-semibold opacity-80" aria-live="polite">Days to Polling: 20</span>
        </div>
        <h2 className="text-4xl font-heading font-bold mb-2">India votes in phases</h2>
        <p className="text-lg opacity-90 font-body mb-4">
          India's election spans 7 phases over 6 weeks. Your constituency votes in Phase 4. Rival parties are doing last-minute campaigning.
        </p>
        
        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-slate-500 mb-2">
          <h3 className="font-bold text-slate-300 uppercase tracking-wide text-xs mb-1">48 Hours Before Voting</h3>
          <p className="font-bold text-lg text-white">ELECTION SILENCE PERIOD APPROACHING</p>
          <p className="text-sm text-slate-300">No public campaigning allowed 48 hours before polling. ECI strictly enforces this.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-b-2xl shadow-lg border border-slate-100">
        
        {scandal && !scandalResolved && (
          <div className="mb-8" aria-live="assertive" role="alert">
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded-r">
              <h3 className="font-bold text-red-800 text-lg">BREAKING: Scandal Surfaced!</h3>
              <p className="text-red-700">A video surfaces allegedly showing cash distribution in your name in a village.</p>
            </div>
            <h4 id="decision-scandal-title" className="font-bold mb-4 text-secondary">How do you respond?</h4>
            <div role="radiogroup" aria-labelledby="decision-scandal-title" className="space-y-3">
              {scandalResponses.map(d => (
                <DecisionCard 
                  key={d.id} title={d.label} impact={d.impactLabel}
                  selected={false} onSelect={() => handleScandalResponse(d)}
                />
              ))}
            </div>
          </div>
        )}

        {(!scandal || scandalResolved) && (
          <div>
            <h3 id="decision-5-title" className="text-xl font-bold mb-6 text-secondary border-b pb-2">Your final move before polling:</h3>
            <div role="radiogroup" aria-labelledby="decision-5-title" className="space-y-4">
              {mainDecisions.map(d => (
                <DecisionCard 
                  key={d.id} title={d.label} impact={d.impactLabel}
                  selected={selectedDecision === d.id} onSelect={() => handleMainDecision(d)}
                />
              ))}
            </div>

            {selectedDecision && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 flex justify-end"
              >
                <button 
                  onClick={handleNext}
                  className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center gap-2"
                >
                  Go to Counting Day
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </motion.div>
            )}
          </div>
        )}

      </div>

      <CampaignManager 
        scene="Scene 5: Phase Voting"
        context="Player needs to understand election silence period, why phase-wise voting exists, role of CAPF, what booth agents do on polling day."
        playerDecision={scandal && !scandalResolved ? 'Scandal handling' : selectedDecision}
        gameState={gameState}
      />
    </motion.div>
  );
}
