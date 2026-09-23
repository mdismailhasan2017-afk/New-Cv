import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const ClassicalFramedTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-corp-4 relative p-8 font-serif bg-white text-slate-900 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      {/* Classical Outer Perimeter Double Frame */}
      <div className="border-4 border-double border-slate-900 p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4 flex-1">
          {/* Formal Centered Header */}
          <div className="text-center pb-3 mb-4 border-b-2 border-slate-900 relative">
            {showPhoto && (
              <div className="absolute right-0 top-0">
                <img
                  src={data.photoUrl}
                  alt={name}
                  className="w-18 h-22 object-cover border border-slate-800 shadow-xs"
                />
              </div>
            )}
            <div className="text-[8pt] tracking-[0.25em] font-bold uppercase text-slate-600 mb-1">
              CURRICULUM VITAE & BIOGRAPHICAL RECORD
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
              {name}
            </h1>
            {jobTitle && (
              <p className="text-xs font-semibold tracking-widest text-slate-700 uppercase mt-0.5">
                {jobTitle}
              </p>
            )}
            <div className="text-[8.5pt] text-slate-700 mt-1.5 space-x-3">
              {mobile && <span>Telephone: {mobile}</span>}
              {email && <span>• Email: {email}</span>}
              {passport && <span>• Passport: <strong>{passport}</strong></span>}
            </div>
          </div>

          {/* Objective */}
          {objective && (
            <div className="mb-4">
              <h2 className="text-[9pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">
                I. PROFESSIONAL OBJECTIVE
              </h2>
              <p className="text-[9pt] leading-relaxed text-justify text-slate-800 pl-2">
                {objective}
              </p>
            </div>
          )}

          {/* Passport & Identity Table */}
          <div className="mb-4">
            <h2 className="text-[9pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">
              II. PASSPORT & CITIZENSHIP PARTICULARS
            </h2>
            <table className="w-full text-[8.5pt] border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-1.5 font-bold bg-slate-50 w-36 border-r border-slate-300">Passport Number</td>
                  <td className="p-1.5 border-r border-slate-300 font-bold font-mono">{passport || 'N/A'}</td>
                  <td className="p-1.5 font-bold bg-slate-50 w-36 border-r border-slate-300">Date of Expiry</td>
                  <td className="p-1.5 font-bold text-rose-900">{expiry || 'N/A'}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Date of Issue</td>
                  <td className="p-1.5 border-r border-slate-300">{issue || 'N/A'}</td>
                  <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Place of Issue</td>
                  <td className="p-1.5">{place || 'DHAKA'}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Date of Birth</td>
                  <td className="p-1.5 border-r border-slate-300">{dob || 'N/A'}</td>
                  <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Nationality</td>
                  <td className="p-1.5">{nationality || 'BANGLADESHI'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Work Experience Table */}
          {data.experiences.length > 0 && (
            <div className="mb-4">
              <h2 className="text-[9pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">
                III. EMPLOYMENT RECORD & OVERSEAS POSTINGS
              </h2>
              <table className="w-full text-[8.5pt] border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-left">
                    <th className="p-1.5 border-r border-slate-300 w-8 text-center">SL</th>
                    <th className="p-1.5 border-r border-slate-300">ORGANIZATION / PROJECT</th>
                    <th className="p-1.5 border-r border-slate-300 w-28">COUNTRY</th>
                    <th className="p-1.5 w-28">PERIOD</th>
                  </tr>
                </thead>
                <tbody>
                  {data.experiences.map((exp, i) => (
                    <tr key={exp.id} className="border-b border-slate-300">
                      <td className="p-1.5 border-r border-slate-300 text-center font-bold">{i + 1}</td>
                      <td className="p-1.5 border-r border-slate-300 font-medium">
                        {exp.project}
                        {exp.designation && <span className="block text-[8pt] text-slate-600">Role: {exp.designation}</span>}
                      </td>
                      <td className="p-1.5 border-r border-slate-300">{exp.country}</td>
                      <td className="p-1.5">{exp.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Education Table */}
          {data.educations.length > 0 && (
            <div className="mb-4">
              <h2 className="text-[9pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">
                IV. ACADEMIC QUALIFICATIONS
              </h2>
              <table className="w-full text-[8.5pt] border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-left">
                    <th className="p-1.5 border-r border-slate-300">CERTIFICATE / EXAMINATION</th>
                    <th className="p-1.5 border-r border-slate-300">INSTITUTION / BOARD</th>
                    <th className="p-1.5 w-20 text-center">YEAR</th>
                  </tr>
                </thead>
                <tbody>
                  {data.educations.map((edu) => (
                    <tr key={edu.id} className="border-b border-slate-300">
                      <td className="p-1.5 border-r border-slate-300 font-bold">{edu.exam}</td>
                      <td className="p-1.5 border-r border-slate-300">{edu.inst} {edu.board ? `(${edu.board})` : ''}</td>
                      <td className="p-1.5 text-center">{edu.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Personal Particulars */}
          <div className="mb-4">
            <h2 className="text-[9pt] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">
              V. BIODATA & ADDRESS
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[8pt] text-slate-700">
              <div>Father: <strong>{father}</strong></div>
              <div>Mother: <strong>{mother}</strong></div>
              <div>Religion / Marital: {religion} / {marital}</div>
              <div>Permanent Address: {permAddress}</div>
            </div>
          </div>
        </div>

        {/* Bottom Attestation & Signature */}
        <div className="mt-auto pt-4 border-t-2 border-slate-900 flex justify-between items-end">
          <div className="text-[7pt] text-slate-500 uppercase">
            CERTIFIED FORMAL CURRICULUM VITAE
          </div>
          <div className="text-center min-w-36">
            {Boolean(data.showSignature) && (
              <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-xs uppercase">
                {data.signatureText !== undefined ? data.signatureText.trim() : name}
              </div>
            )}
            <span className="text-[7pt] uppercase text-slate-500 block">CANDIDATE SIGNATURE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
