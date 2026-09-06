import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  RotateCcw,
  Trash2,
  Download,
  Calendar,
  User,
  CreditCard,
  Check,
  PlusCircle,
  FileText,
  Search,
  Camera,
  CheckCircle2,
  BarChart3,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CVData, CVTemplateId, StyleConfig, CVHistoryItem } from '../types';
import {
  getCVHistory,
  saveCVToHistory,
  deleteHistoryItem,
  clearAllHistory,
  getCVStats,
} from '../utils/historyStorage';
import {
  getPassportHistory,
  deletePassportHistoryItem,
  clearAllPassportHistory,
  getPassportScanStats,
  formatPassportDetailsText,
  PassportHistoryItem,
} from '../utils/passportHistory';
import { toCapitalCase } from '../utils/textTransform';
import { formatBangladeshiAddress } from '../utils/passportScanner';

interface CVHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: CVData;
  currentTemplateId: CVTemplateId;
  currentStyle?: StyleConfig;
  onRestore: (data: CVData, templateId?: CVTemplateId, style?: StyleConfig) => void;
  onApplyPassportData?: (updates: Partial<CVData>) => void;
  initialTab?: 'cv' | 'passport' | 'stats';
}

export const CVHistoryModal: React.FC<CVHistoryModalProps> = ({
  isOpen,
  onClose,
  currentData,
  currentTemplateId,
  currentStyle,
  onRestore,
  onApplyPassportData,
  initialTab = 'cv',
}) => {
  const [activeTab, setActiveTab] = useState<'cv' | 'passport' | 'stats'>(initialTab);
  const [cvHistoryList, setCvHistoryList] = useState<CVHistoryItem[]>([]);
  const [passportList, setPassportList] = useState<PassportHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newSnapshotTitle, setNewSnapshotTitle] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<CVHistoryItem | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [copiedPassportId, setCopiedPassportId] = useState<string | null>(null);

  const loadAll = () => {
    setCvHistoryList(getCVHistory());
    setPassportList(getPassportHistory());
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
      setActiveTab(initialTab);
      setSaveSuccessMsg('');
      setRestoreConfirmId(null);
      setSelectedPreview(null);
    }
  }, [isOpen, initialTab]);

  // Listen for global history updates
  useEffect(() => {
    const handleUpdate = () => {
      loadAll();
    };
    window.addEventListener('pro_cv_history_updated', handleUpdate);
    return () => window.removeEventListener('pro_cv_history_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const cvStats = getCVStats();
  const passportStats = getPassportScanStats();

  const handleSaveCurrentSnapshot = () => {
    const title =
      newSnapshotTitle.trim() ||
      `${currentData.name || 'CV'} (${currentData.passportNumber || 'No Pass'})`;
    saveCVToHistory(currentData, currentTemplateId, currentStyle, title);
    loadAll();
    setNewSnapshotTitle('');
    setSaveSuccessMsg('বর্তমান সিভি সফলভাবে হিস্টোরিতে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleDeleteCV = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setCvHistoryList(updated);
    if (selectedPreview?.id === id) {
      setSelectedPreview(null);
    }
  };

  const handleDeletePassport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deletePassportHistoryItem(id);
    setPassportList(updated);
  };

  const handleClearAllCVs = () => {
    if (window.confirm('আপনি কি সত্যিই সমস্ত সিভি হিস্টোরি মুছে ফেলতে চান?')) {
      clearAllHistory();
      setCvHistoryList([]);
      setSelectedPreview(null);
    }
  };

  const handleClearAllPassports = () => {
    if (window.confirm('আপনি কি সমস্ত পাসপোর্ট স্ক্যান হিস্টোরি মুছে ফেলতে চান?')) {
      clearAllPassportHistory();
      setPassportList([]);
    }
  };

  const handleConfirmRestoreCV = (item: CVHistoryItem) => {
    onRestore(item.data, item.templateId, item.style);
    onClose();
  };

  const handleApplyPassportToCV = (item: PassportHistoryItem) => {
    const d = item.data;
    const updates: Partial<CVData> = {};
    if (d.fullName) updates.name = toCapitalCase(d.fullName);
    if (d.passportNumber) updates.passportNumber = d.passportNumber.toUpperCase();
    if (d.dateOfIssue) updates.dateOfIssue = d.dateOfIssue;
    if (d.dateOfExpiry) updates.dateOfExpiry = d.dateOfExpiry;
    if (d.fatherName) updates.fatherName = toCapitalCase(d.fatherName);
    if (d.motherName) updates.motherName = toCapitalCase(d.motherName);
    if (d.dob) updates.dob = d.dob;
    if (d.gender) updates.gender = d.gender;
    if (d.nationality) updates.nationality = toCapitalCase(d.nationality);
    if (d.permanentAddress) updates.permanentAddress = formatBangladeshiAddress(d.permanentAddress);
    if (d.presentAddress) updates.presentAddress = formatBangladeshiAddress(d.presentAddress || d.permanentAddress);
    if (d.personalNo) updates.personalNo = d.personalNo;
    if (d.previousPassportNumber) updates.previousPassportNumber = d.previousPassportNumber;
    if (d.placeOfIssue) updates.placeOfIssue = d.placeOfIssue;
    if (d.religion) updates.religion = d.religion;
    if (d.maritalStatus) updates.maritalStatus = d.maritalStatus;
    if (d.height) updates.height = d.height;
    if (d.weight) updates.weight = d.weight;

    if (onApplyPassportData) {
      onApplyPassportData(updates);
    } else {
      onRestore({ ...currentData, ...updates }, currentTemplateId, currentStyle);
    }
    onClose();
  };

  const handleCopyPassportText = (item: PassportHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = formatPassportDetailsText(item.data);
    navigator.clipboard.writeText(text);
    setCopiedPassportId(item.id);
    setTimeout(() => setCopiedPassportId(null), 2000);
  };

  const handleExportSingleCV = (item: CVHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = JSON.stringify(item.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CV_${(item.candidateName || 'Candidate').replace(/\s+/g, '_')}_${item.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFullBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      app: 'Pro CV Builder',
      totalCVs: cvStats.totalCount,
      totalPassports: passportStats.totalScanned,
      cvHistory: cvHistoryList,
      passportHistory: passportList,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pro_CV_Full_History_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered CV List
  const filteredCVList = cvHistoryList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.candidateName.toLowerCase().includes(q) ||
      (item.passportNumber && item.passportNumber.toLowerCase().includes(q)) ||
      (item.summary && item.summary.toLowerCase().includes(q))
    );
  });

  // Filtered Passport List
  const filteredPassportList = passportList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.data.fullName && item.data.fullName.toLowerCase().includes(q)) ||
      (item.data.passportNumber && item.data.passportNumber.toLowerCase().includes(q)) ||
      item.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  সিভি ও পাসপোর্ট হিস্টোরি হাব
                </h2>
                <span className="text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  অটো-সেভ সক্রিয়
                </span>
              </div>
              <p className="text-xs text-slate-400">
                কতগুলো সিভি বানিয়েছেন ও পাসপোর্ট স্ক্যান করেছেন সবগুলোর স্বয়ংক্রিয় রেকর্ড
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter Summary Bar */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <FileText className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">মোট সিভি তৈরি</span>
              <strong className="text-sky-300 text-sm font-extrabold">{cvStats.totalCount} টি</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Camera className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">মোট পাসপোর্ট স্ক্যান</span>
              <strong className="text-amber-300 text-sm font-extrabold">{passportStats.totalScanned} টি</strong>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">সংরক্ষণ পদ্ধতি</span>
              <strong className="text-emerald-300 text-xs font-semibold">লোকাল ব্রাউজার স্টোরেজ</strong>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-2.5 pb-0 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('cv')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'cv'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>সিভি হিস্টোরি</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'cv' ? 'bg-sky-500/25 text-sky-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {cvHistoryList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('passport')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'passport'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>পাসপোর্ট স্ক্যান হিস্টোরি</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'passport' ? 'bg-amber-500/25 text-amber-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {passportList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>পরিসংখ্যান ও ব্যাকআপ</span>
          </button>
        </div>

        {/* Search & Actions Bar (for list tabs) */}
        {activeTab !== 'stats' && (
          <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'cv' ? 'নাম বা পাসপোর্ট দিয়ে সিভি খুঁজুন...' : 'নাম বা পাসপোর্ট দিয়ে স্ক্যান খুঁজুন...'}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'cv' && cvHistoryList.length > 0 && (
                <button
                  onClick={handleClearAllCVs}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>সিভি হিস্টোরি মুছুন</span>
                </button>
              )}
              {activeTab === 'passport' && passportList.length > 0 && (
                <button
                  onClick={handleClearAllPassports}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>স্ক্যান হিস্টোরি মুছুন</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 1 Quick Save Current Bar */}
        {activeTab === 'cv' && (
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 space-y-1.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newSnapshotTitle}
                onChange={(e) => setNewSnapshotTitle(e.target.value)}
                placeholder={`ম্যানুয়াল স্ন্যাপশট নাম (যেমন: ${currentData.name || 'ALAMEN'} - ভার্সন ২)`}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                onClick={handleSaveCurrentSnapshot}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>বর্তমান সিভি সেভ করুন</span>
              </button>
            </div>
            {saveSuccessMsg && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          
          {/* TAB 1: CV HISTORY LIST */}
          {activeTab === 'cv' && (
            <div>
              {cvHistoryList.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/30 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-sky-400/80" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">কোনো সিভি হিস্টোরি সংরক্ষিত নেই</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    আপনি যখনই কোনো সিভি তৈরি করবেন, প্রিন্ট বা ডাউনলোড করবেন, তা স্বয়ংক্রিয়ভাবে এখানে সেভ হয়ে থাকবে।
                  </p>
                  <button
                    onClick={handleSaveCurrentSnapshot}
                    className="mt-2 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>বর্তমান সিভি স্ন্যাপশট সেভ করুন</span>
                  </button>
                </div>
              ) : filteredCVList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  "{searchQuery}" এর সাথে কোনো সিভি রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredCVList.map((item) => {
                    const isSelected = selectedPreview?.id === item.id;
                    const isConfirming = restoreConfirmId === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPreview(item)}
                        className={`border rounded-xl p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 border-sky-500 shadow-md'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        {/* Item Info */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                              {item.title}
                            </span>
                            {item.passportNumber && (
                              <span className="text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <CreditCard className="w-2.5 h-2.5" /> {item.passportNumber}
                              </span>
                            )}
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {item.templateId}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3 text-slate-500" /> {item.dateFormatted}
                            </span>
                            {item.candidateName && (
                              <span className="flex items-center gap-1 text-slate-300">
                                <User className="w-3 h-3 text-sky-400" /> {item.candidateName}
                              </span>
                            )}
                            {item.summary && (
                              <span className="text-slate-400 hidden md:inline">
                                {item.summary}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={(e) => handleExportSingleCV(item, e)}
                            className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition"
                            title="JSON ফাইল হিসেবে ডাউনলোড করুন"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteCV(item.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition"
                            title="এই রেকর্ডটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Restore Button */}
                          {!isConfirming ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRestoreConfirmId(item.id);
                              }}
                              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500 hover:text-slate-950 text-sky-300 font-bold text-xs rounded-lg border border-sky-500/30 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>সিভিতে লোড করুন</span>
                            </button>
                          ) : (
                            <div
                              className="flex items-center gap-1 bg-sky-950 p-1 rounded-lg border border-sky-500/60"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleConfirmRestoreCV(item)}
                                className="px-2 py-1 bg-sky-500 text-slate-950 font-bold text-[11px] rounded transition flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>হ্যাঁ, লোড করুন</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRestoreConfirmId(null)}
                                className="px-1.5 py-1 text-slate-400 hover:text-slate-200 text-[11px] transition cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected Snapshot Preview */}
              {selectedPreview && (
                <div className="mt-4 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <FileText className="w-3.5 h-3.5" /> নির্বাচিত সিভির তথ্যের সারসংক্ষেপ ({selectedPreview.title}):
                    </span>
                    <span className="text-[10px] text-slate-400">{selectedPreview.dateFormatted}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <div>
                      <span className="text-slate-400">নাম:</span> <strong className="text-slate-100">{selectedPreview.data.name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">পাসপোর্ট নং:</span> <strong className="text-sky-300 font-mono">{selectedPreview.data.passportNumber || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">পিতার নাম:</span> {selectedPreview.data.fatherName || 'N/A'}
                    </div>
                    <div>
                      <span className="text-slate-400">মাতার নাম:</span> {selectedPreview.data.motherName || 'N/A'}
                    </div>
                    <div>
                      <span className="text-slate-400">জন্ম তারিখ:</span> {selectedPreview.data.dob || 'N/A'}
                    </div>
                    <div>
                      <span className="text-slate-400">মোবাইল:</span> {selectedPreview.data.mobile || 'N/A'}
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400">স্থায়ী ঠিকানা:</span> {selectedPreview.data.permanentAddress || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASSPORT SCAN HISTORY */}
          {activeTab === 'passport' && (
            <div>
              {passportList.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/30 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6 text-amber-400/80" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">কোনো পাসপোর্ট স্ক্যান হিস্টরি নেই</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    পাসপোর্ট ছবি আপলোড বা টেক্সট দিয়ে স্ক্যান করলে প্রতিটি স্ক্যান এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
                  </p>
                </div>
              ) : filteredPassportList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  "{searchQuery}" এর সাথে কোনো পাসপোর্ট স্ক্যান পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredPassportList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 rounded-xl transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-100">
                              {item.data.fullName || 'নামহীন প্রার্থী'}
                            </span>
                            {item.data.passportNumber && (
                              <span className="text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded">
                                {item.data.passportNumber}
                              </span>
                            )}
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {item.source === 'gemini-ai' ? '🤖 AI স্ক্যান' : item.source === 'local-ocr' ? '📷 OCR' : '📋 টেক্সট'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" /> {item.scannedAt}
                            </span>
                            {item.data.dob && <span>• জন্ম: {item.data.dob}</span>}
                            {item.data.dateOfExpiry && <span>• মেয়াদ: {item.data.dateOfExpiry}</span>}
                            {item.data.placeOfIssue && <span>• ইস্যু স্থান: {item.data.placeOfIssue}</span>}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleCopyPassportText(item, e)}
                            className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition"
                            title="পাসপোর্ট তথ্য টেক্সট হিসেবে কপি করুন"
                          >
                            {copiedPassportId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePassport(item.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition"
                            title="এই রেকর্ডটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Detail info bar */}
                      <div className="text-[11px] text-slate-300 bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-sans">
                        {item.data.fatherName && <div><span className="text-slate-400">পিতা:</span> {item.data.fatherName}</div>}
                        {item.data.motherName && <div><span className="text-slate-400">মাতা:</span> {item.data.motherName}</div>}
                        {item.data.personalNo && <div><span className="text-slate-400">NID/Personal:</span> <span className="font-mono">{item.data.personalNo}</span></div>}
                        {item.data.nationality && <div><span className="text-slate-400">জাতীয়তা:</span> {item.data.nationality}</div>}
                        {item.data.permanentAddress && (
                          <div className="sm:col-span-2 truncate"><span className="text-slate-400">ঠিকানা:</span> {item.data.permanentAddress}</div>
                        )}
                      </div>

                      {/* Apply to CV Button */}
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleApplyPassportToCV(item)}
                          className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>বর্তমান সিভিতে এই পাসপোর্ট তথ্য লোড করুন</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STATISTICS & OVERVIEW */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">মোট সিভি তৈরির সংখ্যা</span>
                    <FileText className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-sky-300">{cvStats.totalCount} টি</div>
                  <p className="text-[11px] text-slate-400">
                    বর্তমানে {cvHistoryList.length}টি সিভি স্ন্যাপশট আপনার ব্রাউজারে সংরক্ষিত আছে।
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">মোট পাসপোর্ট স্ক্যানের সংখ্যা</span>
                    <Camera className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-300">{passportStats.totalScanned} টি</div>
                  <p className="text-[11px] text-slate-400">
                    বর্তমানে {passportList.length}টি পাসপোর্ট স্ক্যান ডাটা সংরক্ষিত আছে।
                  </p>
                </div>
              </div>

              {/* Auto-Save & Security info */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>সম্পূর্ণ স্বয়ংক্রিয় অটো-সেভ সুরক্ষা (Auto-Save Active)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  ১. আপনি সিভিতে যেকোনো প্রার্থীর নাম, পাসপোর্ট বা অন্যান্য তথ্য লিখলে অথবা পরিবর্তন করলে প্রতিবার তা স্বয়ংক্রিয়ভাবে হিস্টোরিতে আপডেট হয়ে যায়।<br />
                  ২. যখনই &quot;প্রিন্ট / PDF / JPG&quot; বাটনে ক্লিক করবেন, সেই মুহূর্তের সম্পূর্ণ সিভি হিস্টোরিতে সংরক্ষিত হয়।<br />
                  ৩. যেকোনো পাসপোর্ট স্ক্যান করলে তার প্রতিটি ফিল্ড (নাম, পাসপোর্ট নম্বর, ইস্যু ও মেয়াদ, পিতা-মাতার নাম, ঠিকানা) হিস্টোরিতে চিরতরে সংরক্ষিত থাকে।
                </p>
              </div>

              {/* Backup & Export Options */}
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">পূর্ণাঙ্গ ডাটা ব্যাকআপ ডাউনলোড</h4>
                  <p className="text-[11px] text-slate-400">
                    আপনার সমস্ত সিভি ও পাসপোর্ট হিস্টোরির ডাটা একটি একক JSON ফাইলে ডাউনলোড করে নিরাপদে রাখুন।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportFullBackup}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>সব ব্যাকআপ ডাউনলোড</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            সর্বোচ্চ ৫০টি পর্যন্ত রেকর্ড স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
