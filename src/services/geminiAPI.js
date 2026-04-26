import { getRandomFact } from '../constants/electionFacts.js';
import { getCache, setCache } from '../utils/cache.js';

let debounceTimer = null;
let lastCallPromise = null;

export async function callCampaignManager(scene, context, playerDecision, gameState) {
  const cacheKey = `gemini_${scene}_${playerDecision || 'init'}`;
  
  // 1. Check Cache
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  // 2. Debounce logic
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      try {
        lastCallPromise = executeCall(scene, context, playerDecision, gameState, cacheKey);
        const result = await lastCallPromise;
        resolve(result);
      } catch (error) {
        console.error('Campaign Manager API Error:', error);
        resolve(getFallbackResponse(scene));
      }
    }, 500); // 500ms debounce
  });
}

async function executeCall(scene, context, playerDecision, gameState, cacheKey) {
  try {
    // Use VITE_API_URL for production, otherwise use relative path 
    // which is handled by Vite's proxy in development
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const endpoint = `${baseUrl}/api/campaign-manager`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scene,
        context,
        playerDecision,
        gameState
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Save to cache (5 minutes TTL)
    setCache(cacheKey, data, 5);

    return data;
  } catch (error) {
    throw error;
  }
}

function getFallbackResponse(scene) {
  const fact = getRandomFact();
  return {
    message: "Network signals are weak here in the constituency. Keep your focus on the ground game.",
    realWorldFact: fact,
    tip: "Always double check your campaign expenditure limits.",
    mood: "warning"
  };
}
