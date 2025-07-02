import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import './App.css'
import IntroductionBlock from "./IntroductionBlock";
import SpectrumSelector from "./SpectrumSelector";
import ResultsBlock from "./ResultsBlock";
import ShareBlock from "./ShareBlock";

const MIN_HUE = 120;
const MAX_HUE = 240;

function App() {
  const [split, setSplit] = useState(MIN_HUE);
  const [showResults, setShowResults] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const splitParam = params.get('split');
    if (splitParam) {
      const value = Number(splitParam);
      if (!isNaN(value) && value >= MIN_HUE && value <= MAX_HUE) {
        setSplit(value);
      }
    }
  }, []);

  // Fonction pour recommencer
  const handleRestart = () => {
    setShowResults(false);
    setSplit(MIN_HUE);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center px-2">
      <IntroductionBlock />
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <SpectrumSelector split={split} setSplit={setSplit} onShowResults={() => setShowResults(true)} exportRef={exportRef} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <ResultsBlock split={split} showResults={showResults} onRestart={handleRestart} />
            <ShareBlock />
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="fixed bottom-0 left-0 w-screen bg-black text-white text-center py-4 text-sm z-50" style={{marginBottom:0}}>
        Vert ou bleu est un projet d'exploration proposé par <a href="https://dataviz-centric.com/" target="_blank" rel="noopener noreferrer" className="text-white underline hover:underline">Dataviz Centric</a>
      </footer>
    </div>
  )
}

export default App
