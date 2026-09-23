import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
  Type,
  MoveVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { CVData, CVTemplateId, StyleConfig, CVFontSize, CVSectionGap, CVHeaderAlign } from '../types';
import { CVRenderer } from './CVRenderer';
import { TEMPLATE_OPTIONS } from '../data/samplePresets';
import { WordRibbon } from './WordRibbon';
import { WordRuler } from './WordRuler';

interface PreviewContainerProps {
  data: CVData;
  templateId: CVTemplateId;
  onTemplateChange: (id: CVTemplateId) => void;
  styleConfig: StyleConfig;
  onStyleChange?: (config: StyleConfig) => void;
  onOpenSettings?: () => void;
  onPrint: () => void;
  onDeleteAdditionalPage?: (id?: string) => void;
  onAddNewPage?: () => void;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  data,
  templateId,
  onTemplateChange,
  styleConfig,
  onStyleChange,
  onOpenSettings,
  onPrint,
  onDeleteAdditionalPage,
  onAddNewPage,
}) => {
  const [zoom, setZoom] = useState<number>(0.85);
  const [isFormatBarVisible, setIsFormatBarVisible] = useState<boolean>(true);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const formatScrollRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.45));
  const handleResetZoom = () => setZoom(0.85);
  const handleFitPage = () => setZoom(0.72);

  const fontSizes: CVFontSize[] = ['xs', 'sm', 'base', 'lg', 'xl'];
  const currentSizeIndex = Math.max(0, fontSizes.indexOf(styleConfig.fontSize || 'base'));
  const sizeLabels: Record<CVFontSize, string> = {
    xs: '৮৫%',
    sm: '৯২%',
    base: '১০০%',
    lg: '১১০%',
    xl: '১২০%',
  };

  const gaps: CVSectionGap[] = ['compact', 'normal', 'relaxed', 'spacious'];
  const currentGap = styleConfig.sectionGap || styleConfig.spacing || 'normal';
  const currentGapIndex = Math.max(0, gaps.indexOf(currentGap));
  const gapLabels: Record<CVSectionGap, string> = {
    compact: 'কম (৮px)',
    normal: 'স্বাভাবিক (১৪px)',
    relaxed: 'ফাঁকা (২২px)',
    spacious: 'বড় (২৮px)',
  };

  const handleStepFontSize = (delta: number) => {
    if (!onStyleChange) return;
    const nextIdx = Math.min(Math.max(currentSizeIndex + delta, 0), fontSizes.length - 1);
    onStyleChange({ ...styleConfig, fontSize: fontSizes[nextIdx] });
  };

  const handleCycleGap = () => {
    if (!onStyleChange) return;
    const nextIdx = (currentGapIndex + 1) % gaps.length;
    onStyleChange({ ...styleConfig, sectionGap: gaps[nextIdx] });
  };

  const handleScrollFormatLeft = () => {
    if (formatScrollRef.current) {
      formatScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollFormatRight = () => {
    if (formatScrollRef.current) {
      formatScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const currentTemplate = TEMPLATE_OPTIONS.find((t) => t.id === templateId) || TEMPLATE_OPTIONS[0];

  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden relative">
      {/* Microsoft Word Ribbon: HOME & PAGE LAYOUT Tabs */}
      {onStyleChange && (
        <WordRibbon
          styleConfig={styleConfig}
          onChange={onStyleChange}
          onAddNewPage={onAddNewPage}
          onOpenTemplates={() => setIsFormatBarVisible((prev) => !prev)}
          onPrint={onPrint}
        />
      )}

      {/* Top Floating Control Bar */}
      <div className="no-print bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {currentTemplate.name}
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs bg-slate-800 text-sky-400 border-l-2 border-sky-400 tracking-wider hidden sm:inline-block">
            {currentTemplate.category}
          </span>
          {/* Paper Size Badge matching Word's Paper Size format */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-700/80 hover:border-sky-500/80 text-sky-300 hover:text-white transition cursor-pointer text-[10.5px] font-mono shadow-xs"
            title="সিভির সাইজ: A4 (8.2 x 11.7 in; 210 x 297 mm) • 8.27' x 11.69' (পরিবর্তন করতে ক্লিক করুন)"
          >
            <div className="w-2.5 h-3.5 rounded-2xs border border-sky-400 bg-white/10 shrink-0" />
            <span className="font-bold">
              {styleConfig.paperSize ? styleConfig.paperSize.toUpperCase() : 'A4'}
            </span>
            <span className="hidden md:inline text-slate-400 text-[10px]">
              {styleConfig.paperSize === 'letter' ? '(8.5" × 11")' : styleConfig.paperSize === 'legal' ? '(8.5" × 14")' : '(8.27" × 11.69" • 210 × 297 mm)'}
            </span>
          </button>
          {/* Toggle Format Bar Button */}
          <button
            onClick={() => setIsFormatBarVisible(!isFormatBarVisible)}
            className={`text-[10px] font-bold px-2 py-1 rounded border transition cursor-pointer flex items-center gap-1 ${
              isFormatBarVisible
                ? 'bg-sky-950 text-sky-300 border-sky-800 hover:bg-sky-900'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="ফরম্যাট অপশন বার দেখান বা লুকান"
          >
            <Sliders className="w-3 h-3" />
            <span>ফরম্যাট: {isFormatBarVisible ? 'লুকান' : 'দেখান'}</span>
          </button>
        </div>

        {/* Font Size, Gap, Settings & Zoom Controls */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Quick Font Size Controls (A- / A+) */}
          {onStyleChange && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800" title="সিভির সমস্ত ফন্ট বড় বা ছোট করুন">
              <span className="text-[10px] text-amber-400 font-bold px-1 flex items-center gap-0.5">
                <Type className="w-3 h-3 text-amber-400" /> ফন্ট:
              </span>
              <button
                type="button"
                onClick={() => handleStepFontSize(-1)}
                disabled={currentSizeIndex === 0}
                className="px-1.5 py-0.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 disabled:opacity-30 rounded transition cursor-pointer border border-slate-800"
                title="সব ফন্ট ছোট করুন (A-)"
              >
                A-
              </button>
              <span className="text-[11px] font-mono font-bold text-amber-300 px-1 select-none min-w-8 text-center">
                {sizeLabels[styleConfig.fontSize || 'base']}
              </span>
              <button
                type="button"
                onClick={() => handleStepFontSize(1)}
                disabled={currentSizeIndex === fontSizes.length - 1}
                className="px-1.5 py-0.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 disabled:opacity-30 rounded transition cursor-pointer border border-slate-800"
                title="সব ফন্ট বড় করুন (A+)"
              >
                A+
              </button>
            </div>
          )}

          {/* Quick Gap Control */}
          {onStyleChange && (
            <button
              type="button"
              onClick={handleCycleGap}
              className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 px-2 py-1 rounded border border-slate-800 text-[11px] text-slate-300 hover:text-sky-300 transition cursor-pointer"
              title="ক্লিক করে অপশন ও সেকশনের গ্যাপ পরিবর্তন করুন (কম -> স্বাভাবিক -> ফাঁকা -> বড়)"
            >
              <MoveVertical className="w-3 h-3 text-sky-400" />
              <span>গ্যাপ: <strong className="text-sky-300">{gapLabels[currentGap]}</strong></span>
            </button>
          )}

          {/* Quick Header Align Control */}
          {onStyleChange && (
            <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded border border-slate-800" title="হেডার এলাইনমেন্ট: CURRICULUM VITAE, নাম, পদবী ও পাসপোর্ট">
              <span className="text-[10px] text-sky-400 font-bold px-1 hidden md:inline">Align:</span>
              <button
                type="button"
                onClick={() => onStyleChange({ ...styleConfig, headerAlign: 'left' })}
                className={`p-1 rounded text-xs transition cursor-pointer ${
                  styleConfig.headerAlign === 'left'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="বামে এলাইন (Left Align)"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onStyleChange({ ...styleConfig, headerAlign: 'center' })}
                className={`p-1 rounded text-xs transition cursor-pointer ${
                  (!styleConfig.headerAlign || styleConfig.headerAlign === 'center')
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="মাঝখানে এলাইন (Center Align - ডিফল্ট)"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onStyleChange({ ...styleConfig, headerAlign: 'right' })}
                className={`p-1 rounded text-xs transition cursor-pointer ${
                  styleConfig.headerAlign === 'right'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="ডানে এলাইন (Right Align)"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Open Full Settings Modal */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded bg-slate-950 hover:bg-sky-950 text-slate-400 hover:text-sky-300 border border-slate-800 hover:border-sky-700 transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
              title="সম্পূর্ণ স্টাইল ও গ্যাপ সেটিংস খুলুন"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xl:inline">স্টাইল ও সেটিংস</span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-sky-400 px-1 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitPage}
              className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition ml-0.5"
              title="Fit Width"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition"
              title="100% Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Template Badges Bar - Movable & Scrollable */}
      {isFormatBarVisible && (
        <div className="no-print bg-slate-900/90 border-b border-slate-800 px-2 py-1.5 flex items-center gap-1.5 z-10 shrink-0 select-none">
          <button
            onClick={handleScrollFormatLeft}
            className="p-1 rounded bg-slate-950 hover:bg-sky-900 text-slate-400 hover:text-white border border-slate-800 shrink-0 transition cursor-pointer"
            title="বামে ফরম্যাট দেখুন"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            ref={formatScrollRef}
            onWheel={(e) => {
              if (e.deltaY && formatScrollRef.current) {
                formatScrollRef.current.scrollLeft += e.deltaY;
              }
            }}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 px-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 pr-1">
              🎨 ফরম্যাটসমূহ:
            </span>
            {TEMPLATE_OPTIONS.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => onTemplateChange(t.id)}
                className={`text-[11px] px-2.5 py-1 rounded shrink-0 transition font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap active:scale-95 ${
                  templateId === t.id
                    ? 'bg-sky-950 text-sky-400 border border-sky-500 shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {idx + 1}. {t.name.replace(/^\d+\.\s*/, '').split('(')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleScrollFormatRight}
            className="p-1 rounded bg-slate-950 hover:bg-sky-900 text-slate-400 hover:text-white border border-slate-800 shrink-0 transition cursor-pointer"
            title="ডানে ফরম্যাট দেখুন"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFormatBarVisible(false)}
            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-950 transition shrink-0 ml-1"
            title="ফরম্যাট বার লুকান"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* A4 Canvas Scroll Workspace */}
      <div className="preview-panel flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/90 overscroll-contain">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="preview-zoom-wrapper my-2 flex flex-col items-center"
        >
          <WordRuler
            styleConfig={styleConfig}
            onStyleChange={onStyleChange}
            showCropMarks={showCropMarks}
            onToggleCropMarks={() => setShowCropMarks((prev) => !prev)}
          />
          <CVRenderer
            data={data}
            templateId={templateId}
            styleConfig={styleConfig}
            onDeleteAdditionalPage={onDeleteAdditionalPage}
            showCropMarks={showCropMarks}
          />
        </div>
      </div>

    </div>
  );
};
