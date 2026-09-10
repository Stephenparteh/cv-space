import { Schema, model, type Document, type Model, type Types } from "mongoose";

export const RESUME_TEMPLATES = [
  "classic",
  "modern",
  "minimal",
  "professional",
  "executive",
  "creative",
] as const;
export type ResumeTemplate = (typeof RESUME_TEMPLATES)[number];
export const DEFAULT_TEMPLATE: ResumeTemplate = "classic";

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
  /** Bullet points (M6). Legacy `description` is migrated into this on load. */
  responsibilities: string[];
  /** Legacy single-paragraph field — kept for backward compatibility. */
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

export interface IResume extends Document {
  ownerId: Types.ObjectId;
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
  /** Public sharing — private by default (M5). */
  isPublic: boolean;
  /** Unguessable, human-readable public identifier; minted on first publish. */
  publicSlug?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dates are stored as free-form strings ("2021", "2021-06", "Jun 2021") — the MVP
// does not need date arithmetic and this avoids timezone/format ambiguity.

const personalInfoSchema = new Schema<PersonalInfo>(
  {
    fullName: { type: String, trim: true, default: "", maxlength: 200 },
    email: { type: String, trim: true, default: "", maxlength: 200 },
    phone: { type: String, trim: true, default: "", maxlength: 60 },
    phone2: { type: String, trim: true, default: "", maxlength: 60 },
    location: { type: String, trim: true, default: "", maxlength: 200 },
    website: { type: String, trim: true, default: "", maxlength: 300 },
    linkedin: { type: String, trim: true, default: "", maxlength: 300 },
    dateOfBirth: { type: String, trim: true, default: "", maxlength: 40 },
    gender: { type: String, trim: true, default: "", maxlength: 40 },
    religion: { type: String, trim: true, default: "", maxlength: 60 },
    nationality: { type: String, trim: true, default: "", maxlength: 60 },
    // Small inline data: URL (validated in parsePersonalInfo). ~350KB cap.
    photo: { type: String, default: "", maxlength: 500_000 },
  },
  { _id: false },
);

const experienceSchema = new Schema<ExperienceItem>(
  {
    jobTitle: { type: String, trim: true, default: "", maxlength: 200 },
    company: { type: String, trim: true, default: "", maxlength: 200 },
    location: { type: String, trim: true, default: "", maxlength: 200 },
    startDate: { type: String, trim: true, default: "", maxlength: 40 },
    endDate: { type: String, trim: true, default: "", maxlength: 40 },
    current: { type: Boolean, default: false },
    responsibilities: {
      type: [{ type: String, trim: true, maxlength: 600 }],
      default: [],
    },
    description: { type: String, trim: true, default: "", maxlength: 5000 },
  },
  { _id: false },
);

const educationSchema = new Schema<EducationItem>(
  {
    institution: { type: String, trim: true, default: "", maxlength: 200 },
    degree: { type: String, trim: true, default: "", maxlength: 200 },
    fieldOfStudy: { type: String, trim: true, default: "", maxlength: 200 },
    location: { type: String, trim: true, default: "", maxlength: 200 },
    startDate: { type: String, trim: true, default: "", maxlength: 40 },
    endDate: { type: String, trim: true, default: "", maxlength: 40 },
    description: { type: String, trim: true, default: "", maxlength: 5000 },
  },
  { _id: false },
);

const certificationSchema = new Schema<CertificationItem>(
  {
    name: { type: String, trim: true, default: "", maxlength: 200 },
    institution: { type: String, trim: true, default: "", maxlength: 200 },
    location: { type: String, trim: true, default: "", maxlength: 200 },
    startDate: { type: String, trim: true, default: "", maxlength: 40 },
    endDate: { type: String, trim: true, default: "", maxlength: 40 },
    description: { type: String, trim: true, default: "", maxlength: 5000 },
  },
  { _id: false },
);

const languageSchema = new Schema<LanguageItem>(
  {
    language: { type: String, trim: true, default: "", maxlength: 80 },
    proficiency: { type: String, trim: true, default: "", maxlength: 40 },
  },
  { _id: false },
);

const referenceSchema = new Schema<ReferenceItem>(
  {
    name: { type: String, trim: true, default: "", maxlength: 200 },
    position: { type: String, trim: true, default: "", maxlength: 200 },
    institution: { type: String, trim: true, default: "", maxlength: 200 },
    contact: { type: String, trim: true, default: "", maxlength: 120 },
    location: { type: String, trim: true, default: "", maxlength: 200 },
    email: { type: String, trim: true, default: "", maxlength: 200 },
  },
  { _id: false },
);

const resumeSchema = new Schema<IResume>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true, // ownership can never be reassigned after creation
      index: true,
    },
    title: { type: String, trim: true, default: "My Resume", maxlength: 200 },
    personalInfo: { type: personalInfoSchema, default: () => ({}) },
    summary: { type: String, trim: true, default: "", maxlength: 5000 },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    skills: { type: [{ type: String, trim: true, maxlength: 100 }], default: [] },
    languages: { type: [languageSchema], default: [] },
    references: { type: [referenceSchema], default: [] },
    template: {
      type: String,
      enum: RESUME_TEMPLATES,
      default: DEFAULT_TEMPLATE,
    },
    isPublic: { type: Boolean, default: false, index: true },
    publicSlug: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        if (ret.ownerId != null) ret.ownerId = String(ret.ownerId);
        return ret;
      },
    },
  },
);

export const Resume: Model<IResume> = model<IResume>("Resume", resumeSchema);
