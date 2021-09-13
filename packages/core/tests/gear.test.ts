import { Gear } from "../node/index";

it("Gear", () => {
  const gear = Gear.default();
  expect(gear.gear_type).toBe("Unknown");
});
