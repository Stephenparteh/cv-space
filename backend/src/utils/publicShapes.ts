import type { IProfile } from "../models/Profile.js";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  IResume,
  LanguageItem,
  PersonalInfo,
  ResumeTemplate,
} from "../models/Resume.js";

/**
 * Allowlisted response shapes for the unauthenticated public API.
 *
 * Every field returned to an anonymous visitor is spelled out here on purpose —
 * these functions never call `.toJSON()` on a raw document.
 *
 * DELIBERATELY WITHHELD from every public endpoint (M6 privacy review):
 *   personalInfo.dateOfBirth, personalInfo.gender, personalInfo.religion,
 *   personalInfo.nationality, and the entire `references` section (it contains
 *   other people's contact details).
 * Also never exposed: id / _id / ownerId / userId / isPublic / publicSlug /
 *   createdAt / __v.
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

export interface PublicExperienceItem {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
  description: string;
}

export interface PublicResume {
  title: string;
  template: ResumeTemplate;
  summary: string;
  personalInfo: PublicPersonalInfo;
  experience: PublicExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  skills: string[];
  languages: LanguageItem[];
  updatedAt: Date;
}

const s = (value: unknown): string => (typeof value === "string" ? value : "");

const publicPersonalInfo = (pi: PersonalInfo): PublicPersonalInfo => ({
  fullName: s(pi?.fullName),
  email: s(pi?.email),
  phone: s(pi?.phone),
  phone2: s(pi?.phone2),
  location: s(pi?.location),
  website: s(pi?.website),
  linkedin: s(pi?.linkedin),
  photo: s(pi?.photo),
  // dateOfBirth / gender / religion / nationality intentionally omitted.
});

const publicExperience = (item: ExperienceItem): PublicExperienceItem => ({
  jobTitle: s(item.jobTitle),
  company: s(item.company),
  location: s(item.location),
  startDate: s(item.startDate),
  endDate: s(item.endDate),
  current: item.current === true,
  responsibilities: (item.responsibilities ?? []).filter((r) => typeof r === "string"),
  description: s(item.description),
});

const publicEducation = (item: EducationItem): EducationItem => ({
  institution: s(item.institution),
  degree: s(item.degree),
  fieldOfStudy: s(item.fieldOfStudy),
  location: s(item.location),
  startDate: s(item.startDate),
  endDate: s(item.endDate),
  description: s(item.description),
});

const publicCertification = (item: CertificationItem): CertificationItem => ({
  name: s(item.name),
  institution: s(item.institution),
  location: s(item.location),
  startDate: s(item.startDate),
  endDate: s(item.endDate),
  description: s(item.description),
});

const publicLanguage = (item: LanguageItem): LanguageItem => ({
  language: s(item.language),
  proficiency: s(item.proficiency),
});

export const toPublicResume = (resume: IResume): PublicResume => ({
  title: s(resume.title),
  template: resume.template,
  summary: s(resume.summary),
  personalInfo: publicPersonalInfo(resume.personalInfo),
  experience: (resume.experience ?? []).map(publicExperience),
  education: (resume.education ?? []).map(publicEducation),
  certifications: (resume.certifications ?? []).map(publicCertification),
  skills: [...(resume.skills ?? [])],
  languages: (resume.languages ?? []).map(publicLanguage),
  // references intentionally omitted from every public response.
  updatedAt: resume.updatedAt,
});

export interface PublicProfile {
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  featuredResume: { slug: string; resume: PublicResume } | null;
}

export const toPublicProfile = (
  profile: IProfile,
  featuredResume: IResume | null,
): PublicProfile => ({
  displayName: s(profile.displayName),
  headline: s(profile.headline),
  bio: s(profile.bio),
  location: s(profile.location),
  skills: [...(profile.skills ?? [])],
  featuredResume:
    featuredResume && featuredResume.publicSlug
      ? { slug: featuredResume.publicSlug, resume: toPublicResume(featuredResume) }
      : null,
});

export interface DirectoryEntry {
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  /** Public slug of the featured resume, when it is still public. */
  resumeSlug: string | null;
}

export const toDirectoryEntry = (
  profile: IProfile,
  resumeSlug: string | null,
): DirectoryEntry => ({
  slug: s(profile.slug),
  displayName: s(profile.displayName),
  headline: s(profile.headline),
  bio: s(profile.bio),
  location: s(profile.location),
  skills: [...(profile.skills ?? [])],
  resumeSlug,
});
