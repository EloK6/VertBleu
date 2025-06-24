import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";
import * as d3 from "d3";

type ResultsBlockProps = {
  split: number;
  showResults: boolean;
};

const MIN_HUE = 120;
const MAX_HUE = 240;

const ResultsBlock: React.FC<ResultsBlockProps> = ({ split, showResults }) => {
  const [votes, setVotes] = useState<number[]>([]);
  const [similarity, setSimilarity] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState(600);
  const [containerHeight, setContainerHeight] = useState(130);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showResults) {
      supabase.from('votes').select('split_hue').then(({ data }) => {
        if (data) setVotes(data.map((d: any) => d.split_hue));
      });
    }
  }, [showResults]);

  useEffect(() => {
    if (votes.length > 0) {
      const window = 5; // degrés autour du split
      const similarVotes = votes.filter(v => Math.abs(v - split) <= window).length;
      setSimilarity(Math.round((similarVotes / votes.length) * 100));
    }
  }, [votes, split]);

  useEffect(() => {
    if (!gradientRef.current) return;
    const updateSize = () => {
      setContainerWidth(gradientRef.current!.offsetWidth);
      setContainerHeight(gradientRef.current!.offsetHeight);
    };
    updateSize();
    const resizeObserver = new window.ResizeObserver(updateSize);
    resizeObserver.observe(gradientRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (!showResults) return null;

  return (
    <div className="my-8" style={{ width: '80vw' }}>
      {/* Bloc superposé : gradient + heatmap D3 */}
      <div ref={gradientRef} className="w-full max-w-[600px] h-[90px] md:h-[130px] rounded mb-2 mx-auto relative overflow-hidden" style={{ background: "linear-gradient(to right, hsl(120,100%,40%), hsl(180,100%,50%), hsl(240,100%,50%))", borderRadius: "0.5rem" }}>
        {/* Ligne utilisateur sur toute la hauteur */}
        <div className="absolute top-0" style={{ height: containerHeight, left: `calc(${((split - MIN_HUE) / (MAX_HUE - MIN_HUE)) * 100}% - 2px)`, zIndex: 20, width: 4, background: '#ec4899', borderRadius: 2 }} />
        {/* Courbe D3 superposée */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          <D3Curve votes={votes} width={containerWidth} height={containerHeight} />
        </div>
      </div>
      {/* Statistique de similarité dynamique */}
      <div className="text-center text-lg text-gray-700 dark:text-gray-200">
        Vous êtes d'accord avec <span className="font-bold">{similarity}&nbsp;%</span> des autres utilisateurs.
      </div>
      <div className="mt-6 text-base md:text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto space-y-3 text-left bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-6">
        <p className="font-semibold text-blue-700 dark:text-blue-300">Sur une roue HSL (Hue, Saturation, Lightness), les teintes sont réparties sur 360° :</p>
        <ul className="list-disc list-inside ml-4">
          <li>Bleu pur ≈ <span className="font-mono text-blue-700 dark:text-blue-300">240°</span></li>
          <li>Cyan (turquoise clair) ≈ <span className="font-mono text-cyan-600 dark:text-cyan-300">180°</span></li>
          <li>Vert pur ≈ <span className="font-mono text-green-700 dark:text-green-300">120°</span></li>
        </ul>
        <p className="mt-2">👉 <span className="font-semibold">Donc le point de bascule « neutre » (équidistant entre bleu et vert) serait :</span></p>
        <p className="font-mono text-cyan-700 dark:text-cyan-300 text-lg">→ Hue 180°</p>
        <p className="italic">C'est le cyan pur, mélange optique 50 % vert / 50 % bleu.</p>
        <p className="mt-4 font-semibold text-pink-700 dark:text-pink-300">Mais…</p>
        <p>🧠 <span className="font-semibold">Côté perception humaine</span><br />
        Le cyan est souvent perçu ni complètement bleu, ni complètement vert.<br />
        Ce point de bascule varie selon les individus, les langues, et même la culture.</p>
        <p className="mt-2">Des études comme celles de <span className="font-semibold">Paul Kay</span> et <span className="font-semibold">Brent Berlin</span> (1970s) sur la classification des couleurs dans les langues du monde montrent que :</p>
        <ul className="list-disc list-inside ml-4">
          <li>Les mots pour « bleu » et « vert » n'apparaissent pas simultanément dans toutes les langues.</li>
          <li>Certaines langues ne distinguent pas du tout ces deux couleurs.</li>
        </ul>
        <p className="mt-2">Donc même si <span className="font-mono text-cyan-700 dark:text-cyan-300">Hue 180°</span> est techniquement la coupure, le point de bascule perçu peut se situer entre <span className="font-mono text-cyan-700 dark:text-cyan-300">Hue 160° à 200°</span> selon les individus.</p>
      </div>
    </div>
  );
};

// Courbe D3 lissée (hauteur x2, y scale x2)
const D3Curve: React.FC<{ votes: number[]; width?: number; height?: number }> = ({ votes, width = 600, height = 130 }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || votes.length === 0) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const x = d3.scaleLinear().domain([MIN_HUE, MAX_HUE]).range([0, width]);
    const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(60));
    const density = kde(votes);
    const y = d3.scaleLinear().domain([0, (d3.max(density, d => d[1]) || 1)]).range([height, 0]);

    svg.append("path")
      .datum(density as [number, number][])
      .attr("fill", "none")
      .attr("stroke", "#111")
      .attr("stroke-width", 2)
      .attr("d", d3.line<[number, number]>()
        .curve(d3.curveBasis)
        .x((d: [number, number]) => x(d[0]))
        .y((d: [number, number]) => y(d[1]))
      );
  }, [votes, width, height]);

  return (
    <svg ref={ref} width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="block mx-auto mb-2" preserveAspectRatio="none" />
  );
};

// KDE helpers
function kernelDensityEstimator(kernel: (v: number) => number, X: number[]) {
  return function (V: number[]) {
    return X.map((x: number) => [x, d3.mean(V, (v: number) => kernel(x - v)) || 0]);
  };
}
function kernelEpanechnikov(k: number) {
  return function (v: number) {
    v = v / k;
    return Math.abs(v) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}

export default ResultsBlock; 