import type { JSX } from "react";
import { Github, Keyboard, Search } from "lucide-react";
import { projectLinks } from "@/core/config/project-links";
import { shortcuts } from "@/core/shortcuts/shortcuts";
import { Button } from "@/shared/ui/button";
import { ThemeMenu } from "./ThemeMenu";

interface HeaderActionsProps {
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
}

export function HeaderActions({
  onOpenCommandPalette,
  onOpenShortcuts,
}: HeaderActionsProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Search tools"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 md:hidden"
        onClick={onOpenCommandPalette}
        type="button"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
      </button>
      <Button
        className="hidden min-w-52 justify-start text-slate-500 md:inline-flex"
        onClick={onOpenCommandPalette}
        size="sm"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
        Search tools
        <kbd className="ml-auto rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500">
          {shortcuts.commandPalette.label}
        </kbd>
      </Button>
      <button
        aria-label="View keyboard shortcuts"
        className="hidden h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex"
        onClick={onOpenShortcuts}
        type="button"
      >
        <Keyboard aria-hidden="true" className="h-4 w-4" />
      </button>
      <ThemeMenu />
      <a
        aria-label="Open Forge on GitHub"
        className="hidden h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
        href={projectLinks.repository}
        rel="noreferrer"
        target="_blank"
      >
        <Github aria-hidden="true" className="h-4 w-4" />
      </a>
    </div>
  );
}
