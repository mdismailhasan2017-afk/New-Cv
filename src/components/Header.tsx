import React from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Copy,
  Check,
  Eye,
  Edit3,
  Columns3,
  Sliders,
  History,
  Camera,
} from 'lucide-react';
import { CVData, CVTemplateId } from '../types';
import {
  TEMPLATE_OPTIONS,
  PRESET_ALAMEN_PASSPORT,
  PRESET_GULF_ELECTRICAL,
  PRESET_CIVIL_ENGINEER,
  PRESET_SOFTWARE_ENGINEER,
} from '../data/samplePresets';

interface HeaderProps {
  templateId: CVTemplateId;
  onTemplateChange: (id: CVTemplateId) => void;
  onLoadPreset: (data: CVData) => void;
  onReset: () => void;
  onPrint: () => void;
  viewMode: 'split' | 'editor' | 'preview';
  onViewModeChange: (mode: 'split' | 'editor' | 'preview') => void;
  cvData: CVData;
  onImportData: (data: CVData) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenPassportScanner?: () => void;
  cvCount?: number;
  passportScanCount?: number;
  onOpenHistoryWithTab?: (tab: 'cv' | 'passport' | 'stats') => void;
}

export const Header: React.FC<HeaderProps> = ({
  templateId,
  onTemplateChange,
  onLoadPreset,
  onReset,
  onPrint,
  viewMode,
  onViewModeChange,
  cvData,
  onImportData,
  onOpenSettings,
  onOpenHistory,
  onOpenPassportScanner,
  cvCount = 0,
  passportScanCount = 0,
  onOpenHistoryWithTab,
}) => {
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${(cvData.name || 'CV').replace(/\s+/g, '_')}_Resume.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            onImportData(parsed);
          }
        } catch {
          alert('Invalid JSON CV file');
        }
      };
    }
  };

  const handleCopyText = () => {
    const text = `
CURRICULUM VITAE
${cvData.name.toUpperCase()}
${cvData.jobTitle}
Telephone No: ${cvData.mobile} | Email: ${cvData.email}

OBJECTIVE:
${cvData.objective}

PERSONAL INFORMATION:
Father's Name: ${cvData.fatherName}
Mother's Name: ${cvData.motherName}
Date of Birth: ${cvData.dob}
Nationality: ${cvData.nationality}
Passport No: ${cvData.passportNumber} (Issue: ${cvData.dateOfIssue}, Expiry: ${cvData.dateOfExpiry})
Address: ${cvData.permanentAddress}

EXPERIENCE:
${cvData.experiences.map((exp) => `- ${exp.project} (${exp.country}) | ${exp.duration}`).join('\n')}

EDUCATION:
${cvData.educations.map((edu) => `- ${edu.exam}, ${edu.inst} (${edu.board}) - ${edu.year}`).join('\n')}

SKILLS:
${cvData.skills.join(', ')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* App Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-max">
          <div className="w-9 h-9 rounded bg-slate-950 border-l-2 border-sky-400 flex items-center justify-center shadow-md text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-wider uppercase text-white flex items-center gap-1.5 font-sans">
                PRO CV BUILDER
              </h1>
              <span className="text-[10px] font-bold uppercase bg-slate-800 text-sky-300 border-l-2 border-sky-400 px-2 py-0.5 rounded-xs tracking-wider">
                {TEMPLATE_OPTIONS.length} FORMATS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">Geometric & Gulf CV Workspace</p>
          </div>
        </div>

        {/* Middle Controls: Template Selection */}
        <div className="flex items-center gap-2 flex-1 max-w-xl justify-center">
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <select
              id="template-select-dropdown"
              value={templateId}
              onChange={(e) => onTemplateChange(e.target.value as CVTemplateId)}
              className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-semibold rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none cursor-pointer truncate shadow-inner tracking-wide"
            >
              <optgroup label="🌐 Gulf & Overseas Formats (পাসপোর্টসহ)">
                {TEMPLATE_OPTIONS.filter((t) => t.category === 'gulf').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚡ Technical & Industrial Formats">
                {TEMPLATE_OPTIONS.filter((t) => t.category === 'technical').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="💼 General & Corporate Formats">
                {TEMPLATE_OPTIONS.filter((t) => t.category === 'corporate').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Presets Dropdown */}
          <div className="relative group">
            <button
              id="btn-auto-fill"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-sky-300 rounded text-xs font-bold uppercase tracking-wider transition"
              title="অটো-ফিল ডেমো ডাটা"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">অটো-ফিল</span>
            </button>
            <div className="absolute left-0 mt-1 w-60 bg-slate-900 border border-slate-700 rounded shadow-2xl py-1 hidden group-hover:block z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400 border-b border-slate-800">
                নমুনা ডাটা লোড করুন:
              </div>
              <button
                onClick={() => onLoadPreset(PRESET_ALAMEN_PASSPORT)}
                className="w-full text-left px-3 py-2 text-xs text-amber-300 font-semibold hover:bg-slate-800 hover:text-amber-200 flex items-center justify-between border-l-2 border-transparent hover:border-amber-400 transition"
              >
                <span>👤 ALAMEN (পাসপোর্ট ডাটা)</span>
              </button>
              <button
                onClick={() => onLoadPreset(PRESET_GULF_ELECTRICAL)}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-sky-300 flex items-center justify-between border-l-2 border-transparent hover:border-sky-400 transition"
              >
                <span>⚡ Electrical Sargent (Gulf)</span>
              </button>
              <button
                onClick={() => onLoadPreset(PRESET_CIVIL_ENGINEER)}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-sky-300 flex items-center justify-between border-l-2 border-transparent hover:border-sky-400 transition"
              >
                <span>🏗️ Civil Engineer / QC</span>
              </button>
              <button
                onClick={() => onLoadPreset(PRESET_SOFTWARE_ENGINEER)}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-sky-300 flex items-center justify-between border-l-2 border-transparent hover:border-sky-400 transition"
              >
                <span>💻 Software Engineer (IT)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* View mode toggle for smaller/responsive screens */}
          <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => onViewModeChange('editor')}
              className={`p-1.5 rounded-xs text-xs transition ${
                viewMode === 'editor' ? 'bg-slate-800 text-sky-400 border-l border-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Editor Only"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('split')}
              className={`p-1.5 rounded-xs text-xs transition ${
                viewMode === 'split' ? 'bg-slate-800 text-sky-400 border-l border-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('preview')}
              className={`p-1.5 rounded-xs text-xs transition ${
                viewMode === 'preview' ? 'bg-slate-800 text-sky-400 border-l border-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lifetime Counters Widget: CVs Made & Passports Scanned */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-950/70 border border-slate-800/90 px-2 py-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => onOpenHistoryWithTab ? onOpenHistoryWithTab('cv') : onOpenHistory()}
              className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition cursor-pointer px-1 py-0.5 rounded hover:bg-slate-800/80"
              title="মোট কতগুলো সিভি তৈরি হয়েছে এবং সংরক্ষিত হিস্টোরি"
            >
              <FileText className="w-3 h-3 text-sky-400" />
              <span className="text-slate-400">সিভি:</span>
              <span className="font-extrabold text-sky-300 font-mono">{cvCount}টি</span>
            </button>
            <span className="text-slate-700 text-[10px]">|</span>
            <button
              type="button"
              onClick={() => onOpenHistoryWithTab ? onOpenHistoryWithTab('passport') : onOpenHistory()}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition cursor-pointer px-1 py-0.5 rounded hover:bg-slate-800/80"
              title="মোট কতগুলো পাসপোর্ট স্ক্যান করা হয়েছে এবং সংরক্ষিত হিস্টোরি"
            >
              <Camera className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400">স্ক্যান:</span>
              <span className="font-extrabold text-amber-300 font-mono">{passportScanCount}টি</span>
            </button>
          </div>

          {/* Passport Scanner Button */}
          {onOpenPassportScanner && (
            <button
              onClick={onOpenPassportScanner}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1 cursor-pointer shadow-sm"
              title="পাসপোর্ট স্ক্যানার ও ডাটা এক্সট্রাক্টর (Passport AI Scan)"
            >
              <Camera className="w-3.5 h-3.5 text-sky-200" />
              <span className="hidden sm:inline">পাসপোর্ট স্ক্যান</span>
            </button>
          )}

          {/* CV & Passport History Button */}
          <button
            onClick={onOpenHistory}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-sky-400 text-slate-200 rounded text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer"
            title={`সিভি হিস্টোরি (${cvCount}টি) ও পাসপোর্ট হিস্টোরি (${passportScanCount}টি) - অটো সেভ`}
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">হিস্টোরি</span>
            {(cvCount > 0 || passportScanCount > 0) && (
              <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                {cvCount + passportScanCount}
              </span>
            )}
          </button>

          {/* Quick Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1"
            title="Custom Styling & Font Settings"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">স্টাইল</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative group">
            <button
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1"
              title="Export & Import Options"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xl:inline">ব্যাকআপ</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded shadow-2xl py-1 hidden group-hover:block z-50">
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 border-l-2 border-transparent hover:border-sky-400"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Export JSON Backup</span>
              </button>
              <label className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer border-l-2 border-transparent hover:border-sky-400">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
              </label>
              <button
                onClick={handleCopyText}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800 border-l-2 border-transparent hover:border-sky-400"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text Resume'}</span>
              </button>
              <button
                onClick={onReset}
                className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-800 border-l-2 border-transparent hover:border-rose-400"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear / Reset Form</span>
              </button>
            </div>
          </div>

          {/* Primary Print / PDF / JPG Button */}
          <button
            id="btn-print-download"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-bold uppercase tracking-wider rounded text-xs sm:text-sm shadow-md shadow-sky-500/20 transition cursor-pointer"
            title="PDF, JPG ইমেজ ডাউনলোড বা প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>প্রিন্ট / PDF / JPG</span>
          </button>
        </div>

      </div>
    </header>
  );
};
