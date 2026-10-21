import { Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, ChevronRight, Package, Truck } from "lucide-react";
import { STATUS_LABEL, trackQueryOptions } from "@/lib/parcels";
import { useRecentTracking } from "@/lib/recent-tracking";
import postalPattern from "@/assets/postal-pattern.jpg";
import { cn } from "@/lib/utils";
import { liveTrackQueryOptions } from "@/lib/live-tracking.functions";

export function RecentParcels() {
  const { recent, ready } = useRecentTracking();
  const numbers = recent;
  const results = useQueries({ queries: numbers.map((number) => ({
    ...trackQueryOptions(number),
    enabled: ready,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })) });
  // Share the detail screen's carrier cache; only fall back after a successful masked read.
  const liveResults = useQueries({ queries: numbers.map((number, index) => ({
    ...liveTrackQueryOptions(number),
    enabled: ready && results[index]?.isSuccess === true && !results[index]?.data,
  })) });
  if (ready && !recent.length) {
    return (
      <section className="relative overflow-hidden rounded-2xl bg-hero p-5 text-primary-foreground shadow-card">
        <img src={postalPattern} alt="" width={1024} height={1536} className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-highlight/25"><Package className="h-6 w-6" /></span>
          <div>
            <p className="font-bold">No parcels yet</p>
            <p className="text-xs text-primary-foreground/75">Parcels you track will appear here with their latest status.</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section aria-labelledby="recent-parcels-heading">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="recent-parcels-heading" className="font-bold text-primary">Recently tracked</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Latest status
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {numbers.map((number, index) => {
          const result = results[index];
          const parcel = result?.data;
          const liveResult = liveResults[index];
          const live = !parcel ? liveResult?.data : null;
          const liveStatus = live?.status ?? live?.events[0]?.event;
          const delivered = parcel?.status === "delivered" || /^delivered\b/i.test(liveStatus ?? "");
          const Icon = delivered ? CheckCircle2 : parcel?.status === "in_transit" || parcel?.status === "out_for_delivery" ? Truck : Package;
          return (
            <Link key={number} to="/track/$trackingNumber" params={{ trackingNumber: number }}
              aria-label={`Track ${number}`}
              className="relative flex min-h-52 min-w-0 flex-col overflow-hidden rounded-2xl bg-hero p-3 text-primary-foreground shadow-card transition hover:opacity-95 active:scale-[0.98]">
              <img src={postalPattern} alt="" width={1024} height={1536} className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" />
              <div className="relative flex items-center justify-between gap-1">
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", delivered ? "bg-success-soft text-success" : "bg-highlight/25 text-primary")}><Icon className="h-5 w-5" /></span>
                <ChevronRight className="h-4 w-4 text-primary-foreground/70" />
              </div>
              <p className="relative mt-3 break-all font-mono text-xs font-bold">{number}</p>
              <p className={cn("relative mt-1 text-sm font-bold", delivered && "text-success-soft")}>
                {parcel ? STATUS_LABEL[parcel.status] : live ? liveStatus || "Tracking updates available" : result?.isError || liveResult?.isError ? "Updates unavailable" : result?.isSuccess && liveResult?.isSuccess ? "Parcel not found" : "Checking status…"}
              </p>
              {parcel && <div className="relative mt-2 flex min-w-0 items-center gap-1 text-[11px] text-primary-foreground/75"><span className="min-w-0 flex-1 break-words">{parcel.origin_city}</span><ArrowRight className="h-3 w-3 shrink-0" /><span className="min-w-0 flex-1 break-words">{parcel.destination_city}</span></div>}
              {live && <p className="relative mt-2 text-[11px] text-primary-foreground/75">Live carrier updates</p>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}