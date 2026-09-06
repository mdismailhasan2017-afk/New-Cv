import React, { useState } from 'react';
import {
  Download,
  Printer,
  ExternalLink,
  X,
  FileCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { CVData } from '../types';
import { exportCVToPDF, exportCVToJPG, openPrintWindow } from '../utils/pdfExport';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData?: CVData;
}

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, cvData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'jpg' | null>(null);
  const [progressMsg, setProgressMsg] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const candidateName = (cvData?.name || 'Candidate').trim();
  const defaultFilename = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
  const additionalPagesCount = cvData?.additionalPages?.length || 0;
  const totalPages = 1 + additionalPagesCount;

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    setError(null);
    setExportSuccess(false);

    try {
      await exportCVToPDF(defaultFilename, (msg) => {
        setProgressMsg(msg);
      });
      setExportSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
        setExportSuccess(false);
        setExportType(null);
      }, 2500);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'PDF তৈরিতে সমস্যা হয়েছে');
      setIsExporting(false);
    }
  };

  const handleDownloadJPG = async (pageIndex?: number) => {
    setIsExporting(true);
    setExportType('jpg');
    setError(null);
    setExportSuccess(false);

    try {
      await exportCVToJPG(candidateName, pageIndex, (msg) => {
        setProgressMsg(msg);
      });
      setExportSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
        setExportSuccess(false);
        setExportType(null);
      }, 2500);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'JPG তৈরিতে সমস্যা হয়েছে');
      setIsExporting(false);
    }
  };

  const handleDirectPrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Standard window.print failed, attempting popup print window', err);
      openPrintWindow();
    }
  };

  const handleOpenNewTabPrint = () => {
    openPrintWindow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                সিভি প্রিন্ট ও ডাউনলোড (PDF / JPG)
              </h3>
              <p className="text-[11px] text-slate-400">
                A4 স্ট্যান্ডার্ড ফরম্যাট • মোট {totalPages}টি A4 পেজ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Status Alert if in progress */}
          {isExporting && (
            <div className="p-3 bg-sky-950/70 border border-sky-500/40 rounded-lg flex items-center gap-3 text-sky-200 text-xs animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-sky-400 shrink-0" />
              <div>
                <p className="font-semibold">{progressMsg || (exportType === 'jpg' ? 'JPG ছবি তৈরি হচ্ছে...' : 'PDF ফাইল প্রস্তুত হচ্ছে...')}</p>
                <p className="text-[10px] text-sky-300/80">দয়া করে কয়েক সেকেন্ড অপেক্ষা করুন, ফন্ট ও ছবি প্রসেস হচ্ছে</p>
              </div>
            </div>
          )}

          {exportSuccess && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-lg flex items-center gap-3 text-emerald-200 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold">{exportType === 'jpg' ? 'JPG ছবি ডাউনলোড সম্পন্ন হয়েছে!' : 'PDF ফাইল ডাউনলোড সম্পন্ন হয়েছে!'}</p>
                <p className="text-[10px] text-emerald-300/80">আপনার ব্রাউজারের ডাউনলোড ফোল্ডার চেক করুন।</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-lg flex items-center gap-3 text-rose-200 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold">সমস্যা হয়েছে:</p>
                <p className="text-[10px] text-rose-300">{error}</p>
              </div>
            </div>
          )}

          {/* Option 1: Direct High-Res PDF Download */}
          <div className="bg-slate-950/60 border border-slate-800 hover:border-sky-500/60 rounded-xl p-3.5 transition group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-400" /> ১. সরাসরি PDF ফাইল ডাউনলোড
                  </span>
                  <span className="bg-sky-500/20 text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    প্রস্তাবিত
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Times New Roman ও অন্যান্য ফন্টে শার্প ও ক্রিস্প A4 মাল্টি-পেজ PDF ফাইল (ফন্ট ভাঙা বা নষ্ট হওয়া সম্পূর্ণ সমাধান করা হয়েছে)।
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPDF}
              className="mt-3 w-full py-2 px-3 bg-sky-500 hover:bg-sky-400 active:scale-[0.99] disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-sky-500/20"
            >
              {isExporting && exportType === 'pdf' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PDF তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF ডাউনলোড করুন ({totalPages > 1 ? `সব ${totalPages}টি পেজ` : defaultFilename})</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: High-Quality JPG Image Download */}
          <div className="bg-slate-950/60 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-3.5 transition group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" /> ২. JPG ইমেজ (ছবি) ডাউনলোড করুন
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    নতুন অপশন
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  সোশ্যাল মিডিয়া, হোয়াটসঅ্যাপ, ইমেইল বা এজেন্সিতে পাঠানোর জন্য ঝকঝকে 300 DPI হাই-কোয়ালিটি JPG ছবি।
                </p>
              </div>
            </div>

            {/* JPG Download Buttons */}
            <div className="mt-3 space-y-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleDownloadJPG(undefined)}
                className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {isExporting && exportType === 'jpg' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>JPG ছবি প্রসেস হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{totalPages > 1 ? `সবগুলো পেজ JPG ডাউনলোড (${totalPages}টি পেজ)` : 'সিভি JPG ডাউনলোড করুন'}</span>
                  </>
                )}
              </button>

              {/* Individual Page Buttons if multi-page */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10.5px] text-slate-400 font-medium mr-1">আলাদা পেজ:</span>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleDownloadJPG(0)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-300 text-xs font-semibold rounded border border-slate-700 hover:border-emerald-500/50 transition cursor-pointer"
                  >
                    পেজ ১ (মেইন সিভি)
                  </button>
                  {cvData?.additionalPages?.map((page, idx) => (
                    <button
                      key={page.id}
                      type="button"
                      disabled={isExporting}
                      onClick={() => handleDownloadJPG(idx + 1)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded border border-slate-700 hover:border-emerald-500/50 transition cursor-pointer"
                    >
                      পেজ {idx + 2} ({page.title.length > 10 ? `${page.title.slice(0, 10)}...` : page.title})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Option 3: Browser Vector Print / Save as PDF */}
          <div className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-sky-400" /> ৩. অরিজিনাল ভেক্টর PDF / প্রিন্ট (100% ক্রিস্টাল ক্লিয়ার)
              </span>
              <span className="text-[9px] bg-slate-800 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                100% ATS ফ্রেন্ডলি
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">
              ব্রাউজারের প্রিন্ট ডায়ালগ থেকে <b>Destination: Save as PDF</b> নির্বাচন করলে কোনো ইমেজ প্রসেসিং ছাড়াই টেক্সট ১০০% ভেক্টর ফন্টে থাকে (টেক্সট সিলেক্ট ও কপি করা যায়)।
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDirectPrint}
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span>প্রিন্ট / Save as PDF ডায়ালগ</span>
              </button>
              
              <button
                type="button"
                onClick={handleOpenNewTabPrint}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition cursor-pointer border border-slate-700"
                title="আইফ্রেম ব্লকিং এড়াতে নতুন উইন্ডোতে খুলে ভেক্টর PDF সেভ করুন"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">আলাদা উইন্ডো</span>
              </button>
            </div>
          </div>

          {/* Printing & Font Tips */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-400" /> ফন্ট নষ্ট না হওয়ার নিশ্চয়তা:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-[10.5px] text-slate-400">
              <li>সব ডিভাইসে (মোবাইল ও পিসিতে) Times New Roman ও অন্যান্য ফন্ট অক্ষত রাখতে <b>Tinos</b> এবং <b>Arimo</b> মেট্রিক-কম্প্যাটিবল ওয়েবফন্ট সংযুক্ত করা হয়েছে।</li>
              <li>স্ক্রিন জুমের প্রভাব মুক্ত করে ইনটেজার স্কেলিং ও লসলেস কোয়ালিটিতে PDF জেনারেট হয়, ফলে লেখা ঝাপসা বা বিকৃত হয় না।</li>
              <li>রিক্রুটার যদি কপি-পেস্ট যোগ্য টেক্সট চান, তবে ৩ নম্বর অপশন থেকে <b>"Save as PDF"</b> করে ভেক্টর PDF সংগ্রহ করতে পারেন।</li>
              <li>কাগজে প্রিন্ট করার সময় <b>Paper size: A4</b> এবং <b>Background graphics: Checked</b> রাখবেন।</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            type="button"
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
