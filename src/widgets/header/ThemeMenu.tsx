import { themeOptions } from "@/core/theme/theme.options";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Sun } from "lucide-react";
import { useThemeStore } from "@/core/theme/theme.store";
import type { ThemeMode } from "@/core/theme/theme.types";

function getThemeIcon(mode: ThemeMode): typeof Sun {
  return themeOptions.find((option) => option.mode === mode)?.icon ?? Sun;
}

export function ThemeMenu(): JSX.Element {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const ActiveIcon = getThemeIcon(mode);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent): void {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Change theme"
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <ActiveIcon aria-hidden="true" className="h-4 w-4" />
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-11 z-40 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/12"
          role="menu"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const selected = option.mode === mode;

            return (
              <button
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-slate-50"
                key={option.mode}
                onClick={() => {
                  setMode(option.mode);
                  setOpen(false);
                }}
                role="menuitemradio"
                type="button"
                aria-checked={selected}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
                  {option.label}
                </span>
                {selected ? (
                  <Check aria-hidden="true" className="h-4 w-4 text-slate-800" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
