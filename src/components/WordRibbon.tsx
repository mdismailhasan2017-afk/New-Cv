import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  ArrowUpDown,
  Highlighter,
  Palette,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronUp,
  FileText,
  Columns,
  Scissors,
  Copy,
  Printer,
  Sliders,
  Check,
  Plus,
} from 'lucide-react';
import {
  StyleConfig,
  CVFontFamily,
  CVPaperSize,
  CVMargins,
  CVOrientation,
  CVColumns,
  CVTextCase,
  CVTextAlign,
} from '../types';

interface WordRibbonProps {
  styleConfig: StyleConfig;
  onChange: (updated: StyleConfig) => void;
  onAddNewPage?: () => void;
  onOpenTemplates?: () => void;
  onPrint?: () => void;
}

export const WordRibbon: React.FC<WordRibbonProps> = ({
  styleConfig,
  onChange,
  onAddNewPage,
  onOpenTemplates,
  onPrint,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'page_layout'>('home');
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState(false);

  // Open menu tracking ('font' | 'size' | 'case' | 'color' | 'highlight' | 'lineSpacing' | 'margins' | 'orientation' | 'paperSize' | 'columns' | null)
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (ribbonRef.current && !ribbonRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const toggleMenu = (menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const closeAllMenus = () => {
    setOpenMenu(null);
  };

  // Font family options with Nirmala UI matching Word screenshot
  const FONT_OPTIONS: { id: CVFontFamily; label: string }[] = [
    { id: 'nirmala', label: 'Nirmala UI' },
    { id: 'times', label: 'Times New Roman' },
    { id: 'calibri', label: 'Calibri' },
    { id: 'arial', label: 'Arial' },
    { id: 'georgia', label: 'Georgia' },
    { id: 'garamond', label: 'EB Garamond' },
    { id: 'trebuchet', label: 'Trebuchet MS' },
    { id: 'sans', label: 'Plus Jakarta Sans' },
    { id: 'bengali', label: 'Hind Siliguri (বাংলা)' },
  ];

  // Font size options matching Word: 8 to 72
  const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];

  // Current numeric font size
  const currentNumericSize: number =
    typeof styleConfig.fontSize === 'number'
      ? styleConfig.fontSize
      : styleConfig.fontSize === 'xs'
      ? 9
      : styleConfig.fontSize === 'sm'
      ? 10
      : styleConfig.fontSize === 'base'
      ? 11
      : styleConfig.fontSize === 'lg'
      ? 12
      : styleConfig.fontSize === 'xl'
      ? 14
      : 11;

  const currentFontFamily = styleConfig.fontFamily || 'nirmala';
  const currentFontLabel =
    FONT_OPTIONS.find((f) => f.id === currentFontFamily)?.label || 'Nirmala UI';

  // Handlers for Home Tab
  const handleFontChange = (font: CVFontFamily) => {
    onChange({ ...styleConfig, fontFamily: font });
    closeAllMenus();
  };

  const handleSizeChange = (size: number) => {
    onChange({ ...styleConfig, fontSize: size });
    closeAllMenus();
  };

  const handleGrowFont = () => {
    const current = currentNumericSize;
    const next = FONT_SIZES.find((s) => s > current) || Math.min(current + 2, 72);
    onChange({ ...styleConfig, fontSize: next });
  };

  const handleShrinkFont = () => {
    const current = currentNumericSize;
    const prev = [...FONT_SIZES].reverse().find((s) => s < current) || Math.max(current - 1, 8);
    onChange({ ...styleConfig, fontSize: prev });
  };

  const handleToggleBold = () => {
    onChange({ ...styleConfig, isBold: !styleConfig.isBold });
  };

  const handleToggleItalic = () => {
    onChange({ ...styleConfig, isItalic: !styleConfig.isItalic });
  };

  const handleToggleUnderline = () => {
    onChange({ ...styleConfig, isUnderline: !styleConfig.isUnderline });
  };

  const handleToggleStrike = () => {
    onChange({ ...styleConfig, isStrikethrough: !styleConfig.isStrikethrough });
  };

  const handleSetCase = (c: CVTextCase) => {
    onChange({ ...styleConfig, textCase: c });
    closeAllMenus();
  };

  const handleClearFormatting = () => {
    onChange({
      ...styleConfig,
      fontSize: 11,
      fontFamily: 'nirmala',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrikethrough: false,
      textCase: 'none',
      textAlign: 'left',
      lineSpacing: 1.15,
      spacingAfter: 8,
      spacingBefore: 0,
      indentLeft: 0,
      indentRight: 0,
    });
  };

  const handleSetTextAlign = (align: CVTextAlign) => {
    onChange({
      ...styleConfig,
      textAlign: align,
      headerAlign: align === 'justify' ? 'left' : align,
    });
  };

  const handleSetLineSpacing = (spacing: number) => {
    onChange({ ...styleConfig, lineSpacing: spacing });
    closeAllMenus();
  };

  // Handlers for Page Layout Tab
  const handleSetMargins = (margin: CVMargins) => {
    onChange({ ...styleConfig, margins: margin });
    closeAllMenus();
  };

  const handleSetOrientation = (orientation: CVOrientation) => {
    onChange({ ...styleConfig, orientation });
    closeAllMenus();
  };

  const handleSetPaperSize = (paperSize: CVPaperSize) => {
    onChange({ ...styleConfig, paperSize });
    closeAllMenus();
  };

  const handleSetColumns = (columns: CVColumns) => {
    onChange({ ...styleConfig, columns });
    closeAllMenus();
  };

  const handleIndentChange = (field: 'left' | 'right', delta: number) => {
    if (field === 'left') {
      const current = styleConfig.indentLeft || 0;
      const next = Math.max(0, Math.min(2, Number((current + delta).toFixed(2))));
      onChange({ ...styleConfig, indentLeft: next });
    } else {
      const current = styleConfig.indentRight || 0;
      const next = Math.max(0, Math.min(2, Number((current + delta).toFixed(2))));
      onChange({ ...styleConfig, indentRight: next });
    }
  };

  const handleSpacingChange = (field: 'before' | 'after', delta: number) => {
    if (field === 'before') {
      const current = styleConfig.spacingBefore || 0;
      const next = Math.max(0, Math.min(36, current + delta));
      onChange({ ...styleConfig, spacingBefore: next });
    } else {
      const current = styleConfig.spacingAfter ?? 8;
      const next = Math.max(0, Math.min(36, current + delta));
      onChange({ ...styleConfig, spacingAfter: next });
    }
  };

  return (
    <div
      ref={ribbonRef}
      className="no-print w-full bg-[#f3f4f6] text-[#262626] border-b border-[#d1d5db] shadow-xs select-none relative z-30 font-sans"
    >
      {/* 1. TOP TABS BAR (HOME, PAGE LAYOUT, TEMPLATES, COLLAPSE) */}
      <div className="flex items-center justify-between px-2 bg-[#2b579a] text-white text-xs border-b border-[#1b3d6d]">
        <div className="flex items-center">
          {/* Word Office Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 font-bold tracking-wider text-[11px] bg-[#1e3f73] text-white border-r border-[#1b3d6d] mr-1">
            <span className="w-2.5 h-3.5 bg-white text-[#2b579a] font-extrabold flex items-center justify-center text-[9px] rounded-2xs shadow-xs">
              W
            </span>
            <span className="hidden sm:inline">WORD CV</span>
          </div>

          {/* HOME TAB */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              closeAllMenus();
            }}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition cursor-pointer border-b-2 ${
              activeTab === 'home'
                ? 'bg-[#f3f4f6] text-[#2b579a] border-white font-bold'
                : 'text-white/90 hover:bg-white/10 border-transparent'
            }`}
          >
            HOME
          </button>

          {/* PAGE LAYOUT TAB */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('page_layout');
              closeAllMenus();
            }}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition cursor-pointer border-b-2 ${
              activeTab === 'page_layout'
                ? 'bg-[#f3f4f6] text-[#2b579a] border-white font-bold'
                : 'text-white/90 hover:bg-white/10 border-transparent'
            }`}
          >
            PAGE LAYOUT
          </button>

          {/* TEMPLATES (Quick Switcher) */}
          {onOpenTemplates && (
            <button
              type="button"
              onClick={onOpenTemplates}
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 hover:bg-white/10 transition cursor-pointer hidden md:flex items-center gap-1"
              title="১২টি ফরম্যাটের ডিজাইন টেমপ্লেট দেখুন"
            >
              <Sliders className="w-3 h-3 text-sky-200" />
              <span>TEMPLATES</span>
            </button>
          )}
        </div>

        {/* Right Action Icons: Paper badge & Collapse chevron */}
        <div className="flex items-center gap-2 pr-1">
          <span className="hidden lg:inline-flex items-center gap-1 bg-[#1e3f73] text-sky-200 text-[10px] px-2 py-0.5 rounded font-mono">
            <span>A4 (8.27" × 11.69" • 300 DPI)</span>
          </span>

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span className="hidden sm:inline">প্রিন্ট / সেভ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
            title={isRibbonCollapsed ? 'রিবন বার বড় করুন' : 'রিবন বার মিনিমাইজ করুন'}
          >
            {isRibbonCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. RIBBON BODY (WHEN NOT COLLAPSED) */}
      {!isRibbonCollapsed && (
        <div className="px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto bg-[#f3f4f6] border-b border-[#d1d5db]">
          {/* =========================================================
              TAB 1: HOME (Matching Screenshot 2)
              Font & Paragraph Groups
              ========================================================= */}
          {activeTab === 'home' && (
            <div className="flex items-stretch gap-3">
              {/* GROUP 1: FONT (Microsoft Word Font Section) */}
              <div className="flex flex-col justify-between border-r border-[#d1d5db] pr-3">
                {/* Row 1: Font Family, Size, A^, Av, Case, Clear */}
                <div className="flex items-center gap-1">
                  {/* Font Family Dropdown */}
                  <div className="relative word-menu-trigger">
                    <button
                      type="button"
                      onClick={() => toggleMenu('font')}
                      className="h-6 px-2 text-xs bg-white hover:bg-slate-50 border border-[#c4c4c4] rounded flex items-center justify-between gap-1 w-36 sm:w-40 text-[#262626] font-medium shadow-2xs cursor-pointer truncate"
                      title="Font Family (ফন্ট পরিবর্তন করুন)"
                    >
                      <span className="truncate">{currentFontLabel}</span>
                      <ChevronDown className="w-3 h-3 text-[#666] shrink-0" />
                    </button>

                    {openMenu === 'font' && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#c4c4c4] rounded shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
                        <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                          Theme Fonts
                        </div>
                        {FONT_OPTIONS.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => handleFontChange(f.id)}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#e5f1fb] flex items-center justify-between transition cursor-pointer ${
                              currentFontFamily === f.id ? 'bg-[#cde6fd] font-bold text-[#1b3d6d]' : 'text-[#333]'
                            }`}
                          >
                            <span>{f.label}</span>
                            {currentFontFamily === f.id && <Check className="w-3 h-3 text-[#1b3d6d]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Font Size Dropdown */}
                  <div className="relative word-menu-trigger">
                    <button
                      type="button"
                      onClick={() => toggleMenu('size')}
                      className="h-6 px-1.5 text-xs bg-white hover:bg-slate-50 border border-[#c4c4c4] rounded flex items-center justify-between gap-0.5 w-14 text-[#262626] font-mono font-medium shadow-2xs cursor-pointer"
                      title="Font Size (ফন্ট সাইজ)"
                    >
                      <span>{currentNumericSize}</span>
                      <ChevronDown className="w-3 h-3 text-[#666] shrink-0" />
                    </button>

                    {openMenu === 'size' && (
                      <div className="absolute top-full left-0 mt-1 w-16 bg-white border border-[#c4c4c4] rounded shadow-lg py-1 z-50 max-h-52 overflow-y-auto">
                        {FONT_SIZES.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleSizeChange(sz)}
                            className={`w-full text-center py-1 text-xs hover:bg-[#e5f1fb] transition cursor-pointer ${
                              currentNumericSize === sz ? 'bg-[#cde6fd] font-bold text-[#1b3d6d]' : 'text-[#333]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grow Font (A^) */}
                  <button
                    type="button"
                    onClick={handleGrowFont}
                    className="h-6 px-1.5 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded text-xs font-bold text-[#262626] flex items-center gap-0.5 shadow-2xs transition cursor-pointer"
                    title="Increase Font Size (A^)"
                  >
                    <span>A</span>
                    <span className="text-[9px] text-[#2b579a]">▲</span>
                  </button>

                  {/* Shrink Font (Av) */}
                  <button
                    type="button"
                    onClick={handleShrinkFont}
                    className="h-6 px-1.5 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded text-xs font-bold text-[#262626] flex items-center gap-0.5 shadow-2xs transition cursor-pointer"
                    title="Decrease Font Size (Av)"
                  >
                    <span>A</span>
                    <span className="text-[9px] text-[#2b579a]">▼</span>
                  </button>

                  {/* Change Case (Aa) */}
                  <div className="relative word-menu-trigger">
                    <button
                      type="button"
                      onClick={() => toggleMenu('case')}
                      className="h-6 px-1.5 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded text-xs font-semibold text-[#262626] flex items-center gap-0.5 shadow-2xs transition cursor-pointer"
                      title="Change Case (Aa - বড় বা ছোট হাতের অক্ষর)"
                    >
                      <span>Aa</span>
                      <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                    </button>

                    {openMenu === 'case' && (
                      <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-[#c4c4c4] rounded shadow-lg py-1 z-50">
                        <button
                          type="button"
                          onClick={() => handleSetCase('none')}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-[#e5f1fb] text-[#333]"
                        >
                          Normal (Sentence)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetCase('uppercase')}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-[#e5f1fb] text-[#333]"
                        >
                          UPPERCASE
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetCase('lowercase')}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-[#e5f1fb] text-[#333]"
                        >
                          lowercase
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetCase('capitalize')}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-[#e5f1fb] text-[#333]"
                        >
                          Capitalize Each Word
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clear All Formatting */}
                  <button
                    type="button"
                    onClick={handleClearFormatting}
                    className="h-6 px-1.5 bg-white hover:bg-rose-50 border border-[#c4c4c4] rounded text-xs text-rose-600 flex items-center gap-1 shadow-2xs transition cursor-pointer"
                    title="Clear All Formatting (সব ফরম্যাটিং রিসেট করুন)"
                  >
                    <span className="font-bold text-[11px]">A</span>
                    <span className="text-[10px] text-rose-500 font-bold">⌫</span>
                  </button>
                </div>

                {/* Row 2: B, I, U, abc, x2, x^2, Highlights, Colors */}
                <div className="flex items-center gap-1 mt-1">
                  {/* Bold (B) */}
                  <button
                    type="button"
                    onClick={handleToggleBold}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black transition cursor-pointer border ${
                      styleConfig.isBold
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  {/* Italic (I) */}
                  <button
                    type="button"
                    onClick={handleToggleItalic}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs italic transition cursor-pointer border ${
                      styleConfig.isItalic
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  {/* Underline (U) */}
                  <button
                    type="button"
                    onClick={handleToggleUnderline}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs underline transition cursor-pointer border ${
                      styleConfig.isUnderline
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Underline (Ctrl+U)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  {/* Strikethrough (abc) */}
                  <button
                    type="button"
                    onClick={handleToggleStrike}
                    className={`w-7 h-6 rounded flex items-center justify-center text-[11px] font-mono line-through transition cursor-pointer border ${
                      styleConfig.isStrikethrough
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Strikethrough"
                  >
                    abc
                  </button>

                  {/* Subscript & Superscript aesthetic icons */}
                  <div className="hidden sm:flex items-center gap-0.5">
                    <span className="w-6 h-6 bg-white border border-[#c4c4c4] rounded flex items-center justify-center text-[10px] text-slate-500 select-none">
                      x₂
                    </span>
                    <span className="w-6 h-6 bg-white border border-[#c4c4c4] rounded flex items-center justify-center text-[10px] text-slate-500 select-none">
                      x²
                    </span>
                  </div>

                  {/* Text Highlight Color */}
                  <div className="relative word-menu-trigger">
                    <button
                      type="button"
                      onClick={() => toggleMenu('highlight')}
                      className="h-6 px-1 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded flex items-center gap-0.5 text-xs transition cursor-pointer"
                      title="Text Highlight Color (হাইলাইট কালার)"
                    >
                      <Highlighter className="w-3 h-3 text-amber-500" />
                      <div className="w-2.5 h-1 bg-yellow-400 rounded-2xs" />
                      <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                    </button>

                    {openMenu === 'highlight' && (
                      <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-[#c4c4c4] rounded shadow-lg p-2 z-50">
                        <div className="text-[10px] text-slate-500 mb-1 font-bold">Highlight:</div>
                        <div className="grid grid-cols-4 gap-1">
                          {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e2e8f0', '#ffffff'].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                onChange({ ...styleConfig, highlightColor: color });
                                closeAllMenus();
                              }}
                              className="w-5 h-5 rounded border border-slate-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Font Color */}
                  <div className="relative word-menu-trigger">
                    <button
                      type="button"
                      onClick={() => toggleMenu('color')}
                      className="h-6 px-1 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded flex items-center gap-0.5 text-xs transition cursor-pointer"
                      title="Font Color (ফন্ট কালার)"
                    >
                      <span className="font-bold text-xs">A</span>
                      <div
                        className="w-2.5 h-1 rounded-2xs"
                        style={{ backgroundColor: styleConfig.accentColor || '#1e3a8a' }}
                      />
                      <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                    </button>

                    {openMenu === 'color' && (
                      <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#c4c4c4] rounded shadow-lg p-2 z-50">
                        <div className="text-[10px] text-slate-500 mb-1 font-bold">Theme Colors:</div>
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            '#0f172a',
                            '#1e3a8a',
                            '#0369a1',
                            '#0f766e',
                            '#15803d',
                            '#b45309',
                            '#be123c',
                            '#6d28d9',
                            '#334155',
                            '#000000',
                          ].map((clr) => (
                            <button
                              key={clr}
                              type="button"
                              onClick={() => {
                                onChange({ ...styleConfig, accentColor: clr, fontColor: clr });
                                closeAllMenus();
                              }}
                              className="w-5 h-5 rounded border border-slate-300"
                              style={{ backgroundColor: clr }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Group Footer Label */}
                <div className="text-[9.5px] text-[#6b7280] text-center mt-1 font-medium flex items-center justify-center gap-1">
                  <span>Font</span>
                  <span className="text-[8px] text-[#9ca3af]">⇲</span>
                </div>
              </div>

              {/* GROUP 2: PARAGRAPH (Microsoft Word Paragraph Section) */}
              <div className="flex flex-col justify-between border-r border-[#d1d5db] pr-3">
                {/* Row 1: Bullets, Numbering, Multilevel, Indent, Sort, Show/Hide */}
                <div className="flex items-center gap-1">
                  {/* Bullets */}
                  <button
                    type="button"
                    onClick={() => onChange({ ...styleConfig, showBullets: !styleConfig.showBullets })}
                    className={`h-6 px-1.5 rounded flex items-center gap-0.5 text-xs transition cursor-pointer border ${
                      styleConfig.showBullets !== false
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Bullets (বুলেট পয়েন্ট)"
                  >
                    <List className="w-3.5 h-3.5" />
                    <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                  </button>

                  {/* Numbering */}
                  <button
                    type="button"
                    onClick={() => onChange({ ...styleConfig, showLineNumbers: !styleConfig.showLineNumbers })}
                    className={`h-6 px-1.5 rounded flex items-center gap-0.5 text-xs transition cursor-pointer border ${
                      styleConfig.showLineNumbers
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Numbering (নাম্বারিং তালিকা)"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                  </button>

                  {/* Decrease Indent */}
                  <button
                    type="button"
                    onClick={() => handleIndentChange('left', -0.25)}
                    className="w-6 h-6 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded flex items-center justify-center text-xs transition cursor-pointer"
                    title="Decrease Indent"
                  >
                    <Outdent className="w-3.5 h-3.5 text-[#333]" />
                  </button>

                  {/* Increase Indent */}
                  <button
                    type="button"
                    onClick={() => handleIndentChange('left', 0.25)}
                    className="w-6 h-6 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded flex items-center justify-center text-xs transition cursor-pointer"
                    title="Increase Indent"
                  >
                    <Indent className="w-3.5 h-3.5 text-[#333]" />
                  </button>

                  {/* Sort (A-Z) */}
                  <button
                    type="button"
                    className="h-6 px-1 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded flex items-center gap-0.5 text-[10px] font-bold text-[#333] transition cursor-pointer"
                    title="Sort Items"
                  >
                    <span>A</span>
                    <span className="text-[8px]">Z</span>
                    <span className="text-[9px]">↓</span>
                  </button>

                  {/* Paragraph Mark (¶) */}
                  <div
                    className="w-6 h-6 bg-white border border-[#c4c4c4] rounded flex items-center justify-center text-xs font-serif font-bold text-[#555] select-none"
                    title="Show/Hide Paragraph Marks (¶)"
                  >
                    ¶
                  </div>
                </div>

                {/* Row 2: Align Left, Center, Align Right, Justify, Line Spacing */}
                <div className="flex items-center gap-1 mt-1">
                  {/* Align Left */}
                  <button
                    type="button"
                    onClick={() => handleSetTextAlign('left')}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer border ${
                      styleConfig.textAlign === 'left' || (!styleConfig.textAlign && styleConfig.headerAlign === 'left')
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Align Left (Ctrl+L)"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Align Center */}
                  <button
                    type="button"
                    onClick={() => handleSetTextAlign('center')}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer border ${
                      styleConfig.textAlign === 'center' || (!styleConfig.textAlign && styleConfig.headerAlign === 'center')
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Center (Ctrl+E)"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>

                  {/* Align Right */}
                  <button
                    type="button"
                    onClick={() => handleSetTextAlign('right')}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer border ${
                      styleConfig.textAlign === 'right' || (!styleConfig.textAlign && styleConfig.headerAlign === 'right')
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Align Right (Ctrl+R)"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Justify */}
                  <button
                    type="button"
                    onClick={() => handleSetTextAlign('justify')}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer border ${
                      styleConfig.textAlign === 'justify'
                        ? 'bg-[#cde6fd] border-[#70b3ea] text-[#1b3d6d]'
                        : 'bg-white hover:bg-[#e5f1fb] border-[#c4c4c4] text-[#262626]'
                    }`}
                    title="Justify (Ctrl+J)"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>

                  {/* Line & Paragraph Spacing Dropdown */}
                  <div className="relative word-menu-trigger">
                    <button
                      type="button"
                      onClick={() => toggleMenu('lineSpacing')}
                      className="h-6 px-1.5 bg-white hover:bg-[#e5f1fb] border border-[#c4c4c4] rounded flex items-center gap-0.5 text-xs transition cursor-pointer"
                      title="Line and Paragraph Spacing (লাইনের মধ্যকার দূরত্ব)"
                    >
                      <ArrowUpDown className="w-3 h-3 text-[#333]" />
                      <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                    </button>

                    {openMenu === 'lineSpacing' && (
                      <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#c4c4c4] rounded shadow-lg py-1 z-50">
                        {[1.0, 1.15, 1.25, 1.5, 2.0].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSetLineSpacing(val)}
                            className={`w-full text-left px-3 py-1 text-xs hover:bg-[#e5f1fb] flex items-center justify-between ${
                              styleConfig.lineSpacing === val ? 'bg-[#cde6fd] font-bold text-[#1b3d6d]' : 'text-[#333]'
                            }`}
                          >
                            <span>{val.toFixed(2)}</span>
                            {styleConfig.lineSpacing === val && <Check className="w-3 h-3 text-[#1b3d6d]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Paint Bucket Shading & Border icons */}
                  <div className="hidden sm:flex items-center gap-0.5">
                    <button
                      type="button"
                      className="w-6 h-6 bg-white border border-[#c4c4c4] rounded flex items-center justify-center text-xs text-[#333] hover:bg-[#e5f1fb]"
                      title="Shading"
                    >
                      <div className="w-3 h-3 rounded-xs border border-slate-600 bg-slate-100" />
                    </button>
                    <button
                      type="button"
                      className="w-6 h-6 bg-white border border-[#c4c4c4] rounded flex items-center justify-center text-xs text-[#333] hover:bg-[#e5f1fb]"
                      title="Bottom Border"
                    >
                      <div className="w-3.5 h-3.5 border-b-2 border-slate-700" />
                    </button>
                  </div>
                </div>

                {/* Group Footer Label */}
                <div className="text-[9.5px] text-[#6b7280] text-center mt-1 font-medium flex items-center justify-center gap-1">
                  <span>Paragraph</span>
                  <span className="text-[8px] text-[#9ca3af]">⇲</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: PAGE LAYOUT (Matching Screenshot 1)
              Page Setup & Paragraph Groups
              ========================================================= */}
          {activeTab === 'page_layout' && (
            <div className="flex items-stretch gap-3">
              {/* GROUP 1: PAGE SETUP (Margins, Orientation, Size, Columns, Breaks) */}
              <div className="flex items-start gap-2 border-r border-[#d1d5db] pr-3">
                {/* 1. Margins */}
                <div className="relative word-menu-trigger">
                  <button
                    type="button"
                    onClick={() => toggleMenu('margins')}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-[#e5f1fb] rounded border border-transparent hover:border-[#c4c4c4] transition cursor-pointer min-w-14 text-[#262626]"
                    title="Margins (মার্জিন নির্ধারণ করুন)"
                  >
                    <div className="w-6 h-7 border-2 border-[#2b579a] border-dashed rounded-xs bg-white flex items-center justify-center mb-0.5">
                      <div className="w-3 h-4 border border-[#2b579a]" />
                    </div>
                    <span className="text-[11px] font-medium leading-none flex items-center gap-0.5">
                      Margins
                      <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                    </span>
                  </button>

                  {openMenu === 'margins' && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#c4c4c4] rounded shadow-xl py-1.5 z-50">
                      {[
                        {
                          id: 'narrow',
                          name: 'Narrow',
                          top: '0.5"',
                          bottom: '0.5"',
                          left: '0.5"',
                          right: '0.5"',
                          hint: 'লেখা শুরু ও শেষ: ০.৫" (সর্বোচ্চ লেখা ধরে)',
                          iconInset: 'inset-[3px]',
                        },
                        {
                          id: 'normal',
                          name: 'Normal',
                          top: '1"',
                          bottom: '1"',
                          left: '1"',
                          right: '1"',
                          hint: 'লেখা শুরু ও শেষ: ১.০" (স্ট্যান্ডার্ড)',
                          iconInset: 'inset-[6px]',
                        },
                        {
                          id: 'moderate',
                          name: 'Moderate',
                          top: '1"',
                          bottom: '1"',
                          left: '0.75"',
                          right: '0.75"',
                          hint: 'লেখা শুরু ও শেষ: ০.৭৫"',
                          iconInset: 'top-[6px] bottom-[6px] left-[4.5px] right-[4.5px]',
                        },
                        {
                          id: 'wide',
                          name: 'Wide',
                          top: '1"',
                          bottom: '1"',
                          left: '2"',
                          right: '2"',
                          hint: 'লেখা শুরু ও শেষ: ২.০"',
                          iconInset: 'top-[6px] bottom-[6px] left-[10px] right-[10px]',
                        },
                      ].map((m) => {
                        const isSelected =
                          styleConfig.margins === m.id ||
                          (!styleConfig.margins && m.id === 'narrow');
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSetMargins(m.id as CVMargins)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-3 transition cursor-pointer border-y ${
                              isSelected
                                ? 'bg-[#cde6fd] border-[#7da2ce] text-[#1b3d6d]'
                                : 'hover:bg-[#e5f1fb] border-transparent text-[#262626]'
                            }`}
                          >
                            {/* Word Margin Icon */}
                            <div className="w-8 h-10 border border-[#666] bg-white rounded-2xs relative shrink-0 shadow-2xs flex items-center justify-center">
                              <div className={`absolute ${m.iconInset} border border-[#2b579a] bg-blue-50/40`} />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[12px]">{m.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] text-[#2b579a] font-bold">✓ নির্বাচিত</span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 text-[10.5px] font-mono text-slate-600 mt-0.5">
                                <div>Top: {m.top}</div>
                                <div>Bottom: {m.bottom}</div>
                                <div>Left: {m.left}</div>
                                <div>Right: {m.right}</div>
                              </div>
                              <div className="text-[9.5px] text-[#2b579a] font-medium mt-0.5">
                                {m.hint}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Orientation */}
                <div className="relative word-menu-trigger">
                  <button
                    type="button"
                    onClick={() => toggleMenu('orientation')}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-[#e5f1fb] rounded border border-transparent hover:border-[#c4c4c4] transition cursor-pointer min-w-16 text-[#262626]"
                    title="Orientation (Portrait / Landscape)"
                  >
                    <div className="w-6 h-7 border border-[#2b579a] rounded-xs bg-white flex items-center justify-center mb-0.5 relative">
                      <div className="w-3.5 h-4.5 bg-sky-100 rounded-2xs" />
                      <span className="absolute -top-1 -right-1 text-[8px] text-[#2b579a]">⤵</span>
                    </div>
                    <span className="text-[11px] font-medium leading-none flex items-center gap-0.5">
                      Orientation
                      <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                    </span>
                  </button>

                  {openMenu === 'orientation' && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-[#c4c4c4] rounded shadow-lg py-1 z-50">
                      <button
                        type="button"
                        onClick={() => handleSetOrientation('portrait')}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#e5f1fb] flex items-center justify-between ${
                          styleConfig.orientation !== 'landscape' ? 'bg-[#cde6fd] font-bold text-[#1b3d6d]' : 'text-[#333]'
                        }`}
                      >
                        <span>Portrait (পোর্ট্রেট)</span>
                        {styleConfig.orientation !== 'landscape' && <Check className="w-3 h-3 text-[#1b3d6d]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetOrientation('landscape')}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#e5f1fb] flex items-center justify-between ${
                          styleConfig.orientation === 'landscape' ? 'bg-[#cde6fd] font-bold text-[#1b3d6d]' : 'text-[#333]'
                        }`}
                      >
                        <span>Landscape (ল্যান্ডস্কেপ)</span>
                        {styleConfig.orientation === 'landscape' && <Check className="w-3 h-3 text-[#1b3d6d]" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Size (Paper Size) */}
                <div className="relative word-menu-trigger">
                  <button
                    type="button"
                    onClick={() => toggleMenu('paperSize')}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-[#e5f1fb] rounded border border-transparent hover:border-[#c4c4c4] transition cursor-pointer min-w-12 text-[#262626]"
                    title="Paper Size (A4, Letter, Legal)"
                  >
                    <div className="w-6 h-7 border border-[#2b579a] rounded-xs bg-white flex flex-col items-center justify-center mb-0.5 relative">
                      <span className="text-[7.5px] font-bold text-[#2b579a] font-mono leading-none">
                        {styleConfig.paperSize ? styleConfig.paperSize.toUpperCase() : 'A4'}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium leading-none flex items-center gap-0.5">
                      Size
                      <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                    </span>
                  </button>

                  {openMenu === 'paperSize' && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#c4c4c4] rounded shadow-lg py-1 z-50">
                      {[
                        { id: 'a4', name: 'A4', dim: '8.27" × 11.69" • 210 × 297 mm (স্ট্যান্ডার্ড)' },
                        { id: 'letter', name: 'Letter', dim: '8.5" × 11" • 215.9 × 279.4 mm' },
                        { id: 'legal', name: 'Legal', dim: '8.5" × 14" • 215.9 × 355.6 mm' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSetPaperSize(p.id as CVPaperSize)}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#e5f1fb] transition cursor-pointer ${
                            styleConfig.paperSize === p.id || (!styleConfig.paperSize && p.id === 'a4')
                              ? 'bg-[#cde6fd] font-bold text-[#1b3d6d]'
                              : 'text-[#333]'
                          }`}
                        >
                          <div className="font-semibold flex items-center justify-between">
                            <span>{p.name}</span>
                            {(styleConfig.paperSize === p.id || (!styleConfig.paperSize && p.id === 'a4')) && (
                              <Check className="w-3 h-3 text-[#1b3d6d]" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{p.dim}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Columns */}
                <div className="relative word-menu-trigger">
                  <button
                    type="button"
                    onClick={() => toggleMenu('columns')}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-[#e5f1fb] rounded border border-transparent hover:border-[#c4c4c4] transition cursor-pointer min-w-14 text-[#262626]"
                    title="Columns (কলাম বিভাজন)"
                  >
                    <div className="w-6 h-7 border border-[#2b579a] rounded-xs bg-white flex items-center justify-around px-0.5 mb-0.5">
                      <div className="w-2 h-4.5 bg-sky-200" />
                      <div className="w-2 h-4.5 bg-sky-200" />
                    </div>
                    <span className="text-[11px] font-medium leading-none flex items-center gap-0.5">
                      Columns
                      <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                    </span>
                  </button>

                  {openMenu === 'columns' && (
                    <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#c4c4c4] rounded shadow-lg py-1 z-50">
                      <button
                        type="button"
                        onClick={() => handleSetColumns('one')}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#e5f1fb] flex items-center justify-between ${
                          styleConfig.columns !== 'two' ? 'bg-[#cde6fd] font-bold text-[#1b3d6d]' : 'text-[#333]'
                        }`}
                      >
                        <span>One Column</span>
                        {styleConfig.columns !== 'two' && <Check className="w-3 h-3 text-[#1b3d6d]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetColumns('two')}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#e5f1fb] flex items-center justify-between ${
                          styleConfig.columns === 'two' ? 'bg-[#cde6fd] font-bold text-[#1b3d6d]' : 'text-[#333]'
                        }`}
                      >
                        <span>Two Columns</span>
                        {styleConfig.columns === 'two' && <Check className="w-3 h-3 text-[#1b3d6d]" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Breaks (Page Break) */}
                <button
                  type="button"
                  onClick={onAddNewPage}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-[#e5f1fb] rounded border border-transparent hover:border-[#c4c4c4] transition cursor-pointer min-w-14 text-[#262626]"
                  title="Page Break (নতুন পেজ যোগ করুন)"
                >
                  <div className="w-6 h-7 border border-dashed border-[#2b579a] rounded-xs bg-white flex flex-col items-center justify-between py-0.5 mb-0.5">
                    <div className="w-4 h-1.5 bg-sky-200 rounded-2xs" />
                    <div className="w-4 h-0.5 border-t border-dashed border-sky-400" />
                    <div className="w-4 h-1.5 bg-sky-200 rounded-2xs" />
                  </div>
                  <span className="text-[11px] font-medium leading-none flex items-center gap-0.5">
                    Breaks
                    <ChevronDown className="w-2.5 h-2.5 text-[#666]" />
                  </span>
                </button>

                {/* 6. Line Numbers & Hyphenation (Screenshot icons) */}
                <div className="hidden lg:flex flex-col justify-around py-0.5 pl-1">
                  <div className="flex items-center gap-1 text-[11px] text-[#333] hover:text-[#1b3d6d] cursor-pointer">
                    <FileText className="w-3 h-3 text-[#2b579a]" />
                    <span>Line Numbers ▾</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#333] hover:text-[#1b3d6d] cursor-pointer">
                    <span className="text-[10px] font-serif font-bold text-[#2b579a]">b-c</span>
                    <span>Hyphenation ▾</span>
                  </div>
                </div>

                {/* Group Footer Label */}
                <div className="self-end text-[9.5px] text-[#6b7280] font-medium flex items-center gap-0.5 pl-2">
                  <span>Page Setup</span>
                  <span className="text-[8px] text-[#9ca3af]">⇲</span>
                </div>
              </div>

              {/* GROUP 2: PARAGRAPH (Matching exact screenshot 1: Indent Left/Right, Spacing Before/After) */}
              <div className="flex items-center gap-4 pl-1">
                {/* Indent: Left, Right */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] text-[#4b5563] font-medium leading-none">Indent</div>
                  <div className="flex items-center gap-2">
                    {/* Left Indent */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#374151] w-8">Left:</span>
                      <div className="flex items-center bg-white border border-[#c4c4c4] rounded h-5 px-1 w-16 justify-between shadow-2xs">
                        <span className="text-[10.5px] font-mono text-[#111]">
                          {(styleConfig.indentLeft || 0).toFixed(1)}"
                        </span>
                        <div className="flex flex-col -mr-0.5">
                          <button
                            type="button"
                            onClick={() => handleIndentChange('left', 0.1)}
                            className="text-[7px] text-[#444] hover:text-black leading-none"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleIndentChange('left', -0.1)}
                            className="text-[7px] text-[#444] hover:text-black leading-none"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Indent */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#374151] w-9">Right:</span>
                      <div className="flex items-center bg-white border border-[#c4c4c4] rounded h-5 px-1 w-16 justify-between shadow-2xs">
                        <span className="text-[10.5px] font-mono text-[#111]">
                          {(styleConfig.indentRight || 0).toFixed(1)}"
                        </span>
                        <div className="flex flex-col -mr-0.5">
                          <button
                            type="button"
                            onClick={() => handleIndentChange('right', 0.1)}
                            className="text-[7px] text-[#444] hover:text-black leading-none"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleIndentChange('right', -0.1)}
                            className="text-[7px] text-[#444] hover:text-black leading-none"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacing: Before, After (Matches exact 0 pt and 8 pt from screenshot!) */}
                <div className="flex flex-col gap-1.5 border-l border-[#d1d5db] pl-3">
                  <div className="text-[11px] text-[#4b5563] font-medium leading-none">Spacing</div>
                  <div className="flex items-center gap-2">
                    {/* Spacing Before */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#374151] w-10">Before:</span>
                      <div className="flex items-center bg-white border border-[#c4c4c4] rounded h-5 px-1 w-16 justify-between shadow-2xs">
                        <span className="text-[10.5px] font-mono text-[#111]">
                          {styleConfig.spacingBefore || 0} pt
                        </span>
                        <div className="flex flex-col -mr-0.5">
                          <button
                            type="button"
                            onClick={() => handleSpacingChange('before', 2)}
                            className="text-[7px] text-[#444] hover:text-black leading-none"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSpacingChange('before', -2)}
                            className="text-[7px] text-[#444] hover:text-black leading-none"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Spacing After (Defaults to 8 pt as shown in screenshot!) */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#374151] w-9">After:</span>
                      <div className="flex items-center bg-white border border-[#c4c4c4] rounded h-5 px-1 w-16 justify-between shadow-2xs">
                        <span className="text-[10.5px] font-mono text-[#111]">
                          {styleConfig.spacingAfter ?? 8} pt
                        </span>
                        <div className="flex flex-col -mr-0.5">
                          <button
                            type="button"
                            onClick={() => handleSpacingChange('after', 2)}
                            className="text-[7px] text-[#444] hover:text-black leading-none"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSpacingChange('after', -2)}
                            className="text-[7px] text-[#444] hover:text-black leading-none"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Footer Label */}
                <div className="self-end text-[9.5px] text-[#6b7280] font-medium flex items-center gap-0.5 pl-2">
                  <span>Paragraph</span>
                  <span className="text-[8px] text-[#9ca3af]">⇲</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
