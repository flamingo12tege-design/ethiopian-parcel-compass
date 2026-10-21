import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Calculator, ShieldAlert, BookOpen, CircleHelp } from "lucide-react";
import { Screen, BrandMark } from "@/components/app/shell";
import { CompactTrackSearch } from "@/components/app/tracking";
import { RecentParcels } from "@/components/app/recent-parcels";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import parcel from "@/assets/parcel.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ethio Post — Track Parcels" },
      {
        name: "description",
        content: "Track your parcel and send a package.",
      },
      { property: "og:title", content: "Ethio Post — Track Parcels" },
      {
        property: "og:description",
        content: "Track your parcel and send a package.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unread", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);
      return count ?? 0;
    },
  });
}

const QUICK = [
  { to: "/calculator", label: "Calculate", icon: Calculator },
  { to: "/claims", label: "Claims", icon: ShieldAlert },
  { to: "/guide", label: "Shipping Guide", icon: BookOpen },
  { to: "/info", label: "FAQs", icon: CircleHelp },
] as const;

function Home() {
  const { data: unread } = useUnreadCount();
  return (
    <Screen>
      <header className="pt-safe bg-primary text-primary-foreground">
        <div className="grid h-16 grid-cols-[minmax(0,1fr)_2.5rem] items-center px-3">
          <div className="flex min-w-0 justify-start">
            <BrandMark light />
          </div>
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center"
          >
            <Bell className="h-6 w-6" />
            {!!unread && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-highlight px-1 text-[10px] font-bold text-highlight-foreground">
                {unread}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="space-y-5 px-4 pt-5 pb-4">
        <section className="bg-hero relative overflow-hidden rounded-2xl p-4 text-primary-foreground shadow-card">
          <img
            src={parcel}
            alt=""
            width={256}
            height={256}
            className="absolute -right-4 -top-3 h-32 w-32 object-contain"
          />
          <h2 className="text-lg font-bold">Track Your Parcel</h2>
          <p className="mt-1 max-w-[60%] text-xs opacity-90">
            Enter your tracking number and get the latest updates.
          </p>
          <div className="mt-4">
            <CompactTrackSearch />
          </div>
        </section>

        <RecentParcels />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-primary">Quick Links</h3>
            <Link to="/info" className="text-xs font-semibold text-primary">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex flex-col items-center gap-1.5 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-xl border bg-card text-primary shadow-card">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Screen>
  );
}
