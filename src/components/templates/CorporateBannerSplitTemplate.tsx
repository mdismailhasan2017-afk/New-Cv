import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const CorporateBannerSplitTemplate: React.FC<TemplateProps> = ({
  data,
  styleConfig,
  renderCropMarks,
}) => {
  const {
    name,
    jobTitle,
    mobile,
    email,
    objective,
    father,
    mother,
    dob,
    nationality,
    permAddress,
    presAddress,
    religion,
    marital,
    height,
    weight,
    passport,
    issue,
    expiry,
    place,
    skills,
    showPhoto,
  } = extractCVFields(data, styleConfig);

  return (
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-corp-1 relative p-0 font-sans bg-white text-slate-800 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      {/* Full-width Corporate Header Banner */}
      <header className="bg-emerald-900 text-white px-8 py-5 flex justify-between items-center border-b-4 border-emerald-600">
        <div className="flex-1">
          <div className="text-[8pt] font-semibold tracking-widest text-emerald-300 uppercase mb-1">
            EXECUTIVE BIOGRAPHICAL DOSSIER
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wide text-white">
            {name}
          </h1>
          {jobTitle && (
            <p className="text-xs font-bold text-emerald-200 tracking-wider uppercase mt-1">
              {jobTitle}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[8.5pt] text-emerald-100">
            {mobile && <span>Tel: <strong className="text-white">{mobile}</strong></span>}
            {email && <span>Email: <strong className="text-white">{email}</strong></span>}
            {presAddress && <span>Address: {presAddress}</span>}
          </div>
        </div>

        {showPhoto && (
          <img
            src={data.photoUrl}
            alt={name}
            className="w-20 h-24 object-cover rounded-xs border-2 border-emerald-400 shadow-md ml-4 shrink-0"
          />
        )}
      </header>

      {/* 2-Column Split Body */}
      <div className="px-8 py-5 flex gap-6 flex-1">
        {/* Left Column (35% width): Passport, Identity, Skills, Languages */}
        <aside className="w-[35%] space-y-4">
          {/* Passport Badge Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded p-3">
            <h3 className="text-[9pt] font-extrabold text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-1 mb-2">
              PASSPORT PARTICULARS
            </h3>
            <div className="space-y-1.5 text-[8.5pt]">
              <div>
                <span className="text-[7.5pt] uppercase text-slate-500 font-bold block">Passport No</span>
                <strong className="font-mono text-emerald-950 text-[9.5pt]">{passport || 'N/A'}</strong>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-[7.5pt] uppercase text-slate-500 font-bold block">Issue Date</span>
                  <span>{issue || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[7.5pt] uppercase text-slate-500 font-bold block">Expiry Date</span>
                  <span className="text-rose-700 font-bold">{expiry || 'N/A'}</span>
                </div>
              </div>
              <div>
                <span className="text-[7.5pt] uppercase text-slate-500 font-bold block">Place of Issue</span>
                <span>{place || 'DHAKA'}</span>
              </div>
            </div>
          </div>

          {/* Personal Biodata */}
          <div className="border border-slate-200 rounded p-3">
            <h3 className="text-[9pt] font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              PERSONAL BIODATA
            </h3>
            <div className="space-y-1.5 text-[8pt] text-slate-700">
              <div><span className="text-slate-500 font-bold block text-[7pt]">FATHER</span> {father}</div>
              <div><span className="text-slate-500 font-bold block text-[7pt]">MOTHER</span> {mother}</div>
              <div><span className="text-slate-500 font-bold block text-[7pt]">DATE OF BIRTH</span> {dob}</div>
              <div><span className="text-slate-500 font-bold block text-[7pt]">NATIONALITY / RELIGION</span> {nationality || 'Bangladeshi'} / {religion || 'Islam'}</div>
              <div><span className="text-slate-500 font-bold block text-[7pt]">MARITAL / PHYSICAL</span> {marital} {height ? `• ${height}` : ''}</div>
              <div><span className="text-slate-500 font-bold block text-[7pt]">PERMANENT ADDRESS</span> {permAddress}</div>
            </div>
          </div>

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="border border-slate-200 rounded p-3">
              <h3 className="text-[9pt] font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                LANGUAGES
              </h3>
              <div className="space-y-1 text-[8pt]">
                {data.languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-slate-500">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && (
            <div className="border border-slate-200 rounded p-3">
              <h3 className="text-[9pt] font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                CORE EXPERTISE
              </h3>
              <div className="flex flex-wrap gap-1">
                {skills.split(',').map((s, idx) => (
                  <span key={idx} className="bg-emerald-100 text-emerald-900 text-[7.5pt] font-semibold px-2 py-0.5 rounded">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Column (65% width): Objective, Experience, Education */}
        <main className="w-[65%] flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            {objective && (
              <div>
                <h2 className="text-[9.5pt] font-extrabold uppercase text-emerald-900 tracking-wider border-b-2 border-emerald-800 pb-1 mb-2">
                  EXECUTIVE SUMMARY
                </h2>
                <p className="text-[9pt] text-slate-700 leading-relaxed text-justify">{objective}</p>
              </div>
            )}

            {data.experiences.length > 0 && (
              <div>
                <h2 className="text-[9.5pt] font-extrabold uppercase text-emerald-900 tracking-wider border-b-2 border-emerald-800 pb-1 mb-2">
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className="space-y-3">
                  {data.experiences.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-emerald-600 pl-3 py-0.5">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-[9.5pt] text-slate-900 uppercase">
                          {exp.project}
                        </h3>
                        <span className="text-[8pt] font-mono text-emerald-800 font-bold">{exp.duration}</span>
                      </div>
                      <div className="text-[8.5pt] text-slate-600 mt-0.5 flex gap-3">
                        <span>Country: <strong>{exp.country}</strong></span>
                        {exp.designation && <span>Designation: <strong className="text-slate-800">{exp.designation}</strong></span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.educations.length > 0 && (
              <div>
                <h2 className="text-[9.5pt] font-extrabold uppercase text-emerald-900 tracking-wider border-b-2 border-emerald-800 pb-1 mb-2">
                  EDUCATION & CREDENTIALS
                </h2>
                <div className="space-y-2">
                  {data.educations.map((edu) => (
                    <div key={edu.id} className="flex justify-between text-[8.5pt] border-b border-slate-100 pb-1">
                      <div>
                        <span className="font-bold text-slate-900">{edu.exam}</span>
                        <p className="text-[8pt] text-slate-500">{edu.inst} {edu.board ? `(${edu.board})` : ''}</p>
                      </div>
                      <span className="font-mono text-slate-600">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Signature */}
          {Boolean(data.showSignature) && (
            <div className="mt-auto pt-6 flex justify-end">
              <div className="text-right border-t border-slate-300 pt-1.5 min-w-36">
                <span className="font-bold text-xs uppercase block text-slate-900">
                  {data.signatureText !== undefined ? data.signatureText.trim() : name}
                </span>
                <p className="text-[7pt] text-slate-400 uppercase">CANDIDATE SIGNATURE</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
