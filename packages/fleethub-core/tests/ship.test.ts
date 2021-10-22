import { Ship } from "..";

it("Ship", () => {
  const ship = Ship.default();
  expect(ship.ship_type).toBe("Unknown");
  expect(ship.ship_class).toBe("Unknown");
  expect(ship.has_attr("Kai2")).toBe(false);
});
