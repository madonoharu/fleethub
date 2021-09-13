import { Gear } from "../node/fh_core";

it("Gear", () => {
  const gear = Gear.default();
  expect(gear.gear_type).toBe("Unknown");
});
