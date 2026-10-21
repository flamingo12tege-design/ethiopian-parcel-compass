import { useEffect, useState } from "react";
import { normalizeTracking, TRACKING_RE } from "./parcels";

const STORAGE_KEY = "ethiopost:recent-tracking";
const CHANGE_EVENT = "ethiopost:recent-tracking-changed";

export function readRecentTracking(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && TRACKING_RE.test(item)).slice(0, 4)
      : [];
  } catch {
    return [];
  }
}

/** Store identifiers only; contact details never enter browser history storage. */
export function rememberTrackedParcel(raw: string) {
  const number = normalizeTracking(raw);
  if (!TRACKING_RE.test(number)) return;
  try {
    const recent = [number, ...readRecentTracking().filter((item) => item !== number)].slice(0, 4);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Tracking still works when device storage is unavailable.
  }
}

export function useRecentTracking() {
  const [recent, setRecent] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const update = () => { setRecent(readRecentTracking()); setReady(true); };
    update();
    window.addEventListener(CHANGE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CHANGE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return { recent, ready };
}