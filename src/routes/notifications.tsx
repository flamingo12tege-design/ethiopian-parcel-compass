import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, CheckCheck, LogIn, Trash2 } from "lucide-react";
import { Screen, PageHeader, PrimaryButton } from "@/components/app/shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/parcels";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Ethiopian Postal Service" },
      { name: "description", content: "Status updates for the parcels you follow." },
      { property: "og:title", content: "Notifications" },
      { property: "og:description", content: "Status updates for the parcels you follow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const list = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, is_read, created_at, tracking_number")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["unread"] });
  };
  const markAll = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    },
    onSuccess: refresh,
  });
  const clear = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").delete().eq("user_id", user!.id);
    },
    onSuccess: refresh,
  });

  const open = async (n: { id: string; is_read: boolean; tracking_number: string | null }) => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      refresh();
    }
    if (n.tracking_number) navigate({ to: "/track/$trackingNumber", params: { trackingNumber: n.tracking_number } });
  };

  return (
    <Screen>
      <PageHeader
        title="Notifications"
        right={
          user && list.data?.length ? (
            <button aria-label="Mark all as read" onClick={() => markAll.mutate()} className="grid h-10 w-10 place-items-center">
              <CheckCheck className="h-5 w-5" />
            </button>
          ) : null
        }
      />
      <main className="flex-1 px-4">
        {!loading && !user ? (
          <div className="flex flex-col items-center pt-10 text-center">
            <LogIn className="h-12 w-12 text-primary" />
            <h2 className="mt-4 text-lg font-bold text-primary">Sign in to see notifications</h2>
            <Link to="/auth" search={{ redirect: "/notifications" }} className="mt-6 w-full">
              <PrimaryButton>Sign in</PrimaryButton>
            </Link>
          </div>
        ) : list.data?.length ? (
          <>
            <ul className="space-y-2">
              {list.data.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => open(n)}
                    className={cn("flex w-full gap-3 rounded-2xl border p-4 text-left", !n.is_read && "border-primary/30 bg-info-soft")}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-highlight/30 text-primary">
                      <BellRing className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-primary">{n.title}</span>
                      <span className="block text-xs text-muted-foreground">{n.body}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{formatDateTime(n.created_at)}</span>
                    </span>
                    {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-highlight" />}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => clear.mutate()} className="mx-auto mt-4 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Trash2 className="h-3 w-3" /> Clear all
            </button>
          </>
        ) : (
          <div className="pt-12 text-center">
            <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-3 font-semibold text-primary">No notifications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Follow a parcel to get updates when its status changes.</p>
          </div>
        )}
      </main>
    </Screen>
  );
}
