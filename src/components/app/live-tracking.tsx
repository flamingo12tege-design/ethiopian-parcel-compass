import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowRight, MapPin, PackageX, Radio } from "lucide-react";
import { TrackingLoader } from "@/components/app/tracking-loader";
import { Card, PrimaryButton } from "@/components/app/shell";
import { CopyButton } from "@/components/app/tracking";
import { liveTrackQueryOptions } from "@/lib/live-tracking.functions";
import { rememberTrackedParcel } from "@/lib/recent-tracking";

export function LiveTracking({ tn }: { tn: string }) {
  const q = useQuery(liveTrackQueryOptions(tn));
  const r = q.data;
  useEffect(() => {
    if (r) rememberTrackedParcel(tn);
  }, [r, tn]);

  if (q.isLoading) {
    return <TrackingLoader trackingNumber={tn} />;
  }

  if (!r) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 pt-10 text-center">
        <PackageX className="h-14 w-14 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-bold text-primary">No parcel found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn't find <span className="font-mono font-semibold">{tn}</span> with Ethiopian Post or international carriers. Check the number and try again.
        </p>
        {q.isError && <p className="mt-2 text-xs text-destructive">The tracking service is unavailable right now.</p>}
        <Link to="/track" className="mt-6 w-full">
          <PrimaryButton>Try another number</PrimaryButton>
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-4 px-4 pb-6">
      <div className="flex items-center gap-3 rounded-2xl bg-success-soft p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success text-primary-foreground">
          <Radio className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latest update</p>
          <p className="font-bold text-primary">{r.status ?? r.events[0]?.event}</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xl font-bold tracking-wide text-primary">{r.trackingNumber}</h2>
          <CopyButton value={r.trackingNumber} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Live data from {r.source === "ethiopost" ? "Ethiopian Post official tracking" : "international carrier tracking"}
        </p>
        {(r.origin || r.destination) && (
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-t pt-3">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="font-semibold">{r.origin ?? "—"}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">To</p>
              <p className="font-semibold">{r.destination ?? "—"}</p>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-bold text-primary">Tracking history</h3>
        <ol className="relative space-y-4 border-l-2 border-border pl-5">
          {r.events.map((e, i) => (
            <li key={i} className="relative">
              <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ${i === 0 ? "bg-success" : "bg-border"}`} />
              <p className="text-sm font-semibold">{e.event}</p>
              {e.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {e.location}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{[e.date, e.time].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ol>
      </Card>
    </main>
  );
}
