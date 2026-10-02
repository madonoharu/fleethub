import { describe, expect, it } from "bun:test";
import { persistStore, REHYDRATE } from "redux-persist";
import { ActionCreators } from "redux-undo";

import { parseBackupData } from "../backup";
import { createStore, persistConfig, type RootState } from "../createStore";
import { entitiesSlice, type ImportPayload } from "./entitiesSlice";
import { filesSlice } from "./filesSlice";
import legacyFixture from "./fixtures/legacy-cloned-plan.json";
import { reconcileLegacyActiveSteps } from "./reconcileLegacyActiveSteps";
import { schemaKeys, type PlanEntity } from "./schemata";
import { selectActiveStep, selectOrgState } from "./selectors";
import { stepsSlice } from "./stepsSlice";

// Generated with the previous cloneAffectedEntities implementation: node B's
// active copy has edited formation/HP, independently from its listed copy.
const legacy = legacyFixture as unknown as ImportPayload;
const fileId = legacy.result;
const activeId = "legacy-8";

function legacyRoot(): RootState {
  const root = structuredClone(createStore().getState().present);
  for (const key of schemaKeys) {
    const dict = structuredClone(legacy.entities[key] ?? {});
    Object.assign(root.entities[key], { ids: Object.keys(dict), entities: dict });
  }
  root.entities.files.rootIds = [fileId];
  root.app.fileId = fileId;
  return root;
}

function plan(root: RootState, id = fileId): PlanEntity {
  const file = root.entities.files.entities[id];
  if (file.type !== "plan") throw new Error("Expected plan");
  return file;
}

function expectEditedSelection(root: RootState, id = fileId) {
  const file = plan(root, id);
  expect(file.steps).toContain(file.activeStep!);
  const selected = selectActiveStep(root, file);
  expect(selected).toMatchObject({ node: "B", config: { right: { formation: "LineAbreast" } } });
  expect(selectOrgState(root, selected!.org)?.f1?.s1?.current_hp).toBe(12);
}

