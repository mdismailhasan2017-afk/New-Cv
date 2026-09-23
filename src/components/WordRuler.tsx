import React from 'react';
import { StyleConfig, CVMargins, CVPaperSize, CVOrientation } from '../types';

interface WordRulerProps {
  styleConfig: StyleConfig;
  onStyleChange?: (config: StyleConfig) => void;
  showCropMarks: boolean;
  onToggleCropMarks: () => void;
}

export const WordRuler: React.FC<WordRulerProps> = ({
  styleConfig,
  onStyleChange,
  showCropMarks,
  onToggleCropMarks,
}) => {
  const paperSize: CVPaperSize = styleConfig.paperSize || 'a4';
  const orientation: CVOrientation = styleConfig.orientation || 'portrait';
  const margins: CVMargins = styleConfig.margins || 'narrow';

  // Calculate paper width in inches
  let paperWidthInches = 8.27; // A4 portrait
  if (orientation === 'landscape') {
    paperWidthInches = 11.69;
  } else if (paperSize === 'letter' || paperSize === 'legal') {
    paperWidthInches = 8.5;
  }

  // Margin specifications in inches
  const marginSpecs: Record<CVMargins, { left: number; right: number; top: number; bottom: number; label: string }> = {
    narrow: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, label: 'Narrow (0.5")' },
    normal: { left: 1.0, right: 1.0, top: 1.0, bottom: 1.0, label: 'Normal (1.0")' },
    moderate: { left: 0.75, right: 0.75, top: 1.0, bottom: 1.0, label: 'Moderate (0.75")' },
    wide: { left: 2.0, right: 2.0, top: 1.0, bottom: 1.0, label: 'Wide (2.0")' },
  };

  const current = marginSpecs[margins] || marginSpecs.narrow;
  const leftMarginInches = current.left;
  const rightMarginInches = current.right;
  const writableWidthInches = Math.max(1, paperWidthInches - leftMarginInches - rightMarginInches);

  const leftMarginPct = (leftMarginInches / paperWidthInches) * 100;
  const writableWidthPct = (writableWidthInches / paperWidthInches) * 100;
  const rightMarginPct = (rightMarginInches / paperWidthInches) * 100;

  // Generate inch markings across the paper
  const totalInchesCeil = Math.floor(paperWidthInches);
  const inchTicks: number[] = [];
  for (let i = 1; i <= totalInchesCeil; i++) {
    inchTicks.push(i);
  }

  const handleSelectMargin = (m: CVMargins) => {
    if (!onStyleChange) return;
    onStyleChange({
      ...styleConfig,
      margins: m,
    });
  };

  return (
    <div className="print-hide w-full flex flex-col items-center select-none mb-1.5 transition-all">
      {/* Quick Margin Bar with Visual State */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-[210mm] px-1 pb-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            মার্জিন নির্দেশক:
          </span>

          {/* Narrow (0.5") Quick Toggle */}
          <button
            type="button"
            onClick={() => handleSelectMargin('narrow')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 border ${
              margins === 'narrow'
                ? 'bg-[#2b579a] text-white border-[#1b3d6d] shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
            }`}
            title="Narrow: Top 0.5', Bottom 0.5', Left 0.5', Right 0.5' - লেখা শুরু ও শেষ ০.৫ ইঞ্চি দূরত্বে"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <strong>Narrow (০.৫")</strong>
            <span className="text-[10px] opacity-80">(লেখা শুরু ও শেষ)</span>
          </button>

          {/* Normal (1.0") Quick Toggle */}
          <button
            type="button"
            onClick={() => handleSelectMargin('normal')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 border ${
              margins === 'normal'
                ? 'bg-[#2b579a] text-white border-[#1b3d6d] shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
            }`}
            title="Normal: Top 1', Bottom 1', Left 1', Right 1'"
          >
            <span>Normal (১.০")</span>
          </button>
        </div>

        {/* Boundary Marks Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCropMarks}
            className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition cursor-pointer flex items-center gap-1 border ${
              showCropMarks
                ? 'bg-sky-950 text-sky-300 border-sky-600'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
            title="Microsoft Word এর টেক্সট বাউন্ডারি ও মার্জিন কোণচিহ্ন (Crop Marks) দেখান বা লুকান"
          >
            <span>┌ ┐</span>
            <span>কোণচিহ্ন {showCropMarks ? 'চালু' : 'বন্ধ'}</span>
          </button>
          <span className="text-[10.5px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            শুরু: <strong className="text-white">{leftMarginInches}"</strong> | শেষ:{' '}
            <strong className="text-white">{rightMarginInches}"</strong>
          </span>
        </div>
      </div>

      {/* Horizontal Word Ruler */}
      <div
        className="relative bg-white border border-[#c4c4c4] shadow-xs rounded-xs overflow-visible"
        style={{
          width: '100%',
          maxWidth: orientation === 'landscape' ? '297mm' : paperSize === 'a4' ? '210mm' : '216mm',
          height: '24px',
        }}
      >
        {/* 1. Left Margin Shaded Area */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-[#e2e8f0] border-r border-[#94a3b8] flex items-center justify-center overflow-hidden"
          style={{ width: `${leftMarginPct}%` }}
          title={`বাম মার্জিন: ${leftMarginInches}" (${Math.round(leftMarginInches * 25.4)}mm)`}
        >
          <span className="text-[9px] font-mono text-slate-600 font-bold tracking-tight truncate px-0.5">
            {leftMarginInches}"
          </span>
        </div>

        {/* 2. Center Writable Area (White) */}
        <div
          className="absolute top-0 bottom-0 bg-white"
          style={{
            left: `${leftMarginPct}%`,
            width: `${writableWidthPct}%`,
          }}
        >
          {/* Subtle horizontal baseline */}
          <div className="absolute top-[18px] left-0 right-0 h-px bg-slate-200" />

          {/* Sub-divisions and inch markings inside writable area */}
          {inchTicks.map((inch) => {
            const inchPosPct = (inch / paperWidthInches) * 100;
            // Only draw ticks if within writable area
            if (inchPosPct >= leftMarginPct && inchPosPct <= leftMarginPct + writableWidthPct) {
              const relativePct = ((inchPosPct - leftMarginPct) / writableWidthPct) * 100;
              return (
                <div
                  key={inch}
                  className="absolute top-0 flex flex-col items-center pointer-events-none"
                  style={{ left: `${relativePct}%`, transform: 'translateX(-50%)' }}
                >
                  <span className="text-[9px] font-mono font-bold text-slate-700 leading-none mt-1 select-none">
                    {inch}
                  </span>
                  <div className="w-px h-2.5 bg-slate-400 mt-0.5" />
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* 3. Right Margin Shaded Area */}
        <div
          className="absolute right-0 top-0 bottom-0 bg-[#e2e8f0] border-l border-[#94a3b8] flex items-center justify-center overflow-hidden"
          style={{ width: `${rightMarginPct}%` }}
          title={`ডান মার্জিন: ${rightMarginInches}" (${Math.round(rightMarginInches * 25.4)}mm)`}
        >
          <span className="text-[9px] font-mono text-slate-600 font-bold tracking-tight truncate px-0.5">
            {rightMarginInches}"
          </span>
        </div>

        {/* 4. Left Margin Indent Marker ("লেখা শুরু") */}
        <div
          className="absolute top-0 z-20 flex flex-col items-center pointer-events-none"
          style={{
            left: `${leftMarginPct}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Top downward triangle (First line indent) */}
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1b3d6d]" />
          {/* Vertical indicator line */}
          <div className="w-0.5 h-[14px] bg-[#1b3d6d]" />
          {/* Bottom upward triangle (Hanging indent) */}
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-[#1b3d6d]" />

          {/* Floating badge for "লেখা শুরু" */}
          <div className="absolute top-[25px] whitespace-nowrap bg-[#1b3d6d] text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-30">
            <span>▼</span>
            <span>লেখা শুরু ({leftMarginInches}")</span>
          </div>
        </div>

        {/* 5. Right Margin Indent Marker ("লেখা শেষ") */}
        <div
          className="absolute top-0 z-20 flex flex-col items-center pointer-events-none"
          style={{
            left: `${leftMarginPct + writableWidthPct}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Vertical indicator line */}
          <div className="w-0.5 h-[14px] bg-[#c53030] mt-1" />
          {/* Bottom upward triangle */}
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-[#c53030]" />

          {/* Floating badge for "লেখা শেষ" */}
          <div className="absolute top-[25px] whitespace-nowrap bg-[#c53030] text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-30">
            <span>▲</span>
            <span>লেখা শেষ ({rightMarginInches}")</span>
          </div>
        </div>
      </div>
    </div>
  );
};
