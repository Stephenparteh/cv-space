import { createPortal } from "react-dom";
import type { ResumeEditableFields } from "@/types/resume";
import { ResumeDocument } from "./ResumeDocument";

interface Props {
  data: ResumeEditableFields;
}

/**
 * The document used by "Download PDF" (browser print / "Save as PDF").
 *
 * It is rendered through a portal as a direct child of <body> — a *sibling* of
 * the React app root (#root). On screen it is hidden (`#resume-print` base rule
 * in index.css). When printing, `@media print` hides #root entirely and shows
 * only this element in normal document flow, so the browser paginates the
 * actual resume content — no blank pages from the (hidden) editor page.
 *
 * Renders the same template components as the live preview, so the PDF matches
 * the selected design exactly.
 */
export function PrintableResume({ data }: Props) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div id="resume-print" aria-hidden="true">
      <div className="resume-print-sheet">
        <ResumeDocument data={data} />
      </div>
    </div>,
    document.body,
  );
}
