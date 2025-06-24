import React, { useState } from "react";
import html2canvas from "html2canvas";

type ShareBlockProps = {
  split: number;
  exportRef?: React.RefObject<HTMLDivElement>;
};

const ShareBlock: React.FC<ShareBlockProps> = ({ split, exportRef }) => {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const shareUrl = `${window.location.origin}${window.location.pathname}?split=${split}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExport = async () => {
    if (!exportRef?.current) return;
    setExporting(true);
    const canvas = await html2canvas(exportRef.current, { backgroundColor: null });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `bleuouvert-perception.png`;
    link.click();
    setExporting(false);
  };

  return (
    <div className="my-8 flex flex-col items-center">
      <button className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition mb-4" onClick={handleCopy}>
        {copied ? "Lien copié !" : "Partager votre perception"}
      </button>
      <div className="mb-2 text-gray-700 dark:text-gray-200 break-all">Lien&nbsp;: <span className="font-mono">{shareUrl}</span></div>
    </div>
  );
};

export default ShareBlock; 