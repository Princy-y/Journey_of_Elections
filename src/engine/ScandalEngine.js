export function triggerScandal(gameState) {
  const scandals = [
    {
      id: 'cash_for_votes',
      title: 'Cash for Votes Allegation',
      description: 'A video surfaces allegedly showing cash distribution in your name in a village.',
      approvalImpact: -5,
      responses: [
        {
          id: 'scandal_A',
          label: 'Call immediate press conference, deny with evidence',
          impactLabel: '+trust, costs 2 days',
          impact: { urbanSupport: 2 }
        },
        {
          id: 'scandal_B',
          label: 'Stay silent',
          impactLabel: '-10 approval',
          impact: { urbanSupport: -10 }
        }
      ]
    },
    {
      id: 'silence_period_violation',
      title: 'Silence Period Violation',
      description: 'You were caught holding a rally 48 hours before polling.',
      approvalImpact: -10,
      responses: [
        {
          id: 'scandal_sp_A',
          label: 'Apologize and pay fine',
          impactLabel: 'Neutral',
          impact: { urbanSupport: 0 }
        }
      ]
    }
  ];
  
  if (gameState && gameState.timeline && gameState.timeline.currentScene === 5) {
    return scandals.find(s => s.id === 'silence_period_violation');
  }
  return scandals[0];
}
