import React from 'react';
import { CVData, CVTemplateId, StyleConfig } from '../types';
import { Mail, Phone, MapPin, Globe, Award, Calendar, CheckCircle2, Trash2 } from 'lucide-react';

interface CVRendererProps {
  data: CVData;
  templateId: CVTemplateId;
  styleConfig: StyleConfig;
  onDeleteAdditionalPage?: (id?: string) => void;
  showCropMarks?: boolean;
}

export const CVRenderer: React.FC<CVRendererProps> = ({
  data,
  templateId,
  styleConfig,
  onDeleteAdditionalPage,
  showCropMarks = true,
}) => {
  const name = data.name || 'YOUR NAME';
  const jobTitle = data.jobTitle || '';
  const mobile = data.mobile || '';
  const email = data.email || '';
  const objective = data.objective || '';
  const father = data.fatherName || '';
  const mother = data.motherName || '';
  const dob = data.dob || '';
  const nationality = data.nationality || '';
  const permAddress = data.permanentAddress || '';
  const presAddress = data.presentAddress || '';
  const gender = data.gender || '';
  const religion = data.religion || '';
  const marital = data.maritalStatus || '';
  const height = data.height || '';
  const weight = data.weight || '';
  const passport = data.passportNumber || '';
  const issue = data.dateOfIssue || '';
  const expiry = data.dateOfExpiry || '';
  const place = data.placeOfIssue || '';
  const skills =
    data.skillsRaw !== undefined
      ? data.skillsRaw.trim()
      : (data.skills.length > 0 ? data.skills.join(', ') : '');
  const showPhoto = styleConfig.showPhoto && !!data.photoUrl;

  const activeMargins = styleConfig.margins || 'narrow';
  const marginLookup: Record<string, { top: string; bottom: string; left: string; right: string }> = {
    narrow: { top: '12.7mm', bottom: '12.7mm', left: '12.7mm', right: '12.7mm' },
    normal: { top: '25.4mm', bottom: '25.4mm', left: '25.4mm', right: '25.4mm' },
    moderate: { top: '25.4mm', bottom: '25.4mm', left: '19.05mm', right: '19.05mm' },
    wide: { top: '25.4mm', bottom: '25.4mm', left: '50.8mm', right: '50.8mm' },
  };
  const m = marginLookup[activeMargins] || marginLookup.narrow;

  const renderCropMarks = () => {
    if (!showCropMarks) return null;
    return (
      <div className="print-hide pointer-events-none absolute inset-0 z-20 select-none overflow-hidden" aria-hidden="true">
        {/* Top-Left: লেখা শুরু (Top & Left margin intersection) */}
        <div
          className="absolute w-3.5 h-3.5 border-t-2 border-l-2 border-slate-400/60"
          style={{
            top: m.top,
            left: m.left,
          }}
          title="লেখা শুরু (Top-Left Margin)"
        />
        {/* Top-Right: লেখা শেষ (Top & Right margin intersection) */}
        <div
          className="absolute w-3.5 h-3.5 border-t-2 border-r-2 border-slate-400/60"
          style={{
            top: m.top,
            right: m.right,
          }}
          title="লেখা শেষ (Top-Right Margin)"
        />
        {/* Bottom-Left */}
        <div
          className="absolute w-3.5 h-3.5 border-b-2 border-l-2 border-slate-400/60"
          style={{
            bottom: m.bottom,
            left: m.left,
          }}
          title="লেখা শুরু (Bottom-Left Margin)"
        />
        {/* Bottom-Right */}
        <div
          className="absolute w-3.5 h-3.5 border-b-2 border-r-2 border-slate-400/60"
          style={{
            bottom: m.bottom,
            right: m.right,
          }}
          title="লেখা শেষ (Bottom-Right Margin)"
        />
      </div>
    );
  };

  const renderMainTemplate = () => {
    // =========================================================================
    // FORMAT 4: Technical 2-Column Sidebar (Geometric Balance Archetype)
    // =========================================================================
    if (templateId === 'fmt-tech-1') {
    return (
      <div id="cv_render_paper" className="a4-paper-container fmt-tech-1 relative min-h-[297mm]">
        {renderCropMarks()}
        {/* Left Dark Sidebar */}
        <aside className="left-col min-h-[297mm] flex flex-col justify-between">
          <div className="space-y-4 flex-1">
          {showPhoto && (
            <div className="mb-4 flex justify-center">
              <img
                src={data.photoUrl}
                alt={name}
                className="w-24 h-32 object-cover rounded border-2 border-sky-400 shadow-md"
              />
            </div>
          )}

          <header className="profile-header mb-6">
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider leading-tight mb-1">
              {name}
            </h1>
            {jobTitle && (
              <div className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
                {jobTitle}
              </div>
            )}
          </header>

          <section className="sidebar-section mb-6">
            <span className="sec-title-left">যোগাযোগ / CONTACT</span>
            <div className="space-y-2.5 text-[9pt]">
              {mobile && (
                <div className="contact-item">
                  <span className="contact-icon block text-[8pt] text-slate-400 font-bold uppercase">টেলিফোন / TELEPHONE NO</span>
                  <span className="text-slate-200">{mobile}</span>
                </div>
              )}
              {email && (
                <div className="contact-item">
                  <span className="contact-icon block text-[8pt] text-slate-400 font-bold uppercase">ইমেইল / EMAIL</span>
                  <span className="text-slate-200 break-all">{email}</span>
                </div>
              )}
              {presAddress && (
                <div className="contact-item">
                  <span className="contact-icon block text-[8pt] text-slate-400 font-bold uppercase">ঠিকানা / ADDRESS</span>
                  <span className="text-slate-300">{presAddress}</span>
                </div>
              )}
            </div>
          </section>

          {passport && (
            <section className="sidebar-section mb-6">
              <span className="sec-title-left">পাসপোর্ট / PASSPORT</span>
              <div className="space-y-1.5 text-[9pt] text-slate-200">
                <div className="contact-item">
                  <span className="contact-icon block text-[8pt] text-slate-400 font-bold uppercase">PASSPORT NO</span>
                  <span className="text-sky-300 font-bold tracking-wider">{passport}</span>
                </div>
                {issue && (
                  <div className="text-[8.5pt] text-slate-300">
                    <span className="text-slate-400">Date of Issue:</span> {issue}
                  </div>
                )}
                {expiry && (
                  <div className="text-[8.5pt] text-slate-300">
                    <span className="text-slate-400">Date Of Expiry:</span> {expiry}
                  </div>
                )}
                {data.placeOfIssue && (
                  <div className="text-[8.5pt] text-slate-300">
                    <span className="text-slate-400">Authority:</span> {data.placeOfIssue}
                  </div>
                )}
                {data.previousPassportNumber && (
                  <div className="text-[8.5pt] text-slate-300">
                    <span className="text-slate-400">Prev Pass:</span> {data.previousPassportNumber}
                  </div>
                )}
              </div>
            </section>
          )}

          {data.skills.length > 0 && (
            <section className="sidebar-section mb-6">
              <span className="sec-title-left">দক্ষতা / TECHNICAL SKILLS</span>
              <div className="flex flex-wrap gap-1">
                {data.skills.map((s, i) => (
                  <div key={i} className="skill-pill">
                    {s}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.languages.length > 0 && (
            <section className="sidebar-section">
              <span className="sec-title-left">ভাষা / LANGUAGES</span>
              <div className="space-y-1 text-[9pt] text-slate-300">
                {data.languages.map((l) => (
                  <div key={l.id} className="flex justify-between items-baseline border-b border-slate-800/60 pb-0.5">
                    <span className="font-semibold text-white">{l.name}</span>
                    <span className="text-[8.5pt] text-slate-400">({l.proficiency})</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          </div>
        </aside>

        {/* Right Content Column */}
        <main className="right-col min-h-[297mm] flex flex-col justify-between">
          <div className="space-y-4 flex-1">
          {objective && (
            <section className="mb-5">
              <div className="section-heading">
                <h2>ক্যারিয়ার সামারি / CAREER SUMMARY</h2>
              </div>
              <div className="summary-box">
                <p className="summary-text">{objective}</p>
              </div>
            </section>
          )}

          {data.experiences.length > 0 && (
            <section className="mb-5">
              <div className="section-heading">
                <h2>কাজের অভিজ্ঞতা / WORK EXPERIENCE</h2>
              </div>
              <div>
                {data.experiences.map((e) => (
                  <div key={e.id} className="experience-item">
                    <div className="job-meta">
                      <span className="job-role">{e.designation || e.project}</span>
                      <span className="job-date">{e.duration}</span>
                    </div>
                    <div className="company-name">
                      {e.designation ? `${e.project} • ` : ''}{e.country}
                    </div>
                    {e.responsibilities && e.responsibilities.length > 0 && e.responsibilities[0] && (
                      <ul className="text-[9pt] text-slate-600 list-disc pl-4 space-y-0.5 mt-1">
                        {e.responsibilities.map((r, ri) => (
                          <li key={ri}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.educations.length > 0 && (
            <section className="mb-5">
              <div className="section-heading">
                <h2>শিক্ষা / EDUCATION</h2>
              </div>
              <div className="education-grid">
                {data.educations.map((edu) => (
                  <div key={edu.id} className="edu-card">
                    <div className="job-role text-[9.5pt]">{edu.exam}</div>
                    <div className="job-date mb-1">{edu.year}</div>
                    <div className="text-[8.5pt] text-slate-600">
                      {edu.inst} {edu.board ? `(${edu.board})` : ''}
                    </div>
                    {edu.grade && (
                      <div className="text-[8pt] text-sky-700 font-semibold mt-0.5">
                        Grade: {edu.grade}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Personal Information */}
          <section className="mb-4">
            <div className="section-heading">
              <h2>ব্যক্তিগত তথ্য / PERSONAL DETAILS</h2>
            </div>
            <table className="info-tbl text-[9pt] w-full">
              <tbody>
                {father && (
                  <tr>
                    <td className="w-36 py-0.5 font-bold text-slate-700">Father's Name</td>
                    <td className="py-0.5 text-slate-800">: {father}</td>
                  </tr>
                )}
                {mother && (
                  <tr>
                    <td className="w-36 py-0.5 font-bold text-slate-700">Mother's Name</td>
                    <td className="py-0.5 text-slate-800">: {mother}</td>
                  </tr>
                )}
                {dob && (
                  <tr>
                    <td className="py-0.5 font-bold text-slate-700">Date of Birth</td>
                    <td className="py-0.5 text-slate-800">: {dob}</td>
                  </tr>
                )}
                {nationality && (
                  <tr>
                    <td className="py-0.5 font-bold text-slate-700">Nationality</td>
                    <td className="py-0.5 text-slate-800">: {nationality}</td>
                  </tr>
                )}
                {religion && (
                  <tr>
                    <td className="py-0.5 font-bold text-slate-700">Religion</td>
                    <td className="py-0.5 text-slate-800">: {religion}</td>
                  </tr>
                )}
                {data.personalNo && (
                  <tr>
                    <td className="py-0.5 font-bold text-slate-700">Personal No (NID)</td>
                    <td className="py-0.5 text-slate-800">: {data.personalNo}</td>
                  </tr>
                )}
                {data.placeOfBirth && (
                  <tr>
                    <td className="py-0.5 font-bold text-slate-700">Place of Birth</td>
                    <td className="py-0.5 text-slate-800">: {data.placeOfBirth}</td>
                  </tr>
                )}
                {permAddress && (
                  <tr>
                    <td className="py-0.5 font-bold text-slate-700">Permanent Address</td>
                    <td className="py-0.5 text-slate-800">: {permAddress}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          </div>

          {/* Signature */}
          {Boolean(data.showSignature) && (
            <div className="mt-auto pt-6 text-right">
              <div className="inline-block text-center border-t-2 border-slate-900 pt-1 min-w-32">
                {(data.signatureText !== undefined ? data.signatureText.trim() : name) ? (
                  <span className="font-bold text-xs uppercase tracking-wide block">
                    {data.signatureText !== undefined ? data.signatureText.trim() : name}
                  </span>
                ) : (
                  <div className="h-4" />
                )}
                <p className="text-[8pt] text-slate-500 uppercase tracking-wider">SIGNATURE</p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // FORMAT 2: Gulf Modern Blue (Photo & Passport Focus)
  // =========================================================================
  if (templateId === 'fmt-gulf-2') {
    return (
      <div id="cv_render_paper" className="a4-paper-container fmt-gulf-2 relative min-h-[297mm] flex flex-col justify-between">
        {renderCropMarks()}
        <div className="space-y-3 flex-1">
        {/* Modern Blue Header Block */}
        <div className="header-box">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-white mb-1">{name}</h1>
            {jobTitle && <p className="text-sky-300 font-semibold text-sm mb-2">{jobTitle}</p>}
            <div className="text-xs text-sky-100 flex flex-wrap gap-x-4 gap-y-1">
              {mobile && <span>📱 {mobile}</span>}
              {email && <span>✉️ {email}</span>}
              {passport && <span>🛂 Passport: <strong>{passport}</strong></span>}
            </div>
          </div>

          {showPhoto ? (
            <img
              src={data.photoUrl}
              alt={name}
              className="w-20 h-24 object-cover rounded border-2 border-white shadow ml-4"
            />
          ) : (
            <div className="w-20 h-24 border-2 border-dashed border-sky-300/60 rounded flex items-center justify-center text-center p-1 text-[9px] text-sky-200 ml-4">
              Passport Photo
            </div>
          )}
        </div>

        {/* Objective */}
        {objective && (
          <>
            <div className="sec-banner">CAREER OBJECTIVE</div>
            <p className="text-[9.5pt] text-slate-700 text-justify mb-2 leading-relaxed">{objective}</p>
          </>
        )}

        {/* Personal & Passport Table */}
        <div className="sec-banner">PERSONAL & PASSPORT INFORMATION</div>
        <table className="info-tbl text-[9.5pt] mb-2">
          <tbody>
            <tr>
              <td className="lbl">Name</td>
              <td>: {name}</td>
              <td className="lbl">Passport Number</td>
              <td>: <strong className="text-blue-900">{passport || 'N/A'}</strong></td>
            </tr>
            <tr>
              <td className="lbl">Father's Name</td>
              <td>: {father}</td>
              <td className="lbl">Date of Issue</td>
              <td>: {issue || 'N/A'}</td>
            </tr>
            <tr>
              <td className="lbl">Mother's Name</td>
              <td>: {mother}</td>
              <td className="lbl">Date Of Expiry</td>
              <td>: {expiry || 'N/A'}</td>
            </tr>
            <tr>
              <td className="lbl">Date of Birth</td>
              <td>: {dob}</td>
              <td className="lbl">Height / Weight</td>
              <td>: {height} {weight ? `/ ${weight}` : ''}</td>
            </tr>
            <tr>
              <td className="lbl">Permanent Address</td>
              <td colSpan={3}>: {permAddress}</td>
            </tr>
            {data.personalNo && (
              <tr>
                <td className="lbl">Personal No (NID)</td>
                <td>: {data.personalNo}</td>
                <td className="lbl">Place of Issue</td>
                <td>: {data.placeOfIssue || 'N/A'}</td>
              </tr>
            )}
            <tr>
              <td className="lbl">Nationality</td>
              <td>: {nationality}</td>
              <td className="lbl">Religion / Marital</td>
              <td>: {religion} / {marital}</td>
            </tr>
          </tbody>
        </table>

        {/* Languages */}
        {data.languages.length > 0 && (
          <>
            <div className="sec-banner">LANGUAGE PROFICIENCY</div>
            <div className="text-[9.5pt] space-y-0.5 mb-2">
              {data.languages.map((l) => (
                <p key={l.id}>
                  <strong>{l.name}:</strong> {l.proficiency}
                </p>
              ))}
            </div>
          </>
        )}

        {/* Education Grid */}
        {data.educations.length > 0 && (
          <>
            <div className="sec-banner">EDUCATIONAL BACKGROUND</div>
            <table className="grid-tbl text-[9.5pt] mb-2">
              <thead>
                <tr>
                  <th className="w-12 text-center">SL</th>
                  <th>EXAMINATION / DEGREE</th>
                  <th>INSTITUTE / BOARD</th>
                  <th className="w-20 text-center">YEAR</th>
                </tr>
              </thead>
              <tbody>
                {data.educations.map((edu, i) => (
                  <tr key={edu.id}>
                    <td className="text-center font-bold">0{i + 1}</td>
                    <td className="font-semibold">{edu.exam}</td>
                    <td>{edu.inst} {edu.board ? `(${edu.board})` : ''}</td>
                    <td className="text-center">{edu.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Work Experience */}
        {data.experiences.length > 0 && (() => {
          const hasDesignation = data.experiences.some((exp) => Boolean(exp.designation && exp.designation.trim() !== ''));
          return (
            <>
              <div className="sec-banner">WORK EXPERIENCE & OVERSEAS PROJECTS</div>
              <table className="grid-tbl text-[9.5pt] mb-2">
                <thead>
                  <tr>
                    <th className="w-10 text-center">SL</th>
                    <th>PROJECT / COMPANY</th>
                    <th className={hasDesignation ? "w-28" : "w-32"}>COUNTRY</th>
                    {hasDesignation && <th className="w-32">DESIGNATION</th>}
                    <th className={hasDesignation ? "w-28" : "w-32"}>DURATION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.experiences.map((exp, i) => (
                    <tr key={exp.id}>
                      <td className="text-center font-bold">{i + 1}.</td>
                      <td className="font-medium text-slate-900">{exp.project}</td>
                      <td>{exp.country}</td>
                      {hasDesignation && <td className="font-medium">{exp.designation || '-'}</td>}
                      <td>{exp.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          );
        })()}

        {/* Skills */}
        {skills && (
          <>
            <div className="sec-banner">TECHNICAL SKILLS & EXPERTISE</div>
            <p className="text-[9.5pt] leading-relaxed text-slate-800">{skills}</p>
          </>
        )}
        </div>

        {/* Signature */}
        {Boolean(data.showSignature) && (
          <div className="mt-auto pt-6 flex justify-between items-end">
            <div className="text-[9pt] text-slate-500">
              {data.signatureDate && <span>Date: {data.signatureDate}</span>}
            </div>
            <div className="text-center border-t-2 border-slate-700 pt-1 min-w-36">
              {(data.signatureText !== undefined ? data.signatureText.trim() : name) ? (
                <span className="font-bold text-xs uppercase block">
                  {data.signatureText !== undefined ? data.signatureText.trim() : name}
                </span>
              ) : (
                <div className="h-4" />
              )}
              <p className="text-[8pt] text-slate-500">(SIGNATURE)</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // FORMAT 11: Gulf Manpower Agency Biodata (Recruitment Standard)
  // =========================================================================
  if (templateId === 'fmt-gulf-4') {
    return (
      <div id="cv_render_paper" className="a4-paper-container fmt-gulf-4 relative">
        {renderCropMarks()}
        {/* Agency Top Meta Bar */}
        <div className="agency-top-bar">
          <span className="agency-badge">OVERSEAS MANPOWER RECRUITMENT BIODATA</span>
          <div className="flex gap-4">
            <span><strong>REF NO:</strong> {data.personalNo ? `REF-${data.personalNo.slice(-6)}` : `REF-BD-${passport || '8801'}`}</span>
            <span><strong>DATE:</strong> {data.signatureDate || 'CURRENT'}</span>
          </div>
        </div>

        {/* Candidate Bio Header */}
        <div className="header-content">
          <div className="flex-1 pr-4">
            <h1 className="text-xl font-extrabold uppercase text-slate-900 tracking-tight mb-1">{name}</h1>
            {jobTitle && (
              <div className="inline-block bg-teal-50 border border-teal-200 text-teal-800 font-bold px-2.5 py-0.5 rounded text-xs mb-2">
                {jobTitle}
              </div>
            )}
            <div className="text-[9pt] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              {mobile && <span>📱 {mobile}</span>}
              {email && <span>✉️ {email}</span>}
              {presAddress && <span>📍 {presAddress}</span>}
            </div>
          </div>
          {showPhoto ? (
            <img
              src={data.photoUrl}
              alt={name}
              className="w-20 h-24 object-cover border-2 border-teal-600 rounded shadow-sm shrink-0"
            />
          ) : (
            <div className="w-20 h-24 border border-dashed border-teal-400 bg-teal-50/50 rounded flex flex-col items-center justify-center text-center p-1 text-[8pt] text-teal-700 shrink-0">
              <span>PASSPORT</span>
              <span>PHOTO</span>
            </div>
          )}
        </div>

        {/* Career Objective */}
        {objective && (
          <>
            <div className="sec-banner">CAREER OBJECTIVE / SUMMARY</div>
            <p className="text-[9pt] text-slate-700 text-justify leading-relaxed mb-2">{objective}</p>
          </>
        )}

        {/* Passport & Travel Particulars */}
        <div className="sec-banner">PASSPORT & TRAVEL PARTICULARS</div>
        <table className="info-tbl text-[9pt] mb-2">
          <tbody>
            <tr>
              <td className="lbl">Passport Number</td>
              <td>: <strong className="text-teal-950 tracking-wider">{passport || 'N/A'}</strong></td>
              <td className="lbl">Place of Issue</td>
              <td>: {place || 'DHAKA'}</td>
            </tr>
            <tr>
              <td className="lbl">Date of Issue</td>
              <td>: {issue || 'N/A'}</td>
              <td className="lbl">Date of Expiry</td>
              <td>: <strong className="text-rose-900">{expiry || 'N/A'}</strong></td>
            </tr>
            {(data.personalNo || data.previousPassportNumber) && (
              <tr>
                <td className="lbl">National ID / Personal No</td>
                <td>: {data.personalNo || 'N/A'}</td>
                <td className="lbl">Previous Passport No</td>
                <td>: {data.previousPassportNumber || 'N/A'}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Personal Biodata */}
        <div className="sec-banner">PERSONAL BIODATA</div>
        <table className="info-tbl text-[9pt] mb-2">
          <tbody>
            <tr>
              <td className="lbl">Father's Name</td>
              <td>: {father}</td>
              <td className="lbl">Mother's Name</td>
              <td>: {mother}</td>
            </tr>
            <tr>
              <td className="lbl">Date of Birth</td>
              <td>: {dob}</td>
              <td className="lbl">Nationality</td>
              <td>: {nationality}</td>
            </tr>
            <tr>
              <td className="lbl">Religion / Marital</td>
              <td>: {religion} / {marital}</td>
              <td className="lbl">Height & Weight</td>
              <td>: {height} {weight ? `/ ${weight}` : ''}</td>
            </tr>
            <tr>
              <td className="lbl">Permanent Address</td>
              <td colSpan={3}>: {permAddress}</td>
            </tr>
          </tbody>
        </table>

        {/* Languages */}
        {data.languages.length > 0 && (
          <>
            <div className="sec-banner">LANGUAGE PROFICIENCY</div>
            <table className="grid-tbl text-[9pt] mb-2">
              <thead>
                <tr>
                  <th className="w-12 text-center">SL</th>
                  <th>LANGUAGE</th>
                  <th>PROFICIENCY & SPOKEN SKILLS</th>
                </tr>
              </thead>
              <tbody>
                {data.languages.map((l, i) => (
                  <tr key={l.id}>
                    <td className="text-center font-bold">0{i + 1}</td>
                    <td className="font-semibold text-teal-950">{l.name}</td>
                    <td>{l.proficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Education */}
        {data.educations.length > 0 && (
          <>
            <div className="sec-banner">EDUCATIONAL ATTAINMENT</div>
            <table className="grid-tbl text-[9pt] mb-2">
              <thead>
                <tr>
                  <th className="w-12 text-center">SL</th>
                  <th>CERTIFICATE / DEGREE</th>
                  <th>INSTITUTE / BOARD</th>
                  <th className="w-20 text-center">YEAR</th>
                </tr>
              </thead>
              <tbody>
                {data.educations.map((edu, i) => (
                  <tr key={edu.id}>
                    <td className="text-center font-bold">0{i + 1}</td>
                    <td className="font-semibold">{edu.exam}</td>
                    <td>{edu.inst} {edu.board ? `(${edu.board})` : ''}</td>
                    <td className="text-center">{edu.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Work Experience */}
        {data.experiences.length > 0 && (() => {
          const hasDesignation = data.experiences.some((exp) => Boolean(exp.designation && exp.designation.trim() !== ''));
          return (
            <>
              <div className="sec-banner">OVERSEAS & LOCAL WORK RECORD</div>
              <table className="grid-tbl text-[9pt] mb-2">
                <thead>
                  <tr>
                    <th className="w-10 text-center">SL</th>
                    <th>EMPLOYER / PROJECT</th>
                    <th className={hasDesignation ? "w-28" : "w-32"}>COUNTRY</th>
                    {hasDesignation && <th className="w-32">ROLE / TRADE</th>}
                    <th className={hasDesignation ? "w-28" : "w-32"}>DURATION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.experiences.map((exp, i) => (
                    <tr key={exp.id}>
                      <td className="text-center font-bold">{i + 1}.</td>
                      <td className="font-medium text-slate-900">{exp.project}</td>
                      <td className="font-semibold text-teal-900">{exp.country}</td>
                      {hasDesignation && <td className="font-medium">{exp.designation || '-'}</td>}
                      <td>{exp.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          );
        })()}

        {/* Technical Skills */}
        {skills && (
          <>
            <div className="sec-banner">TECHNICAL SKILLS & JOB EXPERTISE</div>
            <p className="text-[9pt] leading-relaxed text-slate-800 mb-2">{skills}</p>
          </>
        )}

        {/* Signature & Agency Sign-off */}
        <div className="mt-6 pt-3 border-t border-slate-300 flex justify-between items-end">
          <div className="text-center border-t border-slate-400 pt-1 min-w-36">
            <p className="text-[7.5pt] text-slate-500 uppercase">Agency Representative</p>
            <p className="text-[7pt] text-slate-400">(Verification Seal & Stamp)</p>
          </div>
          {Boolean(data.showSignature) ? (
            <div className="text-center border-t border-slate-900 pt-1 min-w-36">
              <span className="font-bold text-xs uppercase block">
                {data.signatureText !== undefined ? data.signatureText.trim() : name}
              </span>
              <p className="text-[7.5pt] text-slate-500">(CANDIDATE SIGNATURE)</p>
            </div>
          ) : (
            <div className="text-[8pt] text-slate-400">
              Verified Candidate Application
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // FORMAT 12: Saudi Arabia / GCC Dual Arabic-English Header
  // =========================================================================
  if (templateId === 'fmt-gulf-5') {
    return (
      <div id="cv_render_paper" className="a4-paper-container fmt-gulf-5 relative">
        {renderCropMarks()}
        {/* Bilingual Header */}
        <div className="cv-title-head relative">
          {showPhoto && (
            <div className="absolute right-0 top-0">
              <img
                src={data.photoUrl}
                alt={name}
                className="w-20 h-24 object-cover border-2 border-amber-600 shadow-sm"
              />
            </div>
          )}
          <div className="arabic-sub">السيرة الذاتية المهنية</div>
          <h2 className="text-base font-serif font-bold text-amber-950 tracking-wider">CURRICULUM VITAE</h2>
          <h1 className="text-xl font-serif font-bold uppercase text-slate-900 tracking-wide mt-1">{name}</h1>
          {jobTitle && <p className="font-bold text-sm text-amber-800">{jobTitle}</p>}
          <div className="text-[9pt] text-slate-700 mt-1">
            {mobile && <span>Tel: <strong>{mobile}</strong></span>}
            {mobile && email && <span> | </span>}
            {email && <span>Email: {email}</span>}
            {passport && <span> | Passport: <strong className="text-amber-900">{passport}</strong></span>}
          </div>
        </div>

        {/* Objective */}
        {objective && (
          <div className="mb-2">
            <div className="sec-banner">
              <span>CAREER OBJECTIVE</span>
              <span className="ar font-arabic">الهدف الوظيفي</span>
            </div>
            <p className="text-[9pt] text-slate-800 leading-relaxed text-justify mb-2">{objective}</p>
          </div>
        )}

        {/* Passport & Personal Information */}
        <div className="sec-banner">
          <span>PERSONAL & PASSPORT DETAILS</span>
          <span className="ar font-arabic">بيانات جواز السفر والمعلومات الشخصية</span>
        </div>
        <table className="info-tbl text-[9pt] mb-2">
          <tbody>
            <tr>
              <td className="lbl">Passport Number (رقم الجواز)</td>
              <td>: <strong className="text-amber-950 font-bold tracking-wider">{passport || 'N/A'}</strong></td>
              <td className="lbl">Place of Issue</td>
              <td>: {place || 'DHAKA'}</td>
            </tr>
            <tr>
              <td className="lbl">Date of Issue (تاريخ الإصدار)</td>
              <td>: {issue || 'N/A'}</td>
              <td className="lbl">Date of Expiry (تاريخ الانتهاء)</td>
              <td>: <strong className="text-amber-900">{expiry || 'N/A'}</strong></td>
            </tr>
            <tr>
              <td className="lbl">Father's Name (اسم الأب)</td>
              <td>: {father}</td>
              <td className="lbl">Date of Birth (تاريخ الميلاد)</td>
              <td>: {dob}</td>
            </tr>
            <tr>
              <td className="lbl">Nationality (الجنسية)</td>
              <td>: {nationality}</td>
              <td className="lbl">Religion / Marital</td>
              <td>: {religion} / {marital}</td>
            </tr>
            <tr>
              <td className="lbl">Height & Weight</td>
              <td>: {height} {weight ? `/ ${weight}` : ''}</td>
              <td className="lbl">Personal No (NID)</td>
              <td>: {data.personalNo || 'N/A'}</td>
            </tr>
            <tr>
              <td className="lbl">Permanent Address</td>
              <td colSpan={3}>: {permAddress}</td>
            </tr>
          </tbody>
        </table>

        {/* Language Proficiency */}
        {data.languages.length > 0 && (
          <>
            <div className="sec-banner">
              <span>LANGUAGE SKILLS</span>
              <span className="ar font-arabic">إتقان اللغات</span>
            </div>
            <div className="text-[9pt] space-y-0.5 mb-2">
              {data.languages.map((l) => (
                <p key={l.id}>
                  <strong>{l.name}:</strong> {l.proficiency}
                </p>
              ))}
            </div>
          </>
        )}

        {/* Education */}
        {data.educations.length > 0 && (
          <>
            <div className="sec-banner">
              <span>EDUCATIONAL QUALIFICATIONS</span>
              <span className="ar font-arabic">المؤهلات العلمية</span>
            </div>
            <table className="grid-tbl text-[9pt] mb-2">
              <thead>
                <tr>
                  <th className="w-12 text-center">SL</th>
                  <th>CERTIFICATE / EXAMINATION</th>
                  <th>INSTITUTION / BOARD</th>
                  <th className="w-20 text-center">YEAR</th>
                </tr>
              </thead>
              <tbody>
                {data.educations.map((edu, i) => (
                  <tr key={edu.id}>
                    <td className="text-center font-bold">0{i + 1}</td>
                    <td className="font-semibold">{edu.exam}</td>
                    <td>{edu.inst} {edu.board ? `(${edu.board})` : ''}</td>
                    <td className="text-center">{edu.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Work Experience */}
        {data.experiences.length > 0 && (() => {
          const hasDesignation = data.experiences.some((exp) => Boolean(exp.designation && exp.designation.trim() !== ''));
          return (
            <>
              <div className="sec-banner">
                <span>OVERSEAS GCC WORK EXPERIENCE</span>
                <span className="ar font-arabic">الخبرات العملية في دول الخليج</span>
              </div>
              <table className="grid-tbl text-[9pt] mb-2">
                <thead>
                  <tr>
                    <th className="w-10 text-center">SL</th>
                    <th>COMPANY / PROJECT NAME</th>
                    <th className={hasDesignation ? "w-28" : "w-32"}>COUNTRY</th>
                    {hasDesignation && <th className="w-32">TRADE / ROLE</th>}
                    <th className={hasDesignation ? "w-28" : "w-32"}>DURATION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.experiences.map((exp, i) => (
                    <tr key={exp.id}>
                      <td className="text-center font-bold">{i + 1}.</td>
                      <td className="font-medium text-slate-900">{exp.project}</td>
                      <td className="font-semibold text-amber-950">{exp.country}</td>
                      {hasDesignation && <td className="font-medium">{exp.designation || '-'}</td>}
                      <td>{exp.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          );
        })()}

        {/* Skills */}
        {skills && (
          <>
            <div className="sec-banner">
              <span>TECHNICAL SKILLS & EXPERTISE</span>
              <span className="ar font-arabic">المهارات الفنية والخبرات</span>
            </div>
            <p className="text-[9pt] leading-relaxed text-slate-800 mb-2">{skills}</p>
          </>
        )}

        {/* Signature */}
        {Boolean(data.showSignature) && (
          <div className="mt-6 pt-3 border-t border-amber-300 flex justify-between items-end">
            <div className="text-[8.5pt] text-slate-500">
              {data.signatureDate && <span>Date: {data.signatureDate}</span>}
            </div>
            <div className="text-center border-t-2 border-amber-900 pt-1 min-w-36">
              <span className="font-bold text-xs uppercase block text-slate-900">
                {data.signatureText !== undefined ? data.signatureText.trim() : name}
              </span>
              <p className="text-[7.5pt] text-slate-500">(توقيع مقدم الطلب / SIGNATURE)</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // FORMAT 16: International Modern Dual-Tone
  // =========================================================================
  if (templateId === 'fmt-corp-5') {
    return (
      <div id="cv_render_paper" className="a4-paper-container fmt-corp-5 relative">
        {renderCropMarks()}
        {/* Left Sidebar */}
        <aside className="corp-sidebar">
          {showPhoto && (
            <div className="mb-4 flex justify-center">
              <img
                src={data.photoUrl}
                alt={name}
                className="w-24 h-32 object-cover rounded border-2 border-sky-400 shadow-md"
              />
            </div>
          )}

          <div className="corp-sec-title-side">CONTACT DETAILS</div>
          <div className="space-y-2 text-[8.5pt] text-slate-300">
            {mobile && (
              <div>
                <span className="text-slate-400 font-bold block text-[7.5pt] uppercase">Mobile Phone</span>
                <span>{mobile}</span>
              </div>
            )}
            {email && (
              <div>
                <span className="text-slate-400 font-bold block text-[7.5pt] uppercase">Email Address</span>
                <span className="break-all">{email}</span>
              </div>
            )}
            {presAddress && (
              <div>
                <span className="text-slate-400 font-bold block text-[7.5pt] uppercase">Current Address</span>
                <span>{presAddress}</span>
              </div>
            )}
          </div>

          <div className="corp-sec-title-side">PASSPORT & IDENTITY</div>
          <div className="space-y-1.5 text-[8.5pt] text-slate-300">
            {passport && (
              <div>
                <span className="text-slate-400 font-bold block text-[7.5pt] uppercase">Passport Number</span>
                <span className="font-mono font-bold text-sky-300">{passport}</span>
              </div>
            )}
            {issue && (
              <div>
                <span className="text-slate-400 font-bold block text-[7.5pt] uppercase">Date of Issue</span>
                <span>{issue}</span>
              </div>
            )}
            {expiry && (
              <div>
                <span className="text-slate-400 font-bold block text-[7.5pt] uppercase">Date of Expiry</span>
                <span className="text-amber-300">{expiry}</span>
              </div>
            )}
            {data.personalNo && (
              <div>
                <span className="text-slate-400 font-bold block text-[7.5pt] uppercase">Personal NID</span>
                <span>{data.personalNo}</span>
              </div>
            )}
            {nationality && (
              <div>
                <span className="text-slate-400 font-bold block text-[7.5pt] uppercase">Nationality</span>
                <span>{nationality}</span>
              </div>
            )}
          </div>

          {data.languages.length > 0 && (
            <>
              <div className="corp-sec-title-side">LANGUAGES</div>
              <div className="space-y-1.5 text-[8.5pt] text-slate-300">
                {data.languages.map((l) => (
                  <div key={l.id}>
                    <span className="font-semibold text-white block">{l.name}</span>
                    <span className="text-[7.5pt] text-slate-400">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {data.skills.length > 0 && (
            <>
              <div className="corp-sec-title-side">CORE SKILLS</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.skills.slice(0, 10).map((s, idx) => (
                  <span key={idx} className="bg-slate-800 text-sky-200 border border-slate-700 px-1.5 py-0.5 rounded text-[7.5pt]">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Right Main Flow */}
        <main className="corp-main">
          <header className="mb-4 pb-3 border-b-2 border-slate-900">
            <h1 className="text-2xl font-extrabold uppercase text-slate-900 tracking-tight leading-none mb-1">
              {name}
            </h1>
            {jobTitle && (
              <div className="text-xs font-bold text-sky-700 uppercase tracking-widest">
                {jobTitle}
              </div>
            )}
          </header>

          {objective && (
            <section className="mb-3">
              <div className="corp-sec-title-main">EXECUTIVE SUMMARY</div>
              <p className="text-[9pt] text-slate-700 leading-relaxed text-justify">{objective}</p>
            </section>
          )}

          {data.experiences.length > 0 && (() => {
            const hasDesignation = data.experiences.some((exp) => Boolean(exp.designation && exp.designation.trim() !== ''));
            return (
              <section className="mb-3">
                <div className="corp-sec-title-main">PROFESSIONAL EXPERIENCE</div>
                <table className="grid-tbl text-[9pt] w-full mb-2">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-left">
                      <th className="p-1.5">ORGANIZATION / PROJECT</th>
                      <th className={hasDesignation ? "w-28 p-1.5" : "w-32 p-1.5"}>COUNTRY</th>
                      {hasDesignation && <th className="w-32 p-1.5">DESIGNATION</th>}
                      <th className={hasDesignation ? "w-28" : "w-32"}>PERIOD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.experiences.map((exp) => (
                      <tr key={exp.id} className="border-b border-slate-200">
                        <td className="p-1.5 font-medium text-slate-900">{exp.project}</td>
                        <td className="p-1.5 text-slate-700">{exp.country}</td>
                        {hasDesignation && <td className="p-1.5 font-medium text-slate-800">{exp.designation || '-'}</td>}
                        <td className="p-1.5 text-slate-600">{exp.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })()}

          {data.educations.length > 0 && (
            <section className="mb-3">
              <div className="corp-sec-title-main">ACADEMIC BACKGROUND</div>
              <table className="grid-tbl text-[9pt] w-full mb-2">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-left">
                    <th className="p-1.5">DEGREE / EXAMINATION</th>
                    <th className="p-1.5">INSTITUTION / BOARD</th>
                    <th className="w-20 p-1.5 text-center">YEAR</th>
                  </tr>
                </thead>
                <tbody>
                  {data.educations.map((edu) => (
                    <tr key={edu.id} className="border-b border-slate-200">
                      <td className="p-1.5 font-semibold text-slate-900">{edu.exam}</td>
                      <td className="p-1.5 text-slate-700">{edu.inst} {edu.board ? `(${edu.board})` : ''}</td>
                      <td className="p-1.5 text-center text-slate-600">{edu.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Personal Metadata Grid */}
          <section className="mb-3">
            <div className="corp-sec-title-main">PERSONAL PARTICULARS</div>
            <table className="info-tbl text-[8.5pt] w-full">
              <tbody>
                <tr>
                  <td className="lbl font-bold text-slate-700 w-32">Father's Name</td>
                  <td>: {father}</td>
                  <td className="lbl font-bold text-slate-700 w-32">Date of Birth</td>
                  <td>: {dob}</td>
                </tr>
                <tr>
                  <td className="lbl font-bold text-slate-700">Mother's Name</td>
                  <td>: {mother}</td>
                  <td className="lbl font-bold text-slate-700">Marital / Religion</td>
                  <td>: {marital} / {religion}</td>
                </tr>
                <tr>
                  <td className="lbl font-bold text-slate-700">Permanent Address</td>
                  <td colSpan={3}>: {permAddress}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Signature */}
          {Boolean(data.showSignature) && (
            <div className="mt-6 pt-3 flex justify-between items-end border-t border-slate-200">
              <div className="text-[8pt] text-slate-500">
                {data.signatureDate && <span>Date: {data.signatureDate}</span>}
              </div>
              <div className="text-center border-t border-slate-900 pt-1 min-w-32">
                <span className="font-bold text-xs uppercase block">
                  {data.signatureText !== undefined ? data.signatureText.trim() : name}
                </span>
                <p className="text-[7pt] text-slate-500">(SIGNATURE)</p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // ALL 10 PRO FORMATS (1, 3, 5, 6, 7, 8, 9, 10, etc.)
  // Clean single-column layout styled with template-specific CSS classes
  // =========================================================================
  return (
    <div id="cv_render_paper" className={`a4-paper-container ${templateId} relative min-h-[297mm] flex flex-col justify-between`}>
      {renderCropMarks()}
      <div className="space-y-2.5 flex-1">
      {/* Top Header */}
      <div className={`cv-title-head relative ${
        styleConfig.headerAlign === 'left' ? 'text-left pr-24' :
        styleConfig.headerAlign === 'right' ? 'text-right pl-24' :
        'text-center'
      }`}>
        {showPhoto && (
          <div className={`absolute ${styleConfig.headerAlign === 'right' ? 'left-0' : 'right-0'} top-0`}>
            <img
              src={data.photoUrl}
              alt={name}
              className="w-20 h-24 object-cover border border-slate-400 shadow-sm"
            />
          </div>
        )}

        <h2>CURRICULUM VITAE</h2>
        <h1>{name}</h1>
        {jobTitle && (
          <p className="font-bold text-sm text-sky-700 tracking-wide">{jobTitle}</p>
        )}
        <div className="text-[9.5pt] text-slate-700 mt-1">
          {mobile && <span>Telephone No: {mobile}</span>}
          {mobile && email && <span> | </span>}
          {email && <span>Email: {email}</span>}
          {passport && <span> | Passport: <strong>{passport}</strong></span>}
        </div>
      </div>

      {/* Main Content Flow (Supports One / Two Columns from Page Layout) */}
      <div className="cv-content-flow">
        {/* Objective */}
        {objective && (
          <div className="cv-flow-section">
            <div className="sec-banner">OBJECTIVE</div>
            <p className="text-justify text-[9.5pt] leading-relaxed text-slate-800 mb-2">
              {objective}
            </p>
          </div>
        )}

        {/* Personal Information Table */}
        <div className="cv-flow-section">
          <div className="sec-banner">PERSONAL INFORMATION</div>
          <table className="info-tbl text-[9.5pt] mb-2">
        <tbody>
          <tr>
            <td className="lbl">Name</td>
            <td>: {name}</td>
          </tr>
          {father && (
            <tr>
              <td className="lbl">Father's Name</td>
              <td>: {father}</td>
            </tr>
          )}
          {mother && (
            <tr>
              <td className="lbl">Mother's Name</td>
              <td>: {mother}</td>
            </tr>
          )}
          {dob && (
            <tr>
              <td className="lbl">Date of Birth</td>
              <td>: {dob}</td>
            </tr>
          )}
          {permAddress && (
            <tr>
              <td className="lbl">Permanent Address</td>
              <td>: {permAddress}</td>
            </tr>
          )}
          {presAddress && (
            <tr>
              <td className="lbl">Present Address</td>
              <td>: {presAddress}</td>
            </tr>
          )}
          {nationality && (
            <tr>
              <td className="lbl">Nationality</td>
              <td>: {nationality}</td>
            </tr>
          )}
          {gender && (
            <tr>
              <td className="lbl">Gender</td>
              <td>: {gender}</td>
            </tr>
          )}
          {religion && (
            <tr>
              <td className="lbl">Religion</td>
              <td>: {religion}</td>
            </tr>
          )}
          {marital && (
            <tr>
              <td className="lbl">Marital Status</td>
              <td>: {marital}</td>
            </tr>
          )}
          {(height || weight) && (
            <tr>
              <td className="lbl">Height & Weight</td>
              <td>: {height} {weight ? `/ ${weight}` : ''}</td>
            </tr>
          )}
          {passport && (
            <tr>
              <td className="lbl">Passport Number</td>
              <td>: <strong className="tracking-wider">{passport}</strong></td>
            </tr>
          )}
          {data.personalNo && (
            <tr>
              <td className="lbl">Personal No (NID)</td>
              <td>: {data.personalNo}</td>
            </tr>
          )}
          {data.previousPassportNumber && (
            <tr>
              <td className="lbl">Previous Passport No</td>
              <td>: {data.previousPassportNumber}</td>
            </tr>
          )}
          {issue && (
            <tr>
              <td className="lbl">Date of Issue</td>
              <td>: {issue} {place ? `(${place})` : ''}</td>
            </tr>
          )}
          {expiry && (
            <tr>
              <td className="lbl">Date Of Expiry</td>
              <td>: {expiry}</td>
            </tr>
          )}
          {!issue && place && (
            <tr>
              <td className="lbl">Place of Issue</td>
              <td>: {place}</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Language Skills */}
      {data.languages.length > 0 && (
        <div className="cv-flow-section">
          <div className="sec-banner">LANGUAGE SKILLS</div>
          <div className="text-[9.5pt] space-y-0.5 mb-2">
            {data.languages.map((l) => (
              <p key={l.id}>
                <strong>{l.name}:</strong> {l.proficiency}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.educations.length > 0 && (
        <div className="cv-flow-section">
          <div className="sec-banner">EDUCATION</div>
          <table className="grid-tbl text-[9.5pt] mb-2">
            <thead>
              <tr>
                <th className="w-12 text-center">SL</th>
                <th>EXAMINATION</th>
                <th>INSTITUTION / BOARD</th>
                <th className="w-20 text-center">YEAR</th>
              </tr>
            </thead>
            <tbody>
              {data.educations.map((edu, i) => (
                <tr key={edu.id}>
                  <td className="text-center font-bold">0{i + 1}</td>
                  <td className="font-semibold">{edu.exam}</td>
                  <td>{edu.inst} {edu.board ? `(${edu.board})` : ''}</td>
                  <td className="text-center">{edu.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Work Experience */}
      {data.experiences.length > 0 && (() => {
        const hasDesignation = data.experiences.some((exp) => Boolean(exp.designation && exp.designation.trim() !== ''));
        return (
          <div className="cv-flow-section">
            <div className="sec-banner">WORK EXPERIENCE</div>
            <table className="grid-tbl text-[9.5pt] mb-2">
              <thead>
                <tr>
                  <th className="w-10 text-center">S.L</th>
                  <th>NAME OF PROJECT / COMPANY</th>
                  <th className={hasDesignation ? "w-28" : "w-32"}>COUNTRY</th>
                  {hasDesignation && <th className="w-32">DESIGNATION</th>}
                  <th className={hasDesignation ? "w-28" : "w-32"}>DURATION</th>
                </tr>
              </thead>
              <tbody>
                {data.experiences.map((exp, i) => (
                  <tr key={exp.id}>
                    <td className="text-center font-bold">{i + 1}.</td>
                    <td className="font-medium text-slate-900">{exp.project}</td>
                    <td>{exp.country}</td>
                    {hasDesignation && <td className="font-medium">{exp.designation || '-'}</td>}
                    <td>{exp.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Skills */}
      {skills && (
        <div className="cv-flow-section">
          <div className="sec-banner">SKILLS & EXPERTISE</div>
          <p className="text-[9.5pt] leading-relaxed text-slate-800 mb-2">{skills}</p>
        </div>
      )}

      {/* Certifications (if available) */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="cv-flow-section">
          <div className="sec-banner">CERTIFICATIONS & TRAININGS</div>
          <div className="text-[9.5pt] space-y-1 mb-2">
            {data.certifications.map((c) => (
              <p key={c.id}>
                • <strong>{c.title}</strong> — {c.organization} ({c.year})
              </p>
            ))}
          </div>
        </div>
      )}
      </div>
      </div>

      {/* Signature */}
      {Boolean(data.showSignature) && (
        <div className="mt-auto pt-6 flex justify-between items-end">
          <div className="text-[9pt] text-slate-600">
            {data.signatureDate && <span>Date: {data.signatureDate}</span>}
          </div>
          <div className="text-center border-t border-slate-900 pt-1 min-w-36">
            {(data.signatureText !== undefined ? data.signatureText.trim() : name) ? (
              <span className="font-bold text-xs uppercase tracking-wide block">
                {data.signatureText !== undefined ? data.signatureText.trim() : name}
              </span>
            ) : (
              <div className="h-4" />
            )}
            <p className="text-[8pt] text-slate-600">(SIGNATURE)</p>
          </div>
        </div>
      )}
    </div>
    );
  };

  const numericFontSize =
    typeof styleConfig.fontSize === 'number'
      ? styleConfig.fontSize
      : styleConfig.fontSize === 'xs'
      ? 8
      : styleConfig.fontSize === 'sm'
      ? 9
      : styleConfig.fontSize === 'lg'
      ? 12
      : styleConfig.fontSize === 'xl'
      ? 14
      : 11;

  const paperClass = `cv-paper-${styleConfig.paperSize || 'a4'}`;
  const fontClass = `cv-font-${styleConfig.fontFamily || 'nirmala'}`;
  const sizeClass = 'cv-size-custom';
  const spacingClass = `cv-spacing-${styleConfig.spacing || 'normal'}`;
  const gapClass = `cv-gap-${styleConfig.sectionGap || styleConfig.spacing || 'normal'}`;
  const alignClass = `cv-header-align-${styleConfig.headerAlign || 'center'}`;

  // Word Ribbon classes
  const marginsClass = `cv-margins-${styleConfig.margins || 'normal'}`;
  const orientationClass = styleConfig.orientation === 'landscape' ? 'cv-orientation-landscape' : 'cv-orientation-portrait';
  const textAlignClass = styleConfig.textAlign ? `cv-text-${styleConfig.textAlign}` : '';
  const boldClass = styleConfig.isBold ? 'cv-fmt-bold' : '';
  const italicClass = styleConfig.isItalic ? 'cv-fmt-italic' : '';
  const underlineClass = styleConfig.isUnderline ? 'cv-fmt-underline' : '';
  const strikeClass = styleConfig.isStrikethrough ? 'cv-fmt-strike' : '';
  const caseClass = styleConfig.textCase && styleConfig.textCase !== 'none' ? `cv-case-${styleConfig.textCase}` : '';
  const columnsClass = styleConfig.columns === 'two' ? 'cv-columns-two' : 'cv-columns-one';
  const fontColorClass = styleConfig.fontColor ? 'cv-has-font-color' : '';
  const highlightClass =
    styleConfig.highlightColor && styleConfig.highlightColor !== '#ffffff' && styleConfig.highlightColor !== 'transparent'
      ? 'cv-has-highlight'
      : '';
  const bulletsClass = styleConfig.showBullets === false ? 'cv-hide-bullets' : '';

  const customStyle: React.CSSProperties = {
    ['--cv-base-font-size' as any]: `${numericFontSize}pt`,
    ['--cv-line-height' as any]: `${styleConfig.lineSpacing ?? 1.35}`,
    ['--cv-spacing-before' as any]: `${styleConfig.spacingBefore ?? 0}pt`,
    ['--cv-spacing-after' as any]: `${styleConfig.spacingAfter ?? 8}pt`,
    ['--cv-indent-left' as any]: `${styleConfig.indentLeft ?? 0}in`,
    ['--cv-indent-right' as any]: `${styleConfig.indentRight ?? 0}in`,
    ['--cv-margin-top' as any]: m.top,
    ['--cv-margin-bottom' as any]: m.bottom,
    ['--cv-margin-left' as any]: m.left,
    ['--cv-margin-right' as any]: m.right,
    ...(styleConfig.fontColor ? { ['--cv-font-color' as any]: styleConfig.fontColor } : {}),
    ...(styleConfig.highlightColor ? { ['--cv-highlight-color' as any]: styleConfig.highlightColor } : {}),
  };

  const isLandscape = styleConfig.orientation === 'landscape';
  const paperWidthClass = isLandscape
    ? 'max-w-[297mm]'
    : styleConfig.paperSize === 'letter' || styleConfig.paperSize === 'legal'
    ? 'max-w-[216mm]'
    : 'max-w-[210mm]';

  return (
    <div
      style={customStyle}
      className={`cv-pages-wrapper ${paperClass} ${fontClass} ${sizeClass} ${spacingClass} ${gapClass} ${alignClass} ${marginsClass} ${orientationClass} ${columnsClass} ${textAlignClass} ${boldClass} ${italicClass} ${underlineClass} ${strikeClass} ${caseClass} ${fontColorClass} ${highlightClass} ${bulletsClass} flex flex-col items-center w-full`}
    >
      {/* Top Paper Size Header for Page 1 */}
      <div className={`print-hide mb-2.5 flex items-center justify-between w-full ${paperWidthClass} px-1 text-[11px] text-slate-400 select-none`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-sky-300 px-2.5 py-1 rounded font-mono text-[10.5px] shadow-xs">
            <span className="w-2.5 h-3.5 border border-sky-400 bg-white/10 rounded-2xs inline-block" />
            <strong className="text-white">
              {isLandscape ? 'A4 Landscape' : (styleConfig.paperSize?.toUpperCase() || 'A4')}
            </strong>{' '}
            {isLandscape
              ? '(11.7 × 8.3 in; 297 × 210 mm) • 11.69" × 8.27"'
              : styleConfig.paperSize === 'letter'
              ? '(8.5 × 11 in; 216 × 279 mm)'
              : styleConfig.paperSize === 'legal'
              ? '(8.5 × 14 in; 216 × 356 mm)'
              : '(8.2 × 11.7 in; 210 × 297 mm) • 8.27" × 11.69"'}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">স্ট্যান্ডার্ড প্রিন্ট ও PDF সাইজ</span>
        </div>
        <div className="text-[10.5px] font-mono text-slate-400">
          পেজ ১ / {1 + (data.additionalPages?.length || 0)}
        </div>
      </div>

      {/* Page 1: Main CV */}
      {renderMainTemplate()}

      {/* Additional Pages (Page 2, Page 3, etc.) */}
      {data.additionalPages && data.additionalPages.length > 0 &&
        data.additionalPages.map((page, pIdx) => {
          const pageNumber = pIdx + 2;
          const totalPages = 1 + data.additionalPages!.length;
          return (
            <React.Fragment key={page.id}>
              {/* Visual Page Break Indicator for screen preview */}
              <div className={`print-hide my-8 flex items-center justify-center gap-3 w-full ${paperWidthClass} text-xs text-slate-400 select-none`}>
                <div className="h-px bg-slate-800 flex-1 border-b border-dashed border-slate-700" />
                <span className="bg-slate-900 border border-slate-700 text-sky-400 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10.5px] shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  পেজ {pageNumber} (A4 • 210 × 297 mm)
                </span>
                {onDeleteAdditionalPage && (
                  <button
                    type="button"
                    onClick={() => onDeleteAdditionalPage(page.id)}
                    className="bg-rose-950/90 border border-rose-600/70 hover:bg-rose-900 text-rose-200 px-3 py-1 rounded-full font-bold text-[11px] shadow transition cursor-pointer flex items-center gap-1.5 hover:border-rose-400"
                    title="এই পেজটি সিভি থেকে মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                    <span>পেজ {pageNumber} ডিলিট করুন</span>
                  </button>
                )}
                <div className="h-px bg-slate-800 flex-1 border-b border-dashed border-slate-700" />
              </div>

              {/* Additional A4 Page Container */}
              <div
                id={`cv_page_${pageNumber}`}
                className="a4-paper-container fmt-additional-page relative"
              >
                {renderCropMarks()}
                {/* Header */}
                <div className="page-header">
                  <div>
                    <h2 className="page-candidate-name">{name}</h2>
                    <p className="page-candidate-sub">
                      {jobTitle ? `${jobTitle} ` : ''}
                      {mobile ? `• Telephone No: ${mobile} ` : ''}
                      {passport ? `• Passport: ${passport}` : ''}
                    </p>
                  </div>
                  <div className="page-badge">
                    PAGE {pageNumber} OF {totalPages}
                  </div>
                </div>

                {/* Content Area */}
                <div className="page-content-area">
                  <div className="page-title-banner">
                    {page.title || `PAGE ${pageNumber}: ADDITIONAL DETAILS`}
                  </div>

                  {page.subtitle && (
                    <p className="text-[9.5pt] font-semibold text-slate-700 -mt-2 mb-3">
                      {page.subtitle}
                    </p>
                  )}

                  {page.content && (
                    <div className="page-text">
                      {page.content}
                    </div>
                  )}

                  {page.items && page.items.filter((item) => Boolean(item && item.trim())).length > 0 && (
                    <ul className="page-bullets">
                      {page.items.filter((item) => Boolean(item && item.trim())).map((item, iIdx) => (
                        <li key={iIdx}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {/* Images Attachment Gallery */}
                  {page.images && page.images.length > 0 && (
                    <div className="mt-4">
                      <span className="text-[8.5pt] font-bold uppercase tracking-wider text-slate-600 block mb-2">
                        সংযুক্ত ডকুমেন্ট ও সার্টিফিকেটের কপি:
                      </span>
                      <div className="doc-image-grid">
                        {page.images.map((imgSrc, imgIdx) => (
                          <div key={imgIdx} className="doc-image-card">
                            <img
                              src={imgSrc}
                              alt={`Attachment ${imgIdx + 1}`}
                              className="w-full h-44 object-contain rounded border border-slate-200 bg-slate-50"
                            />
                            <p className="text-[8pt] text-slate-500 text-center mt-1">
                              সংযুক্তি {imgIdx + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Signature at bottom */}
                {page.showSignature && (
                  <div className="mt-8 pt-4 flex justify-between items-end border-t border-slate-200">
                    <div className="text-[9pt] text-slate-600">
                      {data.signatureDate && <span>Date: {data.signatureDate}</span>}
                    </div>
                    <div className="text-center border-t border-slate-900 pt-1 min-w-36">
                      {(data.signatureText !== undefined ? data.signatureText.trim() : name) ? (
                        <span className="font-bold text-xs uppercase tracking-wide block">
                          {data.signatureText !== undefined ? data.signatureText.trim() : name}
                        </span>
                      ) : (
                        <div className="h-4" />
                      )}
                      <p className="text-[8pt] text-slate-600">(SIGNATURE)</p>
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
    </div>
  );
};
