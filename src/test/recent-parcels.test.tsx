import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { RecentParcels } from "@/components/app/recent-parcels";

const calls = vi.hoisted(() => ({ masked: vi.fn(), live: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/recent-tracking", () => ({ useRecentTracking: () => ({ recent: ["RQ602916122MY"], ready: true }) }));
vi.mock("@/lib/parcels", () => ({ STATUS_LABEL: { delivered: "Delivered" }, trackQueryOptions: (tn: string) => ({ queryKey: ["track", tn], queryFn: calls.masked, retry: false }) }));
vi.mock("@/lib/live-tracking.functions", () => ({ liveTrackQueryOptions: (tn: string) => ({ queryKey: ["live-track", tn], queryFn: calls.live, retry: false }) }));

beforeEach(() => vi.clearAllMocks());
it("shows the successful live result when the masked parcel read is empty", async () => {
  calls.masked.mockResolvedValue(null);
  calls.live.mockResolvedValue({ status: "Delivered - Signed", events: [] });
  render(<QueryClientProvider client={new QueryClient()}><RecentParcels /></QueryClientProvider>);
  expect(await screen.findByText("Delivered - Signed")).toBeTruthy();
  expect(calls.live).toHaveBeenCalledTimes(1);
});

it("does not contact a live carrier when the masked database result exists", async () => {
  calls.masked.mockResolvedValue({ status: "delivered", origin_city: "Addis", destination_city: "Bonga" });
  render(<QueryClientProvider client={new QueryClient()}><RecentParcels /></QueryClientProvider>);
  expect(await screen.findByText("Delivered")).toBeTruthy();
  expect(calls.live).not.toHaveBeenCalled();
});