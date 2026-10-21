import { QueryClient, QueryClientProvider, useSuspenseQuery } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), abortSignal: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: mocks.rpc } }));
import { trackQueryOptions } from "@/lib/parcels";

function Probe() {
  useSuspenseQuery(trackQueryOptions("RQ602916122MY"));
  return <span>tracking ready</span>;
}
afterEach(cleanup);
describe("Tracking request deduplication", () => {
  it("uses the loader result on mount without a second lookup", async () => {
    mocks.abortSignal.mockResolvedValue({ data: null, error: null });
    mocks.rpc.mockReturnValue({ abortSignal: mocks.abortSignal });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await queryClient.ensureQueryData(trackQueryOptions("RQ602916122MY"));
    render(
      <QueryClientProvider client={queryClient}>
        <Probe />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("tracking ready")).toBeInTheDocument();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
    queryClient.clear();
  });
});
