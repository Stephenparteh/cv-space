import type { ComponentType } from "react";
import type { ResumeEditableFields, ResumeTemplate } from "@/types/resume";
import type { TemplateProps } from "./templates/shared";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";

/**
 * The single template registry. Used by the on-screen preview, the printable
 * PDF document and the public resume page, so a design lives in one place.
 */
const TEMPLATES: Record<ResumeTemplate, ComponentType<TemplateProps>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
};

interface Props {
  data: ResumeEditableFields;
}

/** Renders the resume with its selected template and nothing else (no frame). */
export function ResumeDocument({ data }: Props) {
  const Template = TEMPLATES[data.template] ?? ClassicTemplate;
  return <Template data={data} />;
}
