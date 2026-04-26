import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { subscribeLeaderboard } from '../../services/firebaseService.js';
import { analyticsService } from '../../services/analyticsService.js';

export default function ReportCard({ report, results }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const pieChartRef = useRef(null);
  const pieChartInstance = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((data) => {
      setLeaderboard(data);
    });
    return () => unsubscribe();
  }, []);

  // Google Pie Chart Integration
  useEffect(() => {
    if (!results || !window.google) return;
    
    const drawChart = () => {
      const data = new window.google.visualization.DataTable();
      data.addColumn('string', 'Candidate');
      data.addColumn('number', 'Vote Share');

      data.addRows([
        ['You (Player)', parseFloat(results.playerSharePercent)],
        ['Main Opponent', parseFloat(results.opponentSharePercent)],
        ['Third Party & NOTA', 100 - parseFloat(results.playerSharePercent) - parseFloat(results.opponentSharePercent)]
      ]);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      const options = {
        title: `Final Vote Share — ${report.constituency || 'Constituency'}`,
        pieHole: 0.4,
        colors: ['#FF6B00', '#1a3a5c', '#138808'],
        legend: { position: 'bottom' },
        animation: {
          duration: prefersReducedMotion ? 0 : 1000,
          startup: true,
          easing: 'out',
        },
        chartArea: { width: '90%', height: '70%' },
      };

      if (!pieChartInstance.current) {
        pieChartInstance.current = new window.google.visualization.PieChart(pieChartRef.current);
      }
      
      pieChartInstance.current.draw(data, options);
    };

    if (window.google.visualization) {
      drawChart();
    } else {
      window.google.charts.load('current', { packages: ['corechart'] });
      window.google.charts.setOnLoadCallback(drawChart);
    }
  }, [results, report.constituency]);

  if (!report) return null;

  const handleShare = () => {
    const text = `I just learned how Indian elections work! My Election Journey Score: ${report.civicScore}/100 🗳️🇮🇳`;
    navigator.clipboard.writeText(text);
    analyticsService.reportCardShared({ civic_score: report.civicScore, party: report.party, constituency: report.constituency });
    alert("Copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-primary max-w-4xl mx-auto my-8 text-left text-black">
      <div className="bg-gradient-to-r from-primary to-orange-500 p-8 text-center text-white">
        <h2 className="text-3xl font-heading font-bold mb-2 flex items-center justify-center gap-2">
          <span className="material-icons text-3xl">emoji_events</span>
          CIVIC REPORT CARD
        </h2>
        <p className="opacity-90 font-medium">Your Journey of Elections</p>
        
        <div className="mt-8 relative inline-block">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="opacity-20" />
            <motion.circle 
              cx="64" cy="64" r="60" stroke="white" strokeWidth="8" fill="transparent"
              strokeDasharray={377}
              initial={{ strokeDashoffset: 377 }}
              animate={{ strokeDashoffset: 377 - (377 * report.civicScore) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{report.civicScore}</span>
            <span className="text-xs uppercase tracking-wider font-semibold">Score</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-secondary mb-4 border-b pb-2">Campaign Stats</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-600">Budget Spent:</span>
                <span className="font-bold text-red-600">₹{report.stats.budgetSpent?.toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Budget Remaining:</span>
                <span className="font-bold text-green-600">₹{report.stats.budgetRemaining?.toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Scandals Survived:</span>
                <span className="font-bold">{report.stats.scandalsSurvived}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1"><span className="material-icons text-sm text-red-500">warning</span> MCC Violations:</span>
                <span className="font-bold">{report.stats.mccViolations}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Booth Agents Deployed:</span>
                <span className="font-bold">{report.stats.boothAgentsDeployed}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1"><span className="material-icons text-sm">how_to_vote</span> Final Turnout:</span>
                <span className="font-bold">{report.stats.finalTurnout}</span>
              </li>
            </ul>

            <div className="mt-8 border border-slate-200 rounded-lg p-2">
              <div ref={pieChartRef} style={{ width: '100%', height: '250px' }}></div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-secondary mb-4 border-b pb-2">Topics Mastered ({report.topicsLearned?.length}/{report.totalTopics})</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {report.topicsLearned?.map((t, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold border border-green-200 flex items-center gap-1">
                  <span className="material-icons text-[10px]">verified</span> {t.label}
                </span>
              ))}
            </div>
            
            <h3 className="text-lg font-bold text-secondary mb-4 border-b pb-2 flex items-center gap-2">
              <span className="material-icons text-yellow-500">emoji_events</span>
              🏆 Top Election Champions This Week
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((lb, idx) => (
                    <div key={lb.id} className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold w-4 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-500'}`}>{idx + 1}.</span>
                        <span className="font-semibold text-secondary">{lb.playerName}</span>
                        <span className="text-xs text-slate-500">({lb.party} - {lb.constituency})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{lb.civicScore}</span>
                        {lb.won ? (
                          <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Won</span>
                        ) : (
                          <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Lost</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center italic">Loading latest champions...</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-secondary mb-4 border-b pb-2">Decisions Log</h3>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {report.decisionsLog?.map((d, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100 text-sm">
                <div className="font-semibold text-secondary mb-1 flex items-center gap-1">
                  <span className="bg-primary text-white text-[10px] px-1 rounded uppercase tracking-wider">S{d.scene}</span> 
                  {d.choice}
                </div>
                <div className="text-slate-600 text-xs italic">{d.realWorldParallel}</div>
                <div className="text-primary text-xs mt-1 font-medium">{d.impact}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center border-t pt-6">
          <button 
            onClick={handleShare}
            className="bg-[#1DA1F2] hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full shadow transition-colors flex items-center gap-2"
          >
            <span className="material-icons text-sm">share</span>
            Share Score
          </button>
        </div>
      </div>
    </div>
  );
}
