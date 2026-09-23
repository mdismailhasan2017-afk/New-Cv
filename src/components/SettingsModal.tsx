import React from 'react';
import {
  X,
  Sliders,
  Check,
  Type,
  MoveVertical,
  Sparkles,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
} from 'lucide-react';
import { StyleConfig, CVFontSize, CVSpacing, CVSectionGap, CVHeaderAlign, CVPaperSize } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleConfig: StyleConfig;
  onChange: (config: StyleConfig) => void;
}

const PAPER_SIZE_OPTIONS: {
  id: CVPaperSize;
  name: string;
  sub: string;
  dimensionsMm: string;
  desc: string;
  isDefault?: boolean;
}[] = [
  {
    id: 'a4',
    name: 'A4 (8.2 x 11.7 in; 210 x 297 mm)',
    sub: '8.27" x 11.69"',
    dimensionsMm: '210 × 297 mm',
    desc: 'আন্তর্জাতিক ও অফিসিয়াল স্ট্যান্ডার্ড সিভি সাইজ (প্রস্তাবিত)',
    isDefault: true,
  },
  {
    id: 'letter',
    name: 'Letter (8.5 x 11 in; 216 x 279 mm)',
    sub: '8.50" x 11.00"',
    dimensionsMm: '215.9 × 279.4 mm',
    desc: 'আমেরিকান ও কানাডিয়ান ফরম্যাট',
  },
  {
    id: 'legal',
    name: 'Legal (8.5 x 14 in; 216 x 356 mm)',
    sub: '8.50" x 14.00"',
    dimensionsMm: '215.9 × 355.6 mm',
    desc: 'বর্ধিত পাতা (অতিরিক্ত তথ্যের জন্য)',
  },
];

const FONT_SIZE_OPTIONS: { id: CVFontSize; name: string; pct: string; desc: string }[] = [
  { id: 'xs', name: 'অতি ছোট', pct: '৮৫%', desc: 'অনেক বেশি তথ্য থাকলে ১ পেজে নিখুঁত ফিট করার জন্য' },
  { id: 'sm', name: 'ছোট', pct: '৯২%', desc: 'কমপ্যাক্ট লেআউট ও ব্যালান্সড স্পেস' },
  { id: 'base', name: 'স্বাভাবিক', pct: '১০০%', desc: 'স্ট্যান্ডার্ড অফিসিয়াল ফন্ট সাইজ (ডিফল্ট)' },
  { id: 'lg', name: 'বড়', pct: '১১০%', desc: 'স্পষ্ট ও বড় ফন্ট, পড়ার সুবিধার্থে' },
  { id: 'xl', name: 'অনেক বড়', pct: '১২০%', desc: 'অল্প তথ্য থাকলে পুরো A4 পেজ ভরানোর জন্য' },
];

const GAP_OPTIONS: { id: CVSectionGap; name: string; desc: string; px: string }[] = [
  { id: 'compact', name: 'কম গ্যাপ (Tight)', desc: 'সেকশন ও অপশনের মাঝে সামান্য ফাঁকা স্থান', px: '৮px' },
  { id: 'normal', name: 'স্বাভাবিক (Normal)', desc: 'স্ট্যান্ডার্ড ও ব্যালান্সড অপশন গ্যাপ', px: '১৪px' },
  { id: 'relaxed', name: 'ফাঁকা গ্যাপ (Relaxed)', desc: 'খোলামেলা ও স্পষ্ট অপশন গ্যাপ', px: '২২px' },
  { id: 'spacious', name: 'বড় গ্যাপ (Spacious)', desc: 'অতিরিক্ত ফাঁকা স্থান তৈরি করার জন্য', px: '২৮px' },
];

const SPACING_OPTIONS: { id: CVSpacing; name: string; desc: string }[] = [
  { id: 'compact', name: 'কমপ্যাক্ট (Compact)', desc: 'ঘন লাইন ও কম টেবিল প্যাডিং' },
  { id: 'normal', name: 'স্বাভাবিক (Normal)', desc: 'ব্যালান্সড লাইন হাইট ও প্যাডিং' },
  { id: 'relaxed', name: 'খোলামেলা (Relaxed)', desc: 'রিলেক্সড লাইন ও টেবিল সেল' },
  { id: 'spacious', name: 'অতিরিক্ত ফাঁকা (Spacious)', desc: 'প্রশস্ত লাইন ফাঁকা ও মার্জিন' },
];

