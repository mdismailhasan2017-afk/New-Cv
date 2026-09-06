import React from 'react';
import { CVData, CVTemplateId, StyleConfig } from '../types';
import { Mail, Phone, MapPin, Globe, Award, Calendar, CheckCircle2, Trash2 } from 'lucide-react';

interface CVRendererProps {
  data: CVData;
  templateId: CVTemplateId;
  styleConfig: StyleConfig;
  onDeleteAdditionalPage?: (id?: string) => void;
}

export const CVRenderer: React.FC<CVRendererProps> = ({
  data,
  templateId,
  styleConfig,
  onDeleteAdditionalPage,
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

  const renderMainTemplate = () => {
    // =========================================================================
    // FORMAT 4: Technical 2-Column Sidebar (Geometric Balance Archetype)
    // =========================================================================
    if (templateId === 'fmt-tech-1') {
    return (
      <div id="cv_render_paper" className="a4-paper-container fmt-tech-1">
        {/* Left Dark Sidebar */}
        <aside className="left-col">
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
                  <span className="contact-icon block text-[8pt] text-slate-400 font-bold uppercase">ফোন / MOBILE</span>
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
                    <span className="text-slate-400">Issue:</span> {issue}
                  </div>
                )}
                {expiry && (
                  <div className="text-[8.5pt] text-slate-300">
                    <span className="text-slate-400">Expiry:</span> {expiry}
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
        </aside>

        {/* Right Content Column */}
        <main className="right-col">
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
                {data.emergencyContactPhone && (
                  <tr>
                    <td className="py-0.5 font-bold text-slate-700">Emergency Contact</td>
                    <td className="py-0.5 text-slate-800">
                      : {data.emergencyContactName ? `${data.emergencyContactName} ` : ''}
                      {data.emergencyContactRelation ? `(${data.emergencyContactRelation}) ` : ''}
                      {data.emergencyContactPhone}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Signature */}
          {Boolean(data.showSignature) && (
            <div className="mt-6 text-right">
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
      <div id="cv_render_paper" className="a4-paper-container fmt-gulf-2">
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
              <td className="lbl">Date of Expiry</td>
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
            {data.emergencyContactPhone && (
              <tr>
                <td className="lbl">Emergency Contact</td>
                <td colSpan={3}>
                  : {data.emergencyContactName ? `${data.emergencyContactName} ` : ''}
                  {data.emergencyContactRelation ? `(${data.emergencyContactRelation}) ` : ''}
                  - {data.emergencyContactPhone}
                </td>
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

        {/* Signature */}
        {Boolean(data.showSignature) && (
          <div className="mt-8 flex justify-between items-end">
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
  // ALL OTHER FORMATS (1, 3, 5, 6, 7, 8, 9, 10)
  // Clean single-column layout styled with template-specific CSS classes
  // =========================================================================
  return (
    <div id="cv_render_paper" className={`a4-paper-container ${templateId}`}>
      {/* Top Header */}
      <div className="cv-title-head relative">
        {showPhoto && (
          <div className="absolute right-0 top-0">
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
          {mobile && <span>Mobile: {mobile}</span>}
          {mobile && email && <span> | </span>}
          {email && <span>Email: {email}</span>}
          {passport && <span> | Passport: <strong>{passport}</strong></span>}
        </div>
      </div>

      {/* Objective */}
      {objective && (
        <>
          <div className="sec-banner">OBJECTIVE</div>
          <p className="text-justify text-[9.5pt] leading-relaxed text-slate-800 mb-2">
            {objective}
          </p>
        </>
      )}

      {/* Personal Information Table */}
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
          {(issue || expiry) && (
            <tr>
              <td className="lbl">Date of Issue / Expiry</td>
              <td>: {issue || 'N/A'} / {expiry || 'N/A'} {place ? `(${place})` : ''}</td>
            </tr>
          )}
          {data.emergencyContactPhone && (
            <tr>
              <td className="lbl">Emergency Contact</td>
              <td>
                : {data.emergencyContactName ? `${data.emergencyContactName} ` : ''}
                {data.emergencyContactRelation ? `(${data.emergencyContactRelation}) ` : ''}
                - {data.emergencyContactPhone}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Language Skills */}
      {data.languages.length > 0 && (
        <>
          <div className="sec-banner">LANGUAGE SKILLS</div>
          <div className="text-[9.5pt] space-y-0.5 mb-2">
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
        </>
      )}

      {/* Work Experience */}
      {data.experiences.length > 0 && (() => {
        const hasDesignation = data.experiences.some((exp) => Boolean(exp.designation && exp.designation.trim() !== ''));
        return (
          <>
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
          </>
        );
      })()}

      {/* Skills */}
      {skills && (
        <>
          <div className="sec-banner">SKILLS & EXPERTISE</div>
          <p className="text-[9.5pt] leading-relaxed text-slate-800 mb-2">{skills}</p>
        </>
      )}

      {/* Certifications (if available) */}
      {data.certifications && data.certifications.length > 0 && (
        <>
          <div className="sec-banner">CERTIFICATIONS & TRAININGS</div>
          <div className="text-[9.5pt] space-y-1 mb-2">
            {data.certifications.map((c) => (
              <p key={c.id}>
                • <strong>{c.title}</strong> — {c.organization} ({c.year})
              </p>
            ))}
          </div>
        </>
      )}

      {/* Signature */}
      {Boolean(data.showSignature) && (
        <div className="mt-8 pt-4 flex justify-between items-end">
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

  const fontClass = `cv-font-${styleConfig.fontFamily || 'times'}`;
  const spacingClass = `cv-spacing-${styleConfig.spacing || 'normal'}`;

  return (
    <div className={`cv-pages-wrapper ${fontClass} ${spacingClass} flex flex-col items-center w-full`}>
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
              <div className="print-hide my-8 flex items-center justify-center gap-3 w-full max-w-[210mm] text-xs text-slate-400 select-none">
                <div className="h-px bg-slate-800 flex-1 border-b border-dashed border-slate-700" />
                <span className="bg-slate-900 border border-slate-700 text-sky-400 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10.5px] shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  পেজ {pageNumber} (অতিরিক্ত A4 পেজ)
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
                className="a4-paper-container fmt-additional-page"
              >
                {/* Header */}
                <div className="page-header">
                  <div>
                    <h2 className="page-candidate-name">{name}</h2>
                    <p className="page-candidate-sub">
                      {jobTitle ? `${jobTitle} ` : ''}
                      {mobile ? `• Mobile: ${mobile} ` : ''}
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
