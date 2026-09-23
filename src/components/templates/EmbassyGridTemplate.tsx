import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const EmbassyGridTemplate: React.FC<TemplateProps> = ({
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

  const hasDesignation = data.experiences.some((exp) => Boolean(exp.designation && exp.designation.trim() !== ''));

  return (
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-gulf-3 relative p-8 font-serif bg-white text-slate-900 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}
      
      <div className="space-y-3 flex-1">
        {/* Official Top Form Header */}
        <div className="border-2 border-slate-900 p-2 text-center mb-3 bg-slate-100">
          <div className="text-[10pt] font-bold tracking-widest uppercase">GOVERNMENT EMBASSY & IMMIGRATION PARTICULARS</div>
          <div className="text-[8pt] text-slate-600 uppercase">OFFICIAL MANPOWER CANDIDATE BIODATA MATRIX</div>
        </div>

      {/* Top Part: Candidate Details + Embedded Photo Cell */}
      <table className="w-full border-collapse border-2 border-slate-900 mb-3 text-[9pt]">
        <tbody>
          <tr>
            <td className="w-32 bg-slate-100 font-bold p-2 border border-slate-400">FULL NAME</td>
            <td className="p-2 border border-slate-400 font-bold uppercase text-[10.5pt]" colSpan={showPhoto ? 1 : 2}>
              {name}
              {jobTitle && <span className="block text-[8.5pt] text-slate-600 font-normal">POST APPLIED: {jobTitle}</span>}
            </td>
            {showPhoto && (
              <td className="w-28 p-1 border-2 border-slate-900 text-center align-middle" rowSpan={4}>
                <img
                  src={data.photoUrl}
                  alt={name}
                  className="w-24 h-28 object-cover mx-auto border border-slate-400 shadow-xs"
                />
              </td>
            )}
          </tr>
          <tr>
            <td className="bg-slate-100 font-bold p-1.5 border border-slate-400">PASSPORT NO.</td>
            <td className="p-1.5 border border-slate-400 font-mono font-bold text-[10pt] text-blue-900">
              {passport || 'N/A'} (EXPIRY: {expiry || 'N/A'})
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 font-bold p-1.5 border border-slate-400">CONTACT NO.</td>
            <td className="p-1.5 border border-slate-400 font-semibold">
              {mobile} {email ? ` | ${email}` : ''}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 font-bold p-1.5 border border-slate-400">NATIONALITY / RELIGION</td>
            <td className="p-1.5 border border-slate-400">
              {nationality || 'BANGLADESHI'} | {religion || 'ISLAM'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section: Passport & Personal Grid */}
      <div className="bg-slate-900 text-white font-bold px-2 py-1 text-[9pt] uppercase tracking-wider mb-1">
        1. PASSPORT & CITIZENSHIP RECORD
      </div>
      <table className="w-full border-collapse border border-slate-400 mb-3 text-[8.5pt]">
        <tbody>
          <tr className="border-b border-slate-300">
            <td className="w-36 bg-slate-50 font-bold p-1.5 border-r border-slate-300">Place of Issue</td>
            <td className="p-1.5 border-r border-slate-300">{place || 'DHAKA'}</td>
            <td className="w-36 bg-slate-50 font-bold p-1.5 border-r border-slate-300">Date of Issue</td>
            <td className="p-1.5">{issue || 'N/A'}</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="bg-slate-50 font-bold p-1.5 border-r border-slate-300">Date of Birth</td>
            <td className="p-1.5 border-r border-slate-300">{dob || 'N/A'}</td>
            <td className="bg-slate-50 font-bold p-1.5 border-r border-slate-300">Marital Status</td>
            <td className="p-1.5">{marital || 'N/A'}</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="bg-slate-50 font-bold p-1.5 border-r border-slate-300">Father's Name</td>
            <td className="p-1.5 border-r border-slate-300">{father}</td>
            <td className="bg-slate-50 font-bold p-1.5 border-r border-slate-300">Mother's Name</td>
            <td className="p-1.5">{mother}</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="bg-slate-50 font-bold p-1.5 border-r border-slate-300">Height / Weight</td>
            <td className="p-1.5 border-r border-slate-300">{height} {weight ? `/ ${weight}` : ''}</td>
            <td className="bg-slate-50 font-bold p-1.5 border-r border-slate-300">National ID (NID)</td>
            <td className="p-1.5">{data.personalNo || 'N/A'}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 font-bold p-1.5 border-r border-slate-300">Permanent Address</td>
            <td className="p-1.5" colSpan={3}>{permAddress}</td>
          </tr>
        </tbody>
      </table>

      {/* Section: Employment Experience Grid */}
      {data.experiences.length > 0 && (
        <>
          <div className="bg-slate-900 text-white font-bold px-2 py-1 text-[9pt] uppercase tracking-wider mb-1">
            2. EMPLOYMENT & OVERSEAS TRADE EXPERIENCE
          </div>
          <table className="w-full border-collapse border border-slate-400 mb-3 text-[8.5pt]">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-400 text-left">
                <th className="p-1.5 border-r border-slate-300 w-8 text-center">SL</th>
                <th className="p-1.5 border-r border-slate-300">EMPLOYER / PROJECT</th>
                <th className="p-1.5 border-r border-slate-300 w-28">COUNTRY</th>
                {hasDesignation && <th className="p-1.5 border-r border-slate-300 w-32">TRADE / ROLE</th>}
                <th className="p-1.5 w-28">PERIOD</th>
              </tr>
            </thead>
            <tbody>
              {data.experiences.map((exp, i) => (
                <tr key={exp.id} className="border-b border-slate-300">
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold">{i + 1}</td>
                  <td className="p-1.5 border-r border-slate-300 font-medium">{exp.project}</td>
                  <td className="p-1.5 border-r border-slate-300">{exp.country}</td>
                  {hasDesignation && <td className="p-1.5 border-r border-slate-300 font-semibold">{exp.designation || '-'}</td>}
                  <td className="p-1.5">{exp.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Section: Academic Record Grid */}
      {data.educations.length > 0 && (
        <>
          <div className="bg-slate-900 text-white font-bold px-2 py-1 text-[9pt] uppercase tracking-wider mb-1">
            3. ACADEMIC QUALIFICATIONS
          </div>
          <table className="w-full border-collapse border border-slate-400 mb-3 text-[8.5pt]">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-400 text-left">
                <th className="p-1.5 border-r border-slate-300 w-8 text-center">SL</th>
                <th className="p-1.5 border-r border-slate-300">EXAMINATION</th>
                <th className="p-1.5 border-r border-slate-300">INSTITUTION / BOARD</th>
                <th className="p-1.5 w-20 text-center">YEAR</th>
              </tr>
            </thead>
            <tbody>
              {data.educations.map((edu, i) => (
                <tr key={edu.id} className="border-b border-slate-300">
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold">{i + 1}</td>
                  <td className="p-1.5 border-r border-slate-300 font-bold">{edu.exam}</td>
                  <td className="p-1.5 border-r border-slate-300">{edu.inst} {edu.board ? `(${edu.board})` : ''}</td>
                  <td className="p-1.5 text-center">{edu.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Section: Skills & Languages */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {data.languages.length > 0 && (
          <div className="border border-slate-400 p-2">
            <div className="font-bold text-[8.5pt] uppercase border-b border-slate-300 pb-1 mb-1">LANGUAGES</div>
            <div className="space-y-1 text-[8pt]">
              {data.languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-semibold">{l.name}</span>
                  <span className="text-slate-600">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {skills && (
          <div className="border border-slate-400 p-2">
            <div className="font-bold text-[8.5pt] uppercase border-b border-slate-300 pb-1 mb-1">TECHNICAL SKILLS</div>
            <p className="text-[8pt] text-slate-700 leading-tight">{skills}</p>
          </div>
        )}
      </div>
      </div>

      {/* Embassy Grid Attestation & Signature */}
      <div className="mt-auto border-t-2 border-slate-900 pt-3 flex justify-between items-end">
        <div className="text-[7.5pt] text-slate-500 uppercase border border-slate-300 p-2 w-48 text-center">
          OFFICIAL EMBASSY VERIFICATION SEAL
        </div>
        <div className="text-center min-w-40">
          {Boolean(data.showSignature) && (
            <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-xs uppercase">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </div>
          )}
          <span className="text-[7.5pt] uppercase text-slate-500 block">CANDIDATE SIGNATURE</span>
        </div>
      </div>
    </div>
  );
};
