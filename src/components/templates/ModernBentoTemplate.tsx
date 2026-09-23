import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const ModernBentoTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-corp-3 relative p-8 font-sans bg-white text-slate-800 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      <div className="space-y-4 flex-1">
        {/* Top Header Card */}
        <div className="border border-slate-300 rounded-sm p-5 shadow-xs flex justify-between items-center bg-slate-50/50">
          <div>
            <div className="text-[7.5pt] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
              INTERNATIONAL CANDIDATE DOSSIER
            </div>
            <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
              {name}
            </h1>
            {jobTitle && (
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5">
                {jobTitle}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[8.5pt] text-slate-600">
              {mobile && <span>Tel: <strong className="text-slate-900">{mobile}</strong></span>}
              {email && <span>Email: <strong className="text-slate-900">{email}</strong></span>}
              {presAddress && <span>Location: {presAddress}</span>}
            </div>
          </div>

          {showPhoto && (
            <img
              src={data.photoUrl}
              alt={name}
              className="w-20 h-24 object-cover rounded-xs border border-slate-300 shadow-xs ml-4 shrink-0"
            />
          )}
        </div>

        {/* Passport Immigration Matrix (4-Column) */}
        <div className="grid grid-cols-4 gap-3">
          <div className="border border-slate-300 rounded-xs p-2.5 bg-white">
            <span className="text-[7pt] font-bold uppercase text-slate-500 block">PASSPORT NO</span>
            <span className="font-mono font-bold text-[10pt] text-slate-900">{passport || 'N/A'}</span>
          </div>
          <div className="border border-slate-300 rounded-xs p-2.5 bg-white">
            <span className="text-[7pt] font-bold uppercase text-slate-500 block">EXPIRY DATE</span>
            <span className="font-mono font-bold text-[9.5pt] text-rose-700">{expiry || 'N/A'}</span>
          </div>
          <div className="border border-slate-300 rounded-xs p-2.5 bg-white">
            <span className="text-[7pt] font-bold uppercase text-slate-500 block">ISSUE DATE</span>
            <span className="font-mono text-[9pt] text-slate-800">{issue || 'N/A'}</span>
          </div>
          <div className="border border-slate-300 rounded-xs p-2.5 bg-white">
            <span className="text-[7pt] font-bold uppercase text-slate-500 block">NATIONALITY</span>
            <span className="font-bold text-[9pt] text-slate-900">{nationality || 'BANGLADESHI'}</span>
          </div>
        </div>

        {/* Career Objective / Profile */}
        {objective && (
          <div className="border border-slate-300 rounded-xs p-4 bg-white">
            <h2 className="text-[8pt] font-extrabold uppercase tracking-wider text-slate-900 mb-1 border-b border-slate-200 pb-1">
              PROFESSIONAL SUMMARY & OBJECTIVE
            </h2>
            <p className="text-[9pt] text-slate-700 leading-relaxed text-justify">{objective}</p>
          </div>
        )}

        {/* Work Experience Record */}
        {data.experiences.length > 0 && (
          <div className="border border-slate-300 rounded-xs p-4 bg-white">
            <h2 className="text-[8pt] font-extrabold uppercase tracking-wider text-slate-900 mb-2.5 border-b border-slate-200 pb-1">
              EMPLOYMENT HISTORY & OVERSEAS PROJECTS
            </h2>
            <div className="space-y-2">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="border border-slate-200 rounded-xs p-2.5 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-[9pt] text-slate-900 uppercase">{exp.project}</h3>
                    <div className="text-[8pt] text-slate-600 flex gap-3 mt-0.5">
                      <span>Country: <strong className="text-slate-800">{exp.country}</strong></span>
                      {exp.designation && <span>Designation: <strong className="text-slate-800">{exp.designation}</strong></span>}
                    </div>
                  </div>
                  <span className="text-[7.5pt] font-mono font-bold bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded-xs">
                    {exp.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Core Skills Split */}
        <div className="grid grid-cols-2 gap-3">
          {/* Education Card */}
          <div className="border border-slate-300 rounded-xs p-3.5 bg-white">
            <h2 className="text-[8pt] font-extrabold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-200 pb-1">
              ACADEMIC QUALIFICATIONS
            </h2>
            <div className="space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-[8.5pt] border-b border-slate-100 pb-1 last:border-0">
                  <span className="font-bold text-slate-900 block">{edu.exam}</span>
                  <span className="text-[8pt] text-slate-600">{edu.inst} ({edu.year})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Languages Card */}
          <div className="border border-slate-300 rounded-xs p-3.5 bg-white">
            <h2 className="text-[8pt] font-extrabold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-200 pb-1">
              SKILLS & LANGUAGES
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-[7pt] uppercase font-bold text-slate-500 block mb-1">Expertise:</span>
                <div className="flex flex-wrap gap-1">
                  {skills ? (
                    skills.split(',').map((s, idx) => (
                      <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 text-[7.5pt] font-semibold px-2 py-0.5 rounded-xs">
                        {s.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-[8pt] text-slate-500">General Technical Work</span>
                  )}
                </div>
              </div>
              {data.languages.length > 0 && (
                <div className="pt-1 border-t border-slate-100">
                  <span className="text-[7pt] uppercase font-bold text-slate-500 block mb-0.5">Languages:</span>
                  <div className="text-[8pt] text-slate-700 flex flex-wrap gap-2">
                    {data.languages.map((l) => (
                      <span key={l.id}><strong>{l.name}:</strong> {l.proficiency}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Particulars Card */}
        <div className="border border-slate-300 rounded-xs p-3.5 bg-white">
          <span className="text-[7.5pt] font-bold text-slate-500 uppercase block mb-1.5 border-b border-slate-200 pb-0.5">
            PERSONAL BIODATA PARTICULARS
          </span>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[8pt] text-slate-700">
            <div><strong>Father:</strong> {father}</div>
            <div><strong>Mother:</strong> {mother}</div>
            <div><strong>Date of Birth:</strong> {dob}</div>
            <div><strong>Religion:</strong> {religion}</div>
            <div><strong>Marital Status:</strong> {marital}</div>
            <div><strong>Physical:</strong> {height} {weight ? `| ${weight}` : ''}</div>
            <div className="col-span-3"><strong>Permanent Address:</strong> {permAddress}</div>
          </div>
        </div>
      </div>

      {/* Signature */}
      {Boolean(data.showSignature) && (
        <div className="mt-auto pt-4 border-t border-slate-300 flex justify-between items-end">
          <div className="text-[7.5pt] text-slate-500 font-mono">
            VERIFIED PARTICULARS • {data.signatureDate || '2026'}
          </div>
          <div className="text-center border-t-2 border-slate-900 pt-1 min-w-36">
            <span className="font-bold text-xs uppercase block text-slate-900">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </span>
            <p className="text-[6.5pt] text-slate-500 uppercase">CANDIDATE SIGNATURE</p>
          </div>
        </div>
      )}
    </div>
  );
};
