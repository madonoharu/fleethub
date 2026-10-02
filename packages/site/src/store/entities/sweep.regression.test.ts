import { describe, expect, it } from "bun:test";

import { entitiesSlice } from "./entitiesSlice";

describe("entity sweep", () => {
  it("keeps rooted entities and preset equipment, including gear referenced by both", () => {
    let state = entitiesSlice.reducer(
      undefined,
      entitiesSlice.actions.createPlan({
        id: "root-plan",
        org: {
          id: "root-org",
          f1: {
            id: "root-fleet",
            s1: {
              id: "root-ship",
              ship_id: 277,
              g1: { id: "shared-gear", gear_id: 24 },
              g2: { id: "root-gear", gear_id: 16 },
            },
          },
        },
      }),
    );
    state = entitiesSlice.reducer(
      state,
      entitiesSlice.actions.createPlan({
        id: "orphan-plan",
        org: {
          id: "orphan-org",
          f1: {
            id: "orphan-fleet",
            s1: {
              id: "orphan-ship",
              ship_id: 599,
              g1: { id: "orphan-gear", gear_id: 21 },
            },
          },
        },
      }),
    );
    state = {
      ...state,
      files: { ...state.files, rootIds: ["root-plan"] },
      gears: {
        ...state.gears,
        ids: [...state.gears.ids, "preset-gear"],
        entities: {
          ...state.gears.entities,
          "preset-gear": { id: "preset-gear", gear_id: 21 },
        },
      },
      presets: {
        ids: ["preset"],
        entities: {
          preset: {
            id: "preset",
            name: "Equipment preset",
            g1: "shared-gear",
            g2: "preset-gear",
          },
        },
      },
    };

    const result = entitiesSlice.reducer(state, entitiesSlice.actions.sweep());

    expect(result.files.ids).toEqual(["root-plan"]);
    expect(result.orgs.ids).toEqual(["root-org"]);
    expect(result.fleets.ids).toEqual(["root-fleet"]);
    expect(result.ships.ids).toEqual(["root-ship"]);
    expect(result.gears.ids).toEqual(["shared-gear", "root-gear", "preset-gear"]);
    expect(result.presets).toEqual(state.presets);
    expect(result.gears.entities["shared-gear"]).toEqual({
      id: "shared-gear",
      gear_id: 24,
    });
    expect(state.files.ids).toContain("orphan-plan");
    expect(state.gears.ids).toContain("orphan-gear");
    expect(entitiesSlice.reducer(result, entitiesSlice.actions.sweep())).toEqual(result);
  });
});
