import { beforeEach, describe, expect, it } from "vitest";
import { readRecentTracking, rememberTrackedParcel } from "@/lib/recent-tracking";

describe("Recent parcel lookups", () => {
  beforeEach(() => localStorage.clear());

  it("remembers an identifier once and moves it to the front", () => {
    rememberTrackedParcel("EP123456789ET");
    rememberTrackedParcel("EP987654321ET");
    rememberTrackedParcel(" ep123456789et ");
    expect(readRecentTracking()).toEqual(["EP123456789ET", "EP987654321ET"]);
  });

  it("does not store invalid tracking inputs", () => {
    rememberTrackedParcel("a person's contact details");
    expect(localStorage.getItem("ethiopost:recent-tracking")).toBeNull();
  });

  it("recovers from malformed stored history", () => {
    localStorage.setItem("ethiopost:recent-tracking", "not json");
    expect(readRecentTracking()).toEqual([]);
  });
});