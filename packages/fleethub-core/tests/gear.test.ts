import { Gear } from "..";

it("Gear", () => {
  const gear = Gear.default();
  expect(gear.gear_type).toBe("Unknown");
});
