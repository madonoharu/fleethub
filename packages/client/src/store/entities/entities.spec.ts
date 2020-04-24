import entitiesSlice, { getInitialState } from "."
import { PayloadAction } from "@reduxjs/toolkit"
import { NormalizedFleet } from "./fleets"

describe("entities", () => {
  const { reducer, actions } = entitiesSlice
  it("", () => {
    expect(entitiesSlice.actions.createFleet({ main: [] })).toMatchObject<PayloadAction<NormalizedFleet>>({
      type: "entities/createFleet",
      payload: { fleet: { uid: "0", name: "", main: [], escort: [] }, gears: [], ships: [] },
    })
  })

  it("actiosn", () => {
    const { createFleet } = actions
    const afterCreateFleet = reducer(getInitialState(), createFleet({ main: [] }))
    expect(afterCreateFleet.fleets.entities[0]).toEqual({ uid: "0", main: [], escort: [] })
  })
})
