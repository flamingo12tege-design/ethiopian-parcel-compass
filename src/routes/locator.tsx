import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronRight, Crosshair, MapPin, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { Screen, PageHeader, DemoBadge } from "@/components/app/shell";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import map from "@/assets/map.jpg";

const officesQuery = queryOptions({
  queryKey: ["post_offices"],
  staleTime: 5 * 60_000,
  queryFn: async ({ signal }) => {
    const { data, error } = await supabase
      .from("post_offices")
      .select("*")
      .order("name")
      .abortSignal(signal);
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/locator")({
  loader: ({ context }) => context.queryClient.ensureQueryData(officesQuery).then(() => undefined),
  head: () => ({
    meta: [
      { title: "Post Office Locator — Ethiopian Postal Service" },
      { name: "description", content: "Find a nearby post office, opening hours and directions." },
      { property: "og:title", content: "Post Office Locator" },
      {
        property: "og:description",
        content: "Find a nearby post office, opening hours and directions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Locator,
});

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371,
    r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r,
    dLng = (b.lng - a.lng) * r;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Schematic map window over central Addis Ababa
const BOUNDS = { minLat: 8.98, maxLat: 9.05, minLng: 38.71, maxLng: 38.8 };
const pos = (lat: number, lng: number) => ({
  left: `${((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100}%`,
  top: `${(1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100}%`,
});
const inBounds = (lat: number, lng: number) =>
  lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat && lng >= BOUNDS.minLng && lng <= BOUNDS.maxLng;

function Locator() {
  const { data: offices } = useSuspenseQuery(officesQuery);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const ref = me ?? { lat: 9.012, lng: 38.765 };

  const list = useMemo(
    () =>
      offices
        .filter((o) => `${o.name} ${o.city} ${o.address}`.toLowerCase().includes(q.toLowerCase()))
        .map((o) => ({ ...o, dist: km(ref, o) }))
        .sort((a, b) => a.dist - b.dist),
    [offices, q, ref.lat, ref.lng],
  );

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("Location isn't available on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setMe({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error("Allow location access to sort by distance"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <Screen>
      <PageHeader title="Post Office Locator" />
      <div className="relative -mt-4 aspect-[4/3.6] w-full overflow-hidden bg-muted">
        <img
          src={map}
          alt="Schematic map of central Addis Ababa"
          width={1024}
          height={1024}
          className="h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute left-[38%] top-[52%] text-center font-bold leading-tight text-primary/70">
          Addis Ababa
          <span className="block font-ethiopic">አዲስ አበባ</span>
        </span>
        {offices
          .filter((o) => inBounds(o.lat, o.lng))
          .map((o) => (
            <button
              key={o.id}
              aria-label={o.name}
              onClick={() => setSelected(o.id)}
              style={pos(o.lat, o.lng)}
              className="absolute -translate-x-1/2 -translate-y-full"
            >
              <MapPin
                className={cn(
                  "h-8 w-8 fill-pin text-background drop-shadow",
                  selected === o.id && "scale-125",
                )}
              />
            </button>
          ))}
        {me && inBounds(me.lat, me.lng) && (
          <span
            style={pos(me.lat, me.lng)}
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary ring-8 ring-primary/20"
          />
        )}
        <button
          onClick={locate}
          aria-label="Use my location"
          className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-background text-primary shadow-card"
        >
          <Crosshair className="h-5 w-5" />
        </button>
      </div>

      <main className="-mt-4 relative z-10 rounded-t-3xl bg-background px-4 pt-4">
        <label className="flex h-11 items-center gap-2 rounded-xl border px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search post offices"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {list.length === 0
            ? "No post offices listed yet."
            : me
              ? "Sorted by distance from you."
              : "Tap ⌖ to sort by your location."}
        </p>
        <ul className="mt-2 divide-y">
          {list.map((o) => (
            <li key={o.id} className={cn("rounded-xl", selected === o.id && "bg-accent")}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`}
                target="_blank"
                rel="noreferrer"
                onFocus={() => setSelected(o.id)}
                className="flex items-center gap-3 px-2 py-3"
              >
                <MapPin className="h-6 w-6 shrink-0 fill-pin text-background" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary">{o.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.dist.toFixed(1)} km · {o.hours}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
              {o.phone && selected === o.id && (
                <a
                  href={`tel:${o.phone.replace(/\s/g, "")}`}
                  className="mb-2 ml-11 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  <Phone className="h-3 w-3" /> {o.phone}
                </a>
              )}
            </li>
          ))}
          {!list.length && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              No post offices match.
            </li>
          )}
        </ul>
      </main>
    </Screen>
  );
}
