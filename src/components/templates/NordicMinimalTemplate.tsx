import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const NordicMinimalTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-tech-2 relative p-8 font-sans bg-white text-slate-800 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      <div className="space-y-4 flex-1">
        {/* Header */}
        <header className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-slate-900 uppercase">
              <strong className="font-extrabold">{name.split(' ')[0]}</strong> {name.split(' ').slice(1).join(' ')}
            </h1>
            {jobTitle && (
              <p className="text-xs font-bold tracking-widest text-slate-600 uppercase mt-1">
                {jobTitle}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-[8.5pt] text-slate-600">
              {mobile && <span>Tel: <strong className="text-slate-900">{mobile}</strong></span>}
              {email && <span>Email: <strong className="text-slate-900">{email}</strong></span>}
              {presAddress && <span>Location: {presAddress}</span>}
              {passport && <span>Passport: <strong className="text-slate-900 font-mono">{passport}</strong></span>}
            </div>
          </div>

          {showPhoto && (
            <img
              src={data.photoUrl}
              alt={name}
              className="w-20 h-24 object-cover rounded-sm border border-slate-300 shadow-xs ml-4 shrink-0"
            />
          )}
        </header>

        {/* Summary / Objective */}
        {objective && (
          <section className="mb-4">
            <h2 className="text-[8.5pt] font-extrabold tracking-widest uppercase text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
              Professional Profile
            </h2>
            <p className="text-[9pt] text-slate-700 leading-relaxed text-justify">{objective}</p>
          </section>
        )}

        {/* Experience - Clean Minimalist Timeline without bulky tables */}
        {data.experiences.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[8.5pt] font-extrabold tracking-widest uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
              Work Experience & Overseas Postings
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-slate-900 pl-3 py-0.5">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[9.5pt] font-bold text-slate-900">
                      {exp.project}
                      {exp.designation && <span className="font-normal text-slate-600"> — {exp.designation}</span>}
                    </h3>
                    <span className="text-[8.5pt] text-slate-700 font-mono font-bold tracking-tight">{exp.duration}</span>
                  </div>
                  <div className="text-[8.5pt] text-slate-500 mt-0.5">
                    <span>Country: <strong className="text-slate-800">{exp.country}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.educations.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[8.5pt] font-extrabold tracking-widest uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
              Education & Credentials
            </h2>
            <div className="space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline border-b border-slate-100 pb-1">
                  <div>
                    <h3 className="text-[9pt] font-bold text-slate-900">{edu.exam}</h3>
                    <p className="text-[8pt] text-slate-600">{edu.inst} {edu.board ? `(${edu.board})` : ''}</p>
                  </div>
                  <span className="text-[8.5pt] text-slate-600 font-mono">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Languages in Modern Tag Style */}
        <section className="mb-4 grid grid-cols-2 gap-6 pt-2 border-t border-slate-200">
          <div>
            <h2 className="text-[8.5pt] font-extrabold tracking-widest uppercase text-slate-900 mb-2">Technical Skills & Expertise</h2>
            {skills ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.split(',').map((s, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-800 text-[8pt] font-medium px-2.5 py-1 rounded border border-slate-200">
                    {s.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[8.5pt] text-slate-500">General Technical Work</p>
            )}
          </div>

          <div>
            <h2 className="text-[8.5pt] font-extrabold tracking-widest uppercase text-slate-900 mb-2">Language Proficiency</h2>
            {data.languages.length > 0 ? (
              <div className="space-y-1.5 text-[8.5pt]">
                {data.languages.map((l) => (
                  <div key={l.id} className="flex justify-between text-slate-700 border-b border-slate-100 pb-0.5">
                    <span className="font-semibold text-slate-900">{l.name}</span>
                    <span className="text-slate-600 font-medium">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[8.5pt] text-slate-500">English, Bengali</p>
            )}
          </div>
        </section>

        {/* Personal Particulars in Structured Card */}
        <section className="border-t border-slate-200 pt-3">
          <h2 className="text-[8.5pt] font-extrabold tracking-widest uppercase text-slate-900 mb-2">Personal & Passport Records</h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[8pt] text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div><span className="text-slate-400 block uppercase text-[7pt] font-bold">Passport No</span> {passport || 'N/A'} (Exp: {expiry || 'N/A'})</div>
            <div><span className="text-slate-400 block uppercase text-[7pt] font-bold">Place of Issue</span> {place || 'Dhaka'} (Iss: {issue || 'N/A'})</div>
            <div><span className="text-slate-400 block uppercase text-[7pt] font-bold">Date of Birth</span> {dob || 'N/A'}</div>
            <div><span className="text-slate-400 block uppercase text-[7pt] font-bold">Nationality / Religion</span> {nationality || 'Bangladeshi'} / {religion || 'Islam'}</div>
            <div><span className="text-slate-400 block uppercase text-[7pt] font-bold">Parents' Names</span> {father} / {mother}</div>
            <div><span className="text-slate-400 block uppercase text-[7pt] font-bold">Marital / Physical</span> {marital} {height ? `• ${height}` : ''}</div>
          </div>
          {permAddress && (
            <div className="text-[8pt] text-slate-600 mt-2 pl-1">
              <span className="text-slate-400 font-bold uppercase text-[7pt] inline mr-2">Permanent Address:</span>
              {permAddress}
            </div>
          )}
        </section>
      </div>

      {/* Signature */}
      {Boolean(data.showSignature) && (
        <div className="mt-auto pt-6 flex justify-end">
          <div className="text-right border-t-2 border-slate-900 pt-2 min-w-40">
            <span className="font-bold text-xs uppercase block text-slate-900">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </span>
            <p className="text-[7pt] text-slate-400 uppercase tracking-widest">Candidate Signature</p>
          </div>
        </div>
      )}
    </div>
  );
};
