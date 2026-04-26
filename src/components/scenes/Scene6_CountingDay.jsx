import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '../ui/ProgressBar.jsx';
import CampaignManager from '../ui/CampaignManager.jsx';
import { calculateVotes } from '../../engine/VoteCalculator.js';
import { useAnalytics } from '../../hooks/useAnalytics.js';

export default function Scene6_CountingDay({ gameState, advanceScene, markTopicLearned }) {
  useAnalytics(gameState);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const results = React.useMemo(() => calculateVotes(gameState), [gameState]);

  useEffect(() => {
    markTopicLearned('evm');
  }, [markTopicLearned]);

  const startCounting = () => {
    setIsCounting(true);
  };

  useEffect(() => {
    let timer;
    if (isCounting && results && currentRoundIndex < results.rounds.length - 1) {
      timer = setTimeout(() => {
        setCurrentRoundIndex(prev => prev + 1);
      }, 2000); // 2 seconds per round as requested
    } else if (isCounting && results && currentRoundIndex === results.rounds.length - 1) {
      setTimeout(() => { }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isCounting, currentRoundIndex, results]);

  // Google Charts Integration
  useEffect(() => {
    if (!isCounting || !results || !window.google) return;
    
    const drawChart = () => {
      const data = new window.google.visualization.DataTable();
      data.addColumn('string', 'Candidate');
      data.addColumn('number', 'Votes');
      data.addColumn({ type: 'string', role: 'style' });

      const currentData = results.rounds[currentRoundIndex];
      data.addRows([
        ['You (Player)', currentData.playerCumulative, 'color: #FF6B00'], // Saffron
        [gameState.opponents[0]?.name || 'Opponent', currentData.opponentCumulative, 'color: #1a3a5c'], // Deep blue
        [gameState.opponents[1]?.name || 'Third Party', currentData.thirdCumulative, 'color: #138808'] // Green
      ]);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      const options = {
        title: 'Live Vote Counting',
        hAxis: { title: 'Votes', minValue: 0 },
        vAxis: { title: 'Candidate' },
        legend: 'none',
        animation: {
          duration: prefersReducedMotion ? 0 : 800,
          easing: 'in',
        },
        backgroundColor: 'transparent',
      };

      if (!chartInstance.current) {
        chartInstance.current = new window.google.visualization.BarChart(chartRef.current);
      }
      
      chartInstance.current.draw(data, options);
    };

    if (window.google.visualization) {
      drawChart();
    } else {
      window.google.charts.load('current', { packages: ['corechart'] });
      window.google.charts.setOnLoadCallback(drawChart);
    }
  }, [isCounting, currentRoundIndex, results, gameState.opponents]);

  if (!results) return <div>Loading results...</div>;

  const currentData = isCounting ? results.rounds[currentRoundIndex] : {
    round: 0,
    playerCumulative: 0,
    opponentCumulative: 0,
    thirdCumulative: 0,
    leader: 'WAITING'
  };

  const isFinished = currentRoundIndex === results.rounds.length - 1 && isCounting;
  const margin = Math.abs(currentData.playerCumulative - currentData.opponentCumulative);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-4xl mx-auto pb-24"
    >
      <ProgressBar current={6} total={7} />
      
      <div className="bg-slate-900 text-white p-8 rounded-t-2xl shadow-xl border-b-4 border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-primary to-orange-500"></div>
        <div className="flex justify-between items-center mb-4">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </span>
          <span className="text-sm font-semibold opacity-80 uppercase tracking-widest">Day 0: Counting Day</span>
        </div>
        <h2 className="text-4xl font-heading font-bold mb-2 flex items-center gap-3">
          <span className="material-icons text-4xl text-green-300">bar_chart</span>
          The EVMs are opened
        </h2>
        <p className="text-lg opacity-90 font-body text-slate-300">
          India holds its breath. Results are declared round by round. Each round represents votes from one block of EVM tables.
        </p>
      </div>

      <div className="bg-white p-8 rounded-b-2xl shadow-lg border border-slate-200">
        {!isCounting ? (
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-slate-400 mb-4 block">how_to_vote</span>
            <h3 className="text-2xl font-bold text-secondary mb-6">Strong room seals are verified. Ready to begin counting.</h3>
            <button 
              onClick={startCounting}
              className="bg-primary hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105 text-xl"
            >
              Start Counting
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200" aria-live="polite">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Rounds Counted</p>
                <p className="text-3xl font-heading font-bold text-secondary">{currentData.round} <span className="text-lg text-slate-400">/ 21</span></p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Margin</p>
                <p className={`text-3xl font-heading font-bold ${currentData.leader === 'PLAYER' ? 'text-green-600' : 'text-red-600'}`}>
                  {margin.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                <p className={`text-2xl font-bold px-4 py-1 rounded-full flex items-center justify-center gap-1 ${currentData.leader === 'PLAYER' ? 'bg-green-100 text-green-700' : currentData.leader === 'OPPONENT' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                  {currentData.leader === 'PLAYER' ? <><span className="material-icons">emoji_events</span> LEADING</> : currentData.leader === 'WAITING' ? '--' : 'TRAILING'}
                </p>
              </div>
            </div>

            <div 
              ref={chartRef} 
              style={{ width: '100%', height: '300px' }} 
              aria-label={`Vote counting chart: Player has ${currentData.playerCumulative} votes, Opponent has ${currentData.opponentCumulative} votes, Third party has ${currentData.thirdCumulative} votes`}
              role="img"
            ></div>

            {isFinished && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center border-t border-slate-200 pt-8"
              >
                <h3 className="text-2xl font-bold text-secondary mb-4 flex items-center justify-center gap-2">
                  <span className="material-icons text-green-500">verified</span>
                  Counting Completed
                </h3>
                <button 
                  onClick={() => advanceScene(7)}
                  className="bg-secondary hover:bg-slate-800 text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all flex items-center justify-center mx-auto gap-2"
                >
                  View Final Declaration
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <CampaignManager 
        scene="Scene 6: Counting Day"
        context="Player needs to understand EVM counting process, VVPAT slip verification, role of Returning Officer during counting, what 'leading' vs 'elected' means."
        playerDecision={isFinished ? 'Counting finished' : isCounting ? 'Observing counting' : 'Waiting to start'}
        gameState={gameState}
      />
    </motion.div>
  );
}
