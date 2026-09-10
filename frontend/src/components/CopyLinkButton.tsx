import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface Props {
  value: string;
  label?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
}

/** Copies `value` to the clipboard with "Copied" feedback; degrades gracefully. */
export function CopyLinkButton({
  value,
  label = "Copy link",
  size = "sm",
  variant = "outline",
  className,
}: Props) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error("clipboard unavailable");
      }
      setState("copied");
    } catch {
      setState("error");
    }
    timer.current = setTimeout(() => setState("idle"), 2500);
  };

  return (
    <Button type="button" size={size} variant={variant} className={className} onClick={copy}>
      {state === "copied" ? <Check /> : <Copy />}
      {state === "copied" ? "Link copied" : state === "error" ? "Press Ctrl+C to copy" : label}
    </Button>
  );
}
