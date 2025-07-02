import React, { useRef, useState } from "react";
import { supabase } from "./supabaseClient";

const MIN_HUE = 120; // Vert
const MAX_HUE = 240; // Bleu

type SpectrumSelectorProps = {
  split: number;
  setSplit: (value: number) => void;
  onShowResults: () => void;
  exportRef?: React.RefObject<HTMLDivElement>;
};

const SpectrumSelector: React.FC<SpectrumSelectorProps> = ({ split, setSplit, onShowResults, exportRef }) => {
  const gradientRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Position du curseur sur le gradient (0% à 100%)
  const sliderValue = ((split - MIN_HUE) / (MAX_HUE - MIN_HUE)) * 100;

  const handleSubmit = async () => {
    const { error } = await supabase.from('votes').insert([{ split_hue: split }]);
    if (error) {
      alert('Erreur Supabase : ' + error.message);
      console.error(error);
    } else {
      onShowResults();
    }
  };

  // Drag logic for the color bubble
  const handleBubbleMouseDown = () => {
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  };
  const handleBubbleTouchStart = () => {
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  };
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !gradientRef.current) return;
    const rect = gradientRef.current.getBoundingClientRect();
    let x = 0;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
    } else {
      x = e.clientX - rect.left;
    }
    x = Math.max(0, Math.min(x, rect.width));
    const percent = x / rect.width;
    const newSplit = Math.round(MIN_HUE + percent * (MAX_HUE - MIN_HUE));
    setSplit(newSplit);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };
  React.useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const up = () => handleMouseUp();
    if (isDragging) {
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      window.addEventListener('touchmove', move);
      window.addEventListener('touchend', up);
    }
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [isDragging]);

  // Ajout : drag sur toute la barre
  const handleBarMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    document.body.style.userSelect = 'none';
    handleBarMove(e);
  };
  const handleBarMove = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!gradientRef.current) return;
    let clientX = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ('clientX' in e) {
      clientX = e.clientX;
    }
    const rect = gradientRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(x / rect.width, 1));
    const newSplit = Math.round(MIN_HUE + percent * (MAX_HUE - MIN_HUE));
    setSplit(newSplit);
  };
  React.useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (isDragging) handleBarMove(e);
    };
    const up = () => handleMouseUp();
    if (isDragging) {
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      window.addEventListener('touchmove', move);
      window.addEventListener('touchend', up);
    }
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [isDragging]);

  return (
    <div className="my-8 flex flex-col items-center" style={{ width: '80vw' }}>
      <div className="w-full max-w-2xl flex flex-col items-center" ref={exportRef}>
        {/* Dégradé vert → turquoise → bleu */}
        <div
          className="w-full h-[130px] rounded mb-4 relative cursor-pointer"
          ref={gradientRef}
          onMouseDown={handleBarMouseDown}
          onTouchStart={handleBarMouseDown}
        >
          <div
            style={{
              background:
                "linear-gradient(to right, hsl(120,100%,40%), hsl(180,100%,50%), hsl(240,100%,50%))",
              width: "100%",
              height: "100%",
              borderRadius: "0.5rem",
            }}
          />
          {/* Curseur visuel */}
          <div
            className="absolute top-0 h-[130px] w-1 bg-pink-500 rounded pointer-events-none"
            style={{ left: `calc(${sliderValue}% - 2px)` }}
          />
          {/* Bulle de couleur draggable */}
          <span
            className="absolute w-12 h-12 rounded-full border border-gray-300 align-middle cursor-pointer"
            style={{ top: '-48px', left: `calc(${sliderValue}% - 24px)`, background: `hsl(${split},100%,45%)` }}
            title={`hsl(${split},100%,45%)`}
            onMouseDown={handleBubbleMouseDown}
            onTouchStart={handleBubbleTouchStart}
          />
        </div>
        <div className="flex justify-between w-full max-w-xl text-sm text-gray-600 dark:text-gray-300">
          <span>Vert</span>
          <span>Bleu</span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-sm text-gray-700 dark:text-gray-200">Point de bascule&nbsp;:</span>
          <span className="font-mono text-base">{Math.round(split)}°</span>
        </div>
        <button className="mt-6 px-6 py-2 bg-black text-white rounded shadow hover:bg-gray-800 transition" onClick={handleSubmit}>
          Voir les résultats
        </button>
      </div>
    </div>
  );
};

export default SpectrumSelector; 