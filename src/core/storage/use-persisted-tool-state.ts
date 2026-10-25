import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { storageKeys } from "./storage.keys";
import { readStorageValue, writeStorageValue } from "./storage.service";

type PersistenceStatus = "pending" | "saved" | "unavailable";
interface PersistenceOptions {
  debounceMs?: number;
}

export function usePersistedToolState<TValue>(
  toolId: string,
  initialValue: TValue,
  { debounceMs = 0 }: PersistenceOptions = {},
): [TValue, Dispatch<SetStateAction<TValue>>, PersistenceStatus] {
  const [value, setValue] = useState<TValue>(() => {
    try {
      const storedValue = readStorageValue(storageKeys.toolState(toolId));
      return storedValue === null ? initialValue : (storedValue as TValue);
    } catch {
      // Corrupt JSON or blocked storage must not prevent editing in memory.
      return initialValue;
    }
  });
  const [status, setStatus] = useState<PersistenceStatus>("pending");
  const latestValue = useRef(value);
  useLayoutEffect(() => {
    latestValue.current = value;
  }, [value]);

  const save = useCallback(
    (nextValue: TValue): void => {
      try {
        writeStorageValue(storageKeys.toolState(toolId), nextValue);
        setStatus("saved");
      } catch {
        // Quota and privacy settings can reject writes. Retain the current draft.
        setStatus("unavailable");
      }
    },
    [toolId],
  );

  useEffect(() => {
    if (debounceMs === 0) {
      save(value);
      return;
    }
    setStatus((current) => (current === "unavailable" ? current : "pending"));
    const timer = window.setTimeout(() => save(value), debounceMs);
    return () => window.clearTimeout(timer);
  }, [value, save, debounceMs]);

  useEffect(() => {
    const flush = (): void => save(latestValue.current);
    const handleVisibility = (): void => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", handleVisibility);
      // Navigation unmounts a tool before a debounced write may have run.
      // Do not schedule status updates on an unmounted component.
      try {
        writeStorageValue(storageKeys.toolState(toolId), latestValue.current);
      } catch {
        /* The in-memory session remains authoritative when storage fails. */
      }
    };
  }, [toolId, save]);

  return [value, setValue, status];
}
