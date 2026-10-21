import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { dispatchPendingPush } from "./push.server";

/** Advances a DEMO parcel one step (simulated, labelled) and pushes the resulting notifications. */
export const simulateDemoStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ trackingNumber: z.string().min(5).max(20) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: next, error } = await context.supabase.rpc("advance_demo_parcel", {
      _tracking: data.trackingNumber,
    });
    if (error) throw new Error(error.message);
    const { data: parcel } = await context.supabase.rpc("track_parcel", { _tracking: data.trackingNumber });
    const parcelId = (parcel as { id?: string } | null)?.id;
    const push = parcelId ? await dispatchPendingPush({ parcelId }) : null;
    return { status: next as string, push };
  });
