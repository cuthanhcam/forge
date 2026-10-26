import { useEffect, useState, type JSX } from "react";
import { WifiOff, X } from "lucide-react";
import { Tooltip } from "@/shared/ui/tooltip";

/** Losing the network must not block already-loaded local tools or discard input. */
export function OfflineNotice(): JSX.Element | null {
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const online = (): void => setOffline(false);
    const disconnected = (): void => {
      setOffline(true);
      setDismissed(false);
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", disconnected);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", disconnected);
    };
  }, []);
  if (!offline || dismissed) return null;
  return (
    <div
      role="status"
      aria-label="Offline notice"
      className="flex shrink-0 items-center gap-3 border-b border-border bg-accent-50 px-4 py-2 text-xs leading-5 text-foreground md:px-5"
    >
      <WifiOff aria-hidden="true" className="h-4 w-4 shrink-0 text-accent-700" />
      <p className="flex-1">
        You&apos;re offline. Loaded tools still work; opening another tool may need a
        connection.
      </p>
      <Tooltip content="Dismiss offline notice" side="bottom">
        <button
          type="button"
          aria-label="Dismiss offline notice"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
          onClick={() => setDismissed(true)}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  );
}
