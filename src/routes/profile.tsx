import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, UserRound } from "lucide-react";
import { Screen, BrandMark, inputClass, PrimaryButton } from "@/components/app/shell";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { registerNativePush, unregisterNativePush } from "@/lib/native-push";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Ethiopian Postal Service" },
      { name: "description", content: "Manage your account and notification settings." },
      { property: "og:title", content: "Profile & Settings" },
      { property: "og:description", content: "Manage your account and notification settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/profile" }, replace: true });
  }, [loading, user, navigate]);
  const qc = useQueryClient();
  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });
  const myParcels = useQuery({
    queryKey: ["my-parcels", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("parcels").select("tracking_number, status, destination_city").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    setName(profile.data?.full_name ?? "");
    setPhone(profile.data?.phone ?? "");
  }, [profile.data]);

  const save = useMutation({
    mutationFn: async (patch: { full_name?: string; phone?: string; push_enabled?: boolean }) => {
      const { error } = await supabase.from("profiles").upsert({ id: user!.id, ...patch });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePush = async (on: boolean) => {
    await save.mutateAsync({ push_enabled: on });
    if (on) {
      const r = await registerNativePush();
      if (r === "denied") toast.error("Notifications are blocked in your phone settings");
      else if (r === "web") toast.success("Updates will appear in Notifications. Phone alerts work in the Android app.");
      else toast.success("Push notifications enabled");
    } else {
      await unregisterNativePush();
      toast.success("Push notifications turned off");
    }
  };

  return (
    <Screen>
      <header className="pt-safe bg-primary px-5 pb-8 pt-6 text-primary-foreground">
        <div className="flex items-center gap-3 pt-safe">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-foreground text-primary">
            <UserRound className="h-8 w-8" />
          </span>
          {user ? (
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{profile.data?.full_name || "Your account"}</p>
              <p className="truncate text-sm opacity-80">{user.email}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold">Welcome</p>
              <Link to="/auth" search={{ redirect: "/profile" }} className="text-sm font-semibold text-highlight underline">
                Sign in or create an account
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="-mt-4 flex-1 space-y-5 rounded-t-3xl bg-background px-4 pt-4">
        {user && (
          <>
            <section className="space-y-3 rounded-2xl border p-4">
              <h2 className="font-bold text-primary">Settings</h2>
              <label className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-medium">Parcel status notifications</span>
                  <span className="text-xs text-muted-foreground">Alerts when a followed parcel moves</span>
                </span>
                <Switch checked={profile.data?.push_enabled ?? true} onCheckedChange={togglePush} />
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Full name" className={inputClass} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} type="tel" placeholder="Phone" className={inputClass} />
              <PrimaryButton
                onClick={() => save.mutate({ full_name: name.trim(), phone: phone.trim() }, { onSuccess: () => toast.success("Profile saved") })}
                disabled={save.isPending}
              >
                Save profile
              </PrimaryButton>
            </section>

            {!!myParcels.data?.length && (
              <section className="rounded-2xl border p-4">
                <h2 className="mb-2 font-bold text-primary">My bookings</h2>
                {myParcels.data.map((p) => (
                  <Link key={p.tracking_number} to="/track/$trackingNumber" params={{ trackingNumber: p.tracking_number }} className="flex justify-between py-2 text-sm">
                    <span className="font-mono font-semibold">{p.tracking_number}</span>
                    <span className="text-muted-foreground">→ {p.destination_city}</span>
                  </Link>
                ))}
              </section>
            )}

            <button onClick={() => supabase.auth.signOut()} className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-sm font-semibold text-destructive">
              <LogOut className="h-5 w-5" /> Sign out
            </button>
          </>
        )}

        <footer className="flex flex-col items-center gap-2 pb-6 pt-4">
          <BrandMark />
          <p className="text-xs text-muted-foreground">© 2026 Ethiopian Postal Service · Demo app</p>
        </footer>
      </main>
    </Screen>
  );
}
