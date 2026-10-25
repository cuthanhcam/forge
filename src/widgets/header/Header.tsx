import type { JSX } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router";
import { getToolById } from "@/core/registry/tool.registry";
import { HeaderActions } from "./HeaderActions";

interface HeaderProps {
  navigationOpen?: boolean;
  onOpenCommandPalette: () => void;
  onOpenNavigation: () => void;
  onOpenShortcuts: () => void;
}

export function Header({
  navigationOpen = false,
  onOpenCommandPalette,
  onOpenNavigation,
  onOpenShortcuts,
}: HeaderProps): JSX.Element {
  const location = useLocation();
  const headerMeta = getHeaderMeta(location.pathname);
  const HeaderIcon = headerMeta.icon;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between bg-white/90 px-4 backdrop-blur md:px-5">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          aria-expanded={navigationOpen}
          aria-controls="forge-sidebar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 lg:hidden"
          onClick={onOpenNavigation}
          type="button"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          {HeaderIcon ? (
            <HeaderIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent-600" />
          ) : null}
          <h1 className="truncate text-[15px] font-semibold text-slate-950">
            {headerMeta.title}
          </h1>
        </div>
      </div>
      <HeaderActions
        onOpenCommandPalette={onOpenCommandPalette}
        onOpenShortcuts={onOpenShortcuts}
      />
    </header>
  );
}

function getHeaderMeta(pathname: string): {
  icon?: NonNullable<ReturnType<typeof getToolById>>["icon"];
  title: string;
} {
  if (pathname === "/") {
    return { title: "Home" };
  }

  if (pathname === "/settings") {
    return { title: "Settings" };
  }

  if (pathname === "/privacy") {
    return { title: "Privacy" };
  }

  if (pathname === "/terms") {
    return { title: "Terms of Use" };
  }

  if (pathname === "/docs") {
    return { title: "Documentation" };
  }

  if (pathname.startsWith("/docs/")) {
    return { title: "Documentation" };
  }

  if (pathname.startsWith("/support")) {
    return { title: "Support" };
  }

  const toolId = pathname.match(/^\/tools\/([^/]+)$/)?.[1];
  const tool = toolId ? getToolById(toolId) : undefined;

  return tool ? { icon: tool.icon, title: tool.name } : { title: "Forge" };
}
