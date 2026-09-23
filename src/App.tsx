/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CVData, CVTemplateId, StyleConfig } from './types';
import { PRESET_GULF_ELECTRICAL, PRESET_ALAMEN_PASSPORT, TEMPLATE_OPTIONS } from './data/samplePresets';
import { Header } from './components/Header';
import { FormEditor } from './components/FormEditor';
import { PreviewContainer } from './components/PreviewContainer';
import { SettingsModal } from './components/SettingsModal';
import { PrintModal } from './components/PrintModal';
import { CVHistoryModal } from './components/CVHistoryModal';
import { Edit3, Eye, Printer, Sparkles, CheckCircle2, History, Camera, FileText, ChevronUp, ChevronDown, Sliders, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react';
import {
  autoSaveCVToHistory,
  saveCVToHistory,
  getTotalCVsCount,
} from './utils/historyStorage';
import { getTotalPassportScansCount } from './utils/passportHistory';
import { cleanExcessiveLocalStorageQuota } from './utils/imageCompressor';

const FORM_QUICK_SECTIONS = [
  { id: 'scanner', label: 'পাসপোর্ট স্ক্যানার', icon: '📷', elementId: 'section-scanner', sectionKey: '' },
  { id: 'contact', label: '১. যোগাযোগ ও ছবি', icon: '👤', elementId: 'section-contact', sectionKey: 'contact' },
  { id: 'objective', label: '২. অবজেক্টিভ', icon: '🎯', elementId: 'section-objective', sectionKey: 'objective' },
  { id: 'personal', label: '৩. ব্যক্তিগত ও পাসপোর্ট', icon: '📋', elementId: 'section-personal', sectionKey: 'personal' },
  { id: 'languages', label: '৪. ভাষা', icon: '🌐', elementId: 'section-languages', sectionKey: 'languages' },
  { id: 'education', label: '৫. শিক্ষা', icon: '🎓', elementId: 'section-education', sectionKey: 'education' },
  { id: 'experience', label: '৬. অভিজ্ঞতা', icon: '💼', elementId: 'section-experience', sectionKey: 'experience' },
  { id: 'skills', label: '৭. স্কিলস', icon: '🛠️', elementId: 'section-skills', sectionKey: 'skills' },
  { id: 'certifications', label: '৮. প্রশিক্ষণ', icon: '📜', elementId: 'section-certifications', sectionKey: 'certifications' },
  { id: 'signature', label: '৯. স্বাক্ষর', icon: '✍️', elementId: 'section-signature', sectionKey: 'signature' },
  { id: 'additional-pages', label: '১০. অতিরিক্ত পেজ', icon: '📄', elementId: 'section-additional-pages', sectionKey: 'additional-pages' },
];

export default function App() {
  // Initialize with local storage if present, or preset
  const [cvData, setCvData] = useState<CVData>(() => {
    try {
      const alamenLoaded = localStorage.getItem('pro_cv_builder_alamen_v1');
      if (!alamenLoaded) {
        localStorage.setItem('pro_cv_builder_alamen_v1', 'true');
        localStorage.setItem('pro_cv_builder_data', JSON.stringify(PRESET_ALAMEN_PASSPORT));
        return PRESET_ALAMEN_PASSPORT;
      }
      const saved = localStorage.getItem('pro_cv_builder_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          // Clear Emergency Contact from CV data as requested by user
          parsed.emergencyContactName = '';
          parsed.emergencyContactRelation = '';
          parsed.emergencyContactPhone = '';
          parsed.emergencyContactAddress = '';

          // Delete additionalPages (Page 2) as requested by user
          if (parsed.additionalPages && parsed.additionalPages.length > 0) {
            parsed.additionalPages = [];
          }
          try {
            localStorage.setItem('pro_cv_builder_data', JSON.stringify(parsed));
          } catch {
            // ignore
          }
          if (!parsed.jobTitle) {
            parsed.jobTitle = 'Position Applied For: ';
          } else if (parsed.jobTitle === 'Overseas Construction & General Worker') {
            parsed.jobTitle = 'Position Applied For: Overseas Construction & General Worker';
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return PRESET_ALAMEN_PASSPORT;
  });

  const [templateId, setTemplateId] = useState<CVTemplateId>(() => {
    try {
      const saved = localStorage.getItem('pro_cv_builder_template');
      if (saved && TEMPLATE_OPTIONS.some((t) => t.id === saved)) {
        return saved as CVTemplateId;
      }
    } catch {
      // Fallback
    }
    return 'fmt-gulf-1';
  });

  const [styleConfig, setStyleConfig] = useState<StyleConfig>(() => {
    try {
      const saved = localStorage.getItem('pro_cv_builder_style');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          sectionGap: parsed.sectionGap || parsed.spacing || 'normal',
          headerAlign: parsed.headerAlign || 'center',
          paperSize: parsed.paperSize || 'a4',
          margins: parsed.margins || 'narrow',
          orientation: parsed.orientation || 'portrait',
          columns: parsed.columns || 'one',
          indentLeft: parsed.indentLeft ?? 0,
          indentRight: parsed.indentRight ?? 0,
          spacingBefore: parsed.spacingBefore ?? 0,
          spacingAfter: parsed.spacingAfter ?? 8,
          lineSpacing: parsed.lineSpacing ?? 1.15,
          textAlign: parsed.textAlign || 'left',
          isBold: parsed.isBold ?? false,
          isItalic: parsed.isItalic ?? false,
          isUnderline: parsed.isUnderline ?? false,
          showBullets: parsed.showBullets ?? true,
        };
      }
    } catch {
      // Fallback
    }
    return {
      accentColor: '#1e3a8a',
      fontFamily: 'times',
      fontSize: 'base',
      spacing: 'normal',
      sectionGap: 'normal',
      headerAlign: 'center',
      showPhoto: true,
      paperSize: 'a4',
      margins: 'narrow',
      orientation: 'portrait',
      columns: 'one',
      indentLeft: 0,
      indentRight: 0,
      spacingBefore: 0,
      spacingAfter: 8,
      lineSpacing: 1.15,
      textAlign: 'left',
      showBullets: true,
    };
  });

  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyModalTab, setHistoryModalTab] = useState<'cv' | 'passport' | 'stats'>('cv');
  const [cvCount, setCvCount] = useState<number>(() => getTotalCVsCount());
  const [passportScanCount, setPassportScanCount] = useState<number>(() => getTotalPassportScansCount());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formScrollRef = React.useRef<HTMLDivElement>(null);
  const optionScrollTrackRef = React.useRef<HTMLDivElement>(null);
  const [isOptionScrollVisible, setIsOptionScrollVisible] = useState<boolean>(true);
  const [showFloatingScrollControls, setShowFloatingScrollControls] = useState<boolean>(true);

  const handleScrollOptionsLeft = () => {
    if (optionScrollTrackRef.current) {
      optionScrollTrackRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollOptionsRight = () => {
    if (optionScrollTrackRef.current) {
      optionScrollTrackRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  const handleJumpToSection = (sectionKey: string, elementId: string) => {
    if (viewMode === 'preview') {
      setViewMode('split');
    }
    if (sectionKey) {
      window.dispatchEvent(new CustomEvent('jump_to_cv_section', { detail: { section: sectionKey } }));
    }
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-2', 'ring-sky-400', 'ring-offset-2', 'ring-offset-slate-900');
        setTimeout(() => el.classList.remove('ring-2', 'ring-sky-400', 'ring-offset-2', 'ring-offset-slate-900'), 2000);
      }
    }, 100);
  };

  const handleScrollTop = () => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollBottom = () => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTo({ top: formScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleScrollToPassportScanner = () => {
    handleJumpToSection('', 'section-scanner');
  };

  // Sync lifetime counters whenever history updates & ensure quota hygiene
  useEffect(() => {
    // Proactively clean and guard storage quota on app startup
    cleanExcessiveLocalStorageQuota();

    const syncCounters = () => {
      setCvCount(getTotalCVsCount());
      setPassportScanCount(getTotalPassportScansCount());
    };
    syncCounters();
    window.addEventListener('pro_cv_history_updated', syncCounters);
    return () => window.removeEventListener('pro_cv_history_updated', syncCounters);
  }, []);

  // Auto-save to localStorage & debounced auto-save snapshot in History
  useEffect(() => {
    try {
      localStorage.setItem('pro_cv_builder_data', JSON.stringify(cvData));
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      autoSaveCVToHistory(cvData, templateId, styleConfig);
    }, 1500);

    return () => clearTimeout(timer);
  }, [cvData, templateId, styleConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('pro_cv_builder_template', templateId);
    } catch {
      // ignore
    }
  }, [templateId]);

  useEffect(() => {
    try {
      localStorage.setItem('pro_cv_builder_style', JSON.stringify(styleConfig));
    } catch {
      // ignore
    }
  }, [styleConfig]);

  // Ensure Page 2 (additionalPages) is removed
  useEffect(() => {
    if (cvData.additionalPages && cvData.additionalPages.length > 0) {
      setCvData((prev) => ({
        ...prev,
        additionalPages: [],
      }));
    }
  }, []);

  const handleDeleteAdditionalPage = (pageId?: string) => {
    setCvData((prev) => ({
      ...prev,
      additionalPages: pageId
        ? (prev.additionalPages || []).filter((p) => p.id !== pageId)
        : [],
    }));
    showToast('পেজ ২ ডিলিট করা হয়েছে!');
  };

  const handleAddNewPage = () => {
    const newPageNum = 2 + (cvData.additionalPages?.length || 0);
    const newPage = {
      id: `page_${Date.now()}`,
      title: `PAGE ${newPageNum}: ADDITIONAL INFORMATION`,
      subtitle: 'সার্টিফিকেট, অভিজ্ঞতা ও অতিরিক্ত বিবরণ',
      content: '',
      items: ['অতিরিক্ত অভিজ্ঞতা বা কোর্স বিবরণ ১', 'অতিরিক্ত অভিজ্ঞতা বা কোর্স বিবরণ ২'],
      images: [],
      showSignature: true,
    };
    setCvData((prev) => ({
      ...prev,
      additionalPages: [...(prev.additionalPages || []), newPage],
    }));
    showToast(`📄 পেজ ${newPageNum} (A4) সফলভাবে যোগ করা হয়েছে!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRestoreFromHistory = (
    data: CVData,
    targetTemplateId?: CVTemplateId,
    targetStyle?: StyleConfig
  ) => {
    setCvData(data);
    if (targetTemplateId) {
      setTemplateId(targetTemplateId);
    }
    if (targetStyle) {
      setStyleConfig(targetStyle);
    }
    showToast('📜 হিস্টোরি থেকে সিভি ডাটা পুনরুদ্ধার করা হয়েছে!');
  };

  const handleLoadPreset = (preset: CVData) => {
    setCvData(preset);
    saveCVToHistory(preset, templateId, styleConfig, `${preset.name || 'Preset'} - লোডকৃত`);
    showToast('⚡ নমুনা ডাটা সফলভাবে লোড ও অটো-সেভ করা হয়েছে!');
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সমস্ত তথ্য মুছে নতুন করে শুরু করতে চান?')) {
      const blankData: CVData = {
        name: '',
        jobTitle: 'Position Applied For: ',
        mobile: '',
        email: '',
        photoUrl: '',
        objective: '',
        fatherName: '',
        motherName: '',
        dob: '',
        nationality: 'Bangladeshi by Birth',
        permanentAddress: '',
        presentAddress: '',
        gender: 'Male',
        religion: 'Islam',
        maritalStatus: 'Single',
        height: '',
        weight: '',
        passportNumber: '',
        dateOfIssue: '',
        dateOfExpiry: '',
        placeOfIssue: '',
        languages: [{ id: '1', name: 'Bengali', proficiency: 'Native' }],
        educations: [],
        experiences: [],
        skills: [],
        skillsRaw: '',
        certifications: [],
        signatureText: '',
        signatureDate: new Date().toLocaleDateString(),
        showSignature: false,
      };
      setCvData(blankData);
      showToast('ফর্ম ক্লিয়ার করা হয়েছে!');
    }
  };

  const handlePrint = () => {
    // Explicit snapshot on print
    saveCVToHistory(cvData, templateId, styleConfig, `${cvData.name || 'CV'} - প্রিন্ট/PDF`);
    setIsPrintModalOpen(true);
  };

  const handleImportData = (data: CVData) => {
    setCvData(data);
    saveCVToHistory(data, templateId, styleConfig, `${data.name || 'CV'} - ইম্পোর্টকৃত`);
    showToast('✅ JSON ফাইল থেকে সিভি ডাটা ইম্পোর্ট ও অটো-সেভ হয়েছে!');
  };

  const handleOpenHistoryWithTab = (tab: 'cv' | 'passport' | 'stats') => {
    setHistoryModalTab(tab);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Header
        templateId={templateId}
        onTemplateChange={(id) => {
          setTemplateId(id);
          showToast(`টেমপ্লেট পরিবর্তিত হয়েছে!`);
        }}
        onLoadPreset={handleLoadPreset}
        onReset={handleReset}
        onPrint={handlePrint}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cvData={cvData}
        onImportData={handleImportData}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => handleOpenHistoryWithTab('cv')}
        onOpenPassportScanner={handleScrollToPassportScanner}
        cvCount={cvCount}
        passportScanCount={passportScanCount}
        onOpenHistoryWithTab={handleOpenHistoryWithTab}
      />

      {/* Main Workspace */}
      <main className="workspace flex-1 h-full min-h-0 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Form Panel - Independent Scroll with Quick Navigation */}
        <div
          className={`form-panel w-full md:w-[490px] lg:w-[530px] xl:w-[570px] 2xl:w-[610px] shrink-0 h-full min-h-0 bg-slate-900 border-r-2 border-slate-700 shadow-2xl flex flex-col overflow-hidden relative z-10 ${
            viewMode === 'preview' ? 'hidden md:hidden' : 'flex'
          }`}
        >
          {/* Header Info Bar */}
          <div className="p-3 bg-sky-950/40 border-b border-slate-800 flex items-center justify-between text-xs text-sky-300 shrink-0 select-none">
            <span className="font-bold flex items-center gap-1.5 text-slate-100">
              <Edit3 className="w-4 h-4 text-sky-400" /> সিভি তথ্য এডিটর
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOptionScrollVisible(!isOptionScrollVisible)}
                className={`text-[11px] px-2 py-0.5 rounded border transition flex items-center gap-1 cursor-pointer font-medium ${
                  isOptionScrollVisible
                    ? 'bg-sky-950 text-sky-300 border-sky-800 hover:bg-sky-900'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="অপশন স্ক্রল বার দেখান বা লুকান"
              >
                <Sliders className="w-3 h-3" />
                <span>অপশন স্ক্রল: {isOptionScrollVisible ? 'চালু' : 'লুকান'}</span>
              </button>
              <button
                onClick={() => handleOpenHistoryWithTab('cv')}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-sky-300 flex items-center gap-1 cursor-pointer transition border border-slate-700"
                title="মোট সিভি সংখ্যা ও হিস্টোরি"
              >
                <FileText className="w-3 h-3 text-sky-400" />
                <span>সিভি: <strong>{cvCount}</strong></span>
              </button>
              <button
                onClick={() => handleOpenHistoryWithTab('passport')}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-amber-300 flex items-center gap-1 cursor-pointer transition border border-slate-700"
                title="মোট পাসপোর্ট স্ক্যান ও হিস্টোরি"
              >
                <Camera className="w-3 h-3 text-amber-400" />
                <span>স্ক্যান: <strong>{passportScanCount}</strong></span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition border border-slate-700"
                title="সিভির সব ফন্ট সাইজ ও গ্যাপ কন্ট্রোল সেটিংস খুলুন"
              >
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>ফন্ট ও গ্যাপ</span>
              </button>
              <button
                onClick={() => handleLoadPreset(PRESET_ALAMEN_PASSPORT)}
                className="text-[11px] hover:underline flex items-center gap-1 text-emerald-400 cursor-pointer pl-1 font-medium"
                title="ALAMEN পাসপোর্ট তথ্য লোড করুন"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" /> ALAMEN ডাটা
              </button>
            </div>
          </div>

          {/* Quick Option Scroll / Move Bar */}
          {isOptionScrollVisible && (
            <div className="shrink-0 bg-slate-950/95 border-b border-slate-800/90 px-2 py-1.5 flex items-center gap-1 shadow-inner z-10 select-none">
              <button
                onClick={handleScrollOptionsLeft}
                className="p-1 rounded bg-slate-900 hover:bg-sky-900 text-slate-400 hover:text-white border border-slate-800 shrink-0 transition cursor-pointer"
                title="বামে অপশন স্ক্রল করুন"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={optionScrollTrackRef}
                onWheel={(e) => {
                  if (e.deltaY && optionScrollTrackRef.current) {
                    optionScrollTrackRef.current.scrollLeft += e.deltaY;
                  }
                }}
                className="flex-1 flex items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 px-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 pr-1">
                  <Sliders className="w-3 h-3 text-sky-400" /> অপশন স্ক্রল:
                </span>
                {FORM_QUICK_SECTIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleJumpToSection(item.sectionKey, item.elementId)}
                    className="text-[11px] px-2 py-1 rounded-md bg-slate-900 hover:bg-sky-950 hover:text-sky-300 text-slate-300 border border-slate-800 hover:border-sky-600/50 shrink-0 transition flex items-center gap-1 cursor-pointer font-medium whitespace-nowrap active:scale-95"
                    title={`ক্লিক করে "${item.label}" সেকশনে স্ক্রল করুন`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleScrollOptionsRight}
                className="p-1 rounded bg-slate-900 hover:bg-sky-900 text-slate-400 hover:text-white border border-slate-800 shrink-0 transition cursor-pointer"
                title="ডানে অপশন স্ক্রল করুন"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOptionScrollVisible(false)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition shrink-0 ml-0.5"
                title="অপশন স্ক্রল বার লুকান"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Independent Scrollable Form Content */}
          <div
            id="form-panel-scroll-container"
            ref={formScrollRef}
            className="flex-1 h-full min-h-0 overflow-y-auto overscroll-contain scroll-smooth form-panel-scroll relative"
          >
            <FormEditor
              data={cvData}
              onChange={setCvData}
              onOpenHistory={() => handleOpenHistoryWithTab('cv')}
            />
          </div>

          {/* Floating Scroll Controls (Top & Bottom) inside Left Panel */}
          {showFloatingScrollControls && (
            <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1.5 pointer-events-auto bg-slate-900/85 p-1 rounded-full border border-slate-800 shadow-xl backdrop-blur-xs">
              <button
                onClick={handleScrollTop}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-700 shadow-sm flex items-center justify-center transition cursor-pointer active:scale-90"
                title="এক ক্লিকে একদম উপরে যান (Scroll to Top)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleScrollBottom}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-700 shadow-sm flex items-center justify-center transition cursor-pointer active:scale-90"
                title="এক ক্লিকে একদম নিচে যান (Scroll to Bottom)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowFloatingScrollControls(false)}
                className="w-5 h-5 rounded-full text-slate-500 hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
                title="এই বাটনগুলো লুকান"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right Preview Panel - Fixed & Stationary CV Viewport */}
        <div
          className={`preview-workspace flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-slate-950 ${
            viewMode === 'editor' ? 'hidden md:hidden' : 'flex'
          }`}
        >
          <PreviewContainer
            data={cvData}
            templateId={templateId}
            onTemplateChange={setTemplateId}
            styleConfig={styleConfig}
            onStyleChange={setStyleConfig}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onPrint={handlePrint}
            onDeleteAdditionalPage={handleDeleteAdditionalPage}
            onAddNewPage={handleAddNewPage}
          />
        </div>

      </main>

      {/* Bottom Floating Navigation for Mobile screens */}
      <div className="no-print md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-2 z-40">
        <button
          onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full text-xs font-semibold flex items-center gap-1.5 transition shadow"
        >
          {viewMode === 'editor' ? (
            <>
              <Eye className="w-3.5 h-3.5 text-sky-400" /> <span>প্রিভিউ দেখুন</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5 text-amber-400" /> <span>এডিটর খুলুন</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleOpenHistoryWithTab('cv')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-full text-xs font-semibold flex items-center gap-1.5 transition shadow"
        >
          <History className="w-3.5 h-3.5" /> <span>হিস্টোরি ({cvCount + passportScanCount})</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition shadow"
        >
          <Printer className="w-3.5 h-3.5" /> <span>প্রিন্ট / PDF</span>
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        styleConfig={styleConfig}
        onChange={setStyleConfig}
      />

      {/* CV & Passport Unified History Modal */}
      <CVHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        currentData={cvData}
        currentTemplateId={templateId}
        currentStyle={styleConfig}
        onRestore={handleRestoreFromHistory}
        onApplyPassportData={(updatedFields) => {
          setCvData((prev) => {
            const merged = { ...prev, ...updatedFields };
            autoSaveCVToHistory(merged, templateId, styleConfig);
            return merged;
          });
          showToast('✅ পাসপোর্টের তথ্য সিভিতে সফলভাবে আপডেট ও অটো-সেভ হয়েছে!');
        }}
        initialTab={historyModalTab}
      />

      {/* Print / PDF Export Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        cvData={cvData}
        paperSize={styleConfig.paperSize}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="app-toast no-print fixed top-20 right-5 bg-slate-900/95 border border-sky-500/50 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
