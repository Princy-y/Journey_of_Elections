import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DecisionCard from '../ui/DecisionCard.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import CampaignManager from '../ui/CampaignManager.jsx';

export default function Scene4_Rally({ gameState, makeDecision, advanceScene, activateModelCode, markTopicLearned }) {
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [mccViolation, setMccViolation] = useState(false);

  useEffect(() => {
    // Activate Model Code of Conduct on mount
    if (!gameState.timeline.modelCodeActive) {
      activateModelCode();
      markTopicLearned('mcc');
    }
  }, [activateModelCode, gameState.timeline.modelCodeActive, markTopicLearned]);

  const decisions = [
    {
      id: 'use_govt_vehicle', // Maps to BANNED_WHEN_MCC_ACTIVE for risk
      label: 'Hold a massive rally — book stadium, invite star campaigner',
      impactLabel: 'High impact (+10 approval) BUT 30% risk of MCC violation',
      baseImpact: { urbanSupport: 10, ruralSupport: 10, youthSupport: 10 },
      isRisky: true
    },
    {
      id: 'B',
      label: 'Door-to-door campaign in key booths',
      impactLabel: 'Safe: +6 approval, builds personal connect',
      baseImpact: { urbanSupport: 6, ruralSupport: 8 },
      isRisky: false
    },
    {
      id: 'C',
      label: 'Focus on social media blitz',
      impactLabel: '+5 approval, +youth votes, risk of IT cell complaint',
      baseImpact: { youthSupport: 10, urbanSupport: 5 },
      isRisky: false
    }
  ];

  const handleDecision = (choice) => {
    setSelectedDecision(choice.id);
    
    let isViolation = false;
    if (choice.isRisky) {
      isViolation = Math.random() < 0.3;
      setMccViolation(isViolation);
    }

    // Pass the exact id to engine so it triggers checkModelCodeViolation if isViolation is true
    // Wait, the engine checks BANNED_WHEN_MCC_ACTIVE.includes(decisionId).
    // If choice.isRisky and it triggers, we should send the banned ID. If it doesn't trigger, we send a safe ID.
    const engineDecisionId = isViolation ? 'use_govt_vehicle' : `safe_${choice.id}`;

    makeDecision(engineDecisionId, {
      ...choice.baseImpact,
      id: choice.id,
      label: choice.label,
      impactLabel: choice.impactLabel,
      explanation: 'Campaign strategy during Model Code of Conduct.'
    });
  };

  const handleNext = () => {
    if (selectedDecision) {
      advanceScene(5);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-3xl mx-auto pb-24"
    >
      <ProgressBar current={4} total={7} />
      
      <div className="bg-red-700 text-white p-8 rounded-t-2xl shadow-md border-b-4 border-yellow-400">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-yellow-400 text-red-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Day 35</span>
          <span className="text-sm font-semibold opacity-90" aria-live="polite">Days to Polling: 35</span>
        </div>
        <div className="inline-block bg-yellow-400 text-red-900 px-3 py-1 font-bold text-sm mb-4 rounded shadow-sm tracking-widest uppercase">
          Model Code of Conduct Activated
        </div>
        <h2 className="text-4xl font-heading font-bold mb-2">Every move is being watched</h2>
        <p className="text-lg opacity-90 font-body">
          ECI has announced the election schedule. The Model Code of Conduct is now active. Government machinery cannot be used for campaigning.
        </p>
      </div>

      <div className="bg-white p-8 rounded-b-2xl shadow-lg border border-slate-100">
        <h3 id="decision-4-title" className="text-xl font-bold mb-6 text-secondary border-b pb-2">Plan your campaign event:</h3>
        
        {mccViolation && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r shadow-sm"
            aria-live="assertive"
            role="alert"
          >
            <h4 className="font-bold text-red-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              MCC Violation Detected!
            </h4>
            <p className="text-sm text-red-600 mt-1">
              ECI observer has flagged your rally for using a government vehicle. Penalty: -5 approval, formal warning on record.
            </p>
          </motion.div>
        )}

        <div role="radiogroup" aria-labelledby="decision-4-title" className="space-y-4">
          {decisions.map(d => (
            <DecisionCard 
              key={d.id}
              title={d.label}
              impact={d.impactLabel}
              selected={selectedDecision === d.id}
              onSelect={() => !selectedDecision && handleDecision(d)}
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
              Confirm & Continue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>

      <CampaignManager 
        scene="Scene 4: Model Code Rally"
        context="Player needs to understand what MCC covers, freebies ban, Govt machinery ban, ECI observers, C-Vigil app."
        playerDecision={selectedDecision}
        gameState={gameState}
      />
    </motion.div>
  );
}
