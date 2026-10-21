import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Info, UserRound } from "lucide-react";
import { Screen, PageHeader, Card, DemoBadge } from "@/components/app/shell";
import { CopyButton } from "@/components/app/tracking";
import { trackQueryOptions } from "@/lib/parcels";

export const Route = createFileRoute("/parcel/$trackingNumber")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(trackQueryOptions(params.trackingNumber.toUpperCase()));
  },
  head: ({ params }) => ({
    meta: [
      { title: `Parcel ${params.trackingNumber} — Details` },
      { name: "description", content: "Service type, weight, sender and recipient for this parcel." },
      { property: "og:title", content: `Parcel ${params.trackingNumber} — Details` },
      { property: "og:description", content: "Parcel details from the Ethiopian Postal Service app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParcelDetails,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function ParcelDetails() {
  const tn = Route.useParams().trackingNumber.toUpperCase();
  const { data: p } = useSuspenseQuery(trackQueryOptions(tn));

  if (!p)
    return (
      <Screen>
        <PageHeader title="Parcel Details" />
        <p className="p-6 text-center text-sm text-muted-foreground">
          Parcel not found. <Link to="/track" className="font-semibold text-primary">Track another</Link>
        </p>
      </Screen>
    );

  return (
    <Screen>
      <PageHeader title="Parcel Details" />
      <main className="px-4 pb-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="min-w-0">
              <h2 className="font-mono text-xl font-bold text-primary">{p.tracking_number}</h2>
              {p.is_demo && <DemoBadge className="mt-1" />}
            </div>
            <CopyButton value={p.tracking_number} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Service Type" value={p.service_type} />
            <Field label="Weight" value={`${Number(p.weight_kg)} kg`} />
            <Field label="Declared Value" value={`ETB ${Number(p.declared_value).toLocaleString()}`} />
            <Field label="Category" value={p.category} />
          </div>
          {p.description && <Field label="Description" value={p.description} />}
          <div className="space-y-4 border-t pt-4">
            {[
              { title: "Sender", lines: [p.sender_name, p.sender_address] },
              { title: "Recipient", lines: [p.recipient_name, p.recipient_address, p.recipient_phone] },
            ].map((b) => (
              <div key={b.title} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-bold">{b.title}</p>
                  {b.lines.map((l) => (
                    <p key={l} className="text-muted-foreground">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 rounded-xl bg-info-soft p-3">
            <Info className="h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-semibold text-primary">Estimated Delivery</p>
              <p className="text-primary/80">{p.estimated_delivery}</p>
            </div>
          </div>
        </Card>
      </main>
    </Screen>
  );
}
