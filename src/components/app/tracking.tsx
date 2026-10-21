import { Check, Copy, PackageSearch, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  STATUS_LABEL,
  STEPS,
  TRACKING_RE,
  formatDateTime,
  normalizeTracking,
  type ParcelStatus,
  type TrackingEvent,
} from "@/lib/parcels";
import { PrimaryButton, inputClass } from "./shell";

export function useTrackSubmit() {
  const navigate = useNavigate();
  return (raw: string) => {
    const tn = normalizeTracking(raw);
    if (!/^[A-Z0-9]{10,20}$/.test(tn)) {
      toast.error("Enter a valid tracking number, e.g. EP123456789ET");
      return false;
    }
    navigate({ to: "/track/$trackingNumber", params: { trackingNumber: tn } });
    return true;
  };
}

export function CompactTrackSearch() {
  const [v, setV] = useState("");
  const submit = useTrackSubmit();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(v);
      }}
      className="flex h-11 items-center rounded-xl bg-background p-1 pl-3"
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Enter tracking number"
        aria-label="Tracking number"
        autoCapitalize="characters"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        aria-label="Track"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-highlight text-highlight-foreground"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

export function TrackForm({ initial = "" }: { initial?: string }) {
  const [v, setV] = useState(initial);
  const submit = useTrackSubmit();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(v);
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="relative block">
        <span className="sr-only">Tracking number</span>
        <PackageSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="e.g. EP123456789ET"
          autoCapitalize="characters"
          autoComplete="off"
          className={cn(inputClass, "h-14 pl-12 text-base tracking-wide")}
        />
      </label>
      <PrimaryButton type="submit">Track</PrimaryButton>
    </form>
  );
}

export function StatusStepper({ status }: { status: ParcelStatus }) {
  const idx = STEPS.indexOf(status);
  return (
    <div className="grid grid-cols-4">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const current = i === idx;
        return (
          <div key={s} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                className={cn("absolute right-1/2 top-[9px] h-0.5 w-full", i <= idx ? "bg-success" : "bg-border")}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid h-5 w-5 place-items-center rounded-full border-2",
                done ? "border-success bg-success text-primary-foreground" : "border-border bg-muted",
                current && "bg-background ring-4 ring-success/20",
              )}
            >
              {done && !current && <Check className="h-3 w-3" strokeWidth={3} />}
              {current && <span className="h-2 w-2 rounded-full bg-success" />}
            </span>
            <span
              className={cn(
                "mt-2 text-[11px] leading-tight",
                done ? "font-semibold text-success" : "text-muted-foreground",
              )}
            >
              {STATUS_LABEL[s]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function EventTimeline({ events }: { events: TrackingEvent[] }) {
  if (!events.length) return <p className="text-sm text-muted-foreground">No updates yet.</p>;
  return (
    <ol className="relative">
      {events.map((e, i) => (
        <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
          {i < events.length - 1 && <span className="absolute left-[7px] top-4 h-full w-0.5 bg-success/40" />}
          <span
            className={cn(
              "relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full border-[3px] border-success",
              i === 0 ? "bg-success" : "bg-background",
            )}
          />
          <div className="min-w-0 flex-1 border-b pb-4 last:border-0">
            <p className="text-xs text-muted-foreground">{formatDateTime(e.occurred_at)}</p>
            <p className="mt-0.5 text-sm font-medium">{e.description}</p>
            <p className="text-xs text-muted-foreground">{e.location}</p>
            {e.is_simulated && (
              <span className="mt-1 inline-block rounded bg-highlight/30 px-1.5 text-[10px] font-bold uppercase">
                Simulated
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CopyButton({ value }: { value: string }) {
  return (
    <button
      aria-label="Copy tracking number"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success("Tracking number copied");
        } catch {
          toast.error("Couldn't copy");
        }
      }}
      className="grid h-9 w-9 place-items-center rounded-lg text-primary hover:bg-accent"
    >
      <Copy className="h-4 w-4" />
    </button>
  );
}
