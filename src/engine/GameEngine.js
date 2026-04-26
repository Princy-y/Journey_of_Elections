import { constituencies, opponentsDatabase } from '../constants/candidateData.js';
// We would ideally import triggerScandal from ScandalEngine, but let's implement it here or assume it's injected/called from elsewhere.
// The prompt asked for core engine functions here.

export const BANNED_WHEN_MCC_ACTIVE = [
  'announce_new_scheme',
  'use_govt_vehicle',
  'hold_rally_after_deadline',
  'distribute_freebies'
];

export function getInitialState() {
  return {
    player: {
      name: '',
      party: '',
      constituency: '',
      state: '',
      avatar: ''
    },
    resources: {
      budget: 7000000,           // ₹70 lakhs
      approvalRating: 45,
      partySupport: 60,
      urbanSupport: 40,
      ruralSupport: 50,
      youthSupport: 35,
      boothAgents: 0,
      fundraised: 0,
      voterTurnout: 0
    },
    constituency: {
      name: '',
      totalVoters: 1800000,
      urbanPercent: 45,
      ruralPercent: 55,
      youthPercent: 32,
      dominantCommunity: '',
      isIncumbent: false,
      incumbencyPenalty: -8,
      lastMargin: 45000
    },
    opponents: [],
    timeline: {
      currentScene: 1,
      daysRemaining: 75,
      currentPhase: 1,
      modelCodeActive: false,
      silencePeriodActive: false
    },
    decisions: [],
    scandals: [],
    violations: [],
    achievements: [],
    civicScore: 0
  };
}

export function initGame(playerData, constituencyName) {
  const state = getInitialState();
  
  // Set Player Data
  state.player = {
    ...state.player,
    ...playerData
  };
  
  // Load constituency profile
  const profile = constituencies.find(c => c.name === constituencyName) || constituencies[0];
  state.constituency = {
    ...state.constituency,
    ...profile,
    isIncumbent: profile.naturalAdvantage === playerData.party
  };
  
  // Set incumbency penalty
  if (state.constituency.isIncumbent) {
    state.resources.approvalRating += state.constituency.incumbencyPenalty; // Apply penalty (-8)
  }
  
  // Set natural advantage boost
  if (state.constituency.naturalAdvantage === playerData.party) {
    state.resources.partySupport += 10;
  }
  
  // Set opponents
  const possibleOpponents = Object.keys(opponentsDatabase).filter(p => p !== playerData.party);
  const mainOpponentParty = profile.naturalAdvantage !== playerData.party ? profile.naturalAdvantage : possibleOpponents[0];
  
  const mainOpp = opponentsDatabase[mainOpponentParty] || opponentsDatabase['INC'];
  const thirdOpp = opponentsDatabase['Independent'];
  
  state.opponents = [
    {
      name: mainOpp.name,
      party: mainOpponentParty,
      baseStrength: mainOpp.baseStrength,
      isIncumbent: profile.naturalAdvantage === mainOpponentParty
    },
    {
      name: thirdOpp.name,
      party: 'Independent',
      baseStrength: thirdOpp.baseStrength,
      isIncumbent: false
    }
  ];
  
  return state;
}

export function recalculateApproval(state) {
  const { resources, constituency } = state;
  const newApproval = (
    (resources.urbanSupport * constituency.urbanPercent / 100) +
    (resources.ruralSupport * constituency.ruralPercent / 100)
  );
  // Optional: Factor youthSupport in some way, but prompt specifically states:
  // approvalRating = weighted average of urban and rural
  return {
    ...state,
    resources: {
      ...resources,
      approvalRating: parseFloat(newApproval.toFixed(2))
    }
  };
}

export function makeDecision(state, decisionId, choice) {
  // choice should be an object defining the impacts
  // e.g. { id: 'A', urbanSupport: 8, ruralSupport: 2, youthSupport: 10, budget: -500000, boothAgents: 0, ... }
  
  // Create deep copy
  let newState = JSON.parse(JSON.stringify(state));
  
  // Apply impacts
  if (choice.urbanSupport) newState.resources.urbanSupport += choice.urbanSupport;
  if (choice.ruralSupport) newState.resources.ruralSupport += choice.ruralSupport;
  if (choice.youthSupport) newState.resources.youthSupport += choice.youthSupport;
  if (choice.budget) newState.resources.budget += choice.budget;
  if (choice.boothAgents) newState.resources.boothAgents += choice.boothAgents;
  
  // Cap supports between 0 and 100
  newState.resources.urbanSupport = Math.max(0, Math.min(100, newState.resources.urbanSupport));
  newState.resources.ruralSupport = Math.max(0, Math.min(100, newState.resources.ruralSupport));
  newState.resources.youthSupport = Math.max(0, Math.min(100, newState.resources.youthSupport));
  newState.resources.budget = Math.max(0, Math.min(7000000, newState.resources.budget));
  
  // Record decision
  newState.decisions.push({
    id: decisionId,
    choiceId: choice.id,
    scene: newState.timeline.currentScene,
    choiceLabel: choice.label || '',
    explanation: choice.explanation || '',
    impact: choice.impactLabel || ''
  });
  
  // Recalculate approval
  newState = recalculateApproval(newState);
  
  return newState;
}

export function activateModelCode(state) {
  return {
    ...state,
    timeline: {
      ...state.timeline,
      modelCodeActive: true
    }
  };
}

export function checkModelCodeViolation(state, decisionId) {
  if (!state.timeline.modelCodeActive) return state;
  
  if (BANNED_WHEN_MCC_ACTIVE.includes(decisionId)) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.violations.push({
      decisionId,
      scene: newState.timeline.currentScene,
      timestamp: Date.now()
    });
    newState.resources.approvalRating -= 5;
    newState.civicScore = Math.max(0, newState.civicScore - 10);
    return newState;
  }
  
  return state;
}

export function activateSilencePeriod(state) {
  return {
    ...state,
    timeline: {
      ...state.timeline,
      silencePeriodActive: true
    }
  };
}

export function triggerScandal(state) {
  // 35% chance
  const isTriggered = Math.random() < 0.35;
  if (isTriggered) {
    // Pick from a mock list or import from ScandalEngine
    const scandalsList = [
      { id: 'fake_news', label: 'Fake News Campaign', penalty: -5 },
      { id: 'funding_irregularity', label: 'Campaign Finance Allegation', penalty: -8 },
      { id: 'inappropriate_comment', label: 'Inappropriate Comment at Rally', penalty: -6 }
    ];
    const picked = scandalsList[Math.floor(Math.random() * scandalsList.length)];
    
    let newState = JSON.parse(JSON.stringify(state));
    newState.scandals.push({
      ...picked,
      unresolved: true,
      scene: newState.timeline.currentScene
    });
    
    return { state: newState, scandal: picked };
  }
  return { state, scandal: null };
}
