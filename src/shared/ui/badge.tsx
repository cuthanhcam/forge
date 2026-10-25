import type { HTMLAttributes, JSX } from "react";
import { cn } from "@/shared/lib/cn";

type BadgeTone = "neutral" | "accent" | "success";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  accent: "border-accent-200 bg-accent-50 text-accent-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
