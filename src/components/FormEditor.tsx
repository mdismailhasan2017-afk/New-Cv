import React, { useState, useEffect } from 'react';
import {
  User,
  FileText,
  CreditCard,
  Languages,
  GraduationCap,
  Briefcase,
  Wrench,
  Award,
  PenTool,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Camera,
  X,
  Files,
  FilePlus,
  Image as ImageIcon,
  History,
  CaseSensitive,
} from 'lucide-react';
import { CVData, EducationItem, ExperienceItem, LanguageItem, CertificationItem, AdditionalPage } from '../types';
import { COMMON_SKILL_SUGGESTIONS } from '../data/samplePresets';
import { InlinePassportScanner } from './InlinePassportScanner';
import { transformCase, TextCaseMode } from '../utils/textTransform';
import { formatBangladeshiAddress } from '../utils/passportScanner';
import { compressImageForCVPhoto } from '../utils/imageCompressor';

interface FormEditorProps {
  data: CVData;
  onChange: (newData: CVData) => void;
  onOpenHistory?: () => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({ data, onChange, onOpenHistory }) => {
  const [activeSection, setActiveSection] = useState<string>('contact');
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  const handleApplyPassportScan = (updatedFields: Partial<CVData>) => {
    onChange({ ...data, ...updatedFields });
  };

  const updateField = <K extends keyof CVData>(field: K, value: CVData[K]) => {
    onChange({ ...data, [field]: value });
  };

  // Ensure jobTitle defaults to "Position Applied For: " if empty
  useEffect(() => {
    if (!data.jobTitle || data.jobTitle.trim() === '') {
      updateField('jobTitle', 'Position Applied For: ');
    }
  }, []);

  // Quick Capital and Small converter for personal & passport details
  const handleConvertCase = (mode: TextCaseMode) => {
    onChange({
      ...data,
      name: transformCase(data.name, mode),
      fatherName: transformCase(data.fatherName, mode),
      motherName: transformCase(data.motherName, mode),
      permanentAddress: transformCase(data.permanentAddress, mode),
      presentAddress: transformCase(data.presentAddress, mode),
      nationality:
        mode === 'capital'
          ? 'BANGLADESHI BY BIRTH'
          : mode === 'title'
          ? 'Bangladeshi by Birth'
          : 'bangladeshi by birth',
      religion: transformCase(data.religion || '', mode),
      maritalStatus: transformCase(data.maritalStatus || '', mode),
      placeOfBirth: transformCase(data.placeOfBirth || '', mode),
      placeOfIssue:
        mode === 'capital'
          ? (data.placeOfIssue || '').toUpperCase()
          : transformCase(data.placeOfIssue || '', mode),
    });
  };

  // Photo handler with automatic compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImageForCVPhoto(file);
        if (compressed) {
          updateField('photoUrl', compressed);
          return;
        }
      } catch {
        // fallback
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        updateField('photoUrl', uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: Date.now().toString(),
      exam: '',
      inst: '',
      board: '',
      year: '',
      grade: '',
    };
    updateField('educations', [...data.educations, newEdu]);
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, val: string) => {
    const updated = data.educations.map((edu) => (edu.id === id ? { ...edu, [field]: val } : edu));
    updateField('educations', updated);
  };

