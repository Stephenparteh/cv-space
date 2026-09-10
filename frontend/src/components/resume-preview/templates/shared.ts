import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ReferenceItem,
  ResumeEditableFields,
} from "@/types/resume";

/** Every template receives the live editor state. */
export interface TemplateProps {
  data: ResumeEditableFields;
}

const clean = (value: string): string => value.trim();

export const anyText = (...values: string[]): boolean => values.some((v) => clean(v).length > 0);

/** "Jan 2021 – Present" / "2016 – 2020" / "" when nothing is set. */
export const dateRange = (start: string, end: string, current?: boolean): string => {
  const from = clean(start);
  const to = current ? "Present" : clean(end);
  if (from && to) return `${from} – ${to}`;
  return from || to || "";
};

/** Bullet lines for one experience entry: `responsibilities`, else the legacy paragraph. */
export const experienceLines = (item: ExperienceItem): string[] => {
  const bullets = (item.responsibilities ?? []).map(clean).filter(Boolean);
  if (bullets.length > 0) return bullets;
  const legacy = clean(item.description);
  if (!legacy) return [];
  return legacy
    .split(/\r?\n|•|·/)
    .map((line) => line.replace(/^[-*•·\s]+/, "").trim())
    .filter(Boolean);
};

export const filledExperience = (items: ExperienceItem[]): ExperienceItem[] =>
  items.filter(
    (x) =>
      anyText(x.jobTitle, x.company, x.location, x.startDate, x.endDate, x.description) ||
      experienceLines(x).length > 0,
  );

export const filledEducation = (items: EducationItem[]): EducationItem[] =>
  items.filter((x) =>
    anyText(x.institution, x.degree, x.fieldOfStudy, x.location, x.startDate, x.endDate, x.description),
  );

export const filledCertifications = (items: CertificationItem[]): CertificationItem[] =>
  items.filter((x) =>
    anyText(x.name, x.institution, x.location, x.startDate, x.endDate, x.description),
  );

export const filledLanguages = (items: LanguageItem[]): LanguageItem[] =>
  items.filter((x) => anyText(x.language, x.proficiency));

export const filledReferences = (items: ReferenceItem[]): ReferenceItem[] =>
  items.filter((x) => anyText(x.name, x.position, x.institution, x.contact, x.location, x.email));

export const filledSkills = (skills: string[]): string[] =>
  skills.map(clean).filter((s) => s.length > 0);

/** Contact entries in a stable order, empties dropped. */
export const contactItems = (data: ResumeEditableFields): string[] => {
  const p = data.personalInfo;
  return [p.email, p.phone, p.phone2, p.location, p.website, p.linkedin].map(clean).filter(Boolean);
};

export const displayName = (data: ResumeEditableFields): string =>
  clean(data.personalInfo.fullName) || "Your Name";

export const photoUrl = (data: ResumeEditableFields): string => clean(data.personalInfo.photo);
