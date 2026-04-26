export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim().substring(0, 500);
};

export const validateGameState = (state) => {
  if (!state || typeof state !== 'object') return false;
  if (!state.player || typeof state.player.name !== 'string') return false;
  if (!state.resources || typeof state.resources.budget !== 'number') return false;
  if (!state.constituency || typeof state.constituency.name !== 'string') return false;
  return true;
};

export const sanitizeCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(7000000, num));
};
