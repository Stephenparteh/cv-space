import { useEffect } from "react";

const BASE_TITLE = "Resume Builder";

const setMeta = (name: string, content: string): (() => void) => {
  let created = false;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
    created = true;
  }
  const previous = el.getAttribute("content");
  el.setAttribute("content", content);
  return () => {
    if (created) el?.remove();
    else if (previous !== null) el?.setAttribute("content", previous);
  };
};

/**
 * Basic per-page document metadata for shareable public pages.
 * Restores the previous title / description on unmount. No dependency.
 */
export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
    const restoreDescription = description ? setMeta("description", description) : undefined;
    return () => {
      document.title = previousTitle;
      restoreDescription?.();
    };
  }, [title, description]);
}
