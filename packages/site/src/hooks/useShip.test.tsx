import { describe, expect, it, spyOn } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { FhCore, MasterData, Ship } from "fleethub-core";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";

import masterDataFixture from "../../../../tests/e2e/fixtures/master-data.json";
import { appSlice, entitiesSlice, gearsSlice, shipsSlice } from "../store";
import { createStore } from "../store/createStore";

import { FhCoreContext, FhCoreState } from "./useFhCore";
import { useShip } from "./useShip";

function createCoreState(firepower?: number): FhCoreState {
  const fixture: unknown = structuredClone(masterDataFixture);
  const masterData = fixture as MasterData;
  if (firepower !== undefined) masterData.ships[0].firepower = [firepower, firepower];
  const core = new FhCore(masterData);
  return { core, masterData, analyzer: core.create_analyzer(), allShips: [] };
}

function setup() {
  const store = createStore();
  store.dispatch(
    entitiesSlice.actions.createShip({
      id: "ship",
      input: { ship_id: 277, g1: { id: "gear", gear_id: 24 } },
    }),
  );
  store.dispatch(
    entitiesSlice.actions.createShip({
      id: "other-ship",
      input: { ship_id: 599, g1: { id: "other-gear", gear_id: 16 } },
    }),
  );

  let context = createCoreState();
  const createShip = spyOn(context.core, "create_ship");
  let renders = 0;
  const view = renderHook(
    ({ id }: { id: string | undefined }) => {
      renders++;
      return useShip(id);
    },
    {
      initialProps: { id: "ship" as string | undefined },
      wrapper: ({ children }: PropsWithChildren) => (
        <Provider store={store}>
          <FhCoreContext.Provider value={context}>{children}</FhCoreContext.Provider>
        </Provider>
      ),
    },
  );

  return {
    ...view,
    store,
    createShip,
    renderCount: () => renders,
    replaceCore: (next: FhCoreState) => {
      context = next;
      view.rerender({ id: "ship" });
    },
  };
}

describe("useShip with the real Wasm factory", () => {
  it("avoids Wasm construction and rerenders for unrelated UI, ship, and equipment changes", () => {
    const { result, store, createShip, renderCount } = setup();
    const ship = result.current;
    const renders = renderCount();
    expect(ship?.ship_id).toBe(277);
    createShip.mockClear();

    act(() => {
      store.dispatch(appSlice.actions.toggleExplorerOpen());
      store.dispatch(shipsSlice.actions.update({ id: "other-ship", changes: { level: 70 } }));
      store.dispatch(gearsSlice.actions.update({ id: "other-gear", changes: { stars: 5 } }));
    });

    expect(createShip).not.toHaveBeenCalled();
    expect(result.current).toBe(ship);
    expect(renderCount()).toBe(renders);
  });

  it("recalculates changed nested equipment and removes missing references", () => {
    const { result, store } = setup();
    const original = result.current;

    act(() => {
      store.dispatch(gearsSlice.actions.update({ id: "gear", changes: { stars: 7 } }));
    });
    const upgraded = result.current;
    expect(upgraded).not.toBe(original);
    expect(upgraded?.state().g1?.stars).toBe(7);
    expect(original?.state().g1?.stars).toBeUndefined();

    act(() => {
      store.dispatch(gearsSlice.actions.remove("gear"));
    });
    expect(result.current).not.toBe(upgraded);
    expect(result.current?.state().g1).toBeUndefined();
    expect(upgraded?.state().g1?.gear_id).toBe(24);
  });

  it("retains the previous wrapper and suppresses rerenders for equivalent ship state", () => {
    const { result, store, createShip, renderCount } = setup();
    const ship = result.current;
    const renders = renderCount();
    createShip.mockClear();

    act(() => {
      store.dispatch(
        shipsSlice.actions.update({
          id: "ship",
          changes: { ...store.getState().present.entities.ships.entities.ship },
        }),
      );
    });

    expect(createShip).toHaveBeenCalled();
    expect(createShip.mock.results[0]?.value).toHaveProperty("hash", ship?.hash);
    expect(result.current).toBe(ship);
    expect(renderCount()).toBe(renders);
  });

  it("changes ships by ID and constructs nothing for removed or absent ships", () => {
    const { result, rerender, store, createShip } = setup();
    rerender({ id: "other-ship" });
    expect(result.current?.ship_id).toBe(599);
    createShip.mockClear();

    act(() => {
      store.dispatch(shipsSlice.actions.remove("other-ship"));
    });
    expect(result.current).toBeUndefined();
    rerender({ id: "unknown" });
    expect(result.current).toBeUndefined();
    rerender({ id: undefined });
    expect(result.current).toBeUndefined();
    expect(createShip).not.toHaveBeenCalled();
  });

  it("uses a replacement core's real calculations even when the wrappers have equal hashes", () => {
    const { result, replaceCore } = setup();
    const original = result.current;
    if (!original) throw new Error("The fixture must create the initial ship");
    const replacement = createCoreState(200);
    const createShip = replacement.core.create_ship.bind(replacement.core);
    let replacementShip: Ship | undefined;
    const replacementFactory = spyOn(replacement.core, "create_ship").mockImplementation(
      (state) => {
        replacementShip = createShip(state);
        if (replacementShip) {
          // Simulate coincident cache metadata while keeping the real Wasm calculations.
          Object.defineProperty(replacementShip, "hash", {
            value: original.hash,
          });
        }
        return replacementShip;
      },
    );

    replaceCore(replacement);

    expect(replacementFactory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(replacementShip);
    expect(result.current).not.toBe(original);
    expect(result.current?.hash).toBe(original.hash);
    expect(result.current?.naked_firepower).toBe(200);
    expect(original.naked_firepower).not.toBe(200);
  });
});
