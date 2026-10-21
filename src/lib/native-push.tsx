import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/** True only inside the Capacitor Android/iOS shell. */
export async function isNativeApp() {
  if (typeof window === "undefined") return false;
  const { Capacitor } = await import("@capacitor/core");
  return Capacitor.isNativePlatform();
}

/**
 * Asks for notification permission and registers this device with FCM.
 * The token is stored per signed-in user so the server can target it.
 */
export async function registerNativePush(): Promise<"registered" | "web" | "denied"> {
  if (!(await isNativeApp())) return "web";
  const { PushNotifications } = await import("@capacitor/push-notifications");
  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt") perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") return "denied";
  await PushNotifications.register();
  return "registered";
}

export async function unregisterNativePush() {
  if (!(await isNativeApp())) return;
  const { PushNotifications } = await import("@capacitor/push-notifications");
  await PushNotifications.unregister();
}

/** Mounted once: saves FCM tokens and opens the parcel when a notification is tapped. */
export function NativePushBridge() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const handles: { remove: () => Promise<void> }[] = [];
    const retain = async (handle: { remove: () => Promise<void> }) => {
      if (cancelled) await handle.remove();
      else handles.push(handle);
    };
    (async () => {
      if (!(await isNativeApp())) return;
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const { Capacitor } = await import("@capacitor/core");
      if (cancelled) return;
      const reg = await PushNotifications.addListener("registration", async ({ value }) => {
        if (cancelled) return;
        await supabase.from("push_tokens").upsert({
          token: value,
          user_id: userId,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString(),
        });
      });
      await retain(reg);
      if (cancelled) return;
      const tap = await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
        if (cancelled) return;
        const tn = a.notification.data?.tracking_number;
        if (typeof tn === "string")
          navigate({ to: "/track/$trackingNumber", params: { trackingNumber: tn } });
      });
      await retain(tap);
      if (cancelled) return;
      const { data } = await supabase
        .from("profiles")
        .select("push_enabled")
        .eq("id", userId)
        .maybeSingle();
      if (!cancelled && data?.push_enabled !== false) await registerNativePush();
    })().catch(() => {
      for (const handle of handles.splice(0)) void handle.remove();
    });
    return () => {
      cancelled = true;
      for (const handle of handles.splice(0)) void handle.remove();
    };
  }, [userId, navigate]);

  return null;
}
