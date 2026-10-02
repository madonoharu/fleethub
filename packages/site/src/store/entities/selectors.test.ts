import { describe, expect, it } from "bun:test";

import { createStore } from "../createStore";

import { entitiesSlice } from "./entitiesSlice";
import { gearsSlice } from "./gearsSlice";
import { selectOrgState, selectPreset, selectShipState } from "./selectors";
import { shipsSlice } from "./shipsSlice";

function setup() {
  const store = createStore();
  store.dispatch(
    entitiesSlice.actions.createPlan({
      id: "plan",
      org: {
        id: "org",
        f1: {
          id: "fleet",
          s1: {
            id: "ship",
            ship_id: 277,
            g1: { id: "gear", gear_id: 24 },
          },
        },
      },
    }),
  );
  store.dispatch(
    entitiesSlice.actions.createShip({
      id: "other-ship",
      input: {
        id: "other-ship",
        ship_id: 599,
        g1: { id: "other-gear", gear_id: 16 },
      },
    }),
  );
  return store;
}

describe("denormalized entity dependencies", () => {
  it("retains ship and org identity when unrelated ships or equipment change", () => {
    const store = setup();
    const before = store.getState().present;
    const ship = selectShipState(before, "ship");
    const org = selectOrgState(before, "org");
    const otherShip = selectShipState(before, "other-ship");

    store.dispatch(shipsSlice.actions.update({ id: "other-ship", changes: { level: 70 } }));
    store.dispatch(gearsSlice.actions.update({ id: "other-gear", changes: { stars: 5 } }));
    const after = store.getState().present;

    expect(selectShipState(after, "ship")).toBe(ship);
    expect(selectOrgState(after, "org")).toBe(org);
    expect(selectShipState(after, "other-ship")).not.toBe(otherShip);
    expect(selectShipState(after, "other-ship")).toMatchObject({
      level: 70,
      g1: { stars: 5 },
    });
  });

  it("invalidates nested equipment and changed links while preserving previous states", () => {
    const store = setup();
    const original = selectOrgState(store.getState().present, "org");
    store.dispatch(gearsSlice.actions.update({ id: "gear", changes: { stars: 7 } }));
    const updated = selectOrgState(store.getState().present, "org");

    expect(updated).not.toBe(original);
    expect(updated?.f1?.s1?.g1).toMatchObject({ gear_id: 24, stars: 7 });
    expect(original?.f1?.s1?.g1?.stars).toBeUndefined();

    store.dispatch(shipsSlice.actions.update({ id: "ship", changes: { g1: "other-gear" } }));
    const relinked = selectOrgState(store.getState().present, "org");
    expect(relinked?.f1?.s1?.g1).toMatchObject({ gear_id: 16 });
    expect(relinked).not.toBe(updated);

    store.dispatch(gearsSlice.actions.remove("gear"));
    expect(selectOrgState(store.getState().present, "org")).toBe(relinked);
  });

  it("tracks missing equipment that is later added and removed", () => {
    const store = setup();
    store.dispatch(gearsSlice.actions.remove("gear"));
    const missing = selectShipState(store.getState().present, "ship");
    expect(missing?.g1).toBeUndefined();

    store.dispatch(
      entitiesSlice.actions.createGear({
        input: { id: "gear", gear_id: 21 },
        position: { tag: "ships", id: "ship", key: "g1" },
      }),
    );
    const restored = selectShipState(store.getState().present, "ship");
    expect(restored).not.toBe(missing);
    expect(restored?.g1).toMatchObject({ gear_id: 21 });
    expect(missing?.g1).toBeUndefined();

    store.dispatch(gearsSlice.actions.remove("gear"));
    const removed = selectShipState(store.getState().present, "ship");
    expect(removed).not.toBe(restored);
    expect(removed?.g1).toBeUndefined();
  });

  it("keeps presets cached across unrelated changes and refreshes their own equipment", () => {
    const store = setup();
    store.dispatch(
      entitiesSlice.actions.createPreset({
        position: { tag: "ships", id: "ship" },
        name: "Preset",
      }),
    );
    const root = store.getState().present;
    const presetId = root.entities.presets.ids[0];
    if (typeof presetId !== "string") {
      throw new Error("Preset setup must generate a string ID");
    }
    const gearId = root.entities.presets.entities[presetId].g1;
    if (!gearId) throw new Error("Preset setup must contain equipment");
    const original = selectPreset(root, presetId);

    store.dispatch(gearsSlice.actions.update({ id: "other-gear", changes: { stars: 3 } }));
    expect(selectPreset(store.getState().present, presetId)).toBe(original);

    store.dispatch(gearsSlice.actions.update({ id: gearId, changes: { stars: 9 } }));
    const updated = selectPreset(store.getState().present, presetId);
    expect(updated).not.toBe(original);
    expect(updated?.g1).toMatchObject({ gear_id: 24, stars: 9 });
    expect(original?.g1?.stars).toBeUndefined();
  });
});
