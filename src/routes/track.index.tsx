import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Screen, PageHeader } from "@/components/app/shell";
import { TrackForm } from "@/components/app/tracking";
import parcel from "@/assets/parcel.webp";

export const Route = createFileRoute("/track/")({
  head: () => ({
    meta: [
      { title: "Track Parcel — Ethiopian Postal Service" },
      { name: "description", content: "Enter your tracking number to see where your parcel is." },
      { property: "og:title", content: "Track Parcel — Ethiopian Postal Service" },
      {
        property: "og:description",
        content: "Enter your tracking number to see where your parcel is.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  return (
    <Screen>
      <PageHeader title="Track Parcel" />
      <main className="flex-1 space-y-6 px-5">
        <div className="mx-auto grid h-48 w-48 place-items-center rounded-full bg-info-soft">
          <img
            src={parcel}
            alt="Parcel with location pin"
            width={256}
            height={256}
            className="h-44 w-44 object-contain"
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-primary">Enter your tracking number</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            You can find the tracking number on your receipt or SMS.
          </p>
        </div>
        <TrackForm />
        <div className="flex gap-3 rounded-2xl bg-info-soft p-4">
          <Info className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold text-primary">Did you know?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tracking numbers look like RR123456789ET — two letters, nine digits, two letters.
            </p>
          </div>
        </div>
      </main>
    </Screen>
  );
}
