import { Search } from "lucide-react";
import parcel from "@/assets/parcel.webp";

export function TrackingLoader({ trackingNumber }: { trackingNumber: string }) {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12 text-center" role="status" aria-live="polite" aria-busy="true">
      <div className="relative grid h-40 w-40 place-items-center" aria-hidden="true">
        <div className="absolute inset-2 rounded-full border border-primary/15 bg-info-soft" />
        <img src={parcel} alt="" width={256} height={256} className="relative h-28 w-28 object-contain" />
        <span className="tracking-scan absolute bottom-3 right-2 grid h-12 w-12 place-items-center rounded-full border-4 border-background bg-highlight text-highlight-foreground">
          <Search className="h-6 w-6" />
        </span>
      </div>
      <h2 className="mt-6 text-lg font-bold text-primary">Checking Ethiopian Post's live tracking for…</h2>
      <p className="mt-2 max-w-full break-all font-mono text-base font-semibold text-foreground">{trackingNumber}</p>
      <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="splash-loader h-full w-1/2 rounded-full bg-highlight" />
      </div>
    </main>
  );
}