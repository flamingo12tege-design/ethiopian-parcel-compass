import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import type { LiveResult } from "./live-tracking.server";

export type { LiveResult, LiveEvent } from "./live-tracking.server";

export const liveTrack = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ trackingNumber: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{10,20}$/) }).parse(d),
  )
  .handler(async ({ data }): Promise<LiveResult | null> => {
    const { liveLookup } = await import("./live-tracking.server");
    return liveLookup(data.trackingNumber);
  });

export const liveTrackQueryOptions = (tn: string) =>
  queryOptions({
    queryKey: ["live-track", tn],
    queryFn: () => liveTrack({ data: { trackingNumber: tn } }),
    staleTime: 5 * 60_000,
    retry: false,
  });
