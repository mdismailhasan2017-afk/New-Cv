import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const IndustrialTimelineTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-tech-3 relative p-8 font-sans bg-white text-slate-800 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      <div className="space-y-4 flex-1">
        {/* Industrial Header Banner */}
        <div className="bg-slate-900 text-white p-5 rounded-sm flex justify-between items-center border-b-4 border-amber-500">
          <div>
            <div className="text-[8.5pt] font-mono text-amber-400 font-bold tracking-widest uppercase">
              TECHNICAL & TRADES DOSSIER
            </div>
            <h1 className="text-2xl font-black tracking-wide uppercase text-white mt-0.5">
              {name}
            </h1>
            {jobTitle && (
              <span className="inline-block bg-amber-500 text-slate-950 font-extrabold text-[8.5pt] px-2.5 py-0.5 rounded-xs uppercase tracking-wider mt-1.5">
                {jobTitle}
              </span>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[8.5pt] text-slate-300">
              {mobile && <span>Mob: <strong className="text-white">{mobile}</strong></span>}
              {email && <span>Email: <strong className="text-white">{email}</strong></span>}
              {passport && <span>Passport: <strong className="text-amber-300 font-mono">{passport}</strong></span>}
            </div>
          </div>

          {showPhoto && (
            <img
              src={data.photoUrl}
              alt={name}
              className="w-20 h-24 object-cover rounded-xs border-2 border-amber-500 shadow-md ml-4 shrink-0"
            />
          )}
        </div>

        {/* Main Container */}
        <div className="bg-white p-4 rounded-b-sm border border-slate-200 shadow-xs space-y-4">
        {/* Objective */}
        {objective && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-4 bg-amber-500" />
              <h2 className="text-[9.5pt] font-extrabold uppercase text-slate-900 tracking-wider">CAREER MISSION</h2>
            </div>
            <p className="text-[9pt] text-slate-700 leading-relaxed text-justify pl-4 border-l-2 border-slate-200">
              {objective}
            </p>
          </div>
        )}

        {/* Vertical Connected Timeline for Work Experience */}
        {data.experiences.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-4 bg-amber-500" />
              <h2 className="text-[9.5pt] font-extrabold uppercase text-slate-900 tracking-wider">
                TRADE & FIELD EXPERIENCE
              </h2>
            </div>
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-400">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-amber-400" />
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[9.5pt] text-slate-900 uppercase">
                        {exp.project}
                      </h3>
                      <span className="text-[8pt] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        {exp.duration}
                      </span>
                    </div>
                    <div className="text-[8.5pt] text-slate-600 mt-1 flex gap-3">
                      <span>Country: <strong className="text-slate-800">{exp.country}</strong></span>
                      {exp.designation && <span>Role: <strong className="text-slate-800">{exp.designation}</strong></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Skills Split */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Education */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-3.5 bg-amber-500" />
              <h2 className="text-[9pt] font-extrabold uppercase text-slate-900 tracking-wider">QUALIFICATIONS</h2>
            </div>
            <div className="space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-[8.5pt] border-l-2 border-slate-300 pl-2">
                  <div className="font-bold text-slate-900">{edu.exam}</div>
                  <div className="text-slate-600 text-[8pt]">{edu.inst} ({edu.year})</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Skills Chips */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-3.5 bg-amber-500" />
              <h2 className="text-[9pt] font-extrabold uppercase text-slate-900 tracking-wider">TECHNICAL SKILLS</h2>
            </div>
            <div className="flex flex-wrap gap-1">
              {skills ? (
                skills.split(',').map((s, idx) => (
                  <span key={idx} className="bg-slate-900 text-amber-400 font-mono text-[7.5pt] font-bold px-2 py-1 rounded">
                    {s.trim()}
                  </span>
                ))
              ) : (
                <span className="text-[8pt] text-slate-500">General Technical Trade</span>
              )}
            </div>
          </div>
        </div>

        {/* Technical Data Specification Sheet (Personal & Passport) */}
        <div className="border border-slate-300 rounded overflow-hidden">
          <div className="bg-slate-800 text-white font-mono text-[8pt] font-bold px-3 py-1 uppercase tracking-wider">
            TECHNICAL SPECIFICATIONS: CANDIDATE DATA SHEET
          </div>
          <table className="w-full text-[8pt] divide-y divide-slate-200">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50/50">
                <td className="p-1.5 font-bold text-slate-700 w-32">Passport Number</td>
                <td className="p-1.5 font-mono font-bold text-slate-900">{passport || 'N/A'}</td>
                <td className="p-1.5 font-bold text-slate-700 w-32">Date of Issue</td>
                <td className="p-1.5">{issue || 'N/A'} (Place: {place || 'DHAKA'})</td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold text-slate-700">Date of Expiry</td>
                <td className="p-1.5 font-mono text-rose-700 font-bold">{expiry || 'N/A'}</td>
                <td className="p-1.5 font-bold text-slate-700">Date of Birth</td>
                <td className="p-1.5">{dob || 'N/A'}</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-1.5 font-bold text-slate-700">Father's Name</td>
                <td className="p-1.5">{father}</td>
                <td className="p-1.5 font-bold text-slate-700">Mother's Name</td>
                <td className="p-1.5">{mother}</td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold text-slate-700">Physical Metrics</td>
                <td className="p-1.5">{height} {weight ? `| ${weight}` : ''}</td>
                <td className="p-1.5 font-bold text-slate-700">Religion / Marital</td>
                <td className="p-1.5">{religion} | {marital}</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-1.5 font-bold text-slate-700">Permanent Address</td>
                <td className="p-1.5" colSpan={3}>{permAddress}</td>
              </tr>
            </tbody>
          </table>
        </div>

        </div>
      </div>

      {/* Footer Signature */}
      {Boolean(data.showSignature) && (
        <div className="mt-auto pt-4 border-t-2 border-slate-900 flex justify-between items-end">
          <div className="text-[7.5pt] text-slate-500 font-mono">
            SPEC SHEET VERIFIED • {data.signatureDate || '2026'}
          </div>
          <div className="text-center border-t border-slate-900 pt-1 min-w-36">
            <span className="font-bold text-xs uppercase block text-slate-900">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </span>
            <p className="text-[7pt] text-slate-500 uppercase">(Authorized Signature)</p>
          </div>
        </div>
      )}
    </div>
  );
};
