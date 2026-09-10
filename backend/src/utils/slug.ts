import { randomBytes } from "node:crypto";

// Combining diacritical marks (U+0300–U+036F) left behind by NFKD normalisation.
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/** "Senior Developer Résumé!" -> "senior-developer-resume" (max 60 chars). */
export const slugify = (input: string): string =>
  (input || "")
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 60)
    .replace(/-+$/, "");

const randomToken = (length: number): string => {
  let out = "";
  while (out.length < length) {
    out += randomBytes(12).toString("base64").replace(/[^a-z0-9]/gi, "").toLowerCase();
  }
  return out.slice(0, length);
};

/** Readable stem + unguessable suffix, e.g. "software-developer-resume-k3f9a2". */
export const buildSlug = (base: string, fallback: string): string =>
  `${slugify(base) || fallback}-${randomToken(6)}`;

/**
 * Returns a slug that is not already taken, retrying on collision.
 * `isTaken(slug)` resolves true when the slug already exists.
 */
export const generateUniqueSlug = async (
  base: string,
  fallback: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = buildSlug(base, fallback);
    if (!(await isTaken(candidate))) return candidate;
  }
  return `${slugify(base) || fallback}-${randomToken(14)}`;
};
