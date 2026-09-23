import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Check,
  CaseSensitive,
  User,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  Layers,
  ArrowRight,
  Clipboard,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { CVData } from '../types';
import {
  parsePassportRawText,
  scanPassport,
  PassportScanResult,
  formatBangladeshiAddress,
} from '../utils/passportScanner';
import { savePassportScanToHistory } from '../utils/passportHistory';
import { createMicroThumbnail } from '../utils/imageCompressor';
import { toCapitalCase, toTitleCase, transformCase, TextCaseMode } from '../utils/textTransform';

interface InlinePassportScannerProps {
  cvData: CVData;
  onApplyData: (updatedFields: Partial<CVData>) => void;
  onOpenHistory?: () => void;
}

// Helper to calculate age from DOB string
function calculateAge(dobStr: string): string {
  if (!dobStr) return '';
  const match = dobStr.match(/(\d{1,2})[\s\/\.\-]([A-Za-z]{3,9}|\d{1,2})[\s\/\.\-](\d{4})/);
  if (match) {
    const day = parseInt(match[1]);
    const monthStr = match[2];
    const year = parseInt(match[3]);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let month = -1;
    if (/^\d+$/.test(monthStr)) {
      month = parseInt(monthStr) - 1;
    } else {
      month = months.findIndex((m) => monthStr.toLowerCase().startsWith(m));
    }
    if (month !== -1 && !isNaN(day) && !isNaN(year)) {
      const birth = new Date(year, month, day);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      return age > 0 ? `${age} বছর` : '';
    }
  }
  // Try YYYY-MM-DD
  const isoParts = dobStr.match(/(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})/);
  if (isoParts) {
    const birth = new Date(parseInt(isoParts[1]), parseInt(isoParts[2]) - 1, parseInt(isoParts[3]));
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age > 0 ? `${age} বছর` : '';
  }
  return '';
}

export interface ExtractedPassportFields {
  name: string;
  passportNumber: string;
  dob: string;
  age: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  placeOfIssue: string;
  placeOfBirth: string;
  personalNo: string;
  previousPassportNumber: string;
  fatherName: string;
  motherName: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  nationality: string;
  height: string;
  weight: string;
  permanentAddress: string;
  presentAddress: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  telephoneNo?: string;
}