describe("legacy active-node reconciliation", () => {
  it("reattaches the edited copy without mutating source data or unrelated entities", () => {
    const root = legacyRoot();
    const before = structuredClone(root.entities);
    const entities = reconcileLegacyActiveSteps(root.entities);
    expectEditedSelection({ ...root, entities });
    expect(entities.files.entities[fileId]).toMatchObject({ steps: ["legacy-2", activeId] });
    expect(root.entities).toEqual(before);
    expect(entities.steps).toBe(root.entities.steps);
    expect(entities.orgs).toBe(root.entities.orgs);
    expect(entities.steps.entities["legacy-4"]).toBe(root.entities.steps.entities["legacy-4"]);
    expect(reconcileLegacyActiveSteps(entities)).toBe(entities);
  });

  it("keeps all repeated map nodes when the old selected occurrence is ambiguous", () => {
    const root = legacyRoot();
    root.entities.steps.entities.repeated = {
      ...root.entities.steps.entities["legacy-4"],
      id: "repeated",
    };
    root.entities.steps.ids.push("repeated");
    plan(root).steps.push("repeated");
    const entities = reconcileLegacyActiveSteps(root.entities);
    expect(entities.files.entities[fileId]).toMatchObject({
      steps: ["legacy-2", "legacy-4", "repeated", activeId],
    });
    expectEditedSelection({ ...root, entities });
    expect(reconcileLegacyActiveSteps(entities)).toBe(entities);
  });

  it.each([
    "foreign-member",
    "foreign-active",
    "empty",
    "missing-active",
    "unmatched",
    "deleted-match",
  ])("leaves %s references alone instead of reviving or borrowing a node", (scenario) => {
    const root = legacyRoot();
    const file = plan(root);
    if (scenario.startsWith("foreign")) {
      root.entities.files.entities.foreign = {
        ...file,
        id: "foreign",
        steps: scenario === "foreign-member" ? [activeId] : [],
        activeStep: scenario === "foreign-active" ? activeId : undefined,
      };
    } else if (scenario === "empty") file.steps = [];
    else if (scenario === "missing-active") delete root.entities.steps.entities[activeId];
    else if (scenario === "unmatched") root.entities.steps.entities[activeId].node = "Other";
    else delete root.entities.steps.entities["legacy-4"];
    expect(reconcileLegacyActiveSteps(root.entities)).toBe(root.entities);
    expect(selectActiveStep(root, file)?.id).not.toBe(activeId);
  });

  it("normalizes imported public files and preserves import undo/redo", () => {
    const store = createStore();
    store.dispatch(entitiesSlice.actions.createPlan({ id: "existing" }));
    const before = store.getState().present.entities;
    const payload = { ...structuredClone(legacy), to: "root" };
    store.dispatch(entitiesSlice.actions.import(payload));
    expectEditedSelection(store.getState().present);
    expect(payload.entities.files?.[fileId]).toMatchObject({ steps: ["legacy-2", "legacy-4"] });
    store.dispatch(ActionCreators.undo());
    expect(store.getState().present.entities).toEqual(before);
    store.dispatch(ActionCreators.redo());
    expectEditedSelection(store.getState().present);
  });

  it("repairs a legacy source before making an independent file copy", () => {
    const root = legacyRoot();
    const entities = entitiesSlice.reducer(root.entities, entitiesSlice.actions.cloneFile(fileId));
    const copiedId = entities.files.rootIds[1];
    const next = { ...root, entities };
    expectEditedSelection(next);
    expectEditedSelection(next, copiedId);
    const copiedActive = plan(next, copiedId).activeStep!;
    expect(copiedActive).not.toBe(activeId);
    const changed = entitiesSlice.reducer(
      entities,
      stepsSlice.actions.update({
        id: copiedActive,
        changes: { config: { right: { formation: "LineAhead" } } },
      }),
    );
    expectEditedSelection({ ...root, entities: changed });
  });

  it("does not bring repaired nodes back after individual or bulk deletion", () => {
    const store = createStore();
    store.dispatch(entitiesSlice.actions.import(structuredClone(legacy)));
    store.dispatch(stepsSlice.actions.remove(activeId));
    expect(selectActiveStep(store.getState().present, plan(store.getState().present))?.id).toBe(
      "legacy-2",
    );
    store.dispatch(ActionCreators.undo());
    expectEditedSelection(store.getState().present);
    store.dispatch(filesSlice.actions.removeSteps(fileId));
    const root = store.getState().present;
    expect(reconcileLegacyActiveSteps(root.entities)).toBe(root.entities);
    expect(selectActiveStep(root, plan(root))).toBeUndefined();
  });

  it("repairs restored backups before display and persistence, while restore remains undoable", async () => {
    let stored: unknown = null;
    const originalStorage = persistConfig.storage;
    persistConfig.storage = {
      getItem: async () => null,
      setItem: async (_key, value: unknown) => {
        stored = structuredClone(value);
        return value;
      },
      removeItem: async () => {
        stored = null;
      },
    };
    const store = createStore();
    let ready!: () => void;
    const loaded = new Promise<void>((resolve) => {
      ready = resolve;
    });
    const persistor = persistStore(store, undefined, ready);
    try {
      await loaded;
      store.dispatch(entitiesSlice.actions.createPlan({ id: "existing" }));
      await persistor.flush();
      const before = structuredClone(stored);
      const legacyState = legacyRoot();
      const payload = parseBackupData({
        ...legacyState,
        _persist: { version: 1, rehydrated: true },
      });
      store.dispatch({ type: REHYDRATE, key: persistConfig.key, payload });
      expectEditedSelection(store.getState().present);
      await persistor.flush();
      const saved = parseBackupData(stored);
      expect(saved.entities.files.entities[fileId]).toMatchObject({
        steps: ["legacy-2", activeId],
        activeStep: activeId,
      });
      expect(payload.entities.files.entities[fileId]).toMatchObject({
        steps: ["legacy-2", "legacy-4"],
      });
      store.dispatch(ActionCreators.undo());
      await persistor.flush();
      expect(stored).toEqual(before);
      store.dispatch(ActionCreators.redo());
      expectEditedSelection(store.getState().present);
    } finally {
      persistor.pause();
      persistConfig.storage = originalStorage;
    }
  });
});
