import { normalizeShip, denormalizeShip } from "./schemas"

let count = 1
jest.mock("@reduxjs/toolkit", () => ({
  nanoid: () => `id${count++}`,
}))

describe("schemas", () => {
  it("c", () => {
    const shipState = { shipId: 5, gears: [undefined, { gearId: 6 }] }
    const shipEntity = { id: "id2", shipId: 5, gears: [undefined, "id1"] }

    const normalized = normalizeShip(shipState)

    console.log(normalized)

    expect(normalized).toMatchObject({
      gears: {
        id1: { id: "id1", gearId: 6 },
      },
      ships: {
        id2: shipEntity,
      },
    })

    expect(denormalizeShip(shipEntity, normalized.entities)).toMatchObject(shipState)
  })
})
