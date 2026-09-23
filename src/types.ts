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
  | 'fmt-gulf-4'
  | 'fmt-gulf-5'
  | 'fmt-gulf-6'
  | 'fmt-tech-1'
  | 'fmt-tech-2'
  | 'fmt-tech-3'
  | 'fmt-tech-4'
  | 'fmt-tech-5'
  | 'fmt-corp-1'
  | 'fmt-corp-2'
  | 'fmt-corp-3'
  | 'fmt-corp-4'
  | 'fmt-corp-5'
  | 'fmt-corp-6';

export interface TemplateOption {
  id: CVTemplateId;
  name: string;
  category: 'gulf' | 'technical' | 'corporate';
  description: string;
  accentColor: string;
}

export type CVFontFamily =
  | 'times'
  | 'nirmala'
  | 'arial'
  | 'calibri'
  | 'georgia'
  | 'garamond'
  | 'trebuchet'
  | 'sans'
  | 'serif'
  | 'bengali'
  | 'mono';

export type CVFontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | number;
export type CVSpacing = 'compact' | 'normal' | 'relaxed' | 'spacious';
export type CVSectionGap = 'compact' | 'normal' | 'relaxed' | 'spacious';
export type CVHeaderAlign = 'left' | 'center' | 'right';
export type CVPaperSize = 'a4' | 'letter' | 'legal';
export type CVMargins = 'normal' | 'narrow' | 'moderate' | 'wide';
export type CVOrientation = 'portrait' | 'landscape';
export type CVColumns = 'one' | 'two';
export type CVTextCase = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type CVTextAlign = 'left' | 'center' | 'right' | 'justify';

export interface StyleConfig {
  accentColor: string;
  fontFamily: CVFontFamily;
  fontSize: CVFontSize;
  spacing: CVSpacing;
  sectionGap?: CVSectionGap;
  headerAlign?: CVHeaderAlign;
  showPhoto: boolean;
  paperSize?: CVPaperSize;
  fitSinglePage?: boolean;
  // Word Ribbon Page Setup & Paragraph options
  margins?: CVMargins;
  orientation?: CVOrientation;
  columns?: CVColumns;
  indentLeft?: number;
  indentRight?: number;
  spacingBefore?: number;
  spacingAfter?: number;
  showLineNumbers?: boolean;
  // Word Ribbon Home Font & Paragraph options
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  textCase?: CVTextCase;
  textAlign?: CVTextAlign;
  lineSpacing?: number;
  fontColor?: string;
  highlightColor?: string;
  showBullets?: boolean;
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
