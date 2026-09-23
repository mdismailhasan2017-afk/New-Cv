import React from 'react';
import { TemplateProps, extractCVFields } from './templateUtils';

export const EmbassyAttestationTemplate: React.FC<TemplateProps> = ({
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
    <div id="cv_render_paper" className="a4-paper-container has-custom-pad fmt-corp-6 relative p-8 font-serif bg-white text-slate-900 border-4 border-double border-slate-700 min-h-[297mm] flex flex-col justify-between">
      {renderCropMarks()}

      <div className="space-y-4 flex-1">
        {/* Official Government Attestation Header */}
        <div className="text-center border-b-2 border-slate-800 pb-3">
        <div className="text-[8pt] tracking-widest font-bold uppercase text-slate-600">
          MINISTRY OF FOREIGN AFFAIRS & EMBASSY ATTESTATION DOSSIER
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900 mt-0.5">
          {name}
        </h1>
        {jobTitle && (
          <p className="text-xs font-semibold uppercase text-slate-700 mt-0.5">
            DESIGNATION / PROFESSION: {jobTitle}
          </p>
        )}
        <div className="text-[8.5pt] text-slate-600 mt-1">
          {mobile && <span>Tel: {mobile}</span>}
          {email && <span> | Email: {email}</span>}
          {passport && <span> | Passport No: <strong className="text-slate-900 font-mono">{passport}</strong></span>}
        </div>
      </div>

      {showPhoto && (
        <div className="flex justify-center mb-3">
          <img
            src={data.photoUrl}
            alt={name}
            className="w-20 h-24 object-cover border-2 border-slate-700 shadow-xs"
          />
        </div>
      )}

      {/* Attested Particulars Table */}
      <div className="mb-4">
        <div className="bg-slate-100 text-slate-900 font-bold text-[8.5pt] px-2 py-1 uppercase border border-slate-400 mb-1 text-center">
          SCHEDULE A: VERIFIED BIOGRAPHICAL PARTICULARS
        </div>
        <table className="w-full text-[8.5pt] border-collapse border border-slate-400">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="p-1.5 font-bold bg-slate-50 w-36 border-r border-slate-300">Full Name</td>
              <td className="p-1.5 border-r border-slate-300 font-bold">{name}</td>
              <td className="p-1.5 font-bold bg-slate-50 w-36 border-r border-slate-300">Passport Number</td>
              <td className="p-1.5 font-mono font-bold">{passport || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Date of Birth</td>
              <td className="p-1.5 border-r border-slate-300">{dob}</td>
              <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Passport Expiry</td>
              <td className="p-1.5 font-mono text-rose-800">{expiry || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Father's Name</td>
              <td className="p-1.5 border-r border-slate-300">{father}</td>
              <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Date of Issue</td>
              <td className="p-1.5">{issue || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Mother's Name</td>
              <td className="p-1.5 border-r border-slate-300">{mother}</td>
              <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Place of Issue</td>
              <td className="p-1.5">{place || 'DHAKA'}</td>
            </tr>
            <tr>
              <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">Permanent Address</td>
              <td className="p-1.5" colSpan={3}>{permAddress}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Experience Table */}
      {data.experiences.length > 0 && (
        <div className="mb-4">
          <div className="bg-slate-100 text-slate-900 font-bold text-[8.5pt] px-2 py-1 uppercase border border-slate-400 mb-1 text-center">
            SCHEDULE B: RECORD OF EMPLOYMENT & OVERSEAS POSTING
          </div>
          <table className="w-full text-[8.5pt] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-400 text-left">
                <th className="p-1.5 border-r border-slate-300 w-8 text-center">SL</th>
                <th className="p-1.5 border-r border-slate-300">EMPLOYER / SPONSOR</th>
                <th className="p-1.5 border-r border-slate-300 w-28">COUNTRY</th>
                <th className="p-1.5 border-r border-slate-300 w-32">TRADE / ROLE</th>
                <th className="p-1.5 w-28">PERIOD</th>
              </tr>
            </thead>
            <tbody>
              {data.experiences.map((exp, i) => (
                <tr key={exp.id} className="border-b border-slate-300">
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold">{i + 1}</td>
                  <td className="p-1.5 border-r border-slate-300 font-medium">{exp.project}</td>
                  <td className="p-1.5 border-r border-slate-300">{exp.country}</td>
                  <td className="p-1.5 border-r border-slate-300">{exp.designation || '-'}</td>
                  <td className="p-1.5">{exp.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Education */}
      {data.educations.length > 0 && (
        <div className="mb-4">
          <div className="bg-slate-100 text-slate-900 font-bold text-[8.5pt] px-2 py-1 uppercase border border-slate-400 mb-1 text-center">
            SCHEDULE C: EDUCATIONAL & VOCATIONAL ATTAINMENTS
          </div>
          <table className="w-full text-[8.5pt] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-400 text-left">
                <th className="p-1.5 border-r border-slate-300">CERTIFICATE / EXAMINATION</th>
                <th className="p-1.5 border-r border-slate-300">ACCREDITED BOARD / INSTITUTION</th>
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
      </div>

      {/* Formal Dual Declaration & Notary Attestation Box */}
      <div className="mt-auto pt-4 border-t-2 border-slate-800 grid grid-cols-2 gap-6 items-end">
        <div className="border border-slate-400 p-2 text-center">
          <p className="text-[7pt] text-slate-500 uppercase tracking-wider mb-8">
            OFFICIAL NOTARY PUBLIC / ATTESTING AUTHORITY SEAL
          </p>
          <p className="text-[6.5pt] text-slate-400">(SEAL & SIGNATURE)</p>
        </div>

        <div className="text-center">
          {Boolean(data.showSignature) && (
            <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-xs uppercase">
              {data.signatureText !== undefined ? data.signatureText.trim() : name}
            </div>
          )}
          <span className="text-[7.5pt] uppercase text-slate-600 block">DEPONENT / APPLICANT SIGNATURE</span>
        </div>
      </div>
    </div>
  );
};
