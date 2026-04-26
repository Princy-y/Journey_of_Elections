export const civicTopics = [
  { id: 'nomination', label: 'Nomination & Filing Process', learned: false },
  { id: 'epic', label: 'Voter ID & EPIC Cards', learned: false },
  { id: 'expenditure', label: 'ECI Campaign Expenditure Limits', learned: false },
  { id: 'mcc', label: 'Model Code of Conduct', learned: false },
  { id: 'fptp', label: 'First Past The Post System', learned: false },
  { id: 'evm', label: 'EVM & VVPAT Process', learned: false },
  { id: 'certification', label: 'Result Certification & Form 20', learned: false }
];

export function markTopicLearned(state, topicId) {
  // If already learned, return exact same state reference to prevent infinite React re-renders
  if (state.achievements && state.achievements.includes(topicId)) {
    return state;
  }

  let newState = JSON.parse(JSON.stringify(state));
  newState.achievements = newState.achievements || [];
  newState.achievements.push(topicId);
  newState.civicScore = Math.min(100, (newState.civicScore || 0) + 14);
  
  return newState;
}

export function generateReportCard(state, results) {
  // Bonus points logic calculation to represent actual final score
  let finalCivicScore = state.civicScore;
  
  if ((state.violations || []).length === 0) finalCivicScore += 2;
  
  const totalScandals = (state.scandals || []).length;
  const resolvedScandals = (state.scandals || []).filter(s => !s.unresolved).length;
  if (totalScandals > 0 && totalScandals === resolvedScandals) {
    finalCivicScore += 5;
  }
  
  if (state.resources.budget >= 0) { // meaning under 70 lakh limit
    finalCivicScore += 3;
  }
  
  finalCivicScore = Math.min(100, finalCivicScore);
  
  const learnedTopicsList = civicTopics.map(t => ({
    ...t,
    learned: (state.achievements || []).includes(t.id)
  })).filter(t => t.learned);
  
  return {
    civicScore: finalCivicScore,
    topicsLearned: learnedTopicsList,
    totalTopics: civicTopics.length,
    decisionsLog: (state.decisions || []).map(d => ({
      scene: d.scene,
      choice: d.choiceLabel,
      realWorldParallel: d.explanation,
      impact: d.impact
    })),
    stats: {
      budgetSpent: 7000000 - state.resources.budget,
      budgetRemaining: state.resources.budget,
      scandalsSurvived: resolvedScandals,
      mccViolations: (state.violations || []).length,
      boothAgentsDeployed: state.resources.boothAgents,
      finalTurnout: results?.turnoutRate || '0%',
      wonByVoteSplitting: results?.wonByVoteSplitting || false
    }
  };
}
