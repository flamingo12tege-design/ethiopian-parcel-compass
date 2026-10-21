import { describe, expect, it } from "vitest";
import { domesticPostage, isSupportedWeight } from "@/lib/postage";

describe("Ethiopia postage", () => {
  it("charges 565 ETB for Parcel at each confirmed weight", () => {
    for (const weight of [0.5, 1, 1.5])
      expect(domesticPostage("Parcel", "Ethiopia", weight)).toBe(565);
  });
  it("charges 550 ETB for 0.5 kg EMS", () => {
    expect(domesticPostage("EMS", "Ethiopia", 0.5)).toBe(550);
  });
  it("charges 750 ETB for 1 kg EMS", () => {
    expect(domesticPostage("EMS", "Ethiopia", 1)).toBe(750);
  });
  it("charges 845 ETB for 1.5 kg EMS", () => {
    expect(domesticPostage("EMS", "Ethiopia", 1.5)).toBe(845);
  });
  it("never calculates international postage", () => {
    for (const method of ["Parcel", "EMS"] as const) {
      for (const country of ["United States (US)", "China", "Kenya"]) {
        expect(domesticPostage(method, country, 0.5)).toBeNull();
      }
    }
  });
  it("does not extrapolate unconfirmed domestic rates", () => {
    expect(domesticPostage("Parcel", "Ethiopia", 2)).toBeNull();
    expect(domesticPostage("EMS", "Ethiopia", 31.5)).toBeNull();
  });
  it("accepts only half-kilogram steps from 0.5 to 31.5", () => {
    for (let weight = 0.5; weight <= 31.5; weight += 0.5)
      expect(isSupportedWeight(weight)).toBe(true);
    for (const weight of [0, 0.6, 32, NaN]) expect(isSupportedWeight(weight)).toBe(false);
  });
});
