import React from "react";

const IntroductionBlock: React.FC = () => (
  <div className="text-center my-8">
    <h1 className="text-3xl md:text-5xl font-bold mb-2">Vert ou bleu&nbsp;?</h1>
    <h2 className="text-lg md:text-2xl text-gray-600 dark:text-gray-300">
      Jusqu'où s'étend le bleu selon vous&nbsp;? Et quand commence le vert&nbsp;?
    </h2>
    <p className="mt-4 text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
      Le point de bascule dit "neutre" peut être considéré comme la frontière entre le vert et le bleu. Quelle est la vôtre ?
    </p>
  </div>
);

export default IntroductionBlock; 