export const RESUME_TEMPLATES = [
  "classic",
  "modern",
  "minimal",
  "professional",
  "executive",
  "creative",
] as const;
export type ResumeTemplate = (typeof RESUME_TEMPLATES)[number];

export const LANGUAGE_LEVELS = [
  "Basic",
  "Conversational",
  "Intermediate",
  "Advanced",
  "Fluent",
  "Native",
] as const;
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  phone2: string;
  location: string;
  website: string;
  linkedin: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  nationality: string;
  /** Optional professional photo, stored inline as a small data: URL. */
  photo: string;
}

export interface ExperienceItem {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
  /** Legacy paragraph — migrated into `responsibilities` on load; kept for fallback rendering. */
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CertificationItem {
  name: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface LanguageItem {
  language: string;
  proficiency: string;
}

export interface ReferenceItem {
  name: string;
  position: string;
  institution: string;
  contact: string;
  location: string;
  email: string;
}

/** Full resource as returned by the authenticated API. */
export interface Resume {
  id: string;
  ownerId: string;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  skills: string[];
  languages: LanguageItem[];
  references: ReferenceItem[];
  template: ResumeTemplate;
  isPublic: boolean;
  publicSlug?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The only fields the editor is allowed to send back on save. */
export interface ResumeEditableFields {
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  skills: string[];
  languages: LanguageItem[];
  references: ReferenceItem[];
  template: ResumeTemplate;
}

/* -------------------------- safe-default factories ------------------------- */

export const emptyPersonalInfo = (): PersonalInfo => ({
  fullName: "",
  email: "",
  phone: "",
  phone2: "",
  location: "",
  website: "",
  linkedin: "",
  dateOfBirth: "",
  gender: "",
  religion: "",
  nationality: "",
  photo: "",
});

export const emptyExperience = (): ExperienceItem => ({
  jobTitle: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  responsibilities: [],
  description: "",
});

export const emptyEducation = (): EducationItem => ({
  institution: "",
  degree: "",
  fieldOfStudy: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
});

export const emptyCertification = (): CertificationItem => ({
  name: "",
  institution: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
});

export const emptyLanguage = (): LanguageItem => ({ language: "", proficiency: "" });

export const emptyReference = (): ReferenceItem => ({
  name: "",
  position: "",
  institution: "",
  contact: "",
  location: "",
  email: "",
});

const str = (value: unknown): string => (typeof value === "string" ? value : "");
const bool = (value: unknown): boolean => value === true;
const strArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : [];

const toTemplate = (value: unknown): ResumeTemplate =>
  RESUME_TEMPLATES.includes(value as ResumeTemplate) ? (value as ResumeTemplate) : "classic";

/** Splits a legacy paragraph description into bullet lines. */
const linesFromDescription = (description: string): string[] =>
  description
    .split(/\r?\n|•|·|(?<=[.;])\s{2,}/)
    .map((line) => line.replace(/^[-*•·\s]+/, "").trim())
    .filter((line) => line.length > 0);

/**
 * Accepts either the full authenticated `Resume` or the narrower public-resume
 * shape (whose `personalInfo` omits sensitive fields).
 */
type ResumeSource = Partial<Omit<Resume, "personalInfo">> & {
  personalInfo?: Partial<PersonalInfo>;
};

/**
 * Coerces a possibly-partial API resume into a fully-populated editable form,
 * so every input stays controlled and no `undefined` reaches React.
 * Also migrates legacy `experience[].description` into `responsibilities`.
 */
export function toEditableFields(raw: ResumeSource | null | undefined): ResumeEditableFields {
  const pi = (raw?.personalInfo ?? {}) as Partial<PersonalInfo>;
  return {
    title: str(raw?.title),
    summary: str(raw?.summary),
    template: toTemplate(raw?.template),
    personalInfo: {
      fullName: str(pi.fullName),
      email: str(pi.email),
      phone: str(pi.phone),
      phone2: str(pi.phone2),
      location: str(pi.location),
      website: str(pi.website),
      linkedin: str(pi.linkedin),
      dateOfBirth: str(pi.dateOfBirth),
      gender: str(pi.gender),
      religion: str(pi.religion),
      nationality: str(pi.nationality),
      photo: str(pi.photo),
    },
    experience: Array.isArray(raw?.experience)
      ? raw.experience.map((item) => {
          const e = (item ?? {}) as Partial<ExperienceItem>;
          const existing = strArray(e.responsibilities).map((r) => r.trim()).filter(Boolean);
          const legacy = str(e.description).trim();
          return {
            jobTitle: str(e.jobTitle),
            company: str(e.company),
            location: str(e.location),
            startDate: str(e.startDate),
            endDate: str(e.endDate),
            current: bool(e.current),
            responsibilities: existing.length > 0 ? existing : linesFromDescription(legacy),
            // The editor works only with `responsibilities`; the legacy paragraph
            // is migrated above and cleared here so it's saved once as bullets.
            description: "",
          };
        })
      : [],
    education: Array.isArray(raw?.education)
      ? raw.education.map((item) => {
          const ed = (item ?? {}) as Partial<EducationItem>;
          return {
            institution: str(ed.institution),
            degree: str(ed.degree),
            fieldOfStudy: str(ed.fieldOfStudy),
            location: str(ed.location),
            startDate: str(ed.startDate),
            endDate: str(ed.endDate),
            description: str(ed.description),
          };
        })
      : [],
    certifications: Array.isArray(raw?.certifications)
      ? raw.certifications.map((item) => {
          const c = (item ?? {}) as Partial<CertificationItem>;
          return {
            name: str(c.name),
            institution: str(c.institution),
            location: str(c.location),
            startDate: str(c.startDate),
            endDate: str(c.endDate),
            description: str(c.description),
          };
        })
      : [],
    skills: strArray(raw?.skills),
    languages: Array.isArray(raw?.languages)
      ? raw.languages.map((item) => {
          const l = (item ?? {}) as Partial<LanguageItem>;
          return { language: str(l.language), proficiency: str(l.proficiency) };
        })
      : [],
    references: Array.isArray(raw?.references)
      ? raw.references.map((item) => {
          const r = (item ?? {}) as Partial<ReferenceItem>;
          return {
            name: str(r.name),
            position: str(r.position),
            institution: str(r.institution),
            contact: str(r.contact),
            location: str(r.location),
            email: str(r.email),
          };
        })
      : [],
  };
}
