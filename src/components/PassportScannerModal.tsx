import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileText,
  Copy,
  Check,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  CaseSensitive,
  ClipboardPaste,
  Cpu,
  Info,
  History,
  Trash2,
  Search,
} from 'lucide-react';
import { CVData, AdditionalPage } from '../types';
import { scanPassport, parsePassportRawText, PassportScanResult, formatBangladeshiAddress } from '../utils/passportScanner';
import { toCapitalCase, toTitleCase, toLowerCase, transformCase, TextCaseMode } from '../utils/textTransform';
import {
  getPassportHistory,
  savePassportScanToHistory,
  deletePassportHistoryItem,
  clearAllPassportHistory,
  formatPassportDetailsText,
  PassportHistoryItem,
} from '../utils/passportHistory';
import { createMicroThumbnail } from '../utils/imageCompressor';

interface PassportScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  onApplyData: (updatedFields: Partial<CVData>) => void;
}

export const PassportScannerModal: React.FC<PassportScannerModalProps> = ({
  isOpen,
  onClose,
  cvData,
  onApplyData,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'history'>('upload');
  const [history, setHistory] = useState<PassportHistoryItem[]>(() => getPassportHistory());
  const [historySearch, setHistorySearch] = useState<string>('');
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [scanResult, setScanResult] = useState<PassportScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);

  // Raw text paste mode
  const [pastedText, setPastedText] = useState<string>('');

  // Capital and Small Case Option
  const [activeCaseMode, setActiveCaseMode] = useState<TextCaseMode>('capital');

  // Field selection checkboxes
  const [applyPassportNo, setApplyPassportNo] = useState(true);
  const [applyTelephoneNo, setApplyTelephoneNo] = useState(true);
  const [applyIssueDate, setApplyIssueDate] = useState(true);
  const [applyExpiryDate, setApplyExpiryDate] = useState(true);
  const [applyName, setApplyName] = useState(true);
  const [applyFatherName, setApplyFatherName] = useState(true);
  const [applyMotherName, setApplyMotherName] = useState(true);
  const [applyDOB, setApplyDOB] = useState(true);
  const [applyAddress, setApplyAddress] = useState(true);
  const [applyGender, setApplyGender] = useState(true);
  const [applyNationality, setApplyNationality] = useState(true);
  const [applyReligion, setApplyReligion] = useState(true);
  const [applyMaritalStatus, setApplyMaritalStatus] = useState(true);
  const [applyHeightWeight, setApplyHeightWeight] = useState(true);
  const [attachToSecondPage, setAttachToSecondPage] = useState(false);

  // Editable fields in modal
  const [editablePassportNo, setEditablePassportNo] = useState('');
  const [editableTelephoneNo, setEditableTelephoneNo] = useState('');
  const [editableIssueDate, setEditableIssueDate] = useState('');
  const [editableExpiryDate, setEditableExpiryDate] = useState('');
  const [editableName, setEditableName] = useState('');
  const [editableFatherName, setEditableFatherName] = useState('');
  const [editableMotherName, setEditableMotherName] = useState('');
  const [editableDOB, setEditableDOB] = useState('');
  const [editableAddress, setEditableAddress] = useState('');
  const [editableNationality, setEditableNationality] = useState('');
  const [editableGender, setEditableGender] = useState('');
  const [editableReligion, setEditableReligion] = useState('');
  const [editableMaritalStatus, setEditableMaritalStatus] = useState('');
  const [editableHeight, setEditableHeight] = useState('');
  const [editableWeight, setEditableWeight] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setError(null);
      setScanResult(null);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedImage(file);
      setError(null);
      setScanResult(null);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteImageFromClipboard = async () => {
    setError(null);
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], 'clipboard-passport.jpg', { type: imageType });
            setSelectedImage(file);
            setError(null);
            setScanResult(null);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
            setActiveTab('upload');
            return;
          }
        }
        setError('ক্লিপবোর্ডে কোনো ছবি (JPG/PNG) পাওয়া যায়নি। দয়া করে ছবি কপি করে এখানে পেস্ট (Ctrl+V) করুন।');
      } else {
        setError('ক্লিপবোর্ড ছবি পড়ার অনুমতি নেই। কীবোর্ডের Ctrl + V চাপুন।');
      }
    } catch {
      setError('ক্লিপবোর্ডে ছবি পাওয়া যায়নি। ছবি কপি করে কীবোর্ডের Ctrl + V চাপুন।');
    }
  };

  const handleModalPaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData?.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            setSelectedImage(file);
            setError(null);
            setScanResult(null);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
            setActiveTab('upload');
            return;
          }
        }
      }
    }
  };

  const populateFieldsFromResult = async (result: PassportScanResult, skipSaveHistory = false) => {
    setScanResult(result);

    // Save scan to history safely
    if (!skipSaveHistory) {
      try {
        let microThumb: string | undefined = undefined;
        if (imagePreview) {
          try {
            microThumb = await createMicroThumbnail(imagePreview);
          } catch {
            // ignore
          }
        }
        const updated = savePassportScanToHistory(result, microThumb);
        setHistory(updated);
      } catch (err) {
        console.warn('History save notification:', err);
      }
    }

    // Initial population defaults to Capital (ALL CAPS)
    setEditablePassportNo(result.passportNumber || '');
    setEditableIssueDate(result.dateOfIssue || '');
    setEditableExpiryDate(result.dateOfExpiry || '');
    setEditableName(toCapitalCase(result.fullName || ''));
    setEditableFatherName(toCapitalCase(result.fatherName || ''));
    setEditableMotherName(toCapitalCase(result.motherName || ''));
    setEditableDOB(result.dob || '');
    setEditableNationality(toCapitalCase(result.nationality || 'Bangladeshi by Birth'));
    setEditableGender(result.gender || 'Male');
    setEditableTelephoneNo(result.telephoneNo || result.emergencyContactPhone || '');
    const rawPermanent = result.permanentAddress || (result.placeOfBirth ? `${result.placeOfBirth.toUpperCase()}, BANGLADESH` : '');
    const formattedPermanent = formatBangladeshiAddress(rawPermanent);

    setEditableAddress(formattedPermanent);
    setEditableReligion(result.religion || 'Islam');
    setEditableMaritalStatus(result.maritalStatus || 'Married');
    setEditableHeight(result.height || `5' 6"`);
    setEditableWeight(result.weight || '62 KG');

    setActiveCaseMode('capital');
  };

  // Convert all text fields to specified case (Capital / Small / Title)
  const applyCaseConversion = (mode: TextCaseMode) => {
    setActiveCaseMode(mode);
    setEditableName((prev) => transformCase(prev, mode));
    setEditableFatherName((prev) => transformCase(prev, mode));
    setEditableMotherName((prev) => transformCase(prev, mode));
    setEditableAddress((prev) => transformCase(prev, mode));
    setEditableNationality((prev) => transformCase(prev, mode));
    setEditableReligion((prev) => transformCase(prev, mode));
    setEditableMaritalStatus((prev) => transformCase(prev, mode));
  };

  // Toggle single field between Capital and Title/Small
  const toggleSingleFieldCase = (
    currentValue: string,
    setter: (val: string) => void
  ) => {
    if (currentValue === currentValue.toUpperCase()) {
      setter(toTitleCase(currentValue));
    } else {
      setter(toCapitalCase(currentValue));
    }
  };

  const handleStartScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setError(null);
    setProgress(0);
    setStatusMessage('পাসপোর্ট প্রসেসিং ও স্ক্যানিং শুরু হচ্ছে...');

    try {
      const result = await scanPassport(selectedImage, (pct, status) => {
        setProgress(pct);
        setStatusMessage(status);
      });

      populateFieldsFromResult(result);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(
        err?.message ||
          'পাসপোর্ট স্ক্যান করতে সমস্যা হয়েছে। দয়া করে পরিষ্কার ছবি আপলোড করুন অথবা সরাসরি টেক্সট পেস্ট অপশন ব্যবহার করুন।'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      setError('দয়া করে পাসপোর্টের টেক্সট পেস্ট করুন');
      return;
    }
    setError(null);
    const parsed = parsePassportRawText(pastedText);
    populateFieldsFromResult(parsed);
  };

  const handleLoadAlamenPreset = () => {
    const alamenRaw = `Name\t: ALAMEN
Father's Name\t: SHEIKH SHAMSUL ISLAM
Mother's Name\t: SAJEDA BEGUM
Date of Birth\t: 25 Aug 2007
Permanent Address\t: UTTAR CHANDAN, PALASH, JHINARDI - 1610, NARSINGDI
Present Address\t: UTTAR CHANDAN, PALASH, JHINARDI - 1610, NARSINGDI
Nationality\t: Bangladeshi by Birth
Gender\t: Male
Religion\t: Islam
Marital Status\t: Married
Height & Weight\t: 5' 6" / 62 KG
Passport Number\t: A21743327
Personal No (NID)\t: 4164712004
Previous Passport No\t: AA2328199
Date of Issue / Expiry\t: 13 JUN 2022 / 15 Feb 2036 (DIP/DHAKA)`;

    setPastedText(alamenRaw);
    const parsed = parsePassportRawText(alamenRaw);
    populateFieldsFromResult(parsed);
  };

  const handleApplyFromHistory = (item: PassportHistoryItem) => {
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
    if (d.telephoneNo || d.emergencyContactPhone) {
      updates.mobile = (d.telephoneNo || d.emergencyContactPhone || '').trim();
    }
    updates.placeOfIssue = '';
    updates.personalNo = '';
    updates.previousPassportNumber = '';
    updates.presentAddress = '';
    if (d.religion) updates.religion = d.religion;
    if (d.maritalStatus) updates.maritalStatus = d.maritalStatus;
    if (d.height) updates.height = d.height;
    if (d.weight) updates.weight = d.weight;

    // Do NOT add Page 2
    onApplyData(updates);
    onClose();
  };

  const handleLoadFromHistory = (item: PassportHistoryItem) => {
    populateFieldsFromResult(item.data, true);
    if (item.imageThumbnail) {
      setImagePreview(item.imageThumbnail);
    }
    setActiveTab('upload');
  };

  const handleCopyHistory = (item: PassportHistoryItem) => {
    const text = formatPassportDetailsText(item.data);
    navigator.clipboard.writeText(text);
    setCopiedHistoryId(item.id);
    setTimeout(() => setCopiedHistoryId(null), 2000);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deletePassportHistoryItem(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('আপনি কি সমস্ত পাসপোর্ট হিস্টরি মুছে ফেলতে চান?')) {
      clearAllPassportHistory();
      setHistory([]);
    }
  };

  const handleApply = () => {
    if (!scanResult) return;

    const updates: Partial<CVData> = {};

    if (applyPassportNo && editablePassportNo) {
      updates.passportNumber = editablePassportNo;
    }
    if (applyTelephoneNo && editableTelephoneNo) {
      updates.mobile = editableTelephoneNo;
    }
    if (applyIssueDate && editableIssueDate) {
      updates.dateOfIssue = editableIssueDate;
    }
    if (applyExpiryDate && editableExpiryDate) {
      updates.dateOfExpiry = editableExpiryDate;
    }
    if (applyName && editableName) {
      updates.name = editableName;
    }
    if (applyFatherName && editableFatherName) {
      updates.fatherName = editableFatherName;
    }
    if (applyMotherName && editableMotherName) {
      updates.motherName = editableMotherName;
    }
    if (applyDOB && editableDOB) {
      updates.dob = editableDOB;
    }
    if (applyGender && editableGender) {
      updates.gender = editableGender;
    }
    if (applyNationality && editableNationality) {
      updates.nationality = editableNationality;
    }
    if (applyAddress && editableAddress) {
      updates.permanentAddress = editableAddress;
    }
    updates.placeOfIssue = '';
    updates.personalNo = '';
    updates.previousPassportNumber = '';
    updates.presentAddress = '';
    if (applyReligion && editableReligion) {
      updates.religion = editableReligion;
    }
    if (applyMaritalStatus && editableMaritalStatus) {
      updates.maritalStatus = editableMaritalStatus;
    }
    if (applyHeightWeight) {
      if (editableHeight) updates.height = editableHeight;
      if (editableWeight) updates.weight = editableWeight;
    }

    // Attach scan to 2nd page if requested
    if (attachToSecondPage && imagePreview) {
      const currentPages = cvData.additionalPages || [];
      const passNoText = editablePassportNo || cvData.passportNumber || 'Attached';

      const newPage: AdditionalPage = {
        id: Date.now().toString(),
        title: 'PASSPORT & OFFICIAL CREDENTIALS',
        subtitle: 'Government Travel & Identification Document',
        content: `Official scanned copy of International Passport (No: ${passNoText}) verified for overseas deployment, visa processing, and identity clearance:`,
        items: [
          `Passport Number: ${passNoText}`,
          `Issue Date: ${editableIssueDate || cvData.dateOfIssue || 'N/A'} | Expiry: ${editableExpiryDate || cvData.dateOfExpiry || 'N/A'}`,
          'Original document available for physical verification.',
        ],
        images: [imagePreview],
        showSignature: true,
      };

      updates.additionalPages = [...currentPages, newPage];
    }

    onApplyData(updates);
    onClose();
  };

  const copyRawText = () => {
    if (scanResult?.rawText) {
      navigator.clipboard.writeText(scanResult.rawText);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                  পাসপোর্ট স্ক্যানার ও ডাটা এক্সট্রাক্টর
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> এআই ভিশন সাপোর্টেড
                </span>
              </div>
              <p className="text-xs text-slate-400">
                পাসপোর্ট ছবি আপলোড বা টেক্সট পেস্ট করে Capital ও Small অপশনসহ নিখুঁতভাবে সিভিতে সংযুক্ত করুন
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

        {/* Tab Selection */}
        <div className="px-5 pt-3 pb-0 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>ছবি আপলোড ও স্ক্যান</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'text'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>টেক্সট পেস্ট / MRZ</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setHistory(getPassportHistory());
              setActiveTab('history');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>স্ক্যান হিস্টরি</span>
            {history.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'history' ? 'bg-sky-500/25 text-sky-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div onPaste={handleModalPaste} tabIndex={0} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 focus:outline-none">
          
          {/* TAB 1: IMAGE SCAN */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              {!imagePreview ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/40 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mb-1">
                    পাসপোর্টের JPG ছবি পেস্ট করুন (Ctrl + V) অথবা ড্রপ করুন
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    JPG, PNG ফরম্যাট সমর্থিত। WhatsApp বা যেকোনো জায়গা থেকে কপি করা ছবি সরাসরি পেস্ট করতে পারবেন।
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={handlePasteImageFromClipboard}
                      className="px-3 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-600/60 font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                      <span>📋 ক্লিপবোর্ড থেকে JPG ছবি পেস্ট</span>
                    </button>
                    <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      কীবোর্ডে চাপুন <kbd className="font-mono text-sky-300">Ctrl + V</kbd>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" /> নির্বাচিত পাসপোর্টের ছবি:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        setScanResult(null);
                        setError(null);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 transition underline cursor-pointer"
                    >
                      অন্য ছবি নির্বাচন করুন
                    </button>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-slate-800 max-h-40 flex items-center justify-center bg-black/40">
                    <img
                      src={imagePreview}
                      alt="Passport preview"
                      className="max-h-40 w-auto object-contain rounded"
                    />
                  </div>

                  {/* Start Scan Button */}
                  {!scanResult && !isScanning && (
                    <button
                      type="button"
                      onClick={handleStartScan}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>পাসপোর্ট স্ক্যান শুরু করুন (Scan Now)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Scanning Progress Bar */}
              {isScanning && (
                <div className="bg-slate-950/70 border border-sky-500/30 rounded-xl p-4 space-y-2.5 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sky-300 font-semibold flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      {statusMessage}
                    </span>
                    <span className="text-sky-400 font-mono font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    স্মার্ট এআই ভিশন ও উন্নত ক্যারেক্টার রিকগনিশন (OCR) দিয়ে পাসপোর্টের প্রতিটি লাইন বিশ্লেষণ করা হচ্ছে...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEXT PASTE */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5 text-sky-400" />
                    পাসপোর্টের টেক্সট বা বিবরণ পেস্ট করুন:
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadAlamenPreset}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ALAMEN তথ্য এক-ক্লিকে লোড করুন</span>
                  </button>
                </div>

                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Name\t: ALAMEN\nFather's Name\t: SHEIKH SHAMSUL ISLAM\nMother's Name\t: SAJEDA BEGUM\nDate of Birth\t: 25 Aug 2007\nPermanent Address\t: UTTAR CHANDAN, PALASH, JHINARDI - 1610, NARSINGDI\nPassport Number\t: A21743327\nPersonal No (NID)\t: 4164712004\nPrevious Passport No\t: AA2328199\nDate of Issue / Expiry\t: 13 JUN 2022 / 15 Feb 2036 (DIP/DHAKA)`}
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 outline-none focus:border-sky-500 placeholder:text-slate-600 resize-y"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleParsePastedText}
                    className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>টেক্সট থেকে সব ফিল্ড স্বয়ংক্রিয় পার্স করুন</span>
                  </button>
                  {pastedText && (
                    <button
                      type="button"
                      onClick={() => setPastedText('')}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASSPORT SCAN HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {/* History Search & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="নাম বা পাসপোর্ট নম্বর দিয়ে খুঁজুন..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 justify-between sm:justify-end">
                  <span className="text-xs text-sky-400 font-semibold">
                    মোট স্ক্যান: {history.length} টি
                  </span>
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>সব মুছুন</span>
                    </button>
                  )}
                </div>
              </div>

              {/* History Items List */}
              {history.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/30 space-y-2">
                  <History className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">এখনো কোনো পাসপোর্ট স্ক্যান সেভ নেই</p>
                  <p className="text-[11px] text-slate-500">
                    ছবি আপলোড বা টেক্সট পেস্ট করে স্ক্যান করলে স্বয়ংক্রিয়ভাবে এখানে হিস্টরি সেভ হবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                  {history
                    .filter((item) => {
                      if (!historySearch.trim()) return true;
                      const q = historySearch.toLowerCase();
                      return (
                        (item.data.fullName && item.data.fullName.toLowerCase().includes(q)) ||
                        (item.data.passportNumber && item.data.passportNumber.toLowerCase().includes(q)) ||
                        item.title.toLowerCase().includes(q)
                      );
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-100">
                                {item.data.fullName || 'নামহীন প্রার্থী'}
                              </span>
                              {item.data.passportNumber && (
                                <span className="text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/60 px-1.5 py-0.2 rounded">
                                  {item.data.passportNumber}
                                </span>
                              )}
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                                {item.source === 'gemini-ai' ? '🤖 AI স্ক্যান' : item.source === 'local-ocr' ? '📷 OCR' : '📋 টেক্সট'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>তারিখ: {item.scannedAt}</span>
                              {item.data.dob && <span>• জন্ম: {item.data.dob}</span>}
                              {item.data.dateOfExpiry && <span>• মেয়াদ: {item.data.dateOfExpiry}</span>}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistory(item.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition shrink-0"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick detail pills */}
                        <div className="text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-1 font-sans">
                          {item.data.fatherName && <div>পিতা: <span className="text-slate-400">{item.data.fatherName}</span></div>}
                          {(item.data.telephoneNo || item.data.emergencyContactPhone) && (
                            <div>টেলিফোন: <span className="text-emerald-400 font-mono">{item.data.telephoneNo || item.data.emergencyContactPhone}</span></div>
                          )}
                          {item.data.permanentAddress && (
                            <div className="sm:col-span-2 truncate">ঠিকানা: <span className="text-slate-400">{item.data.permanentAddress}</span></div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleApplyFromHistory(item)}
                            className="flex-1 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>সিভিতে এই তথ্য প্রয়োগ করুন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadFromHistory(item)}
                            className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-750 text-sky-300 text-xs rounded-lg transition cursor-pointer"
                            title="এডিটরে লোড করে কাস্টমাইজ করুন"
                          >
                            এডিটর ভিউ
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyHistory(item)}
                            className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                            title="সব তথ্য টেক্সট আকারে কপি করুন"
                          >
                            {copiedHistoryId === item.id ? (
                              <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> কপি হয়েছে</span>
                            ) : (
                              <span>কপি</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">স্ক্যানিং ব্যর্থ হয়েছে</p>
                <p>{error}</p>
                <p className="mt-1 text-[11px] text-rose-400">
                  টিপস: ছবির রেজোলিউশন ও আলো ভালো রাখুন, অথবা ওপরের &quot;টেক্সট পেস্ট&quot; ট্যাবে পাসপোর্ট তথ্য কপি করে পেস্ট করতে পারেন।
                </p>
              </div>
            </div>
          )}

          {/* Scan Results with Capital and Small Options */}
          {scanResult && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              
              {/* Notification Banner with Engine Source */}
              <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs text-emerald-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  পাসপোর্টের তথ্য সফলভাবে শনাক্ত হয়েছে!
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-2 py-0.5 rounded font-mono">
                    {scanResult.source === 'gemini-ai'
                      ? '✨ স্মার্ট এআই ভিশন'
                      : scanResult.source === 'text-parser'
                      ? '📋 ডাইরেক্ট পার্সার'
                      : '🔍 উন্নত OCR ইঞ্জিন'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    নিখুঁত মিল: {scanResult.confidence}%
                  </span>
                </div>
              </div>

              {/* CAPITAL AND SMALL OPTION TOOLBAR */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-sky-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CaseSensitive className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200">
                    অক্ষরের স্টাইল (Capital / Small Option):
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => applyCaseConversion('capital')}
                    className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeCaseMode === 'capital'
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title="সব লেখা বড় হাতের (CAPITAL) অক্ষরে রূপান্তর করুন"
                  >
                    <span>🔠 ALL CAPITAL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCaseConversion('title')}
                    className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeCaseMode === 'title'
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title="প্রথম অক্ষর বড় ও বাকি ছোট হাতের (Title Case) অক্ষরে রূপান্তর করুন"
                  >
                    <span>🔤 Title Case (Small)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCaseConversion('small')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeCaseMode === 'small'
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="সব লেখা ছোট হাতের (lowercase) অক্ষরে রূপান্তর করুন"
                  >
                    <span>🔡 small</span>
                  </button>
                </div>
              </div>

              {/* Fields List */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1 border-b border-slate-800 pb-1.5">
                  <span className="font-semibold text-sky-300">
                    সিভিতে যেসব তথ্য আপডেট হবে (টিক দিন ও প্রয়োজনে এডিট করুন):
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Aa বাটনে ক্লিক করে একক ফিল্ড ক্যাপিটাল/স্মল করতে পারেন
                  </span>
                </div>

                {/* 1. Passport No & Previous Passport No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_pass"
                      checked={applyPassportNo}
                      onChange={(e) => setApplyPassportNo(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_pass" className="text-xs text-slate-300 w-24 shrink-0 font-medium cursor-pointer">
                      পাসপোর্ট নম্বর:
                    </label>
                    <input
                      type="text"
                      value={editablePassportNo}
                      onChange={(e) => setEditablePassportNo(e.target.value)}
                      placeholder="A21743327"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs font-mono font-bold text-sky-300 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_telephone"
                      checked={applyTelephoneNo}
                      onChange={(e) => setApplyTelephoneNo(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_telephone" className="text-xs text-sky-300 w-24 shrink-0 font-medium cursor-pointer">
                      টেলিফোন নম্বর:
                    </label>
                    <input
                      type="text"
                      value={editableTelephoneNo}
                      onChange={(e) => setEditableTelephoneNo(e.target.value)}
                      placeholder="+8801700000000"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-sky-600/60 focus:border-sky-400 rounded text-xs font-mono font-bold text-emerald-400 outline-none"
                    />
                  </div>
                </div>

                {/* 2. Full Name */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_name"
                    checked={applyName}
                    onChange={(e) => setApplyName(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="chk_name" className="text-xs text-slate-300 w-24 shrink-0 font-medium cursor-pointer">
                    পূর্ণ নাম (Name):
                  </label>
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      placeholder="ALAMEN"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs font-semibold text-slate-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSingleFieldCase(editableName, setEditableName)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-sky-300 rounded border border-slate-700 cursor-pointer"
                      title="ক্যাপিটাল / স্মল টগল করুন"
                    >
                      Aa
                    </button>
                  </div>
                </div>

                {/* 3. Father's Name */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_father"
                    checked={applyFatherName}
                    onChange={(e) => setApplyFatherName(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="chk_father" className="text-xs text-slate-300 w-24 shrink-0 font-medium cursor-pointer">
                    পিতার নাম:
                  </label>
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={editableFatherName}
                      onChange={(e) => setEditableFatherName(e.target.value)}
                      placeholder="SHEIKH SHAMSUL ISLAM"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSingleFieldCase(editableFatherName, setEditableFatherName)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-sky-300 rounded border border-slate-700 cursor-pointer"
                      title="ক্যাপিটাল / স্মল টগল করুন"
                    >
                      Aa
                    </button>
                  </div>
                </div>

                {/* 4. Mother's Name */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_mother"
                    checked={applyMotherName}
                    onChange={(e) => setApplyMotherName(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="chk_mother" className="text-xs text-slate-300 w-24 shrink-0 font-medium cursor-pointer">
                    মাতার নাম:
                  </label>
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={editableMotherName}
                      onChange={(e) => setEditableMotherName(e.target.value)}
                      placeholder="SAJEDA BEGUM"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSingleFieldCase(editableMotherName, setEditableMotherName)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-sky-300 rounded border border-slate-700 cursor-pointer"
                      title="ক্যাপিটাল / স্মল টগল করুন"
                    >
                      Aa
                    </button>
                  </div>
                </div>

                {/* 5. Date of Birth & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_dob"
                      checked={applyDOB}
                      onChange={(e) => setApplyDOB(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_dob" className="text-xs text-slate-300 w-24 shrink-0 cursor-pointer">
                      জন্ম তারিখ (DOB):
                    </label>
                    <input
                      type="text"
                      value={editableDOB}
                      onChange={(e) => setEditableDOB(e.target.value)}
                      placeholder="25 Aug 2007"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_gender"
                      checked={applyGender}
                      onChange={(e) => setApplyGender(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_gender" className="text-xs text-slate-300 w-20 shrink-0 cursor-pointer">
                      লিঙ্গ (Gender):
                    </label>
                    <select
                      value={editableGender}
                      onChange={(e) => setEditableGender(e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* 6. Date of Issue & Expiry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_issue"
                      checked={applyIssueDate}
                      onChange={(e) => setApplyIssueDate(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_issue" className="text-xs text-slate-300 w-24 shrink-0 cursor-pointer">
                      ইস্যুর তারিখ:
                    </label>
                    <input
                      type="text"
                      value={editableIssueDate}
                      onChange={(e) => setEditableIssueDate(e.target.value)}
                      placeholder="13 JUN 2022"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_exp"
                      checked={applyExpiryDate}
                      onChange={(e) => setApplyExpiryDate(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_exp" className="text-xs text-slate-300 w-20 shrink-0 cursor-pointer">
                      মেয়াদোত্তীর্ণ:
                    </label>
                    <input
                      type="text"
                      value={editableExpiryDate}
                      onChange={(e) => setEditableExpiryDate(e.target.value)}
                      placeholder="15 Feb 2036"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* 7. Permanent Address */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_address"
                    checked={applyAddress}
                    onChange={(e) => setApplyAddress(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="chk_address" className="text-xs text-slate-300 w-24 shrink-0 font-medium cursor-pointer">
                    স্থায়ী ঠিকানা:
                  </label>
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={editableAddress}
                      onChange={(e) => setEditableAddress(e.target.value)}
                      placeholder="Vill: Paiksha, P.O: Ghorashal, P.S: Palash, Dist: Narsingdi"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setEditableAddress(formatBangladeshiAddress(editableAddress))}
                      className="px-2 py-1 bg-sky-950/80 hover:bg-sky-900 text-[10px] font-medium text-sky-300 rounded border border-sky-700/60 cursor-pointer whitespace-nowrap"
                      title="Vill: ..., P.O: ..., P.S: ..., Dist: ... ফরম্যাট করুন"
                    >
                      Vill/P.O
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSingleFieldCase(editableAddress, setEditableAddress)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-sky-300 rounded border border-slate-700 cursor-pointer"
                      title="ক্যাপিটাল / স্মল টগল করুন"
                    >
                      Aa
                    </button>
                  </div>
                </div>

                {/* 8. Nationality, Religion, Marital Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_nat"
                      checked={applyNationality}
                      onChange={(e) => setApplyNationality(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_nat" className="text-xs text-slate-300 w-16 shrink-0 cursor-pointer">
                      জাতীয়তা:
                    </label>
                    <input
                      type="text"
                      value={editableNationality}
                      onChange={(e) => setEditableNationality(e.target.value)}
                      placeholder="Bangladeshi by Birth"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_rel"
                      checked={applyReligion}
                      onChange={(e) => setApplyReligion(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_rel" className="text-xs text-slate-300 w-12 shrink-0 cursor-pointer">
                      ধর্ম:
                    </label>
                    <input
                      type="text"
                      value={editableReligion}
                      onChange={(e) => setEditableReligion(e.target.value)}
                      placeholder="Islam"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk_marital"
                      checked={applyMaritalStatus}
                      onChange={(e) => setApplyMaritalStatus(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk_marital" className="text-xs text-slate-300 w-16 shrink-0 cursor-pointer">
                      বৈবাহিক:
                    </label>
                    <input
                      type="text"
                      value={editableMaritalStatus}
                      onChange={(e) => setEditableMaritalStatus(e.target.value)}
                      placeholder="Married"
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* 10. Height & Weight */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_hw"
                    checked={applyHeightWeight}
                    onChange={(e) => setApplyHeightWeight(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="chk_hw" className="text-xs text-slate-300 w-24 shrink-0 font-medium cursor-pointer">
                    উচ্চতা ও ওজন:
                  </label>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editableHeight}
                      onChange={(e) => setEditableHeight(e.target.value)}
                      placeholder={`5' 6"`}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      value={editableWeight}
                      onChange={(e) => setEditableWeight(e.target.value)}
                      placeholder="62 KG"
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* Attach to CV 2nd page option */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-semibold text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attachToSecondPage}
                      onChange={(e) => setAttachToSecondPage(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span>সিভির ২য় পেজে এই পাসপোর্টের স্ক্যান কপি সংযোজন করুন</span>
                  </label>
                </div>
              </div>

              {/* Raw OCR Text Toggle */}
              {scanResult.rawText && (
                <div className="border border-slate-800 rounded-lg p-2.5 bg-slate-950/40">
                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      স্ক্যানকৃত মূল টেক্সট (Raw OCR Text)
                    </span>
                    <span className="text-[10px] text-sky-400 underline">
                      {showRawText ? 'লুকান' : 'দেখুন'}
                    </span>
                  </button>
                  {showRawText && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto bg-slate-950 p-2 rounded relative">
                      <button
                        type="button"
                        onClick={copyRawText}
                        className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        <span>{copiedRaw ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                      {scanResult.rawText}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/95">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            বাতিল করুন
          </button>

          {scanResult ? (
            <button
              type="button"
              onClick={handleApply}
              className="py-2 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>সিভিতে তথ্যগুলো বসান (Apply to CV)</span>
            </button>
          ) : (
            activeTab === 'upload' && selectedImage && !isScanning && (
              <button
                type="button"
                onClick={handleStartScan}
                className="py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>স্ক্যান শুরু করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>

      </div>
    </div>
  );
};
