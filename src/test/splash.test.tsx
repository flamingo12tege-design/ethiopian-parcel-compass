import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ loading: true, ready: true }));
vi.mock("@/lib/auth", () => ({ useAuth: () => ({ loading: state.loading }) }));
vi.mock("@tanstack/react-router", () => ({ useRouterState: () => state.ready }));
import { SplashScreen } from "@/components/app/splash";

describe("Startup splash lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    state.loading = true;
    state.ready = true;
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });
  it("waits for readiness then releases the screen without the old fixed delay", () => {
    const { container, rerender } = render(<SplashScreen />);
    act(() => vi.advanceTimersByTime(3000));
    expect(container.childElementCount).toBe(1);
    state.loading = false;
    rerender(<SplashScreen />);
    act(() => vi.advanceTimersByTime(200));
    expect(container.childElementCount).toBe(0);
  });
  it("waits for the initial route before dismissing", () => {
    state.loading = false;
    state.ready = false;
    const { container, rerender } = render(<SplashScreen />);
    act(() => vi.advanceTimersByTime(1000));
    expect(container.childElementCount).toBe(1);
    state.ready = true;
    rerender(<SplashScreen />);
    act(() => vi.advanceTimersByTime(200));
    expect(container.childElementCount).toBe(0);
  });
  it("skips the splash on a warm session", () => {
    sessionStorage.setItem("ethiopost:splash", "1");
    const { container } = render(<SplashScreen />);
    expect(container.childElementCount).toBe(0);
  });
});
