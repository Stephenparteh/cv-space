import { ApiError } from "../middleware/errorHandler.js";
import {
  LANGUAGE_LEVELS,
  RESUME_TEMPLATES,
  type CertificationItem,
  type EducationItem,
  type ExperienceItem,
  type LanguageItem,
  type PersonalInfo,
  type ReferenceItem,
  type ResumeTemplate,
} from "../models/Resume.js";

// Pragmatic email check — backend guards data integrity, the frontend does UX.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const validateRegisterInput = (body: unknown): RegisterInput => {
  const source = (body ?? {}) as Record<string, unknown>;
  const name = asString(source.name).trim();
  const email = asString(source.email).trim().toLowerCase();
  const password = asString(source.password);

  const errors: string[] = [];
  if (!name) errors.push("name is required");
  if (!email) errors.push("email is required");
  else if (!EMAIL_RE.test(email)) errors.push("email is invalid");
  if (!password) errors.push("password is required");
  else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join("; "));
  }
  return { name, email, password };
};

export interface LoginInput {
  email: string;
  password: string;
}

export const validateLoginInput = (body: unknown): LoginInput => {
  const source = (body ?? {}) as Record<string, unknown>;
  const email = asString(source.email).trim().toLowerCase();
  const password = asString(source.password);

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }
  return { email, password };
};

/* -------------------------------------------------------------------------- */
/*  Resume validation                                                         */
/* -------------------------------------------------------------------------- */

/** Rejects a malformed :id before it reaches the database. */
export const assertValidObjectId = (id: string | undefined): string => {
  if (!id || !OBJECT_ID_RE.test(id)) {
    throw new ApiError(400, "Invalid resume id");
  }
  return id;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Upper bound on repeatable resume sections — far beyond any real résumé. */
const MAX_SECTION_ENTRIES = 50;

const clampStr = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const PHOTO_DATA_URL_RE = /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/]+=*$/i;
const PHOTO_MAX_CHARS = 400_000; // ~300 KB decoded

const parsePhoto = (value: unknown): string => {
  if (typeof value !== "string" || value.trim() === "") return "";
  const photo = value.trim();
  if (photo.length > PHOTO_MAX_CHARS) {
    throw new ApiError(400, "Photo is too large — please use a smaller image (under ~300 KB).");
  }
  if (!PHOTO_DATA_URL_RE.test(photo)) {
    throw new ApiError(400, "Photo must be a PNG, JPEG or WebP image.");
  }
  return photo;
};

const parseStringList = (value: unknown, label: string, maxLen: number, maxCount: number): string[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, `${label} must be an array of strings`);
  }
  return value
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim().slice(0, maxLen))
    .filter((x) => x.length > 0)
    .slice(0, maxCount);
};

const parsePersonalInfo = (value: unknown): PersonalInfo => {
  if (value !== undefined && !isPlainObject(value)) {
    throw new ApiError(400, "personalInfo must be an object");
  }
  const s = (value ?? {}) as Record<string, unknown>;
  return {
    fullName: clampStr(s.fullName, 200),
    email: clampStr(s.email, 200),
    phone: clampStr(s.phone, 60),
    phone2: clampStr(s.phone2, 60),
    location: clampStr(s.location, 200),
    website: clampStr(s.website, 300),
    linkedin: clampStr(s.linkedin, 300),
    dateOfBirth: clampStr(s.dateOfBirth, 40),
    gender: clampStr(s.gender, 40),
    religion: clampStr(s.religion, 60),
    nationality: clampStr(s.nationality, 60),
    photo: parsePhoto(s.photo),
  };
};

const parseExperience = (value: unknown): ExperienceItem[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, "experience must be an array");
  }
  return value.slice(0, MAX_SECTION_ENTRIES).map((raw, i) => {
    if (!isPlainObject(raw)) {
      throw new ApiError(400, `experience[${i}] must be an object`);
    }
    return {
      jobTitle: clampStr(raw.jobTitle, 200),
      company: clampStr(raw.company, 200),
      location: clampStr(raw.location, 200),
      startDate: clampStr(raw.startDate, 40),
      endDate: clampStr(raw.endDate, 40),
      current: raw.current === true,
      responsibilities: parseStringList(raw.responsibilities, "responsibilities", 600, 40),
      description: clampStr(raw.description, 5000),
    };
  });
};

