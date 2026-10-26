import { Monitor, Moon, Sun } from "lucide-react";
import type { ThemeMode } from "./theme.types";

export const themeOptions: Array<{ icon: typeof Sun; label: string; mode: ThemeMode }> = [
  { icon: Sun, label: "Light", mode: "light" },
  { icon: Moon, label: "Dark", mode: "dark" },
  { icon: Monitor, label: "System", mode: "system" },
];
