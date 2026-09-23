import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const ExecutiveEditorialTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-corp-2 relative p-8 font-serif bg-white text-slate-900 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      <div className="space-y-4 flex-1">
        {/* Classic Editorial Centered Header */}
        <header className="text-center pb-3 mb-4 border-b-2 border-slate-900 relative">
          {showPhoto && (
            <div className="absolute right-0 top-0">
              <img
                src={data.photoUrl}
                alt={name}
                className="w-18 h-22 object-cover border border-slate-400 shadow-xs"
              />
            </div>
          )}
          <h1 className="text-2xl font-normal tracking-[0.2em] uppercase text-slate-900 mb-1">
            {name}
          </h1>
          {jobTitle && (
            <p className="text-xs italic tracking-widest text-slate-600 uppercase mb-1.5">
              {jobTitle}
            </p>
          )}
          <div className="text-[8.5pt] tracking-wider text-slate-700 space-x-3">
            {mobile && <span>Tel: {mobile}</span>}
            {email && <span>• Email: {email}</span>}
            {presAddress && <span>• Address: {presAddress}</span>}
          </div>
          {passport && (
            <div className="text-[8pt] text-slate-600 mt-1">
              Passport: <span className="font-mono font-bold text-slate-900">{passport}</span> | Issued: {issue || 'N/A'} | Expires: {expiry || 'N/A'}
            </div>
          )}
        </header>

        {/* Executive Summary */}
        {objective && (
          <section className="mb-4">
            <h2 className="text-[8.5pt] font-bold tracking-widest uppercase text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
              Executive Profile & Career Focus
            </h2>
            <p className="text-[9pt] leading-relaxed text-justify text-slate-800 italic">
              "{objective}"
            </p>
          </section>
        )}

        {/* Professional Experience */}
        {data.experiences.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[8.5pt] font-bold tracking-widest uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2.5">
              Professional Experience & Career History
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[9.5pt] text-slate-900">
                      {exp.project}
                    </span>
                    <span className="text-[8.5pt] text-slate-700 italic font-mono">{exp.duration}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[8.5pt] text-slate-600">
                    <span>{exp.designation ? `${exp.designation}, ` : ''}{exp.country}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Academic Background */}
        {data.educations.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[8.5pt] font-bold tracking-widest uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2.5">
              Education & Academic Background
            </h2>
            <div className="space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-[8.5pt]">
                  <div>
                    <strong className="text-slate-900">{edu.exam}</strong>
                    <span className="text-slate-600"> — {edu.inst} {edu.board ? `(${edu.board})` : ''}</span>
                  </div>
                  <span className="text-[8.5pt] text-slate-700 italic font-mono">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Competencies */}
        {skills && (
          <section className="mb-4">
            <h2 className="text-[8.5pt] font-bold tracking-widest uppercase text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
              Key Competencies & Specialized Skills
            </h2>
            <p className="text-[8.5pt] text-slate-800 leading-relaxed">
              {skills}
            </p>
          </section>
        )}

        {/* Personal Particulars */}
        <section className="border-t border-slate-300 pt-3">
          <h2 className="text-[8.5pt] font-bold tracking-widest uppercase text-slate-900 mb-2">
            Personal & Immigration Particulars
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[8.5pt] text-slate-700">
            <div><strong>Father's Name:</strong> {father}</div>
            <div><strong>Mother's Name:</strong> {mother}</div>
            <div><strong>Date of Birth:</strong> {dob}</div>
            <div><strong>Nationality:</strong> {nationality || 'Bangladeshi'}</div>
            <div><strong>Marital Status / Religion:</strong> {marital} / {religion}</div>
            <div><strong>Permanent Address:</strong> {permAddress}</div>
          </div>
        </section>
      </div>

      {/* Formal Signature */}
      {Boolean(data.showSignature) && (
        <div className="mt-auto pt-6 flex justify-end">
          <div className="text-center border-t border-slate-900 pt-1.5 min-w-40">
            <span className="font-bold text-xs uppercase block text-slate-900">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </span>
            <p className="text-[7pt] text-slate-500 uppercase tracking-widest">Candidate Signature</p>
          </div>
        </div>
      )}
    </div>
  );
};
