import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useGameState } from './hooks/useGameState.js';

const Scene1_Nomination = React.lazy(() => import('./components/scenes/Scene1_Nomination.jsx'));
const Scene2_VoterDrive = React.lazy(() => import('./components/scenes/Scene2_VoterDrive.jsx'));
const Scene3_CampaignBudget = React.lazy(() => import('./components/scenes/Scene3_CampaignBudget.jsx'));
const Scene4_Rally = React.lazy(() => import('./components/scenes/Scene4_Rally.jsx'));
const Scene5_PhaseVoting = React.lazy(() => import('./components/scenes/Scene5_PhaseVoting.jsx'));
const Scene6_CountingDay = React.lazy(() => import('./components/scenes/Scene6_CountingDay.jsx'));
const Scene7_Certification = React.lazy(() => import('./components/scenes/Scene7_Certification.jsx'));

import { initFirebase } from './services/firebaseService.js';
import { useAnalytics } from './hooks/useAnalytics.js';

// Init once
initFirebase();

const SceneSkeleton = () => (
  <div className="max-w-3xl mx-auto pb-24 animate-pulse">
    <div className="w-full bg-slate-200 rounded-full h-3 mb-6"></div>
    <div className="bg-slate-300 h-48 rounded-t-2xl mb-4"></div>
    <div className="bg-white p-8 rounded-b-2xl shadow-lg border border-slate-100">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        <div className="h-16 bg-slate-100 rounded"></div>
        <div className="h-16 bg-slate-100 rounded"></div>
        <div className="h-16 bg-slate-100 rounded"></div>
      </div>
    </div>
  </div>
);

function GameScreen() {
  const gameStateManager = useGameState();
  const { gameState, advanceScene, initGame } = gameStateManager;
  const currentScene = gameState.timeline.currentScene;

  useAnalytics(gameState);

  React.useEffect(() => {
    if (!gameState.player.name) {
      initGame({ name: 'Player', party: 'Independent' }, 'Varanasi');
    }
  }, [gameState.player.name, initGame]);

  React.useEffect(() => {
    // Focus main content on scene change
    const mainEl = document.getElementById('main');
    if (mainEl) {
      mainEl.focus();
    }
  }, [currentScene]);

  if (!gameState.player.name) return null;

  return (
    <main id="main" tabIndex="-1" aria-label={`Scene ${currentScene}`} className="container mx-auto p-4 pt-8 outline-none">
      <Suspense fallback={<SceneSkeleton />}>
        <AnimatePresence mode="wait">
          {currentScene === 1 && <Scene1_Nomination key="1" {...gameStateManager} />}
          {currentScene === 2 && <Scene2_VoterDrive key="2" {...gameStateManager} />}
          {currentScene === 3 && <Scene3_CampaignBudget key="3" {...gameStateManager} />}
          {currentScene === 4 && <Scene4_Rally key="4" {...gameStateManager} />}
          {currentScene === 5 && <Scene5_PhaseVoting key="5" {...gameStateManager} />}
          {currentScene === 6 && <Scene6_CountingDay key="6" {...gameStateManager} />}
          {currentScene === 7 && <Scene7_Certification key="7" {...gameStateManager} />}
        </AnimatePresence>
      </Suspense>
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-body text-secondary flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:text-primary shadow-lg border border-primary">
          Skip to main content
        </a>
        <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-40">
          <h1 className="text-3xl font-hindi font-bold text-center tracking-wide"><span lang="hi">चुनाव का सफर</span> <span className="font-heading text-2xl">| Journey of Elections</span></h1>
          <p className="text-center italic mt-1 text-sm opacity-90">Experience India's Democracy — One Vote at a Time</p>
        </header>
        
        <Routes>
          <Route path="/" element={<GameScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
