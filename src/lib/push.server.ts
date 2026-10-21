/**
 * Server-only push dispatcher.
 * Duplicate protection:
 *  1. DB: notifications has UNIQUE(user_id, event_id) — one row per user per status event.
 *  2. Claim: rows are flipped pending -> sending with a conditional UPDATE, so two
 *     concurrent dispatchers can never both claim (and send) the same notification.
 */
const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

export async function dispatchPendingPush(opts: { parcelId?: string; limit?: number } = {}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const fcmKey = process.env["FIREBASE_MESSAGING_API_KEY"];
  const configured = !!(lovableKey && fcmKey);

  let q = supabaseAdmin.from("notifications").select("id").eq("push_status", "pending").limit(opts.limit ?? 50);
  if (opts.parcelId) q = q.eq("parcel_id", opts.parcelId);
  const { data: candidates, error } = await q;
  if (error) throw new Error(error.message);
  if (!candidates?.length) return { claimed: 0, sent: 0, configured };

  const { data: claimed, error: claimErr } = await supabaseAdmin
    .from("notifications")
    .update({ push_status: "sending", push_attempted_at: new Date().toISOString() })
    .in("id", candidates.map((c) => c.id))
    .eq("push_status", "pending")
    .select("id, user_id, title, body, tracking_number");
  if (claimErr) throw new Error(claimErr.message);

  let sent = 0;
  for (const n of claimed ?? []) {
    const [{ data: profile }, { data: tokens }] = await Promise.all([
      supabaseAdmin.from("profiles").select("push_enabled").eq("id", n.user_id).maybeSingle(),
      supabaseAdmin.from("push_tokens").select("token").eq("user_id", n.user_id),
    ]);
    if (!configured || profile?.push_enabled === false || !tokens?.length) {
      await supabaseAdmin.from("notifications").update({ push_status: "skipped" }).eq("id", n.id);
      continue;
    }
    let ok = false;
    for (const { token } of tokens) {
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": fcmKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title: n.title, body: n.body },
            data: { tracking_number: n.tracking_number ?? "", notification_id: n.id },
            android: { collapse_key: n.id },
          },
        }),
      });
      if (res.ok) {
        ok = true;
        continue;
      }
      const text = await res.text();
      console.error(`FCM send failed [${res.status}]: ${text}`);
      if (res.status === 404 || text.includes("UNREGISTERED")) {
        await supabaseAdmin.from("push_tokens").delete().eq("token", token);
      }
    }
    await supabaseAdmin.from("notifications").update({ push_status: ok ? "sent" : "failed" }).eq("id", n.id);
    if (ok) sent++;
  }
  return { claimed: claimed?.length ?? 0, sent, configured };
}
