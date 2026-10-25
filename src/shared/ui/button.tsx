import type { ButtonHTMLAttributes, JSX } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent-solid text-accent-on-solid shadow-sm hover:bg-accent-solid-hover",
  secondary:
    "border border-border bg-white text-foreground shadow-sm hover:border-accent-200 hover:bg-accent-50",
  ghost: "text-muted-foreground hover:bg-slate-100 hover:text-foreground",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  icon: "h-9 w-9 p-0",
};

export function Button({
  className,
  size = "md",
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
