import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Printer, Maximize2 } from 'lucide-react';
import { CVData, CVTemplateId, StyleConfig } from '../types';
import { CVRenderer } from './CVRenderer';
import { TEMPLATE_OPTIONS } from '../data/samplePresets';

interface PreviewContainerProps {
  data: CVData;
  templateId: CVTemplateId;
  onTemplateChange: (id: CVTemplateId) => void;
  styleConfig: StyleConfig;
  onPrint: () => void;
  onDeleteAdditionalPage?: (id?: string) => void;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  data,
  templateId,
  onTemplateChange,
  styleConfig,
  onPrint,
  onDeleteAdditionalPage,
}) => {
  const [zoom, setZoom] = useState<number>(0.85);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.45));
  const handleResetZoom = () => setZoom(0.85);
  const handleFitPage = () => setZoom(0.72);

  const currentTemplate = TEMPLATE_OPTIONS.find((t) => t.id === templateId) || TEMPLATE_OPTIONS[0];

  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden relative">
      
      {/* Top Floating Control Bar */}
      <div className="no-print bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {currentTemplate.name}
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs bg-slate-800 text-sky-400 border-l-2 border-sky-400 tracking-wider hidden sm:inline-block">
            {currentTemplate.category}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
          <button
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold text-sky-400 px-1.5 select-none">
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
            className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition ml-1"
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

      {/* Quick Template Badges Bar */}
      <div className="no-print bg-slate-900/60 border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-10 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">ফরম্যাটসমূহ:</span>
        {TEMPLATE_OPTIONS.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => onTemplateChange(t.id)}
            className={`text-[11px] px-2.5 py-1 rounded shrink-0 transition font-bold uppercase tracking-wider cursor-pointer ${
              templateId === t.id
                ? 'bg-slate-800 text-sky-400 border-l-2 border-sky-400 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {idx + 1}. {t.name.replace(/^\d+\.\s*/, '').split('(')[0]}
          </button>
        ))}
      </div>

      {/* A4 Canvas Scroll Workspace */}
      <div className="preview-panel flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/90 overscroll-contain">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="preview-zoom-wrapper my-2"
        >
          <CVRenderer
            data={data}
            templateId={templateId}
            styleConfig={styleConfig}
            onDeleteAdditionalPage={onDeleteAdditionalPage}
          />
        </div>
      </div>

    </div>
  );
};
