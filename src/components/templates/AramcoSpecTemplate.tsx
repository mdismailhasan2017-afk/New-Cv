import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const AramcoSpecTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-tech-5 relative p-8 font-sans bg-white text-slate-800 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      <div className="space-y-4 flex-1">
        {/* Engineering Drawing / Spec Sheet Title Block Header */}
        <div className="border-2 border-indigo-950 p-3 bg-indigo-50/40">
        <div className="flex justify-between items-center border-b border-indigo-200 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-indigo-900" />
            <span className="text-[8.5pt] font-mono font-bold tracking-widest text-indigo-950 uppercase">
              OIL & GAS INDUSTRIAL TECHNICAL SPECIFICATION
            </span>
          </div>
          <span className="text-[8pt] font-mono bg-indigo-900 text-white px-2 py-0.5 rounded font-bold">
            ARAMCO / SABIC SPEC
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-indigo-950 leading-tight">
              {name}
            </h1>
            <div className="text-xs font-bold text-indigo-800 uppercase tracking-wide mt-0.5">
              DISCIPLINE: {jobTitle || 'TECHNICAL SPECIALIST'}
            </div>
          </div>
          {showPhoto && (
            <img
              src={data.photoUrl}
              alt={name}
              className="w-18 h-22 object-cover border border-indigo-900 rounded-sm shadow-xs"
            />
          )}
        </div>
      </div>

      {/* HSE & Site Safety Compliance Block */}
      <div className="border border-indigo-300 bg-indigo-50/20 p-2.5 rounded mb-4">
        <div className="flex justify-between items-center text-[8pt] text-indigo-950 font-bold uppercase mb-1">
          <span>HSE & PLANT SAFETY COMPLIANCE PROFILE</span>
          <span className="font-mono text-emerald-700">FIT FOR OIL & GAS SITE DUTY</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-[8pt]">
          <div className="bg-white border border-indigo-200 p-1.5 rounded">
            <span className="text-[7pt] text-slate-400 block uppercase font-bold">Passport ID</span>
            <span className="font-mono font-bold text-indigo-950">{passport || 'N/A'}</span>
          </div>
          <div className="bg-white border border-indigo-200 p-1.5 rounded">
            <span className="text-[7pt] text-slate-400 block uppercase font-bold">Passport Expiry</span>
            <span className="font-mono font-bold text-rose-700">{expiry || 'N/A'}</span>
          </div>
          <div className="bg-white border border-indigo-200 p-1.5 rounded">
            <span className="text-[7pt] text-slate-400 block uppercase font-bold">Emergency Tel</span>
            <span className="font-bold">{mobile || 'N/A'}</span>
          </div>
          <div className="bg-white border border-indigo-200 p-1.5 rounded">
            <span className="text-[7pt] text-slate-400 block uppercase font-bold">Nationality</span>
            <span className="font-bold">{nationality || 'BANGLADESHI'}</span>
          </div>
        </div>
      </div>

      {/* Scope / Summary */}
      {objective && (
        <div className="mb-4">
          <div className="text-[8.5pt] font-extrabold uppercase text-indigo-950 tracking-wider border-b border-indigo-950 pb-0.5 mb-1">
            EXECUTIVE TECHNICAL SUMMARY
          </div>
          <p className="text-[8.5pt] text-slate-700 leading-relaxed text-justify">
            {objective}
          </p>
        </div>
      )}

      {/* Oil & Gas / Refinery Work History */}
      {data.experiences.length > 0 && (
        <div className="mb-4">
          <div className="text-[8.5pt] font-extrabold uppercase text-indigo-950 tracking-wider border-b border-indigo-950 pb-0.5 mb-1.5">
            PLANT, REFINERY & SHUTDOWN PROJECT RECORD
          </div>
          <table className="w-full text-[8pt] border border-slate-300">
            <thead>
              <tr className="bg-indigo-950 text-white text-left">
                <th className="p-1.5 w-8 text-center">SL</th>
                <th className="p-1.5">CLIENT / REFINERY PROJECT</th>
                <th className="p-1.5 w-28">LOCATION</th>
                <th className="p-1.5 w-32">TRADE / ROLE</th>
                <th className="p-1.5 w-24">DURATION</th>
              </tr>
            </thead>
            <tbody>
              {data.experiences.map((exp, i) => (
                <tr key={exp.id} className="border-b border-slate-200">
                  <td className="p-1.5 text-center font-bold">{i + 1}</td>
                  <td className="p-1.5 font-medium text-slate-900">{exp.project}</td>
                  <td className="p-1.5 font-semibold text-indigo-900">{exp.country}</td>
                  <td className="p-1.5">{exp.designation || '-'}</td>
                  <td className="p-1.5 font-mono">{exp.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Technical Competencies & Education */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-[8.5pt] font-extrabold uppercase text-indigo-950 tracking-wider border-b border-indigo-950 pb-0.5 mb-1.5">
            TECHNICAL COMPETENCIES
          </div>
          <div className="flex flex-wrap gap-1">
            {skills ? (
              skills.split(',').map((s, idx) => (
                <span key={idx} className="bg-indigo-900 text-indigo-100 text-[7.5pt] px-2 py-0.5 rounded font-mono">
                  {s.trim()}
                </span>
              ))
            ) : (
              <span className="text-[8pt] text-slate-500">Refinery Technical Operations</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-[8.5pt] font-extrabold uppercase text-indigo-950 tracking-wider border-b border-indigo-950 pb-0.5 mb-1.5">
            ACADEMIC & TRADE CERTIFICATIONS
          </div>
          <div className="space-y-1 text-[8pt]">
            {data.educations.map((edu) => (
              <div key={edu.id} className="flex justify-between border-b border-slate-100 pb-0.5">
                <span className="font-semibold text-slate-900">{edu.exam}</span>
                <span className="font-mono text-slate-500">{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Data */}
        <div className="border border-slate-300 p-2 text-[8pt]">
          <div className="grid grid-cols-3 gap-2">
            <div><span className="text-slate-500">Father:</span> <strong>{father}</strong></div>
            <div><span className="text-slate-500">Mother:</span> <strong>{mother}</strong></div>
            <div><span className="text-slate-500">Date of Birth:</span> {dob}</div>
            <div><span className="text-slate-500">Place of Issue:</span> {place || 'DHAKA'}</div>
            <div><span className="text-slate-500">Marital / Religion:</span> {marital} / {religion}</div>
            <div><span className="text-slate-500">Address:</span> {permAddress}</div>
          </div>
        </div>
      </div>

      {/* Engineering Sign-off Box */}
      <div className="mt-auto pt-3 border-t-2 border-indigo-950 flex justify-between items-end">
        <div className="text-[7pt] text-slate-500 font-mono">
          QA / QC TECHNICAL SPECIFICATION APPROVED
        </div>
        <div className="text-center min-w-36">
          {Boolean(data.showSignature) && (
            <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-xs uppercase">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </div>
          )}
          <span className="text-[7pt] uppercase text-slate-500 block">SPECIALIST SIGNATURE</span>
        </div>
      </div>
    </div>
  );
};
