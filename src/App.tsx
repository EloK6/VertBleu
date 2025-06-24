import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center px-2">
      <IntroductionBlock />
      <SpectrumSelector split={split} setSplit={setSplit} onShowResults={() => setShowResults(true)} exportRef={exportRef} />
      <ResultsBlock split={split} showResults={showResults} />
      <ShareBlock split={split} exportRef={exportRef} />
    </div>
  )
}

export default App
