import entitiesSlice, { getInitialState } from "."

describe("entities", () => {
  const { reducer, actions } = entitiesSlice
  it("actiosn", () => {
    const { createFleet } = actions
    const afterCreateFleet = reducer(getInitialState(), createFleet({ ships: Array(1) }))
    expect(afterCreateFleet.fleets.entities[0]).toMatchObject({ ships: [undefined] })
  })
})
