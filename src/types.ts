export interface EducationItem {
  id: string;
  exam: string;
  inst: string;
  board: string;
  year: string;
  grade?: string;
}

export interface ExperienceItem {
  id: string;
  project: string;
  country: string;
  designation?: string;
  duration: string;
  responsibilities?: string[];
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  organization: string;
  year: string;
}

export interface AdditionalPage {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  items?: string[];
  images?: string[];
  showSignature?: boolean;
}

export interface CVData {
  // Contact & Personal
  name: string;
  jobTitle: string;
  mobile: string;
  email: string;
  photoUrl?: string;
  objective: string;

  // Family & Personal
  fatherName: string;
  motherName: string;
  dob: string;
  nationality: string;
  permanentAddress: string;
  presentAddress: string;
  gender: string;
  religion: string;
  maritalStatus: string;
  height: string;
  weight: string;

  // Passport Info
  passportNumber: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  placeOfIssue?: string;
  personalNo?: string;
  previousPassportNumber?: string;
  placeOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;

  // Lists
  languages: LanguageItem[];
  educations: EducationItem[];
  experiences: ExperienceItem[];
  skills: string[];
  skillsRaw?: string;
  certifications?: CertificationItem[];

  // Signature & Declaration
  signatureText?: string;
  signatureDate?: string;
  showSignature?: boolean;

  // Additional A4 Pages
  additionalPages?: AdditionalPage[];
}

export type CVTemplateId =
  | 'fmt-gulf-1'
  | 'fmt-gulf-2'
  | 'fmt-gulf-3'
  | 'fmt-tech-1'
  | 'fmt-tech-2'
  | 'fmt-tech-3'
  | 'fmt-corp-1'
  | 'fmt-corp-2'
  | 'fmt-corp-3'
  | 'fmt-corp-4';

export interface TemplateOption {
  id: CVTemplateId;
  name: string;
  category: 'gulf' | 'technical' | 'corporate';
  description: string;
  accentColor: string;
}

export type CVFontFamily =
  | 'times'
  | 'arial'
  | 'calibri'
  | 'georgia'
  | 'garamond'
  | 'trebuchet'
  | 'sans'
  | 'serif'
  | 'bengali'
  | 'mono';

export interface StyleConfig {
  accentColor: string;
  fontFamily: CVFontFamily;
  fontSize: 'sm' | 'base' | 'lg';
  spacing: 'compact' | 'normal' | 'relaxed';
  showPhoto: boolean;
}

export interface CVHistoryItem {
  id: string;
  timestamp: number;
  dateFormatted: string;
  title: string;
  candidateName: string;
  passportNumber?: string;
  templateId: CVTemplateId;
  data: CVData;
  style?: StyleConfig;
  summary?: string;
}
