import type { ResumeEditableFields } from "@/types/resume";
import { ResumeDocument } from "./ResumeDocument";

interface Props {
  data: ResumeEditableFields;
}

/**
 * On-screen live preview: the resume document inside a "paper" frame.
 * Pure presentation — reads the editor state, holds none of its own.
 */
export function ResumePreview({ data }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-paper">
      <div className="overflow-x-auto">
        <div className="mx-auto w-full max-w-[820px] px-6 py-8 sm:px-10">
          <ResumeDocument data={data} />
        </div>
      </div>
    </div>
  );
}
