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

  return null;
};

export default ShareBlock; 