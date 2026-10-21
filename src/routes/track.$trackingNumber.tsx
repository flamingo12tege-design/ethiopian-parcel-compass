import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Bell, BellOff, CheckCircle2, ChevronRight, FlaskConical, PackageX, Truck } from "lucide-react";
import { toast } from "sonner";
import { Screen, PageHeader, Card, DemoBadge, OutlineButton, PrimaryButton } from "@/components/app/shell";
import { CopyButton, EventTimeline, StatusStepper } from "@/components/app/tracking";
import { STATUS_LABEL, STATUS_MESSAGE, trackQueryOptions } from "@/lib/parcels";
import { simulateDemoStep } from "@/lib/parcels.functions";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { rememberTrackedParcel } from "@/lib/recent-tracking";
import { LiveTracking } from "@/components/app/live-tracking";

export const Route = createFileRoute("/track/$trackingNumber")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(trackQueryOptions(params.trackingNumber.toUpperCase()));
  },
  head: ({ params }) => ({
    meta: [
      { title: `Tracking ${params.trackingNumber} — Ethio Post` },
      { name: "description", content: `Latest status and history for parcel ${params.trackingNumber}.` },
      { property: "og:title", content: `Tracking ${params.trackingNumber}` },
      { property: "og:description", content: "Parcel status and tracking history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackingDetails,
  errorComponent: ({ error }) => (
    <Screen>
      <PageHeader title="Tracking Details" />
      <p className="p-6 text-center text-sm text-muted-foreground">Couldn't load tracking: {(error as Error).message}</p>
    </Screen>
  ),
});

function TrackingDetails() {
  const tn = Route.useParams().trackingNumber.toUpperCase();
  const { data: p } = useSuspenseQuery(trackQueryOptions(tn));
  useEffect(() => {
    if (p) rememberTrackedParcel(p.tracking_number);
  }, [p?.tracking_number]);
  const { user } = useAuth();
  const qc = useQueryClient();
  const simulate = useServerFn(simulateDemoStep);

  const watch = useQuery({
    queryKey: ["watch", p?.id, user?.id],
    enabled: !!p && !!user,
    queryFn: async () => {
      const { data } = await supabase.from("parcel_watches").select("parcel_id").eq("parcel_id", p!.id).maybeSingle();
      return !!data;
    },
  });

  const toggleWatch = useMutation({
    mutationFn: async () => {
      if (watch.data) {
        await supabase.from("parcel_watches").delete().eq("parcel_id", p!.id);
      } else {
        const { error } = await supabase.from("parcel_watches").insert({ parcel_id: p!.id, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(watch.data ? "You'll no longer get updates" : "You'll be notified when the status changes");
      qc.invalidateQueries({ queryKey: ["watch"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const step = useMutation({
    mutationFn: () => simulate({ data: { trackingNumber: tn } }),
    onSuccess: (r) => {
      toast.success(`Demo status set to ${STATUS_LABEL[r.status as keyof typeof STATUS_LABEL] ?? r.status}`);
      qc.invalidateQueries({ queryKey: ["track", tn] });
      qc.invalidateQueries({ queryKey: ["unread"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!p) {
    return (
      <Screen>
        <PageHeader title="Tracking Details" />
        <LiveTracking tn={tn} />
      </Screen>
    );
  }

  const delivered = p.status === "delivered";
  return (
    <Screen>
      <PageHeader title="Tracking Details" />
      <main className="space-y-4 px-4 pb-6">
        <div className={cn("flex items-center gap-3 rounded-2xl p-4", p.status === "booked" ? "bg-info-soft" : "bg-success-soft")}>
          <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground", p.status === "booked" ? "bg-primary" : "bg-success")}>
            {delivered || p.status !== "booked" ? <CheckCircle2 className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold text-primary">{STATUS_LABEL[p.status]}</p>
            <p className="text-sm text-muted-foreground">{STATUS_MESSAGE[p.status]}</p>
          </div>
        </div>

        {p.is_demo && (
          <div className="rounded-xl border border-highlight bg-highlight/15 p-3 text-xs">
            <DemoBadge /> <span className="ml-1">This is a fictional demo parcel. Its movements are not real.</span>
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xl font-bold tracking-wide text-primary">{p.tracking_number}</h2>
            <CopyButton value={p.tracking_number} />
          </div>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-t pt-3">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="font-semibold">{p.origin_city} ({p.origin_code})</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">To</p>
              <p className="font-semibold">{p.destination_city} ({p.destination_code})</p>
            </div>
          </div>
          <div className="mt-5">
            <StatusStepper status={p.status} />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-primary">Latest Update</h3>
          <EventTimeline events={p.events} />
        </Card>

        <Link
          to="/parcel/$trackingNumber"
          params={{ trackingNumber: p.tracking_number }}
          className="flex items-center justify-between rounded-2xl border bg-card p-4 font-semibold text-primary shadow-card"
        >
          View parcel details <ChevronRight className="h-5 w-5" />
        </Link>

        {user ? (
          <OutlineButton onClick={() => toggleWatch.mutate()} disabled={toggleWatch.isPending || watch.isLoading}>
            {watch.data ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {watch.data ? "Stop status updates" : "Notify me about status changes"}
          </OutlineButton>
        ) : (
          <Link to="/auth" search={{ redirect: `/track/${p.tracking_number}` }} className="block">
            <OutlineButton>
              <Bell className="h-4 w-4" /> Sign in to get status updates
            </OutlineButton>
          </Link>
        )}

      </main>
    </Screen>
  );
}
