import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { dispatchPendingPush } from "@/lib/push.server";

// Sends any pending parcel-status push notifications. Callable only by the
// platform scheduler (bearer-authenticated); safe to run repeatedly.
export const Route = createFileRoute("/api/public/push/dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const result = await dispatchPendingPush({ limit: 200 });
        return Response.json(result);
      },
    },
  },
});
