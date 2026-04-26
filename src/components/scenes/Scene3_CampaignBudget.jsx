import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '../ui/ProgressBar.jsx';
import CampaignManager from '../ui/CampaignManager.jsx';

const MAX_BUDGET = 7000000; // 70 lakhs

export default function Scene3_CampaignBudget({ gameState, makeDecision, advanceScene, markTopicLearned }) {
  const [budgetState, setBudgetState] = useState({
    rallies: 0,
    hoardings: 0,
    socialMedia: 0,
    boothAgents: 0,
    logistics: 0
  });

  const [submitted, setSubmitted] = useState(false);

  const totalSpent = Object.values(budgetState).reduce((a, b) => a + b, 0);
  const remaining = MAX_BUDGET - totalSpent;

  const handleChange = (category, value) => {
    const numValue = parseInt(value) || 0;
    const difference = numValue - budgetState[category];
    
    if (totalSpent + difference <= MAX_BUDGET) {
      setBudgetState(prev => ({ ...prev, [category]: numValue }));
    }
  };

  const handleSubmit = () => {
    // Calculate impacts based on budget spent (1000s)
    const rallyUnits = budgetState.rallies / 1000;
    const hoardingUnits = budgetState.hoardings / 1000;
    const socialUnits = budgetState.socialMedia / 1000;
    const agentUnits = budgetState.boothAgents / 1000;
    const logisticUnits = budgetState.logistics / 1000;

    const approvalGain = (rallyUnits * 0.4) + (hoardingUnits * 0.3) + (socialUnits * 0.35) + (logisticUnits * 0.2);
    
    // Using simple math to spread approval across urban/rural to reflect in engine
    makeDecision('budget_allocation', {
      id: 'budget_submission',
      label: 'Submitted Campaign Budget',
      impactLabel: `Spent ₹${totalSpent.toLocaleString()} across various categories`,
      explanation: 'Allocated election campaign budget under ECI limits.',
      impact: {
        budget: -totalSpent,
        urbanSupport: approvalGain / 2,
        ruralSupport: approvalGain / 2,
        youthSupport: socialUnits * 0.5,
        boothAgents: agentUnits * 2
      }
    });

    markTopicLearned('expenditure');
    setSubmitted(true);
  };

  const handleNext = () => advanceScene(4);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-3xl mx-auto pb-24"
    >
      <ProgressBar current={3} total={7} />
      
      <div className="bg-secondary text-white p-8 rounded-t-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Day 50</span>
          <span className="text-sm font-semibold opacity-80" aria-live="polite">Days to Polling: 50</span>
        </div>
        <h2 className="text-4xl font-heading font-bold mb-2 flex items-center gap-3">
          <span className="material-icons text-4xl text-orange-200">campaign</span>
          ₹70 lakhs. 50 days. Spend wisely.
        </h2>
        <p className="text-lg opacity-90 font-body">
          ECI allows Lok Sabha candidates a maximum of ₹70 lakhs in campaign expenses. Every rupee must be accounted for in your election expense register.
        </p>
      </div>

      <div className="bg-white p-8 rounded-b-2xl shadow-lg border border-slate-100">
        <div 
          className={`mb-6 p-4 rounded-lg flex justify-between items-center border ${remaining < 500000 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-secondary'}`}
          aria-live={remaining < 500000 ? 'assertive' : 'polite'}
        >
          <div>
            <h3 className="font-bold text-lg">Total Limit: ₹70,00,000</h3>
            <p className="text-sm">Spent: ₹{totalSpent.toLocaleString()} | Remaining: ₹{remaining.toLocaleString()}</p>
          </div>
          <div className="text-2xl font-bold flex items-center gap-2">
            {remaining < 500000 && <span className="material-icons">warning</span>}
            {((totalSpent / MAX_BUDGET) * 100).toFixed(1)}% Used
          </div>
        </div>

        {!submitted ? (
          <div className="space-y-6">
            <BudgetSlider label="Rallies & Public Meetings" value={budgetState.rallies} onChange={(v) => handleChange('rallies', v)} max={MAX_BUDGET} />
            <BudgetSlider label="Hoardings & Print Media" value={budgetState.hoardings} onChange={(v) => handleChange('hoardings', v)} max={MAX_BUDGET} />
            <BudgetSlider label="Social Media & Digital" value={budgetState.socialMedia} onChange={(v) => handleChange('socialMedia', v)} max={MAX_BUDGET} />
            <BudgetSlider label="Booth Agent Deployment" value={budgetState.boothAgents} onChange={(v) => handleChange('boothAgents', v)} max={MAX_BUDGET} />
            <BudgetSlider label="Vehicle & Logistics" value={budgetState.logistics} onChange={(v) => handleChange('logistics', v)} max={MAX_BUDGET} />

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSubmit}
                className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all"
              >
                Submit Expenditure Plan
              </button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">Budget Approved</h3>
            <p className="text-gray-600 mb-8">Your election expense register has been updated.</p>
            <button 
              onClick={handleNext}
              className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center justify-center mx-auto gap-2"
            >
              Continue Campaign
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>

      <CampaignManager 
        scene="Scene 3: Campaign Budget"
        context="Player needs to understand ECI expenditure limit, election expense register, shadow observers, and how overspending leads to void election."
        playerDecision={submitted ? 'Budget Submitted' : null}
        gameState={gameState}
      />
    </motion.div>
  );
}

function BudgetSlider({ label, value, onChange, max }) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  };

  const handleKeyDown = (e) => {
    let newValue = Number(localValue);
    if (e.key === 'ArrowUp') {
      newValue = Math.min(max, newValue + 100000);
      e.preventDefault();
      handleSliderChange({ target: { value: newValue } });
    } else if (e.key === 'ArrowDown') {
      newValue = Math.max(0, newValue - 100000);
      e.preventDefault();
      handleSliderChange({ target: { value: newValue } });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label id={`slider-label-${label.replace(/\s+/g, '-')}`} className="font-semibold text-secondary">{label}</label>
        <span className="font-medium text-primary">₹{Number(localValue).toLocaleString()}</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max={max} 
        step="10000" 
        value={localValue} 
        onChange={handleSliderChange}
        onKeyDown={handleKeyDown}
        aria-labelledby={`slider-label-${label.replace(/\s+/g, '-')}`}
        aria-valuemin="0"
        aria-valuemax={max}
        aria-valuenow={localValue}
        aria-valuetext={`₹${(Number(localValue)/100000).toFixed(1)} lakhs allocated`}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary"
      />
    </div>
  );
}
