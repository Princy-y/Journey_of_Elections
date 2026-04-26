import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DecisionCard from '../ui/DecisionCard.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import CampaignManager from '../ui/CampaignManager.jsx';

export default function Scene2_VoterDrive({ gameState, makeDecision, advanceScene, markTopicLearned }) {
  const [selectedDecision, setSelectedDecision] = useState(null);

  const decisions = [
    {
      id: 'A',
      label: 'Spend ₹3 lakhs on EPIC card registration camps',
      impactLabel: '+300 registered voters, +approval, -₹3,000,000 budget',
      impact: { budget: -300000, urbanSupport: 5, ruralSupport: 5 },
    },
    {
      id: 'B',
      label: 'Partner with local NGOs and student unions',
      impactLabel: 'Free, +150 voters, +youth goodwill',
      impact: { budget: 0, youthSupport: 10, urbanSupport: 2 },
    },
    {
      id: 'C',
      label: 'Focus on fundraising instead',
      impactLabel: '-approval, miss the registration window, +₹5 lakhs fundraised',
      impact: { budget: 500000, urbanSupport: -5, ruralSupport: -5 },
    }
  ];

  const handleDecision = (choice) => {
    setSelectedDecision(choice.id);
    makeDecision('voter_registration_drive', {
      ...choice.impact,
      id: choice.id,
      label: choice.label,
      impactLabel: choice.impactLabel,
      explanation: 'Decided how to handle voter registration deadlines.'
    });
    markTopicLearned('epic');
  };

  const handleNext = () => {
    if (selectedDecision) {
      advanceScene(3);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-3xl mx-auto pb-24"
    >
      <ProgressBar current={2} total={7} />
      
      <div className="bg-secondary text-white p-8 rounded-t-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Day 60</span>
          <span className="text-sm font-semibold opacity-80" aria-live="polite">Days to Polling: 60</span>
        </div>
        <h2 className="text-4xl font-heading font-bold mb-2">Your voters must be on the rolls</h2>
        <p className="text-lg opacity-90 font-body">
          Voter registration deadline approaches. Thousands in your constituency don't have EPIC cards or aren't on the electoral rolls. They cannot vote for you if they are not registered.
        </p>
      </div>

      <div className="bg-white p-8 rounded-b-2xl shadow-lg border border-slate-100">
        <h3 id="decision-2-title" className="text-xl font-bold mb-6 text-secondary border-b pb-2">How will you handle voter registration?</h3>
        
        <div role="radiogroup" aria-labelledby="decision-2-title" className="space-y-4">
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
        scene="Scene 2: Voter ID Drive"
        context="Player needs to understand Electoral Photo Identity Card (EPIC), Form 6, Form 8, voters.eci.gov.in, importance of BLO."
        playerDecision={selectedDecision}
        gameState={gameState}
      />
    </motion.div>
  );
}
