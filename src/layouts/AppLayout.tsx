import type { JSX } from "react";
import { useCallback, useState } from "react";
import { Outlet } from "react-router";
import { useShortcuts } from "@/core/shortcuts/use-shortcuts";
import { CommandPalette } from "@/widgets/command-palette/CommandPalette";
import { Header } from "@/widgets/header/Header";
import { KeyboardShortcutsDialog } from "@/widgets/shortcuts/KeyboardShortcutsDialog";
import { Sidebar } from "@/widgets/sidebar/Sidebar";

export function AppLayout(): JSX.Element {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);

  useShortcuts({ onCommandPalette: openCommandPalette });

  return (
    <div className="h-dvh overflow-hidden bg-slate-50 text-foreground">
      <div className="flex h-dvh min-h-0">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileOpenChange={setMobileSidebarOpen}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            navigationOpen={mobileSidebarOpen}
            onOpenNavigation={() => setMobileSidebarOpen(true)}
            onOpenCommandPalette={openCommandPalette}
            onOpenShortcuts={openShortcuts}
          />
          <Outlet />
        </div>
      </div>
      <CommandPalette onOpenChange={setCommandPaletteOpen} open={commandPaletteOpen} />
      <KeyboardShortcutsDialog onOpenChange={setShortcutsOpen} open={shortcutsOpen} />
    </div>
  );
}
