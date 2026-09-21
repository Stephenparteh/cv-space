import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  /** The item's own content where possible (e.g. job title), not just its position. */
  title: string;
  meta?: string;
  onRemove: () => void;
  removeLabel: string;
  disabled?: boolean;
}

/** Header row for one entry inside a repeatable section (experience, education, etc.). */
export function RepeatableItemHeader({ title, meta, onRemove, removeLabel, disabled }: Props) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {meta && <p className="truncate text-xs text-muted-foreground">{meta}</p>}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={disabled}
        aria-label={removeLabel}
        className="shrink-0"
      >
        <Trash2 /> Remove
      </Button>
    </div>
  );
}
