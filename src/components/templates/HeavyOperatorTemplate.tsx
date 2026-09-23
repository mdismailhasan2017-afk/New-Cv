import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const HeavyOperatorTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-gulf-6 relative p-8 font-sans bg-white text-slate-900 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      <div className="space-y-4 flex-1">
        {/* Heavy Machinery Top Header */}
        <div className="border-l-8 border-orange-600 bg-slate-900 text-white p-5 flex justify-between items-center rounded-xs">
          <div>
            <span className="text-[8pt] font-mono font-bold tracking-widest text-orange-400 uppercase bg-slate-800 px-2 py-0.5 rounded-xs">
              GCC HEAVY EQUIPMENT & TRANSPORT DOSSIER
            </span>
            <h1 className="text-2xl font-black uppercase text-white tracking-wide mt-1">
              {name}
            </h1>
            <div className="inline-block bg-orange-600 text-white font-extrabold text-[8.5pt] px-2 py-0.5 rounded-xs uppercase mt-1">
              {jobTitle || 'HEAVY VEHICLE DRIVER / OPERATOR'}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[8.5pt] text-slate-300">
              {mobile && <span>Mob: <strong className="text-white">{mobile}</strong></span>}
              {email && <span>Email: <strong className="text-white">{email}</strong></span>}
              {passport && <span>Passport: <strong className="text-orange-300 font-mono">{passport}</strong></span>}
            </div>
          </div>

          {showPhoto && (
            <img
              src={data.photoUrl}
              alt={name}
              className="w-20 h-24 object-cover border-2 border-orange-500 rounded-xs shadow-sm shrink-0 ml-4"
            />
          )}
        </div>

      {/* Operator License & Equipment Specialization Box */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded p-3 mb-4">
        <h2 className="text-[9pt] font-black uppercase text-orange-950 tracking-wider flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 bg-orange-600 rounded-xs" />
          OPERATOR LICENSE & MACHINE COMPETENCIES
        </h2>
        <div className="grid grid-cols-3 gap-2 text-[8.5pt]">
          <div className="bg-white border border-orange-200 p-1.5 rounded">
            <span className="text-[7pt] font-bold text-slate-400 block uppercase">MACHINE / TRADE</span>
            <strong className="text-slate-900">{jobTitle || 'Heavy Equipment Operator'}</strong>
          </div>
          <div className="bg-white border border-orange-200 p-1.5 rounded">
            <span className="text-[7pt] font-bold text-slate-400 block uppercase">PHYSICAL METRICS</span>
            <strong className="text-slate-900">{height || 'Standard'} {weight ? `/ ${weight}` : ''}</strong>
          </div>
          <div className="bg-white border border-orange-200 p-1.5 rounded">
            <span className="text-[7pt] font-bold text-slate-400 block uppercase">PASSPORT VALIDITY</span>
            <strong className="text-rose-700 font-mono">EXP: {expiry || 'N/A'}</strong>
          </div>
        </div>
      </div>

      {/* Work & Project Site Record */}
      {data.experiences.length > 0 && (
        <div className="mb-4">
          <div className="bg-slate-900 text-white font-bold text-[8.5pt] px-3 py-1 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>OVERSEAS PROJECT & DRIVING EXPERIENCE</span>
            <span className="text-orange-400 font-mono">SITE VERIFIED</span>
          </div>
          <table className="w-full text-[8.5pt] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-left">
                <th className="p-1.5 border-r border-slate-300 w-8 text-center">SL</th>
                <th className="p-1.5 border-r border-slate-300">COMPANY / PROJECT SITE</th>
                <th className="p-1.5 border-r border-slate-300 w-28">COUNTRY</th>
                <th className="p-1.5 border-r border-slate-300 w-32">TRADE / ROLE</th>
                <th className="p-1.5 w-28">DURATION</th>
              </tr>
            </thead>
            <tbody>
              {data.experiences.map((exp, i) => (
                <tr key={exp.id} className="border-b border-slate-200">
                  <td className="p-1.5 border-r border-slate-200 text-center font-bold">{i + 1}</td>
                  <td className="p-1.5 border-r border-slate-200 font-medium text-slate-900">{exp.project}</td>
                  <td className="p-1.5 border-r border-slate-200 font-bold text-orange-950">{exp.country}</td>
                  <td className="p-1.5 border-r border-slate-200 font-semibold">{exp.designation || '-'}</td>
                  <td className="p-1.5 font-mono">{exp.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Passport Particulars */}
      <div className="mb-4">
        <div className="bg-slate-900 text-white font-bold text-[8.5pt] px-3 py-1 uppercase tracking-wider mb-1.5">
          PASSPORT & IMMIGRATION RECORD
        </div>
        <table className="w-full text-[8.5pt] border border-slate-300">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-1.5 font-bold bg-slate-50 w-36">Passport Number</td>
              <td className="p-1.5 font-mono font-bold text-slate-900">: {passport || 'N/A'}</td>
              <td className="p-1.5 font-bold bg-slate-50 w-36">Place of Issue</td>
              <td className="p-1.5">: {place || 'DHAKA'}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-1.5 font-bold bg-slate-50">Date of Issue</td>
              <td className="p-1.5">: {issue || 'N/A'}</td>
              <td className="p-1.5 font-bold bg-slate-50">Date of Expiry</td>
              <td className="p-1.5 font-bold text-rose-700">: {expiry || 'N/A'}</td>
            </tr>
            <tr>
              <td className="p-1.5 font-bold bg-slate-50">Father's Name</td>
              <td className="p-1.5">: {father}</td>
              <td className="p-1.5 font-bold bg-slate-50">Date of Birth</td>
              <td className="p-1.5">: {dob}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Skills & Equipment Matrix */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border border-slate-300 p-2.5 rounded">
          <div className="font-bold text-[8.5pt] uppercase text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
            EQUIPMENT & TECHNICAL SKILLS
          </div>
          <div className="flex flex-wrap gap-1">
            {skills ? (
              skills.split(',').map((s, idx) => (
                <span key={idx} className="bg-slate-800 text-orange-300 text-[7.5pt] font-mono px-2 py-0.5 rounded">
                  {s.trim()}
                </span>
              ))
            ) : (
              <span className="text-[8pt] text-slate-500">Heavy Equipment Driving</span>
            )}
          </div>
        </div>

        <div className="border border-slate-300 p-2.5 rounded">
          <div className="font-bold text-[8.5pt] uppercase text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
            LANGUAGES
          </div>
          <div className="space-y-1 text-[8pt]">
            {data.languages.map((l) => (
              <div key={l.id} className="flex justify-between">
                <span className="font-semibold">{l.name}</span>
                <span className="text-slate-600">{l.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Declaration & Operator Signature */}
      <div className="mt-auto pt-4 border-t-2 border-orange-600 flex justify-between items-end">
        <div className="text-[7.5pt] text-slate-500">
          HEAVY TRANSPORT & OPERATOR CREDENTIALS VERIFIED
        </div>
        <div className="text-center min-w-36">
          {Boolean(data.showSignature) && (
            <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-xs uppercase">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </div>
          )}
          <span className="text-[7pt] uppercase text-slate-500 block">OPERATOR SIGNATURE</span>
        </div>
      </div>
    </div>
  );
};
