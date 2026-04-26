export function calculateVotes(state) {
  const { constituency, resources, opponents } = state;
  const { totalVoters } = constituency;
  
  // STEP 1 — Calculate expected turnout
  // Indian Lok Sabha average turnout: 67%
  const baseTurnout = 0.67;
  const agentBoost = Math.min(resources.boothAgents * 0.001, 0.08);
  const turnoutRate = baseTurnout + agentBoost;
  const totalVotesCast = Math.floor(totalVoters * turnoutRate);
  
  // STEP 2 — Calculate player raw vote share %
  // Start from approval rating as base vote share
  let playerSharePercent = resources.approvalRating * 0.6;
  
  // Add party base loyalty votes
  playerSharePercent += (resources.partySupport * 0.15);
  
  // Urban/rural weighted contribution
  const urbanContrib = (resources.urbanSupport / 100) * constituency.urbanPercent * 0.4;
  const ruralContrib = (resources.ruralSupport / 100) * constituency.ruralPercent * 0.4;
  playerSharePercent += urbanContrib + ruralContrib;
  
  // Booth agents add reliable votes
  const boothVotes = resources.boothAgents * 200 * 0.6;
  
  // MCC violations penalty
  const violationPenalty = (state.violations || []).length * 3;
  playerSharePercent -= violationPenalty;
  
  // Scandal penalty
  const scandalPenalty = (state.scandals || [])
    .filter(s => s.unresolved)
    .length * 4;
  playerSharePercent -= scandalPenalty;
  
  // Cap at realistic range (18% min, 58% max for 3-way contest)
  playerSharePercent = Math.max(18, Math.min(58, playerSharePercent));
  
  // STEP 3 — Calculate opponent vote shares
  const remainingPercent = 100 - playerSharePercent;
  
  // Main opponent gets ~60% of remaining votes
  let mainOpponentPercent = remainingPercent * 0.62;
  let thirdCandidatePercent = remainingPercent * 0.38;
  
  // Adjust for opponent base strength
  const opponentStrengthFactor = (opponents[0]?.baseStrength || 42) / 42;
  mainOpponentPercent *= opponentStrengthFactor;
  thirdCandidatePercent = 100 - playerSharePercent - mainOpponentPercent;
  
  // Cap in case of odd math
  thirdCandidatePercent = Math.max(0, thirdCandidatePercent);
  
  // STEP 4 — Convert to actual vote counts
  const playerVotes = Math.floor((playerSharePercent / 100) * totalVotesCast) + Math.floor(boothVotes);
  const opponentVotes = Math.floor((mainOpponentPercent / 100) * totalVotesCast);
  const thirdPartyVotes = Math.floor((thirdCandidatePercent / 100) * totalVotesCast);
  
  // NOTA votes
  const notaVotes = Math.floor(totalVotesCast * 0.015);
  
  // Recalculate total votes cast if necessary due to boothVotes absolute addition
  const adjustedTotalVotesCast = playerVotes + opponentVotes + thirdPartyVotes + notaVotes;
  const finalTurnoutRate = adjustedTotalVotesCast / totalVoters;
  
  // Real player share % after absolute booth votes
  const finalPlayerSharePercent = (playerVotes / adjustedTotalVotesCast) * 100;
  const finalOpponentSharePercent = (opponentVotes / adjustedTotalVotesCast) * 100;
  
  // STEP 5 — FPTP Winner determination
  const winner = playerVotes > opponentVotes ? 'player' : 'opponent';
  const margin = Math.abs(playerVotes - opponentVotes);
  
  // STEP 6 — Recount trigger
  const isRecount = margin < 1000;
  
  // STEP 7 — Generate round-by-round counting data
  const rounds = generateCountingRounds(
    playerVotes, opponentVotes, thirdPartyVotes, 21
  );
  
  return {
    playerVotes,
    opponentVotes,
    thirdPartyVotes,
    notaVotes,
    totalVotesCast: adjustedTotalVotesCast,
    turnoutRate: (finalTurnoutRate * 100).toFixed(1) + '%',
    playerSharePercent: finalPlayerSharePercent.toFixed(1),
    opponentSharePercent: finalOpponentSharePercent.toFixed(1),
    winner,
    margin,
    isRecount,
    rounds,
    wonByVoteSplitting: winner === 'player' && finalPlayerSharePercent < 40
  };
}

export function generateCountingRounds(playerTotal, opponentTotal, thirdTotal, numRounds) {
  const rounds = [];
  let playerCumulative = 0;
  let opponentCumulative = 0;
  let thirdCumulative = 0;
  
  for (let i = 1; i <= numRounds; i++) {
    const isLastRound = i === numRounds;
    
    // Distribute remaining randomly but close to average
    let pVotes = isLastRound ? playerTotal - playerCumulative : Math.floor(playerTotal / numRounds * (0.8 + Math.random() * 0.4));
    let oVotes = isLastRound ? opponentTotal - opponentCumulative : Math.floor(opponentTotal / numRounds * (0.8 + Math.random() * 0.4));
    let tVotes = isLastRound ? thirdTotal - thirdCumulative : Math.floor(thirdTotal / numRounds * (0.8 + Math.random() * 0.4));
    
    // Simulate lead changes (early urban vs late rural)
    if (i < numRounds / 3) {
      // Early rounds favor one side slightly
      pVotes = Math.floor(pVotes * 1.1);
      oVotes = Math.floor(oVotes * 0.9);
    } else if (i > numRounds * 0.6) {
      // Late rounds favor the other side slightly
      pVotes = Math.floor(pVotes * 0.9);
      oVotes = Math.floor(oVotes * 1.1);
    }
    
    // Prevent exceeding totals before the last round
    if (!isLastRound) {
      pVotes = Math.min(pVotes, playerTotal - playerCumulative);
      oVotes = Math.min(oVotes, opponentTotal - opponentCumulative);
      tVotes = Math.min(tVotes, thirdTotal - thirdCumulative);
    }
    
    playerCumulative += pVotes;
    opponentCumulative += oVotes;
    thirdCumulative += tVotes;
    
    const maxVotes = Math.max(playerCumulative, opponentCumulative, thirdCumulative);
    let leader = 'TIE';
    if (maxVotes === playerCumulative) leader = 'PLAYER';
    else if (maxVotes === opponentCumulative) leader = 'OPPONENT';
    else leader = 'THIRD_PARTY';
    
    rounds.push({
      round: i,
      playerCumulative,
      opponentCumulative,
      thirdCumulative,
      leader
    });
  }
  
  return rounds;
}
