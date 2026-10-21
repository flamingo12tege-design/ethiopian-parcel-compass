import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/ethiopost-logo.png.asset.json";
import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

/** Branded splash shown once per app session while the app starts. */
export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const { loading } = useAuth();
  const ready = useRouterState({ select: (state) => state.status === "idle" });
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ethiopost:splash")) setShow(false);
    } catch {
      /* Storage restrictions must not prevent launch. */
    }
  }, []);
  useEffect(() => {
    if (!show || loading || !ready) return;
    setFading(true);
    // Match the fade, not an artificial startup/progress delay.
    const timer = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem("ethiopost:splash", "1");
      } catch {
        /* Optional session marker. */
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [show, loading, ready]);
  if (!show) return null;
  return (
    <div
      aria-hidden
      data-splash
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-hero text-primary-foreground transition-opacity duration-200 motion-reduce:transition-none",
        fading && "opacity-0",
      )}
    >
      <img
        src={logo.url}
        alt=""
        width={640}
        height={640}
        className="h-28 w-28 rounded-full bg-background object-cover shadow-card"
      />
      <p className="mt-6 font-ethiopic text-xl font-bold">የኢትዮጵያ ፖስታ አገልግሎት</p>
      <p className="mt-1 text-sm font-semibold opacity-90">Ethio Post</p>
      <div className="mt-10 h-1 w-24 overflow-hidden rounded-full bg-primary-foreground/20">
        <div className="splash-loader h-full w-1/2 rounded-full bg-highlight" />
      </div>
    </div>
  );
}
