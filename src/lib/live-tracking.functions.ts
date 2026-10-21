import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import type { LiveResult as ServerLiveResult } from "./live-tracking.server";

export type { LiveEvent } from "./live-tracking.server";

// What the app receives: carrier names are replaced by neutral codes so the
// app's own network traffic never names the upstream sites.
export type LiveResult = Omit<ServerLiveResult, "source"> & { source: "official" | "international" };

export const liveTrack = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ trackingNumber: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{10,20}$/) }).parse(d),
  )
  .handler(async ({ data }): Promise<LiveResult | null> => {
    const { liveLookup } = await import("./live-tracking.server");
    const r = await liveLookup(data.trackingNumber);
    if (!r) return null;
    return { ...r, source: r.source === "ethiopost" ? "official" : "international" };
  });

export const liveTrackQueryOptions = (tn: string) =>
  queryOptions({
    queryKey: ["live-track", tn],
    queryFn: () => liveTrack({ data: { trackingNumber: tn } }),
    staleTime: 5 * 60_000,
    retry: false,
  });
