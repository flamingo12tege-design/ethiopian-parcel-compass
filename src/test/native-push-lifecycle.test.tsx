import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  id: "test-user",
  addListener: vi.fn(),
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  register: vi.fn(),
  upsert: vi.fn(),
  profile: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => ({ user: { id: mock.id } }) }));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => mock.navigate }));
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => true, getPlatform: () => "android" },
}));
vi.mock("@capacitor/push-notifications", () => ({ PushNotifications: mock }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (name: string) =>
      name === "push_tokens"
        ? { upsert: mock.upsert }
        : { select: () => ({ eq: () => ({ maybeSingle: mock.profile }) }) },
  },
}));
import { NativePushBridge, registerNativePush } from "@/lib/native-push";

describe("Native push lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.profile.mockResolvedValue({ data: { push_enabled: false } });
  });
  afterEach(cleanup);
  it("removes listeners that finish installing after unmount", async () => {
    let finish: ((handle: { remove: () => Promise<void> }) => void) | undefined;
    mock.addListener.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const remove = vi.fn().mockResolvedValue(undefined);
    const { unmount } = render(<NativePushBridge />);
    await act(async () => {
      await vi.waitFor(() => expect(mock.addListener).toHaveBeenCalledTimes(1));
    });
    unmount();
    await act(async () => {
      finish?.({ remove });
    });
    expect(remove).toHaveBeenCalledTimes(1);
    expect(mock.profile).not.toHaveBeenCalled();
  });
  it("does not reinstall listeners for the same user on session refresh", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    mock.addListener.mockResolvedValue({ remove });
    const { rerender, unmount } = render(<NativePushBridge />);
    await act(async () => {
      await vi.waitFor(() => expect(mock.profile).toHaveBeenCalledTimes(1));
    });
    rerender(<NativePushBridge />);
    expect(mock.addListener).toHaveBeenCalledTimes(2);
    unmount();
    expect(remove).toHaveBeenCalledTimes(2);
  });
  it("does not register when notification permission is denied", async () => {
    mock.checkPermissions.mockResolvedValue({ receive: "denied" });
    expect(await registerNativePush()).toBe("denied");
    expect(mock.register).not.toHaveBeenCalled();
  });
});
