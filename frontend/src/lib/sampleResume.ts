import type { ResumeEditableFields, ResumeTemplate } from "@/types/resume";

/**
 * Static, realistic-looking sample content for the homepage's live template
 * previews (hero visual + template showcase). Not a real user's data —
 * purely illustrative, so a first-time visitor sees what a real CV looks
 * like before creating an account or touching the builder.
 */
const BASE_SAMPLE: Omit<ResumeEditableFields, "template"> = {
  title: "Sample resume",
  summary:
    "Detail-oriented accountant with 5+ years managing budgets, audits, and financial reporting for growing organizations.",
  personalInfo: {
    fullName: "Amara Johnson",
    email: "amara.johnson@email.com",
    phone: "+231 77 000 0000",
    phone2: "",
    location: "Monrovia, Liberia",
    website: "",
    linkedin: "",
    dateOfBirth: "",
    gender: "",
    religion: "",
    nationality: "",
    photo: "",
  },
  experience: [
    {
      jobTitle: "Senior Accountant",
      company: "Liberia Trade Bank",
      location: "Monrovia",
      startDate: "2021",
      endDate: "",
      current: true,
      responsibilities: [
        "Manage monthly financial reporting for a 40-person branch",
        "Reduced reconciliation errors by 30% through process improvements",
        "Led annual audit preparation with zero major findings",
      ],
      description: "",
    },
    {
      jobTitle: "Accountant",
      company: "Coastal Freight Ltd.",
      location: "Monrovia",
      startDate: "2018",
      endDate: "2021",
      current: false,
      responsibilities: [
        "Processed accounts payable/receivable for a 12-vehicle logistics fleet",
        "Maintained compliance with local tax filing deadlines",
      ],
      description: "",
    },
  ],
  education: [
    {
      institution: "University of Liberia",
      degree: "BSc",
      fieldOfStudy: "Accounting",
      location: "Monrovia",
      startDate: "2014",
      endDate: "2018",
      description: "",
    },
  ],
  certifications: [
    {
      name: "Certified Public Accountant (in progress)",
      institution: "ICAL",
      location: "",
      startDate: "2023",
      endDate: "",
      description: "",
    },
  ],
  skills: ["Financial Reporting", "Budgeting", "Excel", "QuickBooks", "Audit Preparation"],
  languages: [{ language: "English", proficiency: "Fluent" }],
  references: [],
};

/** The sample resume, rendered with the given template. */
export function sampleResume(template: ResumeTemplate): ResumeEditableFields {
  return { ...BASE_SAMPLE, template };
}
