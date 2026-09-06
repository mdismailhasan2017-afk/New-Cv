import React from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { StyleConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleConfig: StyleConfig;
  onChange: (config: StyleConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  styleConfig,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-400">
            <Sliders className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base text-white">সিভি স্টাইল ও সেটিংস</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-200">
          
          {/* Photo Visibility */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="font-semibold text-slate-100 block">পাসপোর্ট ছবি প্রদর্শন (Show Photo)</span>
              <span className="text-[11px] text-slate-400">
                সিভির ওপরের অংশে পাসপোর্ট সাইজের ছবি বা ছবির বক্স অন/অফ করুন
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={styleConfig.showPhoto}
                onChange={(e) => onChange({ ...styleConfig, showPhoto: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Font Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-200 block">
                ফন্ট স্টাইল (Font Family)
              </label>
              <span className="text-[11px] text-sky-400 font-medium">
                Times New Roman সেরা স্পষ্টতার জন্য প্রস্তাবিত
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'times', name: 'Times New Roman', sub: 'অফিসিয়াল ও এম্বাসি স্ট্যান্ডার্ড (Official Serif)' },
                { id: 'arial', name: 'Arial', sub: 'সহজ পাঠযোগ্য ও ঝকঝকে (Clean Sans)' },
                { id: 'calibri', name: 'Calibri / Segoe UI', sub: 'আধুনিক অফিস স্ট্যান্ডার্ড (Corporate)' },
                { id: 'georgia', name: 'Georgia', sub: 'প্রফেশনাল এক্সিকিউটিভ সেরিফ (Executive)' },
                { id: 'garamond', name: 'EB Garamond', sub: 'ক্লাসিক মার্জিত ফন্ট (Classic Serif)' },
                { id: 'trebuchet', name: 'Trebuchet MS', sub: 'স্পষ্ট ও টেকনিক্যাল ফন্ট (Crisp Sans)' },
                { id: 'sans', name: 'Plus Jakarta Sans', sub: 'মডার্ন ইন্টারন্যাশনাল (Modern Tech)' },
                { id: 'bengali', name: 'Noto Bengali / Siliguri', sub: 'বাংলা ও ইংরেজি দ্বৈত ফন্ট (Bengali/Eng)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onChange({ ...styleConfig, fontFamily: f.id as any })}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                    styleConfig.fontFamily === f.id
                      ? 'border-sky-500 bg-sky-950/60 text-sky-200 font-semibold ring-1 ring-sky-500/40'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <span className="text-xs font-bold block">{f.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{f.sub}</span>
                  </div>
                  {styleConfig.fontFamily === f.id && <Check className="w-4 h-4 text-sky-400 shrink-0 ml-1.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Spacing density */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">টেক্সট ঘনত্ব ও স্পেসিং (Spacing)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'compact', name: 'কমপ্যাক্ট (Compact)' },
                { id: 'normal', name: 'স্বাভাবিক (Normal)' },
                { id: 'relaxed', name: 'খোলামেলা (Relaxed)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => onChange({ ...styleConfig, spacing: s.id as any })}
                  className={`p-2 rounded-lg border text-center text-xs transition ${
                    styleConfig.spacing === s.id
                      ? 'border-sky-500 bg-sky-950/40 text-sky-300 font-semibold'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Print advice */}
          <div className="p-3 bg-sky-950/20 border border-sky-800/30 rounded-lg text-[11px] text-sky-300 leading-relaxed">
            💡 <strong>প্রিন্ট টিপস:</strong> ব্রাউজারের প্রিন্ট ডায়ালগে <em>"Background graphics"</em> অপশনটি চালু রাখলে রঙিন ব্যানার ও বর্ডার নিখুঁতভাবে A4 পেপারে আসবে।
          </div>

        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
          >
            সেভ ও বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
