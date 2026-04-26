import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Ensure the other config options like authDomain, storageBucket etc are present if required by specific firebase setups
  // If not provided, it may still work for simple auth and firestore depending on setup
};

let app;
let db;
let auth;
let currentUid = null;

export const initFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUid = user.uid;
      }
    });

    signInAnonymously(auth).catch(error => {
      console.error("Anonymous auth failed:", error);
    });
  }
};

export const saveGameSession = async (gameState, finalResults, finalReport) => {
  if (!db || !currentUid) return;
  try {
    const sessionRef = doc(collection(db, 'sessions'), currentUid + '_' + Date.now());
    await setDoc(sessionRef, {
      playerName: gameState.player.name,
      party: gameState.player.party,
      constituency: gameState.constituency.name,
      finalApproval: gameState.resources.approvalRating,
      civicScore: finalReport.civicScore,
      won: finalResults.winner === 'player',
      decisionsLog: finalReport.decisionsLog,
      scandalsTriggered: gameState.scandals.length,
      budgetSpent: 7000000 - gameState.resources.budget,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error saving game session:", error);
  }
};

export const saveToLeaderboard = async (name, civicScore, won, constituency, party) => {
  if (!db || !currentUid) return;
  try {
    const lbRef = doc(collection(db, 'leaderboard'), currentUid);
    await setDoc(lbRef, {
      playerName: name,
      civicScore,
      won,
      constituency,
      party,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error saving to leaderboard:", error);
  }
};

export const getLeaderboard = async () => {
  if (!db) return [];
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('civicScore', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const subscribeLeaderboard = (callback) => {
  if (!db) return () => {};
  const q = query(collection(db, 'leaderboard'), orderBy('civicScore', 'desc'), limit(10));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error("Error subscribing to leaderboard:", error);
  });
  
  return unsubscribe;
};
