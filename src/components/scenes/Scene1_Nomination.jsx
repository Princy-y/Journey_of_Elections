import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DecisionCard from '../ui/DecisionCard.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import CampaignManager from '../ui/CampaignManager.jsx';

export default function Scene1_Nomination({ gameState, makeDecision, advanceScene, markTopicLearned }) {
  const [selectedDecision, setSelectedDecision] = useState(null);

  const decisions = [
    {
      id: 'A',
      label: 'Contest on BJP ticket',
      impactLabel: '+15 party machinery, -10 independent voters',
      impact: { partySupport: 15, urbanSupport: -5, ruralSupport: -5 },
    },
    {
      id: 'B',
      label: 'Contest on INC ticket',
      impactLabel: '+12 party support, -8 swing voters',
      impact: { partySupport: 12, urbanSupport: -4, ruralSupport: -4 },
    },
    {
      id: 'C',
      label: 'Contest as Independent',
      impactLabel: '-15 party support, +20 credibility with neutral voters',
      impact: { partySupport: -15, urbanSupport: 10, ruralSupport: 10 },
    },
    {
      id: 'D',
      label: 'Contest on AAP ticket',
      impactLabel: '+10 anti-corruption image, +youth voters',
      impact: { partySupport: 10, youthSupport: 15 },
    }
  ];

  const handleDecision = (choice) => {
    setSelectedDecision(choice.id);
    makeDecision('nomination_party_choice', {
      ...choice.impact,
      id: choice.id,
      label: choice.label,
      impactLabel: choice.impactLabel,
      explanation: 'Chose the party ticket for the nomination.'
    });
    markTopicLearned('nomination');
  };

  const handleNext = () => {
    if (selectedDecision) {
      advanceScene(2);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-3xl mx-auto pb-24"
    >
      <ProgressBar current={1} total={7} />
      
      <div className="bg-secondary text-white p-8 rounded-t-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Day 75</span>
          <span className="text-sm font-semibold opacity-80">Days to Polling: 75</span>
        </div>
        <h2 className="text-4xl font-heading font-bold mb-2">Your political journey begins today</h2>
        <p className="text-lg opacity-90 font-body">
          You have decided to contest the Lok Sabha election from your constituency. The first step is filing your nomination with the Returning Officer.
        </p>
      </div>

      <div className="bg-white p-8 rounded-b-2xl shadow-lg border border-slate-100">
        <h3 id="decision-1-title" className="text-xl font-bold mb-6 text-secondary border-b pb-2">Select your nomination strategy:</h3>
        
        <div role="radiogroup" aria-labelledby="decision-1-title" className="space-y-4">
          {decisions.map(d => (
            <DecisionCard 
              key={d.id}
              title={d.label}
              impact={d.impactLabel}
              selected={selectedDecision === d.id}
              onSelect={() => handleDecision(d)}
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
        scene="Scene 1: Filing Nomination"
        context="Player needs to understand Form 2B, affidavit of assets and criminal record, security deposit ₹25,000 for Lok Sabha."
        playerDecision={selectedDecision}
        gameState={gameState}
      />
    </motion.div>
  );
}