const parseCertifications = (value: unknown): CertificationItem[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, "certifications must be an array");
  }
  return value.slice(0, MAX_SECTION_ENTRIES).map((raw, i) => {
    if (!isPlainObject(raw)) {
      throw new ApiError(400, `certifications[${i}] must be an object`);
    }
    return {
      name: clampStr(raw.name, 200),
      institution: clampStr(raw.institution, 200),
      location: clampStr(raw.location, 200),
      startDate: clampStr(raw.startDate, 40),
      endDate: clampStr(raw.endDate, 40),
      description: clampStr(raw.description, 5000),
    };
  });
};

const parseLanguages = (value: unknown): LanguageItem[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, "languages must be an array");
  }
  return value.slice(0, MAX_SECTION_ENTRIES).map((raw, i) => {
    if (!isPlainObject(raw)) {
      throw new ApiError(400, `languages[${i}] must be an object`);
    }
    const proficiency = clampStr(raw.proficiency, 40);
    if (proficiency && !LANGUAGE_LEVELS.includes(proficiency as (typeof LANGUAGE_LEVELS)[number])) {
      throw new ApiError(400, `languages[${i}].proficiency must be one of: ${LANGUAGE_LEVELS.join(", ")}`);
    }
    return { language: clampStr(raw.language, 80), proficiency };
  });
};

const parseReferences = (value: unknown): ReferenceItem[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, "references must be an array");
  }
  return value.slice(0, MAX_SECTION_ENTRIES).map((raw, i) => {
    if (!isPlainObject(raw)) {
      throw new ApiError(400, `references[${i}] must be an object`);
    }
    return {
      name: clampStr(raw.name, 200),
      position: clampStr(raw.position, 200),
      institution: clampStr(raw.institution, 200),
      contact: clampStr(raw.contact, 120),
      location: clampStr(raw.location, 200),
      email: clampStr(raw.email, 200),
    };
  });
};

const parseEducation = (value: unknown): EducationItem[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, "education must be an array");
  }
  return value.slice(0, MAX_SECTION_ENTRIES).map((raw, i) => {
    if (!isPlainObject(raw)) {
      throw new ApiError(400, `education[${i}] must be an object`);
    }
    return {
      institution: clampStr(raw.institution, 200),
      degree: clampStr(raw.degree, 200),
      fieldOfStudy: clampStr(raw.fieldOfStudy, 200),
      location: clampStr(raw.location, 200),
      startDate: clampStr(raw.startDate, 40),
      endDate: clampStr(raw.endDate, 40),
      description: clampStr(raw.description, 5000),
    };
  });
};

const parseSkills = (value: unknown): string[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, "skills must be an array of strings");
  }
  const cleaned = value
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  return Array.from(new Set(cleaned)).slice(0, 100);
};

const parseTemplate = (value: unknown): ResumeTemplate => {
  if (!RESUME_TEMPLATES.includes(value as ResumeTemplate)) {
    throw new ApiError(
      400,
      `template must be one of: ${RESUME_TEMPLATES.join(", ")}`,
    );
  }
  return value as ResumeTemplate;
};

export interface ResumeInput {
  title?: string;
  personalInfo?: PersonalInfo;
  summary?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  certifications?: CertificationItem[];
  skills?: string[];
  languages?: LanguageItem[];
  references?: ReferenceItem[];
  template?: ResumeTemplate;
}

/**
 * Builds a sanitized, whitelisted resume payload.
 *
 * - `partial: false` (create) → returns every editable field, applying MVP
 *   defaults for anything omitted.
 * - `partial: true` (update) → returns only the fields actually present in the
 *   body, so an update touches nothing the caller did not send. Sections that
 *   *are* sent (e.g. `personalInfo`, `experience`) are replaced wholesale — PUT
 *   semantics, not deep-merge.
 *
 * Never emits `ownerId` / `createdAt` / `updatedAt` / `id`.
 */
