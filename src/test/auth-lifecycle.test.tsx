import { act, cleanup, render, screen } from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
  router: { invalidate: vi.fn() },
  queries: { clear: vi.fn(), invalidateQueries: vi.fn() },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: mocks } }));
vi.mock("@tanstack/react-router", () => ({ useRouter: () => mocks.router }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => mocks.queries }));
import { AuthProvider, useAuth } from "@/lib/auth";

function Probe() {
  const { loading, user } = useAuth();
  return <span>{loading ? "loading" : (user?.id ?? "signed out")}</span>;
}

describe("Auth initialization", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);
  it("does not overwrite a newer session event with an old initialization result", async () => {
    let emit: ((event: string, session: Session | null) => void) | undefined;
    let finish: ((value: { data: { session: null } }) => void) | undefined;
    mocks.onAuthStateChange.mockImplementation((callback) => {
      emit = callback;
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
    });
    mocks.getSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await act(async () => {
      emit?.("SIGNED_IN", { user: { id: "current-user" } } as Session);
    });
    await act(async () => {
      finish?.({ data: { session: null } });
    });
    expect(screen.getByText("current-user")).toBeInTheDocument();
  });
  it("clears loading after an initialization failure and cleans up its subscription", async () => {
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mocks.unsubscribe } },
    });
    mocks.getSession.mockRejectedValue(new Error("offline"));
    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("signed out")).toBeInTheDocument();
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
