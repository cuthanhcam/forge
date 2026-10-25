import type { ChangeEvent, JSX, ReactNode, TextareaHTMLAttributes } from "react";
import { Copy } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";

interface ToolSurfaceProps {
  children: ReactNode;
  compact?: boolean;
}

interface ToolToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
}

interface ToolTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  label: string;
  onChange: (value: string) => void;
  value: string;
}

interface ToolOutputProps {
  children?: ReactNode;
  error?: string;
  label: string;
  value?: string;
}

interface ToolTitleProps {
  eyebrow?: string;
  title: string;
}

interface PaneHeaderProps {
  actions?: ReactNode;
  tone?: "blue" | "emerald" | "rose" | "slate" | "violet";
  title: ReactNode;
}

interface ResultRowProps {
  label: string;
  onCopy?: () => void;
  value: string;
}

export function ToolSurface({
  children,
  compact = false,
}: ToolSurfaceProps): JSX.Element {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]",
        compact && "p-5",
      )}
    >
      {children}
    </section>
  );
}

export function ToolToolbar({ left, right }: ToolToolbarProps): JSX.Element {
  return (
    <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 bg-white px-2.5 py-1.5 2xl:px-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 2xl:gap-2">
        {left}
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">{right}</div>
    </div>
  );
}

export function ToolTitle({ eyebrow, title }: ToolTitleProps): JSX.Element {
  return (
    <div className="min-w-0">
      <h1 className="truncate text-[15px] font-semibold text-slate-950">{title}</h1>
      {eyebrow ? (
        <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {eyebrow}
        </p>
      ) : null}
    </div>
  );
}

export function PaneHeader({
  actions,
  title,
  tone = "slate",
}: PaneHeaderProps): JSX.Element {
  const tones: Record<NonNullable<PaneHeaderProps["tone"]>, string> = {
    blue: "border-accent-100 bg-accent-50/70 text-accent-700",
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
    rose: "border-rose-100 bg-rose-50/70 text-rose-700",
    slate: "border-slate-100 bg-slate-50/70 text-slate-600",
    violet: "border-violet-100 bg-violet-50/70 text-violet-700",
  };

  return (
    <div
      className={cn(
        "flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 2xl:px-4",
        tones[tone],
      )}
    >
      <div className="text-[12px] font-semibold uppercase tracking-wide">{title}</div>
      {actions}
    </div>
  );
}

export function ToolTextarea({
  className,
  label,
  onChange,
  value,
  ...props
}: ToolTextareaProps): JSX.Element {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    onChange(event.target.value);
  }

  return (
    <label className="flex h-full min-h-0 flex-col bg-white">
      <span className="sr-only">{label}</span>
      <textarea
        className={cn(
          "scrollbar-forge h-full min-h-48 w-full flex-1 resize-none border-0 bg-white p-4 font-mono text-[13px] leading-6 text-slate-900 outline-none placeholder:text-slate-400",
          className,
        )}
        onChange={handleChange}
        spellCheck={false}
        value={value}
        {...props}
      />
    </label>
  );
}

export function ToolOutput({
  children,
  error,
  label,
  value,
}: ToolOutputProps): JSX.Element {
  return (
    <div className="scrollbar-forge h-full min-h-0 overflow-auto bg-white">
      <div className="flex min-h-10 items-center border-b border-slate-100 px-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>
      {error ? (
        <div className="m-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium leading-5 text-red-700">
          {error}
        </div>
      ) : null}
      {children ?? (
        <pre className="min-h-full whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-6 text-slate-900">
          {value}
        </pre>
      )}
    </div>
  );
}

export function ResultRow({ label, onCopy, value }: ResultRowProps): JSX.Element {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-slate-500">{label}</p>
        <p className="mt-1 break-all font-mono text-[13px] leading-5 text-slate-950">
          {value || "-"}
        </p>
      </div>
      {onCopy ? (
        <Tooltip content={`Copy ${label}`} side="bottom">
          <Button
            aria-label={`Copy ${label}`}
            onClick={onCopy}
            size="icon"
            variant="ghost"
          >
            <Copy aria-hidden="true" className="h-4 w-4" />
          </Button>
        </Tooltip>
      ) : null}
    </div>
  );
}
