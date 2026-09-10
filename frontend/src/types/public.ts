import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ResumeTemplate,
} from "./resume";

/**
 * personalInfo fields exposed on public endpoints — deliberately WITHOUT
 * dateOfBirth / gender / religion / nationality.
 */
export interface PublicPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  phone2: string;
  location: string;
  website: string;
  linkedin: string;
  photo: string;
}

/** Shape returned by GET /api/public/resumes/:slug — allowlisted, read-only. */
export interface PublicResume {
  title: string;
  template: ResumeTemplate;
  summary: string;
  personalInfo: PublicPersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  skills: string[];
  languages: LanguageItem[];
  updatedAt: string;
  // No `references` — never returned publicly.
}

/** Shape returned by GET /api/public/profiles/:slug. */
export interface PublicProfile {
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  featuredResume: { slug: string; resume: PublicResume } | null;
}

/** One row from GET /api/public/directory. */
export interface DirectoryEntry {
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  resumeSlug: string | null;
}

/** The authenticated user's own profile (GET /api/profile). */
export interface MyProfile {
  id: string;
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  slug?: string | null;
  isPublic: boolean;
  inDirectory: boolean;
  featuredResumeId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyProfileInput {
  displayName?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  isPublic?: boolean;
  inDirectory?: boolean;
  featuredResumeId?: string | null;
}
