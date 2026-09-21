import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeEditableFields } from "@/types/resume";
import { ResumeDocument } from "./ResumeDocument";

/** A4 width at 96dpi — the fixed intrinsic width the real templates render at. */
const NATIVE_WIDTH = 794;

interface Props {
  data: ResumeEditableFields;
  className?: string;
  frameClassName?: string;
  /** Template name / short caption shown below the frame. Omit for a bare visual. */
  label?: string;
  meta?: string;
  selected?: boolean;
  interactive?: boolean;
}

/**
 * A live, scaled-down render of an actual résumé template inside an
 * A4-proportioned "paper" frame — never a static screenshot, so it's always
 * in sync with the real template components. Used on the homepage (hero +
 * template showcase); reusable anywhere a small, accurate template preview
 * is useful later (e.g. a future template picker).
 *
 * The frame is decorative (aria-hidden) — a scaled-down preview isn't
 * meaningful content for a screen reader. The visible `label` text below it
 * (e.g. the template name) stays in the normal accessibility tree.
 */
export function TemplateThumbnail({
  data,
  className,
  frameClassName,
  label,
  meta,
  selected,
  interactive,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / NATIVE_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        ref={frameRef}
        aria-hidden="true"
        className={cn(
          "relative w-full overflow-hidden rounded-md border border-border bg-white shadow-paper",
          interactive && "transition-shadow duration-standard ease-standard hover:shadow-floating",
          selected && "ring-2 ring-accent",
          frameClassName,
        )}
        style={{ aspectRatio: "210 / 297" }}
      >
        {scale > 0 && (
          <div
            className="pointer-events-none absolute left-0 top-0 origin-top-left"
            style={{ width: NATIVE_WIDTH, transform: `scale(${scale})` }}
          >
            <div style={{ padding: "36px" }}>
              <ResumeDocument data={data} />
            </div>
          </div>
        )}
        {selected && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
      </div>
      {label && (
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        </div>
      )}
    </div>
  );
}
