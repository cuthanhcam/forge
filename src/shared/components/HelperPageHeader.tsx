import type { JSX } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/** Shared soft brand treatment for settings, support and trust pages. */
export function HelperPageHeader({ eyebrow, title, subtitle }: Props): JSX.Element {
  return (
    <header className="rounded-lg border border-border bg-gradient-soft px-6 py-8">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-gradient-brand">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          {subtitle}
        </p>
      )}
    </header>
  );
}
