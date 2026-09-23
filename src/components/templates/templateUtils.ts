import React from 'react';
import { CVData, StyleConfig } from '../../types';

export interface TemplateProps {
  data: CVData;
  styleConfig: StyleConfig;
  renderCropMarks: () => React.ReactNode;
}

export const extractCVFields = (data: CVData, styleConfig: StyleConfig) => {
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
  const showPhoto = styleConfig.showPhoto && Boolean(data.photoUrl);

  return {
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
    gender,
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
  };
};
