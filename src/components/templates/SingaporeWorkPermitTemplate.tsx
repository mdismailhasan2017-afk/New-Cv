import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const SingaporeWorkPermitTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-tech-4 relative p-8 font-sans bg-white text-slate-800 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      <div className="space-y-3.5 flex-1">
        {/* Top Work Permit Meta Header */}
        <div className="border border-cyan-700 p-3 bg-cyan-50/50 flex justify-between items-center rounded-xs">
          <div>
            <div className="text-[7.5pt] font-mono font-bold text-cyan-800 uppercase tracking-widest">
              BCA / CIDB OVERSEAS WORKER REGISTRATION DOSSIER
            </div>
            <div className="text-[11pt] font-bold text-cyan-950 uppercase">
              SINGAPORE & MALAYSIA WORK PERMIT BIODATA
            </div>
          </div>
          <div className="text-right font-mono text-[8pt] text-slate-600">
            <div>REF: SG-{passport ? passport.slice(-6) : '880123'}</div>
            <div>DATE: {data.signatureDate || 'CURRENT'}</div>
          </div>
        </div>

      {/* Candidate Profile Section */}
      <div className="flex gap-4 items-start border-b border-cyan-600 pb-3 mb-3">
        {showPhoto ? (
          <img
            src={data.photoUrl}
            alt={name}
            className="w-20 h-24 object-cover border-2 border-cyan-700 rounded shadow-xs shrink-0"
          />
        ) : (
          <div className="w-20 h-24 border border-dashed border-cyan-400 bg-cyan-50 flex items-center justify-center text-[7pt] text-cyan-800 text-center shrink-0">
            PERMIT PHOTO
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-xl font-extrabold uppercase text-slate-900 leading-tight">
            {name}
          </h1>
          <div className="inline-block bg-cyan-700 text-white font-bold text-[8pt] px-2 py-0.5 rounded uppercase mt-1">
            TRADE: {jobTitle || 'CONSTRUCTION SPECIALIST'}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[8pt] text-slate-700 mt-2">
            <div><strong>Passport No:</strong> <span className="font-mono text-cyan-950 font-bold">{passport || 'N/A'}</span></div>
            <div><strong>Passport Expiry:</strong> <span className="font-mono text-rose-700 font-bold">{expiry || 'N/A'}</span></div>
            <div><strong>Contact No:</strong> {mobile}</div>
            <div><strong>Date of Birth:</strong> {dob}</div>
          </div>
        </div>
      </div>

      {/* Structured Overseas Work Record Table */}
      {data.experiences.length > 0 && (
        <div className="mb-3">
          <div className="bg-cyan-800 text-white font-bold text-[8pt] px-2.5 py-1 uppercase tracking-wider mb-1">
            OVERSEAS CONSTRUCTION & INDUSTRIAL SITE RECORD
          </div>
          <table className="w-full text-[8pt] border border-cyan-300">
            <thead>
              <tr className="bg-cyan-100 text-cyan-950 text-left border-b border-cyan-300">
                <th className="p-1 border-r border-cyan-300 w-8 text-center">SL</th>
                <th className="p-1 border-r border-cyan-300">MAIN CONTRACTOR / PROJECT</th>
                <th className="p-1 border-r border-cyan-300 w-28">COUNTRY</th>
                <th className="p-1 border-r border-cyan-300 w-28">TRADE / SCOPE</th>
                <th className="p-1 w-24">PERIOD</th>
              </tr>
            </thead>
            <tbody>
              {data.experiences.map((exp, i) => (
                <tr key={exp.id} className="border-b border-cyan-100">
                  <td className="p-1 border-r border-cyan-200 text-center font-bold">{i + 1}</td>
                  <td className="p-1 border-r border-cyan-200 font-medium text-slate-900">{exp.project}</td>
                  <td className="p-1 border-r border-cyan-200 font-bold text-cyan-900">{exp.country}</td>
                  <td className="p-1 border-r border-cyan-200">{exp.designation || '-'}</td>
                  <td className="p-1 font-mono">{exp.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trade Skills & Language Proficiency */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="border border-cyan-300 p-2 rounded">
          <div className="font-bold text-[8pt] uppercase text-cyan-900 border-b border-cyan-200 pb-1 mb-1">
            TRADE SKILLS (CIDB / BCA COMPLIANT)
          </div>
          <div className="flex flex-wrap gap-1">
            {skills ? (
              skills.split(',').map((s, idx) => (
                <span key={idx} className="bg-cyan-50 border border-cyan-200 text-cyan-900 text-[7.5pt] px-1.5 py-0.5 rounded">
                  {s.trim()}
                </span>
              ))
            ) : (
              <span className="text-[7.5pt] text-slate-500">General Technical Trade</span>
            )}
          </div>
        </div>

        <div className="border border-cyan-300 p-2 rounded">
          <div className="font-bold text-[8pt] uppercase text-cyan-900 border-b border-cyan-200 pb-1 mb-1">
            LANGUAGE PROFICIENCY
          </div>
          <div className="space-y-0.5 text-[7.5pt]">
            {data.languages.map((l) => (
              <div key={l.id} className="flex justify-between">
                <span className="font-semibold">{l.name}</span>
                <span className="text-slate-600">{l.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker Biodata Table */}
      <div className="mb-3">
        <div className="bg-cyan-800 text-white font-bold text-[8pt] px-2.5 py-1 uppercase tracking-wider mb-1">
          WORKER BIODATA & CITIZENSHIP
        </div>
        <table className="w-full text-[8pt] border border-cyan-200">
          <tbody>
            <tr className="border-b border-cyan-100">
              <td className="p-1 font-bold bg-cyan-50/50 w-32">Father's Name</td>
              <td className="p-1">: {father}</td>
              <td className="p-1 font-bold bg-cyan-50/50 w-32">Mother's Name</td>
              <td className="p-1">: {mother}</td>
            </tr>
            <tr className="border-b border-cyan-100">
              <td className="p-1 font-bold bg-cyan-50/50">Nationality</td>
              <td className="p-1">: {nationality || 'BANGLADESHI'}</td>
              <td className="p-1 font-bold bg-cyan-50/50">Marital / Religion</td>
              <td className="p-1">: {marital} / {religion}</td>
            </tr>
            <tr>
              <td className="p-1 font-bold bg-cyan-50/50">Permanent Address</td>
              <td className="p-1" colSpan={3}>: {permAddress}</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      {/* Work Permit Declaration & Signature */}
      <div className="mt-auto pt-3 border-t-2 border-cyan-700 flex justify-between items-end">
        <div className="text-[7pt] text-slate-500 uppercase">
          OFFICIAL WORK PERMIT APPLICATION DOSSIER
        </div>
        <div className="text-center min-w-36">
          {Boolean(data.showSignature) && (
            <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-xs uppercase">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </div>
          )}
          <span className="text-[7pt] uppercase text-slate-500 block">WORKER SIGNATURE</span>
        </div>
      </div>
    </div>
  );
};
