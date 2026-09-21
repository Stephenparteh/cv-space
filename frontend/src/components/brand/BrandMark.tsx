interface BrandMarkProps {
  /** Pixel size (square). Defaults to a navbar-appropriate 28px. */
  size?: number;
  className?: string;
  /**
   * "duo" (default) — Ink Navy page + Harbor Blue accent bars, for light
   * surfaces (navbar, footer on warm paper).
   * "mono" — a single `currentColor`, for contexts that need one flat color
   * (e.g. a mark on a dark surface, or a favicon-style monochrome use).
   */
  tone?: "duo" | "mono";
  /**
   * Only pass this for a STANDALONE mark with no adjacent visible wordmark
   * (makes it an accessible role="img"). When the mark sits next to visible
   * "CV Space" text (the normal case), omit this — the mark stays
   * decorative/aria-hidden and the text carries the name.
   */
  title?: string;
}

/**
 * The CV Space mark: an open page with a folded corner (the document/CV),
 * carrying three ascending bars (career progress/growth) instead of literal
 * text lines. Two shapes, no gradients, reads clearly down to ~20px.
 */
export function BrandMark({ size = 28, className, tone = "duo", title }: BrandMarkProps) {
  const pageColor = tone === "mono" ? "currentColor" : "hsl(var(--primary))";
  const accentColor = tone === "mono" ? "currentColor" : "hsl(var(--accent))";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* Page, with a folded top-right corner. */}
      <path d="M8 4H20L26 10V28H8V4Z" fill={pageColor} />
      {/* The fold itself — same color, lower opacity, reads as a crease. */}
      <path d="M20 4L26 10H20V4Z" fill={pageColor} opacity={0.55} />
      {/* Ascending bars — the "growth" motif. */}
      <rect x="11" y="20" width="2.6" height="4" rx="0.6" fill={accentColor} />
      <rect x="15.2" y="17" width="2.6" height="7" rx="0.6" fill={accentColor} />
      <rect x="19.4" y="13" width="2.6" height="11" rx="0.6" fill={accentColor} />
    </svg>
  );
}
