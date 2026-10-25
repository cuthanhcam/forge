import { describe, expect, it } from "vitest";
import { rangePosition, rangeValue, snapRangeValue } from "./range-scale";

describe("range scales", () => {
  it("anchors the JWT midpoint and preserves every selectable bit length", () => {
    const scale = { min: 32, max: 512, step: 8, midpoint: 256 };
    expect(rangeValue(0, scale)).toBe(32);
    expect(rangeValue(0.5, scale)).toBe(256);
    expect(rangeValue(1, scale)).toBe(512);
    expect(rangeValue(0.75, scale)).toBe(384);
    for (let value = 32; value <= 512; value += 8)
      expect(rangeValue(rangePosition(value, scale), scale)).toBe(value);
    expect(rangePosition(128, scale)).toBeCloseTo(3 / 14);
  });
  it("keeps ordinary controls linear and clamps/steps their logical values", () => {
    for (const scale of [
      { min: 8, max: 128, step: 1 },
      { min: 3, max: 12, step: 1 },
      { min: 1, max: 100, step: 1 },
      { min: 16, max: 160, step: 1 },
    ]) {
      expect(rangeValue(0.5, scale)).toBe(
        snapRangeValue((scale.min + scale.max) / 2, scale),
      );
      for (let value = scale.min; value <= scale.max; value += scale.step)
        expect(rangeValue(rangePosition(value, scale), scale)).toBe(value);
      expect(rangeValue(-1, scale)).toBe(scale.min);
      expect(rangeValue(2, scale)).toBe(scale.max);
    }
  });
});