const ALIGN_OPTIONS: { id: CVHeaderAlign; name: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'left', name: 'বামে (Left)', desc: 'হেডার লেখাগুলো বাম দিকে সারিবদ্ধ হবে', icon: <AlignLeft className="w-4 h-4" /> },
  { id: 'center', name: 'মাঝখানে (Center)', desc: 'ক্লাসিক অফিসিয়াল সেন্টার এলাইনমেন্ট (ডিফল্ট)', icon: <AlignCenter className="w-4 h-4" /> },
  { id: 'right', name: 'ডানে (Right)', desc: 'হেডার লেখাগুলো ডান দিকে সারিবদ্ধ হবে', icon: <AlignRight className="w-4 h-4" /> },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  styleConfig,
  onChange,
}) => {
  if (!isOpen) return null;

  const fontSizes: CVFontSize[] = ['xs', 'sm', 'base', 'lg', 'xl'];
  const currentSizeIndex = typeof styleConfig.fontSize === 'string' ? fontSizes.indexOf(styleConfig.fontSize) : -1;

  const getNumericFontSize = (val: CVFontSize | undefined): number => {
    if (typeof val === 'number') return Math.max(8, Math.min(72, val));
    if (val === 'xs') return 8.5;
    if (val === 'sm') return 9.2;
    if (val === 'base') return 10;
    if (val === 'lg') return 11;
    if (val === 'xl') return 12;
    return 10;
  };
  const currentNumericSize = getNumericFontSize(styleConfig.fontSize);

  const gaps: CVSectionGap[] = ['compact', 'normal', 'relaxed', 'spacious'];
  const currentGap = styleConfig.sectionGap || styleConfig.spacing || 'normal';
  const currentGapIndex = Math.max(0, gaps.indexOf(currentGap));

  const currentAlign: CVHeaderAlign = styleConfig.headerAlign || 'center';
  const currentPaperSize: CVPaperSize = styleConfig.paperSize || 'a4';

  const handleStepFontSize = (delta: number) => {
    const current = Math.round(currentNumericSize);
    const next = Math.max(8, Math.min(72, current + delta));
    onChange({ ...styleConfig, fontSize: next });
  };

  const handleDecreaseGap = () => {
    if (currentGapIndex > 0) {
      onChange({ ...styleConfig, sectionGap: gaps[currentGapIndex - 1] });
    }
  };

  const handleIncreaseGap = () => {
    if (currentGapIndex < gaps.length - 1) {
      onChange({ ...styleConfig, sectionGap: gaps[currentGapIndex + 1] });
    }
  };

  return (
    <>
      {/* 
        NO BLUR BACKGROUND: As requested, the options panel opens on the right side
        without blurring the screen, so the user can see CV changes live!
        We use a transparent/semi-transparent non-blur dismiss layer on mobile only.
      */}
      <div
        className="fixed inset-0 z-40 bg-black/25 sm:bg-transparent transition-opacity pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-Side Slide-Over Drawer (ডান সাইডে চালু হবে, কোনো ব্লার ছাড়াই) */}
      <div
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] md:w-[450px] bg-slate-900/98 border-l border-slate-700 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 select-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5 text-sky-400">
            <div className="p-1.5 rounded-lg bg-sky-950 border border-sky-800">
              <Sliders className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">স্টাইল ও এলাইনমেন্ট সেটিংস</h3>
              <p className="text-[11px] text-slate-400">ডান পাশের প্যানেল থেকে লাইভ প্রিভিউ সহ পরিবর্তন করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="প্যানেল বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content (Live changes visible on left side) */}
        <div className="p-4 space-y-4 text-xs sm:text-sm text-slate-200 overflow-y-auto flex-1 form-panel-scroll">
          
          {/* =========================================================
              SECTION 0: CV PAPER SIZE (A4 8.27" x 11.69" / 210 x 297 mm)
             ========================================================= */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-sky-600/60 space-y-3 ring-1 ring-sky-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-slate-100 text-xs sm:text-sm">সিভির পেপার সাইজ (Paper Size)</span>
              </div>
              <span className="text-[10.5px] font-mono font-bold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                {currentPaperSize.toUpperCase()} ({currentPaperSize === 'a4' ? '210 × 297 mm' : currentPaperSize === 'letter' ? '215.9 × 279.4 mm' : '215.9 × 355.6 mm'})
              </span>
            </div>

            {/* Paper Size Cards - styled directly after Microsoft Word's Page Setup */}
            <div className="space-y-2">
              {PAPER_SIZE_OPTIONS.map((paper) => {
                const isSelected = currentPaperSize === paper.id;
                return (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => onChange({ ...styleConfig, paperSize: paper.id })}
                    className={`w-full p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-sky-400 bg-sky-950/60 text-white shadow-md ring-1 ring-sky-400/50'
                        : 'border-slate-800 bg-slate-900/90 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Portrait Page Icon matching Word's Paper Size Picker */}
                      <div className={`w-7 h-9 rounded-xs border-2 flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'border-sky-400 bg-white/20 shadow-xs'
                          : 'border-slate-600 bg-slate-800'
                      }`}>
                        <div className="w-3.5 h-5 border-b border-dashed border-slate-400/60" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-100">{paper.name}</span>
                          {paper.isDefault && (
                            <span className="text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                              স্ট্যান্ডার্ড
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-sky-400">
                          {paper.sub}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {paper.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* =========================================================
              SECTION 1: TOP HEADER ALIGNMENT (CURRICULUM VITAE, NAME, POSITION, MOBILE/PASSPORT)
             ========================================================= */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-sky-900/50 space-y-2.5 ring-1 ring-sky-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <AlignCenter className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-slate-100 text-xs sm:text-sm">হেডার এলাইনমেন্ট (Header Align)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                {currentAlign === 'left' ? 'বামে' : currentAlign === 'right' ? 'ডানে' : 'মাঝখানে'}
              </span>
            </div>

            <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-0.5">
              <div className="text-[10px] text-slate-400 font-medium">নিচের উপাদানগুলো স্বয়ংক্রিয় এলাইন হবে:</div>
              <div className="font-mono text-sky-300 text-[10.5px]">
                • CURRICULUM VITAE<br />
                • নাম (যেমন: Momin Nijam)<br />
                • Position Applied For: GTAW &amp; SMAW WELDER<br />
                • Telephone No: +880... | Passport: A2049...
              </div>
            </div>

            {/* 3 Alignment Options */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {ALIGN_OPTIONS.map((al) => {
                const isSelected = currentAlign === al.id;
                return (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => onChange({ ...styleConfig, headerAlign: al.id })}
                    className={`p-2.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/60 text-sky-200 font-bold ring-1 ring-sky-500/50 shadow-sm'
                        : 'border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center text-sky-400">
                      {al.icon}
                    </div>
                    <span className="text-[11.5px] font-bold">{al.name}</span>
                    {isSelected && <span className="text-[9px] text-sky-400 font-mono font-bold">✓ সক্রিয়</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              SECTION 2: ALL FONTS SIZE SCALING (8pt - 72pt Range)
             ========================================================= */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-900/40 space-y-3 ring-1 ring-amber-500/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-100 text-xs sm:text-sm">সমস্ত ফন্ট সাইজ (৮ - ৭২ pt রেঞ্জ)</span>
              </div>
              
              {/* Numeric Input & Stepper Buttons - / + */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleStepFontSize(-1)}
                  disabled={currentNumericSize <= 8}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  title="১ pt কমান (ন্যূনতম ৮ pt)"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-amber-300" />
                  <span>-1</span>
                </button>
                
                <div className="flex items-center gap-1 px-1">
                  <input
                    type="number"
                    min="8"
                    max="72"
                    step="1"
                    value={Math.round(currentNumericSize)}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) {
                        onChange({ ...styleConfig, fontSize: Math.max(8, Math.min(72, v)) });
                      }
                    }}
                    className="w-12 text-center bg-slate-950 border border-slate-700 rounded text-amber-400 font-mono font-bold text-xs py-0.5 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">pt</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepFontSize(1)}
                  disabled={currentNumericSize >= 72}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  title="১ pt বাড়ান (সর্বোচ্চ ৭২ pt)"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>+1</span>
                </button>
              </div>
            </div>

            {/* Slider: 8 to 72 pt */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>৮ pt (মিনিমাম)</span>
                <span className="text-amber-400 font-bold">বর্তমান: {currentNumericSize} pt</span>
                <span>৭২ pt (ম্যাক্সিমাম)</span>
              </div>
              <input
                type="range"
                min="8"
                max="72"
                step="1"
                value={Math.round(currentNumericSize)}
                onChange={(e) => {
                  onChange({ ...styleConfig, fontSize: Number(e.target.value) });
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Quick selection chips for standard sizes */}
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-medium">কুইক সাইজ বাছাই (৮ - ৭২ pt):</div>
              <div className="flex flex-wrap gap-1">
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 48, 72].map((sz) => {
                  const isCur = Math.round(currentNumericSize) === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => onChange({ ...styleConfig, fontSize: sz })}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition cursor-pointer ${
                        isCur
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5 Preset Buttons Grid */}
            <div className="space-y-1 pt-1 border-t border-slate-900">
              <div className="text-[10px] text-slate-400 font-medium">স্ট্যান্ডার্ড প্রিসেট:</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {FONT_SIZE_OPTIONS.map((opt) => {
                  const isSelected = styleConfig.fontSize === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange({ ...styleConfig, fontSize: opt.id })}
                      className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/40 text-amber-100 font-semibold ring-1 ring-amber-500/50 shadow-sm'
                          : 'border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <span className="text-[11px] font-bold">{opt.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{opt.pct}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =========================================================
              SECTION 3: SECTION & OPTIONS GAP
             ========================================================= */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MoveVertical className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-slate-100">সেকশন ও অপশন গ্যাপ (Gap)</span>
              </div>

              {/* Stepper Buttons for Gap */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={handleDecreaseGap}
                  disabled={currentGapIndex === 0}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 font-bold text-xs transition cursor-pointer"
                  title="গ্যাপ কমান"
                >
                  গ্যাপ -
                </button>
                <span className="text-[11px] font-mono font-bold text-sky-400 px-1">
                  {GAP_OPTIONS[currentGapIndex]?.px || '১৪px'}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseGap}
                  disabled={currentGapIndex === gaps.length - 1}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 font-bold text-xs transition cursor-pointer"
                  title="গ্যাপ বাড়ান"
                >
                  গ্যাপ +
                </button>
              </div>
            </div>

            {/* 4 Gap Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {GAP_OPTIONS.map((g) => {
                const isSelected = currentGap === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onChange({ ...styleConfig, sectionGap: g.id })}
                    className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/50 text-sky-100 font-semibold ring-1 ring-sky-500/50 shadow-sm'
                        : 'border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-bold">{g.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                    </div>
                    <span className="text-[10px] font-mono text-sky-400 font-bold">{g.px} দূরত্ব</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 leading-tight line-clamp-1">{g.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              SECTION 4: LINE HEIGHT & ROW SPACING
             ========================================================= */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
            <label className="font-bold text-slate-200 block text-xs">
              লাইন ও টেবিল রো ফাঁকা (Line Spacing)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPACING_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChange({ ...styleConfig, spacing: s.id })}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    styleConfig.spacing === s.id
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold ring-1 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{s.name}</span>
                    {styleConfig.spacing === s.id && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* =========================================================
              SECTION 5: FONT FAMILY SELECTION
             ========================================================= */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-200 block text-xs">
                ফন্ট ধরণ (Font Family)
              </label>
              <span className="text-[10.5px] text-sky-400 font-medium">
                Times New Roman সেরা
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'times', name: 'Times New Roman', sub: 'অফিসিয়াল ও এম্বাসি স্ট্যান্ডার্ড' },
                { id: 'arial', name: 'Arial', sub: 'সহজ পাঠযোগ্য ও ঝকঝকে' },
                { id: 'calibri', name: 'Calibri / Segoe UI', sub: 'আধুনিক কর্পোরেট' },
                { id: 'georgia', name: 'Georgia', sub: 'প্রফেশনাল এক্সিকিউটিভ' },
                { id: 'garamond', name: 'EB Garamond', sub: 'মার্জিত সেরিফ' },
                { id: 'trebuchet', name: 'Trebuchet MS', sub: 'টেকনিক্যাল ও স্পষ্ট' },
                { id: 'sans', name: 'Plus Jakarta Sans', sub: 'মডার্ন ইন্টারন্যাশনাল' },
                { id: 'bengali', name: 'Noto Bengali', sub: 'বাংলা ও ইংরেজি দ্বৈত' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange({ ...styleConfig, fontFamily: f.id as any })}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                    styleConfig.fontFamily === f.id
                      ? 'border-sky-500 bg-sky-950/60 text-sky-200 font-semibold ring-1 ring-sky-500/40'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <span className="text-xs font-bold block">{f.name}</span>
                    <span className="text-[9.5px] text-slate-400 block truncate">{f.sub}</span>
                  </div>
                  {styleConfig.fontFamily === f.id && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 ml-1.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* =========================================================
              SECTION 6: PHOTO VISIBILITY TOGGLE
             ========================================================= */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="font-semibold text-slate-100 block text-xs">পাসপোর্ট ছবি প্রদর্শন (Show Photo)</span>
              <span className="text-[10px] text-slate-400">
                সিভির ওপরের অংশে পাসপোর্ট সাইজের ছবি অন/অফ করুন
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={styleConfig.showPhoto}
                onChange={(e) => onChange({ ...styleConfig, showPhoto: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Helpful Tip */}
          <div className="p-2.5 bg-sky-950/30 border border-sky-800/40 rounded-lg text-[11px] text-sky-300 leading-relaxed flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              💡 <strong>লাইভ টিপস:</strong> ডানে অপশন পরিবর্তনের সাথে সাথে বাম পাশে সিভির পরিবর্তন সঙ্গে সঙ্গে দেখতে পারবেন।
            </span>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div className="text-[10.5px] text-slate-400">
            এলাইন: <strong className="text-sky-400">{currentAlign === 'left' ? 'বামে' : currentAlign === 'right' ? 'ডানে' : 'মাঝখানে'}</strong> | সাইজ: <strong className="text-amber-400">{FONT_SIZE_OPTIONS[currentSizeIndex]?.pct}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow"
          >
            সম্পন্ন (Done)
          </button>
        </div>
      </div>
    </>
  );
};