  const handleRemoveEducation = (id: string) => {
    updateField('educations', data.educations.filter((edu) => edu.id !== id));
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: Date.now().toString(),
      project: '',
      country: '',
      designation: '',
      duration: '',
      responsibilities: [''],
    };
    updateField('experiences', [...data.experiences, newExp]);
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, val: any) => {
    const updated = data.experiences.map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp));
    updateField('experiences', updated);
  };

  const handleRemoveExperience = (id: string) => {
    updateField('experiences', data.experiences.filter((exp) => exp.id !== id));
  };

  // Languages handlers
  const handleAddLanguage = () => {
    const newLang: LanguageItem = {
      id: Date.now().toString(),
      name: '',
      proficiency: 'Good (Working Knowledge)',
    };
    updateField('languages', [...data.languages, newLang]);
  };

  const handleUpdateLanguage = (id: string, field: keyof LanguageItem, val: string) => {
    const updated = data.languages.map((l) => (l.id === id ? { ...l, [field]: val } : l));
    updateField('languages', updated);
  };

  const handleRemoveLanguage = (id: string) => {
    updateField('languages', data.languages.filter((l) => l.id !== id));
  };

  // Skills handlers
  const handleAddSkillTag = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (!data.skills.includes(trimmed)) {
      const updated = [...data.skills, trimmed];
      const currentRaw = data.skillsRaw !== undefined ? data.skillsRaw.trim() : data.skills.join(', ');
      const newRaw = currentRaw ? `${currentRaw}, ${trimmed}` : trimmed;
      onChange({
        ...data,
        skills: updated,
        skillsRaw: newRaw,
      });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkillTag = (index: number) => {
    const updated = data.skills.filter((_, i) => i !== index);
    onChange({
      ...data,
      skills: updated,
      skillsRaw: updated.join(', '),
    });
  };

  const handleRawSkillsChange = (text: string) => {
    const parsed = text
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    onChange({
      ...data,
      skillsRaw: text,
      skills: parsed,
    });
  };

  const handleClearAllSkills = () => {
    onChange({
      ...data,
      skills: [],
      skillsRaw: '',
    });
  };

  // Certifications handlers
  const handleAddCert = () => {
    const newCert: CertificationItem = {
      id: Date.now().toString(),
      title: '',
      organization: '',
      year: new Date().getFullYear().toString(),
    };
    updateField('certifications', [...(data.certifications || []), newCert]);
  };

  const handleUpdateCert = (id: string, field: keyof CertificationItem, val: string) => {
    const certs = data.certifications || [];
    const updated = certs.map((c) => (c.id === id ? { ...c, [field]: val } : c));
    updateField('certifications', updated);
  };

  const handleRemoveCert = (id: string) => {
    const certs = data.certifications || [];
    updateField('certifications', certs.filter((c) => c.id !== id));
  };

  // Additional Pages Handlers
  const handleAddAdditionalPage = (presetType?: 'experience' | 'certificates' | 'passport' | 'blank') => {
    let title = 'ADDITIONAL WORK EXPERIENCE & PROJECT DETAILS';
    let subtitle = 'Detailed Technical Duties & Overseas Execution';
    let content = 'Additional professional history, site supervision responsibilities, safety compliance, and tools proficiencies:';
    let items = [
      'Supervised multi-story electrical cable tray fabrication and DB dressing.',
      'Verified load balance and conducted megger insulation testing on LV/HV panels.',
      'Coordinated directly with main contractor QC inspectors and consultants.',
    ];

    if (presetType === 'certificates') {
      title = 'CERTIFICATES & TECHNICAL CREDENTIALS';
      subtitle = 'Vocational Training & Trade Test Certifications';
      content = 'Below are verified technical credentials, safety induction certifications, and course qualifications:';
      items = [
        'Bureau of Manpower, Employment and Training (BMET) Trade Test Certificate.',
        'OSHA 30-Hour Construction Safety & Health Certification.',
        'Industrial Electrical Automation & PLC Basics Training.',
      ];
    } else if (presetType === 'passport') {
      title = 'PASSPORT & OFFICIAL DOCUMENTS ATTACHMENT';
      subtitle = 'Identification & Travel Credentials';
      content = 'Official copies of International Passport, National ID Card (NID), and Overseas Police Clearance Certificate attached for visa processing and credential verification:';
      items = [
        `Passport No: ${data.passportNumber || 'N/A'} (Issue: ${data.dateOfIssue || 'N/A'}, Expiry: ${data.dateOfExpiry || 'N/A'})`,
        `Full Name as in Passport: ${data.name || 'N/A'}`,
        'Valid for immediate overseas recruitment and visa stamping.',
      ];
    } else if (presetType === 'blank') {
      title = 'ADDITIONAL INFORMATION / দ্বিতীয় পেজ';
      subtitle = '';
      content = '';
      items = [''];
    }

    const newPage: AdditionalPage = {
      id: Date.now().toString(),
      title,
      subtitle,
      content,
      items,
      images: [],
      showSignature: true,
    };

    const currentPages = data.additionalPages || [];
    updateField('additionalPages', [...currentPages, newPage]);
    setActiveSection('additional-pages');
  };

  const handleUpdateAdditionalPage = (id: string, field: keyof AdditionalPage, val: any) => {
    const currentPages = data.additionalPages || [];
    const updated = currentPages.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    updateField('additionalPages', updated);
  };

  const handleRemoveAdditionalPage = (id: string) => {
    const currentPages = data.additionalPages || [];
    updateField('additionalPages', currentPages.filter((p) => p.id !== id));
  };

  const handleAddPageImage = (pageId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const currentPages = data.additionalPages || [];
        const page = currentPages.find((p) => p.id === pageId);
        if (page) {
          const updatedImages = [...(page.images || []), result];
          handleUpdateAdditionalPage(pageId, 'images', updatedImages);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePageImage = (pageId: string, imgIdx: number) => {
    const currentPages = data.additionalPages || [];
    const page = currentPages.find((p) => p.id === pageId);
    if (page) {
      const updatedImages = (page.images || []).filter((_, idx) => idx !== imgIdx);
      handleUpdateAdditionalPage(pageId, 'images', updatedImages);
    }
  };

  const handleAddPageItem = (pageId: string) => {
    const currentPages = data.additionalPages || [];
    const page = currentPages.find((p) => p.id === pageId);
    if (page) {
      const updatedItems = [...(page.items || []), ''];
      handleUpdateAdditionalPage(pageId, 'items', updatedItems);
    }
  };

  const handleUpdatePageItem = (pageId: string, itemIdx: number, val: string) => {
    const currentPages = data.additionalPages || [];
    const page = currentPages.find((p) => p.id === pageId);
    if (page) {
      const updatedItems = (page.items || []).map((item, idx) => (idx === itemIdx ? val : item));
      handleUpdateAdditionalPage(pageId, 'items', updatedItems);
    }
  };

  const handleRemovePageItem = (pageId: string, itemIdx: number) => {
    const currentPages = data.additionalPages || [];
    const page = currentPages.find((p) => p.id === pageId);
    if (page) {
      const updatedItems = (page.items || []).filter((_, idx) => idx !== itemIdx);
      handleUpdateAdditionalPage(pageId, 'items', updatedItems);
    }
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  useEffect(() => {
    const handleJump = (e: any) => {
      if (e.detail?.section) {
        setActiveSection(e.detail.section);
      }
    };
    window.addEventListener('jump_to_cv_section', handleJump);
    return () => window.removeEventListener('jump_to_cv_section', handleJump);
  }, []);

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-5 text-slate-100 font-sans pb-16">

      {/* Inline Smart Passport Scanner & Copy-Paste Hub */}
      <div id="section-scanner">
        <InlinePassportScanner
          cvData={data}
          onApplyData={handleApplyPassportScan}
          onOpenHistory={onOpenHistory}
        />
      </div>

      {/* Section 1: Header & Contact Info */}
      <div id="section-contact" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('contact')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ১. যোগাযোগ ও সাধারণ তথ্য
              </h3>
              <p className="text-[11px] text-slate-400">নাম, পদবী, টেলিফোন, ইমেইল ও ছবি</p>
            </div>
          </div>
          {activeSection === 'contact' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'contact' && (
          <div className="p-4 border-t border-slate-800 space-y-3.5 bg-slate-950/40">
            {/* Photo Box upload */}
            <div className="flex items-center gap-4 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="relative w-16 h-20 bg-slate-800 border-2 border-dashed border-slate-700 rounded flex flex-col items-center justify-center overflow-hidden shrink-0 group">
                {data.photoUrl ? (
                  <>
                    <img src={data.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => updateField('photoUrl', '')}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-80 hover:opacity-100 shadow"
                      title="ছবি মুছুন"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-sky-400">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-medium">ছবি যোগ</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block mb-0.5">পাসপোর্ট সাইজ ছবি (ঐচ্ছিক)</span>
                <span className="text-slate-400 text-[11px] block mb-2">
                  গালফ বা আন্তর্জাতিক ফরম্যাটে ছবির ঘর সক্রিয় থাকলে প্রিন্টে ছবি সংযুক্ত থাকবে।
                </span>
                {data.photoUrl ? (
                  <button
                    onClick={() => updateField('photoUrl', '')}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-medium"
                  >
                    ছবি রিমুভ করুন
                  </button>
                ) : (
                  <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-[11px] font-medium cursor-pointer inline-block">
                    ফাইল সিলেক্ট করুন
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">পূর্ণ নাম (Full Name) *</label>
                <input
                  id="in_name"
                  type="text"
                  value={data.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. SABBIR AHAMED"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs sm:text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="in_jobtitle" className="block text-xs font-semibold text-slate-300">
                    পদবী / পদমর্যাদা (Job Title) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = 'Position Applied For: ';
                      const raw = (data.jobTitle || '').replace(/^Position\s*Applied\s*For\s*[:=-]?\s*/i, '').trim();
                      updateField('jobTitle', raw ? `${prefix}${raw}` : prefix);
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition cursor-pointer flex items-center gap-1"
                    title="Position Applied For: ডিফল্ট টেক্সট নিশ্চিত বা যুক্ত করুন"
                  >
                    <span>+ Position Applied For:</span>
                  </button>
                </div>
                <input
                  id="in_jobtitle"
                  type="text"
                  value={data.jobTitle}
                  onFocus={() => {
                    if (!data.jobTitle || data.jobTitle.trim() === '') {
                      updateField('jobTitle', 'Position Applied For: ');
                    }
                  }}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  placeholder="Position Applied For: e.g. General Electrical Sargent"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs sm:text-sm text-slate-100 outline-none font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 ডিফল্ট হিসেবে <span className="text-sky-300 font-mono font-semibold">Position Applied For:</span> থাকবে, এরপর আপনার কাঙ্ক্ষিত পদবী লিখুন (যেমন: Position Applied For: Electrician)।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">টেলিফোন নম্বর (Telephone No)</label>
                <input
                  id="in_mobile"
                  type="text"
                  value={data.mobile}
                  onChange={(e) => updateField('mobile', e.target.value)}
                  placeholder="+880 1700-000000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs sm:text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ইমেইল ঠিকানা (Email)</label>
                <input
                  id="in_email"
                  type="email"
                  value={data.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs sm:text-sm text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Career Objective */}
      <div id="section-objective" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('objective')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ২. ক্যারিয়ার অবজেক্টিভ / সামারি
              </h3>
              <p className="text-[11px] text-slate-400">পেশাগত লক্ষ্য ও পরিচিতি বক্তব্য</p>
            </div>
          </div>
          {activeSection === 'objective' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'objective' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
            <textarea
              id="in_objective"
              rows={3}
              value={data.objective}
              onChange={(e) => updateField('objective', e.target.value)}
              placeholder="আপনার ক্যারিয়ার অবজেক্টিভ লিখুন..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs sm:text-sm text-slate-100 outline-none leading-relaxed"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-amber-400" /> দ্রুত সাজেশন:
              </span>
              <button
                onClick={() =>
                  updateField(
                    'objective',
                    'To work in a challenging environment and be known for depth of knowledge, quality, hard work, timeliness of service, honesty, dynamism, honoring the commitments and to provide innovative solutions and enable organization to enhance business.'
                  )
                }
                className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
              >
                গালফ টেকনিক্যাল অবজেক্টিভ
              </button>
              <button
                onClick={() =>
                  updateField(
                    'objective',
                    'Results-oriented professional seeking to leverage proven technical leadership, meticulous project execution, and cross-functional team management in high-impact global assignments.'
                  )
                }
                className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
              >
                কর্পোরেট এক্সিকিউটিভ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Personal & Passport Details */}
      <div id="section-personal" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('personal')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ৩. ব্যক্তিগত ও পাসপোর্ট বিস্তারিত
              </h3>
              <p className="text-[11px] text-slate-400">পিতার নাম, মাতার নাম, ঠিকানা, ধর্ম, পাসপোর্ট নম্বর ইত্যাদি</p>
            </div>
          </div>
          {activeSection === 'personal' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'personal' && (
          <div className="p-4 border-t border-slate-800 space-y-3.5 bg-slate-950/40">
            {/* Capital & Small Case Converter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <CaseSensitive className="w-4 h-4 text-sky-400" />
                <span>অক্ষরের স্টাইল (Capital & Small অপশন):</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleConvertCase('capital')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded border border-slate-700 transition cursor-pointer"
                  title="নাম, পিতার নাম, মাতার নাম, ঠিকানা ইত্যাদি সব বড় হাতের (ALL CAPITAL) করুন"
                >
                  🔠 ALL CAPITAL
                </button>
                <button
                  type="button"
                  onClick={() => handleConvertCase('title')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded border border-slate-700 transition cursor-pointer"
                  title="নাম ও ঠিকানা স্বাভাবিক / Title Case (Small) করুন"
                >
                  🔤 Title Case (Small)
                </button>
              </div>
            </div>

            {/* Passport Highlight Card */}
            <div className="bg-sky-950/30 border border-sky-800/40 rounded-lg p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase">
                  <CreditCard className="w-3.5 h-3.5" /> পাসপোর্ট তথ্য (Passport Information)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('inline-passport-scanner');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      el.classList.add('ring-2', 'ring-sky-400');
                      setTimeout(() => el.classList.remove('ring-2', 'ring-sky-400'), 2000);
                    }
                  }}
                  className="px-2.5 py-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  title="উপরে সরাসরি পাসপোর্ট কপি-পেস্ট ও স্ক্যানার বক্সে যান"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-200" />
                  <span>পাসপোর্ট কপি-পেস্ট ও স্ক্যান</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">পাসপোর্ট নং (Passport No)</label>
                  <input
                    id="in_passport"
                    type="text"
                    value={data.passportNumber}
                    onChange={(e) => updateField('passportNumber', e.target.value)}
                    placeholder="e.g. A21743327"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Place of Issue (প্রদানের স্থান)</label>
                  <input
                    id="in_place_of_issue"
                    type="text"
                    value={data.placeOfIssue || ''}
                    onChange={(e) => updateField('placeOfIssue', e.target.value)}
                    placeholder="e.g. DIP/DHAKA"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Personal No (NID)</label>
                  <input
                    id="in_personal_no"
                    type="text"
                    value={data.personalNo || ''}
                    onChange={(e) => updateField('personalNo', e.target.value)}
                    placeholder="e.g. 4164712004"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Date of Issue and Date of Expiry Options (Date of Expiry directly below Date of Issue) */}
              <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2.5">
                <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
                  <span>📅 পাসপোর্টের মেয়াদকাল অপশন</span>
                  <span className="text-[10px] text-slate-400 font-normal">Date Of Issue এর নিচে Date Of Expiry</span>
                </div>

                <div className="space-y-2">
                  {/* অপশন ১: ইস্যুর তারিখ (Date of Issue) */}
                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-md">
                    <label className="block text-[11px] font-semibold text-sky-300 mb-1 flex items-center justify-between">
                      <span>ইস্যুর তারিখ (Date Of Issue)</span>
                      <span className="text-[10px] text-slate-500">অপশন ১</span>
                    </label>
                    <input
                      id="in_issue"
                      type="text"
                      value={data.dateOfIssue}
                      onChange={(e) => updateField('dateOfIssue', e.target.value)}
                      placeholder="e.g. 13 JUN 2022"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100"
                    />
                  </div>

                  {/* অপশন ২: মেয়াদোত্তীর্ণের তারিখ (Date Of Expiry) - Date of Issue এর নিচে আলাদা অপশন */}
                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-md">
                    <label className="block text-[11px] font-semibold text-amber-300 mb-1 flex items-center justify-between">
                      <span>মেয়াদোত্তীর্ণের তারিখ (Date Of Expiry)</span>
                      <span className="text-[10px] text-slate-500">Date Of Issue নিচে অপশন ২</span>
                    </label>
                    <input
                      id="in_expiry"
                      type="text"
                      value={data.dateOfExpiry}
                      onChange={(e) => updateField('dateOfExpiry', e.target.value)}
                      placeholder="e.g. 15 Feb 2036"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Previous Passport Number */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Previous Passport No (পূর্বের পাসপোর্ট নম্বর)</label>
                <input
                  id="in_prev_passport"
                  type="text"
                  value={data.previousPassportNumber || ''}
                  onChange={(e) => updateField('previousPassportNumber', e.target.value)}
                  placeholder="e.g. AA2328199"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 font-mono"
                />
              </div>

              {/* Optional Emergency Contact / Telephone Section */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-300">
                    জরুরী যোগাযোগ ও টেলিফোন নম্বর (Emergency Contact & Telephone No - ঐচ্ছিক)
                  </span>
                  {(data.emergencyContactPhone || data.emergencyContactName) && (
                    <button
                      type="button"
                      onClick={() => {
                        updateField('emergencyContactName', '');
                        updateField('emergencyContactRelation', '');
                        updateField('emergencyContactPhone', '');
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      title="জরুরী যোগাযোগ মুছে ফেলুন"
                    >
                      মুছে ফেলুন (Clear)
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      value={data.emergencyContactName || ''}
                      onChange={(e) => updateField('emergencyContactName', e.target.value)}
                      placeholder="জরুরী ব্যক্তির নাম"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={data.emergencyContactRelation || ''}
                      onChange={(e) => updateField('emergencyContactRelation', e.target.value)}
                      placeholder="সম্পর্ক (e.g. FATHER)"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={data.emergencyContactPhone || ''}
                      onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                      placeholder="Telephone No"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">পিতার নাম (Father's Name)</label>
                <input
                  id="in_father"
                  type="text"
                  value={data.fatherName}
                  onChange={(e) => updateField('fatherName', e.target.value)}
                  placeholder="Father's Name"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">মাতার নাম (Mother's Name)</label>
                <input
                  id="in_mother"
                  type="text"
                  value={data.motherName}
                  onChange={(e) => updateField('motherName', e.target.value)}
                  placeholder="Mother's Name"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">জন্ম তারিখ (Date of Birth)</label>
                <input
                  id="in_dob"
                  type="text"
                  value={data.dob}
                  onChange={(e) => updateField('dob', e.target.value)}
                  placeholder="e.g. 25 Mar 1992"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">জাতীয়তা (Nationality)</label>
                <input
                  id="in_nationality"
                  type="text"
                  value={data.nationality}
                  onChange={(e) => updateField('nationality', e.target.value)}
                  placeholder="e.g. Bangladeshi by Birth"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="in_perm_address" className="text-xs font-semibold text-slate-300">
                  স্থায়ী ঠিকানা (Permanent Address)
                </label>
                <button
                  type="button"
                  onClick={() => updateField('permanentAddress', formatBangladeshiAddress(data.permanentAddress))}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition cursor-pointer flex items-center gap-1"
                  title="Vill: ..., P.O: ..., P.S: ..., Dist: ... ফরম্যাট করুন"
                >
                  <span>✨ Vill/P.O ফরম্যাট করুন</span>
                </button>
              </div>
              <textarea
                id="in_perm_address"
                rows={2}
                value={data.permanentAddress}
                onChange={(e) => updateField('permanentAddress', e.target.value)}
                placeholder="Vill: Paiksha, P.O: Ghorashal, P.S: Palash, Dist: Narsingdi"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="in_pres_address" className="text-xs font-semibold text-slate-300">
                  বর্তমান ঠিকানা (Present Address)
                </label>
                <button
                  type="button"
                  onClick={() => updateField('presentAddress', formatBangladeshiAddress(data.presentAddress))}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition cursor-pointer flex items-center gap-1"
                  title="Vill: ..., P.O: ..., P.S: ..., Dist: ... ফরম্যাট করুন"
                >
                  <span>✨ Vill/P.O ফরম্যাট করুন</span>
                </button>
              </div>
              <input
                id="in_pres_address"
                type="text"
                value={data.presentAddress}
                onChange={(e) => updateField('presentAddress', e.target.value)}
                placeholder="Vill: Paiksha, P.O: Ghorashal, P.S: Palash, Dist: Narsingdi"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">লিঙ্গ (Gender)</label>
                <input
                  id="in_gender"
                  type="text"
                  value={data.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  placeholder="Male / Female"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">ধর্ম (Religion)</label>
                <input
                  id="in_religion"
                  type="text"
                  value={data.religion}
                  onChange={(e) => updateField('religion', e.target.value)}
                  placeholder="Islam / Hinduism / etc."
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">বৈবাহিক অবস্থা (Marital)</label>
                <input
                  id="in_marital"
                  type="text"
                  value={data.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                  placeholder="Married / Single"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">উচ্চতা (Height)</label>
                <input
                  id="in_height"
                  type="text"
                  value={data.height}
                  onChange={(e) => updateField('height', e.target.value)}
                  placeholder={`5' 5"`}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">ওজন (Weight)</label>
                <input
                  id="in_weight"
                  type="text"
                  value={data.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                  placeholder="55 KG"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Language Skills */}
      <div id="section-languages" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('languages')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Languages className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ৪. ভাষার দক্ষতা (Language Skills)
              </h3>
              <p className="text-[11px] text-slate-400">বাংলা, ইংরেজি, আরবি ইত্যাদি ভাষার দক্ষতা</p>
            </div>
          </div>
          {activeSection === 'languages' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'languages' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
            {data.languages.map((lang) => (
              <div key={lang.id} className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => handleUpdateLanguage(lang.id, 'name', e.target.value)}
                  placeholder="Language (e.g. Bengali)"
                  className="w-1/3 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-semibold"
                />
                <input
                  type="text"
                  value={lang.proficiency}
                  onChange={(e) => handleUpdateLanguage(lang.id, 'proficiency', e.target.value)}
                  placeholder="Proficiency / Level description"
                  className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
                <button
                  onClick={() => handleRemoveLanguage(lang.id)}
                  className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/50"
                  title="ডিলিট"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddLanguage}
              className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-dashed border-slate-700 text-sky-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> আরও ভাষা যোগ করুন (+ Add Language)
            </button>
          </div>
        )}
      </div>

      {/* Section 5: Education */}
      <div id="section-education" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('education')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ৫. শিক্ষাগত যোগ্যতা (Education)
              </h3>
              <p className="text-[11px] text-slate-400">পরীক্ষার নাম, প্রতিষ্ঠান, বোর্ড ও পাসের সাল</p>
            </div>
          </div>
          {activeSection === 'education' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'education' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
            {data.educations.map((edu, idx) => (
              <div key={edu.id} className="relative bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-purple-400">শিক্ষাগত রেকর্ড #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="text-rose-400 hover:text-rose-300 p-0.5 rounded hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">পরীক্ষার নাম (Exam/Degree)</label>
                    <input
                      type="text"
                      value={edu.exam}
                      onChange={(e) => handleUpdateEducation(edu.id, 'exam', e.target.value)}
                      placeholder="e.g. SSC / Diploma / B.Sc"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">পাসের সাল (Passing Year)</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleUpdateEducation(edu.id, 'year', e.target.value)}
                      placeholder="e.g. 2009"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">প্রতিষ্ঠান (Institution Name)</label>
                  <input
                    type="text"
                    value={edu.inst}
                    onChange={(e) => handleUpdateEducation(edu.id, 'inst', e.target.value)}
                    placeholder="e.g. Narsingdi Technical Training Center"
                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">বোর্ড / বিশ্ববিদ্যালয় (Board)</label>
                    <input
                      type="text"
                      value={edu.board}
                      onChange={(e) => handleUpdateEducation(edu.id, 'board', e.target.value)}
                      placeholder="e.g. BTEB / Dhaka"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">ফলাফল / গ্রেড (Result/GPA)</label>
                    <input
                      type="text"
                      value={edu.grade || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, 'grade', e.target.value)}
                      placeholder="e.g. GPA 4.50"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddEducation}
              className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-dashed border-slate-700 text-sky-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> + নতুন শিক্ষাগত তথ্য যোগ করুন (Add Education)
            </button>
          </div>
        )}
      </div>

      {/* Section 6: Work Experience */}
      <div id="section-experience" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('experience')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ৬. কাজের অভিজ্ঞতা (Work Experience)
              </h3>
              <p className="text-[11px] text-slate-400">কোম্পানি/প্রজেক্ট, দেশ ও কার্যকাল</p>
            </div>
          </div>
          {activeSection === 'experience' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'experience' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
            {data.experiences.map((exp, idx) => (
              <div key={exp.id} className="relative bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-blue-400">অভিজ্ঞতা #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-rose-400 hover:text-rose-300 p-0.5 rounded hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                    প্রতিষ্ঠান / প্রজেক্টের নাম (Company / Project Name)
                  </label>
                  <input
                    type="text"
                    value={exp.project}
                    onChange={(e) => handleUpdateExperience(exp.id, 'project', e.target.value)}
                    placeholder="e.g. Plane View Engineering / ACC (Saudi Arab)"
                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">দেশ / অবস্থান (Country)</label>
                    <input
                      type="text"
                      value={exp.country}
                      onChange={(e) => handleUpdateExperience(exp.id, 'country', e.target.value)}
                      placeholder="e.g. Saudi Arab / Malaysia / BD"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">পদবী (Designation)</label>
                    <input
                      type="text"
                      value={exp.designation || ''}
                      onChange={(e) => handleUpdateExperience(exp.id, 'designation', e.target.value)}
                      placeholder="e.g. Electrical Sargent / Electrician"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">সময়কাল (Duration)</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleUpdateExperience(exp.id, 'duration', e.target.value)}
                      placeholder="e.g. 2022 to Present"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddExperience}
              className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-dashed border-slate-700 text-sky-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> + নতুন অভিজ্ঞতা যোগ করুন (Add Experience)
            </button>
          </div>
        )}
      </div>

      {/* Section 7: Skills & Expertise */}
      <div id="section-skills" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('skills')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ৭. দক্ষতা ও বিশেষ স্কিলসমূহ (Skills & Expertise)
              </h3>
              <p className="text-[11px] text-slate-400">কাজের মূল টেকনিক্যাল স্কিলসমূহ</p>
            </div>
          </div>
          {activeSection === 'skills' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'skills' && (
          <div className="p-4 border-t border-slate-800 space-y-3.5 bg-slate-950/40">
            {/* Raw Textarea option */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  একসাথে কমা দিয়ে স্কিল লিখুন (Comma-separated text):
                </label>
                {((data.skillsRaw !== undefined && data.skillsRaw.trim() !== '') || data.skills.length > 0) && (
                  <button
                    type="button"
                    onClick={handleClearAllSkills}
                    className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer transition font-medium"
                    title="সব স্কিল লেখা মুছে খালি করুন"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>সব মুছুন (খালি করুন)</span>
                  </button>
                )}
              </div>
              <textarea
                id="in_skills"
                rows={3}
                value={data.skillsRaw !== undefined ? data.skillsRaw : data.skills.join(', ')}
                onChange={(e) => handleRawSkillsChange(e.target.value)}
                placeholder="DB Termination, Cable Pulling, RCP Marking, Piping... (স্কিল না রাখতে চাইলে পুরো লেখা কেটে খালি করে দিন)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs sm:text-sm text-slate-100 outline-none leading-relaxed"
              />
              <p className="text-[10.5px] text-slate-400 mt-1">
                টিপস: এই বক্সের লেখা কাটলে বা মুছলে সিভিতেও স্কিল সেকশন স্বয়ংক্রিয়ভাবে খালি থাকবে।
              </p>
            </div>

            {/* Quick Add Custom Skill */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkillTag(newSkillInput);
                  }
                }}
                placeholder="নতুন স্কিল লিখুন ও এন্টার চাপুন..."
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100"
              />
              <button
                onClick={() => handleAddSkillTag(newSkillInput)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
              >
                + যোগ করুন
              </button>
            </div>

            {/* Active Tags */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400">বর্তমানে যুক্ত স্কিলসমূহ:</span>
                {data.skills.length > 0 && (
                  <span className="text-[10px] text-sky-400 font-mono">({data.skills.length}টি স্কিল)</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-900/60 rounded-lg border border-slate-800 min-h-10 items-center">
                {data.skills.length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">কোনো স্কিল যুক্ত নেই (খালি রয়েছে)</span>
                ) : (
                  data.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-sky-300 border border-sky-500/30 rounded text-[11px]"
                    >
                      {s}
                      <button
                        onClick={() => handleRemoveSkillTag(idx)}
                        className="hover:text-rose-400 ml-0.5"
                        title="এই স্কিলটি মুছুন"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Suggested Tags */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">প্রয়োজনীয় টেকনিক্যাল স্কিল সাজেশন (ক্লিক করুন):</span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {COMMON_SKILL_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddSkillTag(sug)}
                    className="text-[10px] px-2 py-0.5 bg-slate-850 hover:bg-sky-900/60 hover:text-sky-300 text-slate-300 rounded border border-slate-700 transition"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 8: Certifications */}
      <div id="section-certifications" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('certifications')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ৮. প্রশিক্ষণ ও সনদপত্র (Certifications & Training)
              </h3>
              <p className="text-[11px] text-slate-400">ট্রেড কোর্স, সেফটি ও ভোকেশনাল সার্টিফিকেট</p>
            </div>
          </div>
          {activeSection === 'certifications' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'certifications' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
            {(data.certifications || []).map((cert) => (
              <div key={cert.id} className="flex flex-col sm:flex-row gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                <input
                  type="text"
                  value={cert.title}
                  onChange={(e) => handleUpdateCert(cert.id, 'title', e.target.value)}
                  placeholder="Certificate / Course Name"
                  className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-medium"
                />
                <input
                  type="text"
                  value={cert.organization}
                  onChange={(e) => handleUpdateCert(cert.id, 'organization', e.target.value)}
                  placeholder="Organization / Board"
                  className="w-full sm:w-1/3 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
                <input
                  type="text"
                  value={cert.year}
                  onChange={(e) => handleUpdateCert(cert.id, 'year', e.target.value)}
                  placeholder="Year"
                  className="w-full sm:w-20 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 text-center"
                />
                <button
                  onClick={() => handleRemoveCert(cert.id)}
                  className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/50 self-end sm:self-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddCert}
              className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-dashed border-slate-700 text-sky-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> + নতুন প্রশিক্ষণ / সার্টিফিকেট যোগ করুন
            </button>
          </div>
        )}
      </div>

      {/* Section 9: Signature & Declaration */}
      <div id="section-signature" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => toggleSection('signature')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                ৯. স্বাক্ষর ও প্রত্যয়ন (Signature & Declaration)
              </h3>
              <p className="text-[11px] text-slate-400">সিভির নিচের স্বাক্ষর ও তারিখ</p>
            </div>
          </div>
          {activeSection === 'signature' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'signature' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="toggle-signature"
                checked={Boolean(data.showSignature)}
                onChange={(e) => updateField('showSignature', e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="toggle-signature" className="text-xs font-medium text-slate-200 cursor-pointer select-none">
                সিভির শেষে স্বাক্ষর সেকশন প্রদর্শন করুন
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    স্বাক্ষর নাম (Signature Name)
                  </label>
                  {(data.signatureText !== undefined ? data.signatureText : '') !== '' && (
                    <button
                      type="button"
                      onClick={() => updateField('signatureText', '')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                      title="স্বাক্ষরের নাম মুছে সম্পূর্ণ খালি করুন"
                    >
                      মুছুন (খালি করুন)
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={data.signatureText !== undefined ? data.signatureText : ''}
                  onChange={(e) => updateField('signatureText', e.target.value)}
                  placeholder={data.name ? `${data.name} (বা খালি রাখুন)` : 'স্বাক্ষরের নাম লিখুন বা খালি রাখুন...'}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs sm:text-sm text-slate-100 outline-none"
                />
                <p className="text-[10.5px] text-slate-400 mt-1">
                  টিপস: এই নাম কেটে বা মুছে দিলে বক্সটি খালি থাকবে এবং সিভিতে স্বাক্ষরের জায়গা ফাঁকা থাকবে।
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">তারিখ (Date)</label>
                  {(data.signatureDate || '') !== '' && (
                    <button
                      type="button"
                      onClick={() => updateField('signatureDate', '')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                      title="তারিখ মুছে খালি করুন"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={data.signatureDate || ''}
                  onChange={(e) => updateField('signatureDate', e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg text-xs sm:text-sm text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 10: Additional A4 Pages */}
      <div id="section-additional-pages" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all">
        <button
          type="button"
          onClick={() => toggleSection('additional-pages')}
          className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Files className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
                  ১০. অতিরিক্ত A4 পেজ যোগ করুন
                </h3>
                {(data.additionalPages && data.additionalPages.length > 0) && (
                  <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">
                    {data.additionalPages.length}টি অতিরিক্ত পেজ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                সিভির নিচে ২য়, ৩য় A4 পেজ, সার্টিফিকেট, পাসপোর্ট বা অতিরিক্ত কাজের বিবরণ
              </p>
            </div>
          </div>
          {activeSection === 'additional-pages' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {activeSection === 'additional-pages' && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/40">
            
            {/* Quick Presets for Extra Pages */}
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                দ্রুত রেডিমেড পেজ যোগ করুন (Quick Add Page):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddAdditionalPage('experience')}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer hover:border-sky-500"
                >
                  <Briefcase className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">📋 প্রজেক্ট অভিজ্ঞতা পেজ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAdditionalPage('certificates')}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer hover:border-sky-500"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">📜 সার্টিফিকেট সংযুক্তি পেজ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAdditionalPage('passport')}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer hover:border-sky-500"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">🛂 পাসপোর্ট ও ভিসা কপি পেজ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAdditionalPage('blank')}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer hover:border-sky-500"
                >
                  <FilePlus className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">➕ সাধারণ ব্ল্যাঙ্ক পেজ</span>
                </button>
              </div>
            </div>

            {/* Added Pages List */}
            {data.additionalPages && data.additionalPages.length > 0 ? (
              <div className="space-y-4 pt-2">
                {data.additionalPages.map((page, idx) => {
                  const pageNumber = idx + 2;
                  return (
                    <div
                      key={page.id}
                      className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-3 relative shadow"
                    >
                      {/* Page Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10.5px] font-extrabold px-2 py-0.5 rounded">
                            পেজ {pageNumber} (A4)
                          </span>
                          <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">
                            {page.title || 'শিরোনামহীন পেজ'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalPage(page.id)}
                          className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 font-semibold hover:bg-rose-950/40 px-2 py-1 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>এই পেজ মুছুন</span>
                        </button>
                      </div>

                      {/* Page Title & Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            পেজের মূল শিরোনাম (Title)
                          </label>
                          <input
                            type="text"
                            value={page.title}
                            onChange={(e) => handleUpdateAdditionalPage(page.id, 'title', e.target.value)}
                            placeholder="যেমন: WORK DETAILS & SITE EXPERIENCE"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            উপ-শিরোনাম (Subtitle - ঐচ্ছিক)
                          </label>
                          <input
                            type="text"
                            value={page.subtitle || ''}
                            onChange={(e) => handleUpdateAdditionalPage(page.id, 'subtitle', e.target.value)}
                            placeholder="যেমন: Technical Duties & Project Breakdown"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                          />
                        </div>
                      </div>

                      {/* Content / Description Paragraph */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          বিস্তারিত বিবরণ বা নোট (Detailed Content)
                        </label>
                        <textarea
                          rows={3}
                          value={page.content || ''}
                          onChange={(e) => handleUpdateAdditionalPage(page.id, 'content', e.target.value)}
                          placeholder="এই পেজের মূল বিবরণ, প্যারাগ্রাফ বা পরিচিতি লিখুন..."
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none resize-none leading-relaxed"
                        />
                      </div>

                      {/* Bullet Items List */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-300">
                            বুলেট পয়েন্ট বা অর্জনের তালিকা:
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddPageItem(page.id)}
                            className="text-[10.5px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Plus className="w-3 h-3" /> বুলেট পয়েন্ট যোগ করুন
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(page.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-1.5">
                              <span className="text-slate-500 text-xs">•</span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => handleUpdatePageItem(page.id, itemIdx, e.target.value)}
                                placeholder={`পয়েন্ট ${itemIdx + 1} লিখুন...`}
                                className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded text-xs text-slate-100 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePageItem(page.id, itemIdx)}
                                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                title="পয়েন্ট মুছুন"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Document / Certificate Images Upload */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                            সার্টিফিকেট / পাসপোর্ট / ডকুমেন্ট ছবি সংযুক্তি:
                          </label>
                          <label className="text-[10.5px] bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1">
                            <Plus className="w-3 h-3" /> ছবি আপলোড করুন
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleAddPageImage(page.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Images Thumbnails Grid */}
                        {page.images && page.images.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {page.images.map((imgSrc, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="relative group bg-slate-950 rounded border border-slate-700 overflow-hidden h-24 flex items-center justify-center p-1"
                              >
                                <img
                                  src={imgSrc}
                                  alt={`Doc ${imgIdx + 1}`}
                                  className="h-full w-full object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePageImage(page.id, imgIdx)}
                                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow transition"
                                  title="ছবি মুছুন"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <span className="absolute bottom-1 left-1 bg-slate-900/90 text-slate-300 text-[9px] px-1 rounded">
                                  সংযুক্তি {imgIdx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10.5px] text-slate-500 italic">
                            কোনো ছবি যুক্ত করা নেই। উপরে "ছবি আপলোড করুন" বাটনে ক্লিক করে সার্টিফিকেট বা পাসপোর্টের স্ক্যান কপি যুক্ত করতে পারেন।
                          </p>
                        )}
                      </div>

                      {/* Signature Checkbox for this page */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <input
                          type="checkbox"
                          id={`page-sig-${page.id}`}
                          checked={Boolean(page.showSignature)}
                          onChange={(e) => handleUpdateAdditionalPage(page.id, 'showSignature', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`page-sig-${page.id}`}
                          className="text-[11px] text-slate-300 cursor-pointer select-none"
                        >
                          এই পেজের নিচে স্বাক্ষর ও তারিখ সেকশন প্রদর্শন করুন
                        </label>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center">
                <Files className="w-7 h-7 text-slate-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-300">এখনও কোনো অতিরিক্ত A4 পেজ যোগ করা হয়নি</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                  সিভিতে পেজ ২ তৈরি করতে বা সার্টিফিকেট ও পাসপোর্ট ডকুমেন্টস জুড়তে নিচের বাটনে ক্লিক করুন।
                </p>
                <button
                  type="button"
                  onClick={() => handleAddAdditionalPage('experience')}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer inline-flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ প্রথম অতিরিক্ত A4 পেজ যোগ করুন</span>
                </button>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};