export const parseResumeInput = (
  body: unknown,
  { partial }: { partial: boolean },
): ResumeInput => {
  if (body !== undefined && !isPlainObject(body)) {
    throw new ApiError(400, "Request body must be a JSON object");
  }
  const src = (body ?? {}) as Record<string, unknown>;
  const has = (key: string) => Object.prototype.hasOwnProperty.call(src, key);
  const out: ResumeInput = {};

  if (has("title")) {
    if (typeof src.title !== "string") {
      throw new ApiError(400, "title must be a string");
    }
    out.title = src.title.trim().slice(0, 200) || "My Resume";
  } else if (!partial) {
    out.title = "My Resume";
  }

  if (has("summary")) {
    if (typeof src.summary !== "string") {
      throw new ApiError(400, "summary must be a string");
    }
    out.summary = src.summary.trim().slice(0, 5000);
  } else if (!partial) {
    out.summary = "";
  }

  if (has("personalInfo") || !partial) {
    out.personalInfo = parsePersonalInfo(src.personalInfo);
  }
  if (has("experience") || !partial) {
    out.experience = parseExperience(src.experience);
  }
  if (has("education") || !partial) {
    out.education = parseEducation(src.education);
  }
  if (has("certifications") || !partial) {
    out.certifications = parseCertifications(src.certifications);
  }
  if (has("skills") || !partial) {
    out.skills = parseSkills(src.skills);
  }
  if (has("languages") || !partial) {
    out.languages = parseLanguages(src.languages);
  }
  if (has("references") || !partial) {
    out.references = parseReferences(src.references);
  }

  if (has("template")) {
    out.template = parseTemplate(src.template);
  } else if (!partial) {
    out.template = "classic";
  }

  // Reject unknown keys only when they collide with protected fields, so a
  // client cannot smuggle ownership/timestamps/visibility through the save path.
  for (const blocked of [
    "ownerId",
    "owner",
    "createdAt",
    "updatedAt",
    "_id",
    "id",
    "isPublic",
    "publicSlug",
  ]) {
    if (has(blocked)) {
      throw new ApiError(400, `"${blocked}" cannot be set by the client`);
    }
  }

  return out;
};

/* -------------------------------------------------------------------------- */
/*  Visibility + Profile validation (M5)                                      */
/* -------------------------------------------------------------------------- */

/** Body of PUT /api/resumes/:id/visibility */
export const parseVisibilityInput = (body: unknown): { isPublic: boolean } => {
  const src = (body ?? {}) as Record<string, unknown>;
  if (typeof src.isPublic !== "boolean") {
    throw new ApiError(400, "isPublic (boolean) is required");
  }
  if (Object.prototype.hasOwnProperty.call(src, "publicSlug")) {
    throw new ApiError(400, '"publicSlug" cannot be set by the client');
  }
  return { isPublic: src.isPublic };
};

export interface ProfileInput {
  displayName?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  isPublic?: boolean;
  inDirectory?: boolean;
  featuredResumeId?: string | null;
}

/** Body of PUT /api/profile — only these fields; `slug` is server-owned. */
export const parseProfileInput = (body: unknown): ProfileInput => {
  if (body !== undefined && !isPlainObject(body)) {
    throw new ApiError(400, "Request body must be a JSON object");
  }
  const src = (body ?? {}) as Record<string, unknown>;
  const has = (key: string) => Object.prototype.hasOwnProperty.call(src, key);
  const out: ProfileInput = {};

  const readString = (key: string, max: number): string => {
    if (typeof src[key] !== "string") {
      throw new ApiError(400, `${key} must be a string`);
    }
    return (src[key] as string).trim().slice(0, max);
  };
  if (has("displayName")) out.displayName = readString("displayName", 120);
  if (has("headline")) out.headline = readString("headline", 160);
  if (has("bio")) out.bio = readString("bio", 800);
  if (has("location")) out.location = readString("location", 160);

  if (has("skills")) {
    if (!Array.isArray(src.skills)) {
      throw new ApiError(400, "skills must be an array of strings");
    }
    out.skills = Array.from(
      new Set(
        src.skills
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.trim())
          .filter((x) => x.length > 0),
      ),
    ).slice(0, 50);
  }

  if (has("isPublic")) {
    if (typeof src.isPublic !== "boolean") throw new ApiError(400, "isPublic must be a boolean");
    out.isPublic = src.isPublic;
  }
  if (has("inDirectory")) {
    if (typeof src.inDirectory !== "boolean") throw new ApiError(400, "inDirectory must be a boolean");
    out.inDirectory = src.inDirectory;
  }

  if (has("featuredResumeId")) {
    const v = src.featuredResumeId;
    if (v === null || v === "") {
      out.featuredResumeId = null;
    } else if (typeof v === "string" && OBJECT_ID_RE.test(v)) {
      out.featuredResumeId = v;
    } else {
      throw new ApiError(400, "featuredResumeId must be a resume id or null");
    }
  }

  for (const blocked of ["userId", "slug", "id", "_id", "createdAt", "updatedAt"]) {
    if (has(blocked)) {
      throw new ApiError(400, `"${blocked}" cannot be set by the client`);
    }
  }
  return out;
};
