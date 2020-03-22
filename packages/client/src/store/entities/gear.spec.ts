import { gearToEntity, GearEntity } from "./gear"

it("gearToEntity", () => {
  expect(gearToEntity({ gearId: 2 })).toMatchObject<Partial<GearEntity>>({ gearId: 2, stars: 0, exp: 0 })
})