export const InlinePassportScanner: React.FC<InlinePassportScannerProps> = ({
  cvData,
  onApplyData,
  onOpenHistory,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const [caseMode, setCaseMode] = useState<TextCaseMode>('capital');

  // OCR & Image states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Status & Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAppliedToCV, setIsAppliedToCV] = useState<boolean>(false);

  // Extracted Data List state (populated after scan or text parse)
  const [extractedData, setExtractedData] = useState<ExtractedPassportFields | null>(null);
  const [scanConfidence, setScanConfidence] = useState<number>(95);
  const [scanSource, setScanSource] = useState<'ocr' | 'text' | 'ai'>('ocr');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Format text helper according to active case
  const formatValue = (val: string, mode: TextCaseMode = caseMode) => {
    if (!val) return '';
    if (mode === 'capital') return toCapitalCase(val);
    if (mode === 'title') return toTitleCase(val);
    return val.toLowerCase();
  };

  // Convert raw PassportScanResult into ExtractedPassportFields
  const buildExtractedFields = (
    result: PassportScanResult,
    mode: TextCaseMode = 'capital'
  ): ExtractedPassportFields => {
    const rawPermanent = result.permanentAddress || (result.placeOfBirth ? `${result.placeOfBirth.toUpperCase()}, BANGLADESH` : '');
    const formattedPermanent = formatBangladeshiAddress(rawPermanent);
    const rawPresent = result.presentAddress || result.permanentAddress || '';
    const formattedPresent = formatBangladeshiAddress(rawPresent || rawPermanent);

    const placeOfIssue = result.placeOfIssue || (result.placeOfBirth ? `DIP/${result.placeOfBirth.toUpperCase()}` : 'DIP/DHAKA');
    const age = calculateAge(result.dob || '');

    const fields: ExtractedPassportFields = {
      name: transformCase(result.fullName || '', mode),
      passportNumber: toCapitalCase(result.passportNumber || ''),
      dob: result.dob || '',
      age: age,
      dateOfIssue: result.dateOfIssue || '',
      dateOfExpiry: result.dateOfExpiry || '',
      placeOfIssue: toCapitalCase(placeOfIssue),
      placeOfBirth: transformCase(result.placeOfBirth || '', mode),
      personalNo: result.personalNo || '',
      previousPassportNumber: toCapitalCase(result.previousPassportNumber || ''),
      fatherName: transformCase(result.fatherName || '', mode),
      motherName: transformCase(result.motherName || '', mode),
      gender: result.gender || 'Male',
      maritalStatus: result.maritalStatus || 'Married',
      religion: result.religion || 'Islam',
      nationality: mode === 'capital' ? 'BANGLADESHI BY BIRTH' : 'Bangladeshi by Birth',
      height: result.height || `5' 6"`,
      weight: result.weight || '62 KG',
      permanentAddress: transformCase(formattedPermanent, mode),
      presentAddress: transformCase(formattedPresent, mode),
      emergencyContactName: transformCase(result.emergencyContactName || '', mode),
      emergencyContactRelation: transformCase(result.emergencyContactRelation || '', mode),
      emergencyContactPhone: result.emergencyContactPhone || '',
      telephoneNo: result.telephoneNo || result.emergencyContactPhone || '',
    };
    return fields;
  };

function isImageFile(file: File | Blob, name?: string): boolean {
  if (file.type && file.type.toLowerCase().startsWith('image/')) return true;
  const fileName = (file as File).name || name || '';
  const ext = fileName.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'webp', 'jfif', 'bmp', 'tiff', 'gif'].includes(ext || '');
}

function dataUrlToFile(dataUrl: string, filename = 'pasted_passport.jpg'): File {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch {
    return new File([], filename, { type: 'image/jpeg' });
  }
}

  // -------------------------------------------------------------
  // 1. JPG PHOTO COPY & PASTE (GLOBAL & LOCAL CLIPBOARD LISTENER)
  // -------------------------------------------------------------
  const handleImageFile = (file: File | Blob, successNote?: string, customName?: string) => {
    const fileName = (file as File).name || customName || 'pasted_passport.jpg';
    let mimeType = file.type;

    if (!isImageFile(file, fileName)) {
      setErrorMessage('দয়া করে একটি সঠিক ইমেজ ফাইল দিন (JPG, JPEG, PNG, WebP)।');
      return;
    }

    if (!mimeType || !mimeType.startsWith('image/')) {
      const ext = fileName.toLowerCase().split('.').pop() || 'jpg';
      mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    }

    const finalFile = (file instanceof File && file.type)
      ? file
      : new File([file], fileName, { type: mimeType });

    setErrorMessage(null);
    setSelectedImage(finalFile);
    setActiveTab('upload');
    setIsOpen(true);
    setIsAppliedToCV(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(finalFile);

    setSuccessMessage(successNote || '📷 JPG ছবি সফলভাবে পেস্ট হয়েছে! এবার "স্ক্যান করুন" বাটনে ক্লিক করুন।');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const extractImageFromClipboard = (clipboardData: DataTransfer | null): File | null => {
    if (!clipboardData) return null;

    // 1. Check items (screenshots, copied images, browser copy-image)
    if (clipboardData.items && clipboardData.items.length > 0) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type && item.type.toLowerCase().startsWith('image/')) {
          const file = item.getAsFile();
          if (file) return file;
        }
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && isImageFile(file)) return file;
        }
      }
    }

    // 2. Check files (copied files from desktop or folder)
    if (clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (isImageFile(file)) {
          return file;
        }
      }
    }

    // 3. Check for HTML containing an image tag
    try {
      const html = clipboardData.getData('text/html');
      if (html) {
        const match = html.match(/<img[^>]+src=["'](data:image\/[^"']+|https?:\/\/[^"']+)["']/i);
        if (match && match[1] && match[1].startsWith('data:image/')) {
          return dataUrlToFile(match[1], 'pasted_web_image.jpg');
        }
      }
    } catch {
      // ignore
    }

    // 4. Check for plain text starting with data:image/
    try {
      const text = clipboardData.getData('text/plain');
      if (text && text.trim().startsWith('data:image/')) {
        return dataUrlToFile(text.trim(), 'pasted_data_url.jpg');
      }
    } catch {
      // ignore
    }

    return null;
  };

  // Global window paste listener: Pressing Ctrl+V anywhere pastes the copied JPG!
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const imageFile = extractImageFromClipboard(e.clipboardData);
      if (imageFile) {
        e.preventDefault();
        e.stopPropagation();

        handleImageFile(imageFile, '📷 JPG ছবি সফলভাবে পেস্ট হয়েছে!');
        setIsOpen(true);
        setActiveTab('upload');

        setTimeout(() => {
          const el = document.getElementById('inline-passport-scanner');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            el.classList.add('ring-2', 'ring-sky-400');
            setTimeout(() => el.classList.remove('ring-2', 'ring-sky-400'), 1500);
          }
        }, 50);
      }
    };

    window.addEventListener('paste', handleGlobalPaste, true);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste, true);
    };
  }, []);

  // Intercept Paste Event (Ctrl+V) directly on scanner container
  const handleContainerPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const imageFile = extractImageFromClipboard(e.clipboardData);
    if (imageFile) {
      e.preventDefault();
      handleImageFile(imageFile, '📷 ক্লিপবোর্ড থেকে JPG ফটো পেস্ট করা হয়েছে!');
      return;
    }

    // If it's pure text and we are in paste tab, allow normal paste or capture
    const pastedStr = e.clipboardData?.getData('text');
    if (pastedStr && pastedStr.trim()) {
      if (activeTab === 'paste') {
        setPastedText(pastedStr);
      }
    }
  };

  // Dedicated Button: "ক্লিপবোর্ড থেকে JPG ছবি পেস্ট করুন"
  const handlePasteImageFromClipboard = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Method 1: Try modern navigator.clipboard.read()
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], 'clipboard-passport.jpg', { type: imageType });
            handleImageFile(file, '📷 ক্লিপবোর্ড থেকে JPG ছবি সফলভাবে পেস্ট হয়েছে!');
            return;
          }
        }
      } catch (err) {
        console.warn('Clipboard read API error:', err);
      }
    }

    // Method 2: Try text for data URL
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim().startsWith('data:image/')) {
          const file = dataUrlToFile(clipText.trim(), 'pasted_data_url.jpg');
          handleImageFile(file, '📷 ক্লিপবোর্ড থেকে JPG ছবি সফলভাবে পেস্ট হয়েছে!');
          return;
        }
      } catch {
        // ignore
      }
    }

    // Method 3: If browser blocks programmatic reading in iframe, focus container and guide
    if (scannerContainerRef.current) {
      scannerContainerRef.current.focus();
    }
    setSuccessMessage('💡 ছবি কপি করা থাকলে এখন কীবোর্ডে Ctrl + V চাপুন (সরাসরি পেস্ট হয়ে যাবে)');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Dedicated Button: "ক্লিপবোর্ড থেকে টেক্সট পেস্ট করুন"
  const handlePasteTextFromClipboard = async () => {
    setErrorMessage(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          setPastedText(clipText);
          setSuccessMessage('📋 ক্লিপবোর্ড থেকে টেক্সট পেস্ট করা হয়েছে!');
          setTimeout(() => setSuccessMessage(null), 3000);
          return;
        }
      }
      setErrorMessage('ক্লিপবোর্ডে কোনো টেক্সট পাওয়া যায়নি। বক্সে ক্লিক করে Ctrl+V চাপুন।');
    } catch {
      setErrorMessage('ক্লিপবোর্ড অ্যাক্সেস অনুমোদিত নয়। সরাসরি টেক্সট বক্সে Ctrl+V দিয়ে পেস্ট করুন।');
    }
  };

  // -------------------------------------------------------------
  // 2. TRIGGER IMAGE SCAN (OCR & AI)
  // -------------------------------------------------------------
  const handleScanImage = async () => {
    if (!selectedImage) {
      setErrorMessage('দয়া করে প্রথমে একটি পাসপোর্ট ছবি নির্বাচন বা পেস্ট (Ctrl+V) করুন।');
      return;
    }
    setErrorMessage(null);
    setIsScanning(true);
    setScanProgress(10);
    setScanStatus('ছবি লোড করা হচ্ছে...');
    setIsAppliedToCV(false);

    try {
      const result = await scanPassport(selectedImage, (pct, msg) => {
        setScanProgress(pct);
        setScanStatus(msg);
      });

      setScanConfidence(result.confidence || 95);
      setScanSource(result.source === 'gemini-ai' ? 'ai' : 'ocr');

      // Populate Extracted Data List
      const fields = buildExtractedFields(result, caseMode);
      setExtractedData(fields);

      // Auto-apply to CV directly & save to history
      applyFieldsToCV(fields, result, imagePreview);
      setSuccessMessage(`✅ পাসপোর্টের তথ্য সফলভাবে স্ক্যান হয়েছে! নিচে সম্পূর্ণ তথ্যের লিস্ট দেওয়া হলো।`);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
        'ছবি থেকে টেক্সট স্ক্যান করতে সমস্যা হয়েছে। পরিষ্কার ছবি দিন অথবা টেক্সট পেস্ট অপশন ব্যবহার করুন।'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // -------------------------------------------------------------
  // 3. TRIGGER TEXT PARSE
  // -------------------------------------------------------------
  const handleParseText = () => {
    if (!pastedText.trim()) {
      setErrorMessage('দয়া করে পাসপোর্টের টেক্সট পেস্ট করুন!');
      return;
    }
    setErrorMessage(null);
    setIsAppliedToCV(false);
    try {
      const parsed = parsePassportRawText(pastedText);
      setScanConfidence(parsed.confidence || 92);
      setScanSource('text');

      const fields = buildExtractedFields(parsed, caseMode);
      setExtractedData(fields);

      applyFieldsToCV(fields, parsed, null);
      setSuccessMessage('✅ টেক্সট পার্স সম্পন্ন হয়েছে! নিচে সম্পূর্ণ তথ্যের লিস্ট প্রস্তুত।');
    } catch (err: any) {
      setErrorMessage(err?.message || 'টেক্সট পার্স করতে সমস্যা হয়েছে। সঠিক ফরম্যাটের টেক্সট দিন।');
    }
  };

  // Load Preset Sample Data
  const handleLoadSample = (type: 'standard' | 'whatsapp' | 'bengali') => {
    let sample = '';
    if (type === 'standard') {
      sample = `Name: ALAMEN
Father's Name: SHEIKH SHAMSUL ISLAM
Mother's Name: SAJEDA BEGUM
Date of Birth: 25 Aug 2007
Place of Birth: NARSINGDI
Nationality: Bangladeshi by Birth
Gender: Male
Religion: Islam
Marital Status: Married
Height & Weight: 5' 6" / 62 KG
Passport Number: A21743327
Personal No (NID): 4164712004
Previous Passport No: AA2328199
Date of Issue / Expiry: 13 JUN 2022 / 15 Feb 2036 (DIP/DHAKA)
Permanent Address: UTTAR CHANDAN, PALASH, JHINARDI - 1610, NARSINGDI
Present Address: UTTAR CHANDAN, PALASH, JHINARDI - 1610, NARSINGDI`;
    } else if (type === 'whatsapp') {
      sample = `MD SUMON MIA
Pass No: BF0123456
F/Name: ABDUL JABBAR
M/Name: REHANA AKTER
DOB: 12-05-1998
Issue: 14 JUN 2021
Expiry: 13 JUN 2031
Dist: COMILLA, P.S: CHOUDDAGRAM, P.O: BATISA - 3550, Vill: KASHIPUR
NID: 1998191310000000`;
    } else {
      sample = `নাম: আল আমীন
পাসপোর্ট নম্বর: A21743327
পিতার নাম: শেখ শামসুল ইসলাম
মাতার নাম: সাজেদা বেগম
জন্ম তারিখ: ২৫ আগস্ট ২০০৭
ইস্যু তারিখ: ১৩ জুন ২০২২
মেয়াদ: ১৫ ফেব্রুয়ারি ২০৩৬
স্থায়ী ঠিকানা: গ্রাম: উত্তর চন্দন, ডাকঘর: ঝিনারদী - ১৬১০, থানা: পলাশ, জেলা: নরসিংদী`;
    }

    setPastedText(sample);
    setActiveTab('paste');
    setErrorMessage(null);
    setIsAppliedToCV(false);

    const parsed = parsePassportRawText(sample);
    setScanConfidence(parsed.confidence || 90);
    setScanSource('text');

    const fields = buildExtractedFields(parsed, caseMode);
    setExtractedData(fields);
    applyFieldsToCV(fields, parsed, null);
    setSuccessMessage('⚡ নমুনা ডাটা লোড ও পার্স করা হয়েছে! নিচে সম্পূর্ণ লিস্ট দেখুন।');
  };

  // -------------------------------------------------------------
  // 4. APPLY FIELDS TO CV STATE & AUTO-SAVE
  // -------------------------------------------------------------
  const applyFieldsToCV = async (
    fields: ExtractedPassportFields,
    rawResult?: PassportScanResult,
    thumbnail?: string | null
  ) => {
    const passportPhone = fields.telephoneNo || fields.emergencyContactPhone || '';
    const updates: Partial<CVData> = {
      name: fields.name,
      passportNumber: fields.passportNumber,
      mobile: passportPhone || cvData.mobile,
      dob: fields.dob,
      dateOfIssue: fields.dateOfIssue,
      dateOfExpiry: fields.dateOfExpiry,
      placeOfBirth: fields.placeOfBirth,
      fatherName: fields.fatherName,
      motherName: fields.motherName,
      permanentAddress: fields.permanentAddress,
      presentAddress: '',
      gender: fields.gender,
      nationality: fields.nationality,
      religion: fields.religion,
      maritalStatus: fields.maritalStatus,
      height: fields.height,
      weight: fields.weight,
      personalNo: '',
      previousPassportNumber: '',
      placeOfIssue: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: '',
      emergencyContactAddress: '',
    };

    onApplyData(updates);
    setIsAppliedToCV(true);

    // Save to Passport Scan History
    try {
      const histData: PassportScanResult = rawResult || {
        fullName: fields.name,
        passportNumber: fields.passportNumber,
        dob: fields.dob,
        dateOfIssue: fields.dateOfIssue,
        dateOfExpiry: fields.dateOfExpiry,
        placeOfIssue: fields.placeOfIssue,
        placeOfBirth: fields.placeOfBirth,
        fatherName: fields.fatherName,
        motherName: fields.motherName,
        permanentAddress: fields.permanentAddress,
        presentAddress: fields.presentAddress,
        gender: fields.gender,
        nationality: fields.nationality,
        religion: fields.religion,
        maritalStatus: fields.maritalStatus,
        height: fields.height,
        weight: fields.weight,
        personalNo: fields.personalNo,
        previousPassportNumber: fields.previousPassportNumber,
        emergencyContactName: fields.emergencyContactName,
        emergencyContactRelation: fields.emergencyContactRelation,
        emergencyContactPhone: fields.emergencyContactPhone,
        rawText: '',
        confidence: scanConfidence,
        source: scanSource === 'ocr' ? 'local-ocr' : scanSource === 'ai' ? 'gemini-ai' : 'text-parser',
      };

      // Safely prepare tiny thumbnail (<10KB) or skip to protect storage quota
      let microThumb: string | undefined = undefined;
      if (thumbnail && thumbnail.length <= 12000) {
        microThumb = thumbnail;
      } else if (imagePreview) {
        try {
          microThumb = await createMicroThumbnail(imagePreview);
        } catch {
          // ignore
        }
      }

      savePassportScanToHistory(histData, microThumb);
    } catch (err) {
      console.warn('Failed to save to passport history:', err);
    }
  };

  // Switch Case mode for all fields
  const handleCaseChange = (newMode: TextCaseMode) => {
    setCaseMode(newMode);
    if (extractedData) {
      const updated: ExtractedPassportFields = {
        ...extractedData,
        name: transformCase(extractedData.name, newMode),
        fatherName: transformCase(extractedData.fatherName, newMode),
        motherName: transformCase(extractedData.motherName, newMode),
        placeOfBirth: transformCase(extractedData.placeOfBirth, newMode),
        permanentAddress: transformCase(extractedData.permanentAddress, newMode),
        presentAddress: transformCase(extractedData.presentAddress, newMode),
        emergencyContactName: transformCase(extractedData.emergencyContactName, newMode),
        emergencyContactRelation: transformCase(extractedData.emergencyContactRelation, newMode),
        nationality: newMode === 'capital' ? 'BANGLADESHI BY BIRTH' : 'Bangladeshi by Birth',
      };
      setExtractedData(updated);
      applyFieldsToCV(updated);
    }
  };

  // Update a single field in the extracted list
  const updateExtractedField = (key: keyof ExtractedPassportFields, val: string) => {
    if (!extractedData) return;
    const updated = { ...extractedData, [key]: val };
    if (key === 'dob') {
      updated.age = calculateAge(val);
    }
    setExtractedData(updated);
    setIsAppliedToCV(false);
  };

  // Copy single field text to clipboard
  const handleCopySingleField = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Copy all extracted fields as a clean text block
  const handleCopyAllExtracted = () => {
    if (!extractedData) return;
    const block = `Name: ${extractedData.name}
Passport No: ${extractedData.passportNumber}
Father's Name: ${extractedData.fatherName}
Mother's Name: ${extractedData.motherName}
Date of Birth: ${extractedData.dob} (${extractedData.age || 'N/A'})
Date of Issue: ${extractedData.dateOfIssue}
Date of Expiry: ${extractedData.dateOfExpiry}
Place of Birth: ${extractedData.placeOfBirth}
Nationality: ${extractedData.nationality}
Gender: ${extractedData.gender}
Religion: ${extractedData.religion}
Marital Status: ${extractedData.maritalStatus}
Height & Weight: ${extractedData.height} / ${extractedData.weight}
Telephone No: ${extractedData.telephoneNo || extractedData.emergencyContactPhone || ''}
Permanent Address: ${extractedData.permanentAddress}`.trim();
    navigator.clipboard.writeText(block);
    setSuccessMessage('📋 সম্পূর্ণ তথ্যের সামারি কপি করা হয়েছে!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div
      ref={scannerContainerRef}
      onPaste={handleContainerPaste}
      id="inline-passport-scanner"
      className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-sky-500/30 hover:border-sky-500/50 rounded-2xl p-4 sm:p-5 shadow-xl transition-all mb-4 focus:outline-none"
      tabIndex={0}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>পাসপোর্ট দ্রুত স্ক্যানার</span>
              </h2>
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-700/60 font-mono font-bold px-1.5 py-0.5 rounded">
                JPG • AI • OCR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              JPG ফটো পেস্ট (Ctrl+V) অথবা টেক্সট থেকে তথ্য স্ক্যান করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg transition flex items-center gap-1 cursor-pointer border border-slate-700"
              title="পূর্বের সকল পাসপোর্ট স্ক্যান হিস্টোরি দেখুন"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">স্ক্যান হিস্টরি</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title={isOpen ? 'লুকিয়ে রাখুন' : 'প্রদর্শন করুন'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="pt-3.5 space-y-4">
          {/* TAB SELECTOR: 1. JPG ফটো পেস্ট / আপলোড | 2. টেক্সট পেস্ট */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>JPG ফটো</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>টেক্সট ইনপুট</span>
              </button>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
              <span className="text-slate-400 px-1 text-[11px] font-medium hidden sm:inline">নমুনা:</span>
              <button
                type="button"
                onClick={() => handleLoadSample('standard')}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-[11px] hover:text-white transition cursor-pointer"
                title="ALAMEN স্ট্যান্ডার্ড পাসপোর্ট টেক্সট"
              >
                পাসপোর্ট
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('whatsapp')}
                className="px-2 py-0.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 rounded text-[11px] border border-emerald-800/60 transition cursor-pointer"
                title="WhatsApp / মেসেঞ্জার মেসেজ ফরম্যাট"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('bengali')}
                className="px-2 py-0.5 bg-amber-950/70 hover:bg-amber-900 text-amber-300 rounded text-[11px] border border-amber-800/60 transition cursor-pointer"
                title="বাংলা টেক্সট ফরম্যাট"
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* TAB 1: JPG PHOTO PASTE & UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.bmp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
                className="hidden"
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  className="border-2 border-dashed border-sky-500/40 hover:border-sky-400 bg-slate-950/70 hover:bg-slate-950 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition group shadow-sm"
                  title="ক্লিক করুন অথবা ড্র্যাগ & ড্রপ / পেস্ট করুন"
                >
                  {/* Left: Icon Badge & Keyboard indicator */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30 group-hover:scale-105 transition shadow-inner">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 whitespace-nowrap">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                        <span>JPG ফটো</span>
                      </span>
                      <span
                        className="text-[10px] font-mono font-bold bg-slate-900 text-sky-300 border border-slate-700/90 px-1.5 py-0.5 rounded shadow-inner"
                        title="কিবোর্ডে সরাসরি চাপুন"
                      >
                        Ctrl + V
                      </span>
                    </div>
                  </div>

                  {/* Right: Smart Icon Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={handlePasteImageFromClipboard}
                      className="px-2.5 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                      title="ক্লিপবোর্ড থেকে সরাসরি JPG ছবি পেস্ট করুন (Ctrl + V)"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>পেস্ট</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      title="ফাইল থেকে পাসপোর্ট ছবি নির্বাচন করুন"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>ফাইল</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 sm:p-3 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {imagePreview && (
                      <div className="relative shrink-0">
                        <img
                          src={imagePreview}
                          alt="Passport Preview"
                          className="w-10 h-10 object-cover rounded-lg border border-sky-500/40 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-sky-600 text-white text-[8px] font-bold px-1 rounded">
                          JPG
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate max-w-[130px] sm:max-w-[200px]">
                        {selectedImage.name || 'Pasted_Passport.jpg'}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>{(selectedImage.size / 1024).toFixed(0)} KB</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">✓ প্রস্তুত</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        setExtractedData(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      title="ছবি বাদ দিন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={handleScanImage}
                      className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>স্ক্যান হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>স্ক্যান করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Progress bar during image OCR */}
              {isScanning && (
                <div className="space-y-1.5 p-3.5 bg-sky-950/40 border border-sky-500/30 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-sky-300 font-medium">
                    <span>{scanStatus || 'পাসপোর্ট প্রসেসিং ও অপটিক্যাল স্ক্যান হচ্ছে...'}</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEXT COPY & PASTE */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    setIsAppliedToCV(false);
                  }}
                  rows={4}
                  placeholder="WhatsApp, Messenger, ইমেইল বা ওয়েবসাইট থেকে পাসপোর্টের তথ্য এখানে পেস্ট (Ctrl+V) করুন..."
                  className="w-full p-3 bg-slate-950/90 border border-slate-700/80 focus:border-sky-500 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 outline-none resize-y leading-relaxed"
                />
                {pastedText && (
                  <button
                    type="button"
                    onClick={() => {
                      setPastedText('');
                      setExtractedData(null);
                    }}
                    className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-400 bg-slate-900/90 rounded-md transition"
                    title="টেক্সট মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handlePasteTextFromClipboard}
                  className="px-3 py-1.5 bg-sky-950/70 hover:bg-sky-900 text-sky-200 hover:text-white border border-sky-600/50 font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span>📋 ক্লিপবোর্ড থেকে পেস্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={!pastedText.trim()}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                    pastedText.trim()
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-900/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚡ পার্স করুন ও সম্পূর্ণ তথ্য দেখুন</span>
                </button>
              </div>
            </div>
          )}

          {/* Success / Error Messages */}
          {successMessage && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5. সম্পূর্ণ তথ্যের তালিকা (COMPLETE EXTRACTED INFORMATION LIST) */}
          {/* ------------------------------------------------------------- */}
          {extractedData && (
            <div className="border border-sky-500/40 bg-slate-950/90 rounded-2xl p-4 space-y-4 shadow-2xl animate-in fade-in duration-300">
              {/* List Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>পাসপোর্ট স্ক্যানের সম্পূর্ণ তথ্যের তালিকা</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-mono">
                        ১৯টি ফিল্ড প্রস্তুত
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      নিচের প্রতিটি তথ্য সিভিতে প্রযোজ্য। প্রয়োজন অনুযায়ী এডিট বা কপি করতে পারেন।
                    </p>
                  </div>
                </div>

                {/* Case Transformer Toolbar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleCaseChange('capital')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                        caseMode === 'capital'
                          ? 'bg-sky-500 text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      title="সব তথ্য বড় হাতের (CAPITAL) অক্ষরে রূপান্তর করুন"
                    >
                      🔠 ALL CAPITAL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCaseChange('title')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                        caseMode === 'title'
                          ? 'bg-sky-500 text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      title="প্রথম অক্ষর বড় (Title Case) করুন"
                    >
                      🔤 Title Case
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAllExtracted}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                    title="সব তথ্য টেক্সট আকারে কপি করুন"
                  >
                    <Copy className="w-3 h-3 text-sky-400" />
                    <span>সব কপি</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyFieldsToCV(extractedData)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-950/50 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAppliedToCV ? '✓ সিভিতে সংরক্ষিত' : 'সিভিতে আপডেট করুন'}</span>
                  </button>
                </div>
              </div>

              {/* CATEGORY 1: PASSPORT & IDENTITY (10 Fields) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wide">
                  <FileText className="w-3.5 h-3.5" />
                  <span>১. পাসপোর্ট ও পরিচিতি তথ্য (Passport & Identity)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {/* Full Name */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>পূর্ণ নাম (Full Name)</span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleField(extractedData.name, 'name')}
                        className="text-slate-500 hover:text-sky-400 transition"
                      >
                        {copiedField === 'name' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={extractedData.name}
                      onChange={(e) => updateExtractedField('name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1 text-xs font-bold text-sky-200 outline-none"
                    />
                  </div>

                  {/* Passport Number */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>পাসপোর্ট নম্বর (Passport No)</span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleField(extractedData.passportNumber, 'passport')}
                        className="text-slate-500 hover:text-sky-400 transition"
                      >
                        {copiedField === 'passport' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={extractedData.passportNumber}
                      onChange={(e) => updateExtractedField('passportNumber', e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 outline-none"
                    />
                  </div>

                  {/* Date of Birth & Age */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>জন্ম তারিখ (DOB) {extractedData.age && <strong className="text-amber-400">({extractedData.age})</strong>}</span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleField(extractedData.dob, 'dob')}
                        className="text-slate-500 hover:text-sky-400 transition"
                      >
                        {copiedField === 'dob' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={extractedData.dob}
                      onChange={(e) => updateExtractedField('dob', e.target.value)}
                      placeholder="e.g. 25 Aug 2007"
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-100 outline-none"
                    />
                  </div>

                  {/* Place of Birth */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>জন্মস্থান (Place of Birth)</span>
                    </div>
                    <input
                      type="text"
                      value={extractedData.placeOfBirth}
                      onChange={(e) => updateExtractedField('placeOfBirth', e.target.value)}
                      placeholder="e.g. NARSINGDI"
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1 text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* PASSPORT VALIDITY OPTIONS - Date Of Expiry directly below Date Of Issue */}
                <div className="mt-2.5 p-3 bg-slate-950/90 border border-sky-500/30 rounded-xl space-y-2.5 shadow-sm">
                  <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                      পাসপোর্টের মেয়াদ ও ইস্যু তারিখ অপশন (Passport Dates)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Date Of Issue এর নিচে Date Of Expiry</span>
                  </div>

                  <div className="space-y-2">
                    {/* অপশন ১: ইস্যুর তারিখ (Date of Issue) */}
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                          <span>📅</span> ইস্যু তারিখ (Date of Issue)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySingleField(extractedData.dateOfIssue, 'issue')}
                          className="text-slate-500 hover:text-sky-400 transition"
                        >
                          {copiedField === 'issue' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={extractedData.dateOfIssue}
                        onChange={(e) => updateExtractedField('dateOfIssue', e.target.value)}
                        placeholder="e.g. 13 JUN 2022"
                        className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 outline-none"
                      />
                    </div>

                    {/* অপশন ২: মেয়াদোত্তীর্ণের তারিখ (Date Of Expiry) - Date of Issue এর নিচে আলাদা অপশন */}
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                          <span>⏳</span> মেয়াদোত্তীর্ণের তারিখ (Date Of Expiry)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySingleField(extractedData.dateOfExpiry, 'expiry')}
                          className="text-slate-500 hover:text-sky-400 transition"
                        >
                          {copiedField === 'expiry' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={extractedData.dateOfExpiry}
                        onChange={(e) => updateExtractedField('dateOfExpiry', e.target.value)}
                        placeholder="e.g. 15 Feb 2036"
                        className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CATEGORY 2: PERSONAL & FAMILY DETAILS (8 Fields) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wide">
                  <User className="w-3.5 h-3.5" />
                  <span>২. পারিবারিক ও ব্যক্তিগত বিবরণ (Family & Personal Details)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Father's Name */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>পিতার নাম (Father's Name)</span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleField(extractedData.fatherName, 'father')}
                        className="text-slate-500 hover:text-sky-400 transition"
                      >
                        {copiedField === 'father' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={extractedData.fatherName}
                      onChange={(e) => updateExtractedField('fatherName', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-100 outline-none"
                    />
                  </div>

                  {/* Mother's Name */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>মাতার নাম (Mother's Name)</span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleField(extractedData.motherName, 'mother')}
                        className="text-slate-500 hover:text-sky-400 transition"
                      >
                        {copiedField === 'mother' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={extractedData.motherName}
                      onChange={(e) => updateExtractedField('motherName', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-100 outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block">লিঙ্গ (Gender)</span>
                    <select
                      value={extractedData.gender}
                      onChange={(e) => updateExtractedField('gender', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="Male">Male (পুরুষ)</option>
                      <option value="Female">Female (মহিলা)</option>
                    </select>
                  </div>

                  {/* Marital Status */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block">বৈবাহিক অবস্থা (Marital Status)</span>
                    <select
                      value={extractedData.maritalStatus}
                      onChange={(e) => updateExtractedField('maritalStatus', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="Married">Married (বিবাহিত)</option>
                      <option value="Single">Single (অবিবাহিত)</option>
                    </select>
                  </div>

                  {/* Religion */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block">ধর্ম (Religion)</span>
                    <select
                      value={extractedData.religion}
                      onChange={(e) => updateExtractedField('religion', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="Islam">Islam (ইসলাম)</option>
                      <option value="Hinduism">Hinduism (হিন্দু)</option>
                      <option value="Christianity">Christianity (খ্রিস্টান)</option>
                      <option value="Buddhism">Buddhism (বৌদ্ধ)</option>
                    </select>
                  </div>

                  {/* Nationality */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block">জাতীয়তা (Nationality)</span>
                    <input
                      type="text"
                      value={extractedData.nationality}
                      onChange={(e) => updateExtractedField('nationality', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  {/* Height */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block">উচ্চতা (Height)</span>
                    <input
                      type="text"
                      value={extractedData.height}
                      onChange={(e) => updateExtractedField('height', e.target.value)}
                      placeholder={`5' 6"`}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  {/* Weight */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block">ওজন (Weight)</span>
                    <input
                      type="text"
                      value={extractedData.weight}
                      onChange={(e) => updateExtractedField('weight', e.target.value)}
                      placeholder="62 KG"
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* CATEGORY 3: ADDRESS & EMERGENCY CONTACT (5 Fields) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>৩. ঠিকানা ও জরুরী যোগাযোগ (Address & Emergency Contacts)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Permanent Address */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>স্থায়ী ঠিকানা (Permanent Address)</span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleField(extractedData.permanentAddress, 'perm')}
                        className="text-slate-500 hover:text-sky-400 transition"
                      >
                        {copiedField === 'perm' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={extractedData.permanentAddress}
                      onChange={(e) => updateExtractedField('permanentAddress', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1 text-xs text-slate-100 outline-none resize-none"
                    />
                  </div>

                  {/* Candidate Telephone No from Passport */}
                  <div className="p-2.5 bg-slate-900/90 border border-sky-500/40 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-sky-400">টেলিফোন নম্বর (Telephone No)</span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleField(extractedData.telephoneNo || extractedData.emergencyContactPhone || '', 'tel')}
                        className="text-slate-500 hover:text-sky-400 transition"
                      >
                        {copiedField === 'tel' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={extractedData.telephoneNo || extractedData.emergencyContactPhone || ''}
                      onChange={(e) => {
                        updateExtractedField('telephoneNo', e.target.value);
                        updateExtractedField('emergencyContactPhone', e.target.value);
                      }}
                      placeholder="+8801700000000"
                      className="w-full bg-slate-950 border border-sky-500/60 focus:border-sky-400 rounded-lg px-2.5 py-1 text-xs font-mono text-emerald-400 font-bold outline-none"
                    />
                    <p className="text-[10px] text-slate-400">পাসপোর্ট থেকে প্রাপ্ত টেলিফোন নম্বর সিভির "যোগাযোগ ও সাধারণ তথ্য" তে সংরক্ষিত হবে</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons at bottom of complete list */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    প্রার্থীর নাম: <strong className="text-white">{extractedData.name || 'N/A'}</strong> | পাসপোর্ট: <strong className="text-emerald-400 font-mono">{extractedData.passportNumber || 'N/A'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedData(null);
                      setSelectedImage(null);
                      setImagePreview(null);
                      setPastedText('');
                    }}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition cursor-pointer border border-slate-800"
                  >
                    নতুন স্ক্যান
                  </button>

                  <button
                    type="button"
                    onClick={() => applyFieldsToCV(extractedData)}
                    className="flex-1 sm:flex-initial px-5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isAppliedToCV ? '✓ সম্পূর্ণ তথ্য সিভিতে যুক্ত হয়েছে' : '✅ সম্পূর্ণ তথ্য সিভিতে যুক্ত করুন'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
