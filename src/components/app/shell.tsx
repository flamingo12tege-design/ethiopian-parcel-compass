import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, Home, Search, Calculator, LayoutGrid, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/ethiopost-logo.png.asset.json";

/** Phone-width column used by every screen. */
export function Screen({ children, nav = true, className }: { children: ReactNode; nav?: boolean; className?: string }) {
  return (
    <div className={cn("mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background sm:my-0 sm:shadow-card", className)}>
      <div className={cn("flex flex-1 flex-col", nav && "pb-24")}>{children}</div>
    </div>
  );
}

export function PageHeader({ title, back = true, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="pt-safe sticky top-0 z-20 bg-primary text-primary-foreground">
      <div className="grid h-14 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center px-2">
        {back ? (
          <button
            aria-label="Back"
            onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-primary-foreground/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : (
          <span />
        )}
        <h1 className="truncate text-center text-lg font-bold">{title}</h1>
        <div className="flex justify-end">{right}</div>
      </div>
      <div className="h-4 rounded-t-3xl bg-background" />
    </header>
  );
}

export function BrandMark({ light = false, size = "sm" }: { light?: boolean; size?: "sm" | "lg" }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logo.url}
        alt="Ethiopian Postal Service logo"
        width={640}
        height={640}
        className={cn("shrink-0 rounded-full bg-background object-cover", size === "lg" ? "h-16 w-16" : "h-10 w-10")}
      />
      <div className={cn("leading-tight", light ? "text-primary-foreground" : "text-primary")}>
        <div className="font-ethiopic text-[13px] font-bold">የኢትዮጵያ ፖስታ አገልግሎት</div>
        <div className="text-[10px] font-semibold opacity-90">Ethiopian Postal Service</div>
      </div>
    </div>
  );
}

type NavItem = { to: "/" | "/calculator" | "/services" | "/profile"; label: string; icon: typeof Home; exact?: boolean };
const LEFT: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/calculator", label: "Rates", icon: Calculator },
];
const RIGHT: NavItem[] = [
  { to: "/services", label: "Services", icon: LayoutGrid },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const path = useRouterState({ select: (s) => (s.resolvedLocation ?? s.location).pathname });
  const trackActive = path.startsWith("/track") || path.startsWith("/parcel");
  const item = ({ to, label, icon: Icon, exact }: NavItem) => {
    const active = exact ? path === to : path.startsWith(to);
    return (
      <li key={to}>
        <Link
          to={to}
          className={cn(
            "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold",
            active ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
          {label}
        </Link>
      </li>
    );
  };
  return (
    <nav aria-label="Main navigation" className="pb-safe shadow-nav fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md rounded-t-3xl border-t bg-background">
      <ul className="grid grid-cols-5 items-end">
        {LEFT.map(item)}
        <li className="flex justify-center">
          <Link
            to="/track"
            aria-label="Track parcel"
            aria-current={trackActive ? "page" : undefined}
            className="-mt-7 flex flex-col items-center gap-1 text-[11px] font-semibold text-primary"
          >
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-background bg-highlight text-highlight-foreground shadow-card"
            >
              <Search className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <span className="pb-2">Track</span>
          </Link>
        </li>
        {RIGHT.map(item)}
      </ul>
    </nav>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border bg-card p-4 shadow-card", className)}>{children}</div>;
}

export function PrimaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-highlight font-bold text-highlight-foreground transition active:scale-[0.99] disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function OutlineButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background text-sm font-semibold text-primary transition hover:bg-accent disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-highlight/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-highlight-foreground",
        className,
      )}
    >
      Demo data
    </span>
  );
}

export const inputClass =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";
