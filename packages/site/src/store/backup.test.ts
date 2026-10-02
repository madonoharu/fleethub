import { describe, expect, it } from "bun:test";
import { persistStore, REHYDRATE } from "redux-persist";
import { ActionCreators } from "redux-undo";

import { BackupData, InvalidBackupError, parseBackupData } from "./backup";
import { createStore, persistConfig } from "./createStore";
import { entitiesSlice } from "./entities/entitiesSlice";
import { filesSlice } from "./entities/filesSlice";
import { gearsSlice } from "./entities/gearsSlice";
import { schemaKeys } from "./entities/schemata";
import { selectOrgState } from "./entities/selectors";
import { shipsSlice } from "./entities/shipsSlice";
import { stepsSlice } from "./entities/stepsSlice";

function createBackup(): BackupData {
  const store = createStore();
  store.dispatch(filesSlice.actions.createFolder());
  const folder = store.getState().present.entities.files.rootIds[0];
  store.dispatch(
    entitiesSlice.actions.createPlan(
      {
        id: "plan",
        name: "Saved fleet",
        description: "旧バックアップ",
        org: {
          id: "org",
          hq_level: 120,
          f1: {
            id: "fleet",
            s1: {
              id: "ship",
              ship_id: 277,
              level: 99,
              g1: { id: "gear", gear_id: 24, stars: 10 },
            },
          },
          a1: { id: "air", mode: "Sortie" },
        },
        steps: [{ id: "step", type: 4, d: undefined, name: "Boss", org: { id: "enemy-org" } }],
      },
      folder,
    ),
  );
  store.dispatch(
    entitiesSlice.actions.createPreset({ position: { tag: "ships", id: "ship" }, name: "Preset" }),
  );
  const { app, entities } = store.getState().present;
  const config = {
    masterData: {
      ships: { 277: { firepower: [null, 80], slots: [null, null, 32], range: null } },
      day_cutin: { DoubleAttack: { power_mod: null, accuracy_mod: 0 } },
      night_cutin: { DoubleAttack: { power_mod: null } },
      anti_air_cutin: { 1: { guaranteed: 0, sequential: false } },
    },
  };
  return JSON.parse(
    JSON.stringify({ app, config, entities, _persist: { version: 1, rehydrated: true } }),
  ) as BackupData;
}

function replace(value: unknown, path: string[], next: unknown) {
  let parent = value as Record<string, unknown>;
  for (const key of path.slice(0, -1)) parent = parent[key] as Record<string, unknown>;
  parent[path.at(-1)!] = next;
}

describe("backup validation", () => {
  it("accepts full v1 JSON backups and retains null overrides and nested entities", () => {
    const backup = createBackup();
    const result = parseBackupData(backup);
    expect(result).toEqual(backup);
    expect(result.entities.presets.ids).toHaveLength(1);
    expect<unknown>(result.config.masterData?.ships?.[277]).toEqual({
      firepower: [null, 80],
      slots: [null, null, 32],
      range: null,
    });
    expect(
      parseBackupData({
        ...backup,
        app: { explorerOpen: false, outputToTemp: false, gkcoiTheme: "dark" },
      }),
    ).toBeDefined();
  });

  it("allows a legitimately empty library and config", () => {
    const { app, config, entities } = createStore().getState().present;
    expect(
      parseBackupData({ app, config, entities, _persist: { version: 1, rehydrated: true } }),
    ).toBeDefined();
  });

  it("fills missing preferences from older v1 backups with current defaults", () => {
    const restored = parseBackupData({ ...createBackup(), app: {} });
    expect(restored.app).toEqual({ explorerOpen: true, outputToTemp: false, gkcoiTheme: "dark" });
  });

  for (const key of ["app", "config", "entities", "_persist"]) {
    for (const invalid of [undefined, null, [], "invalid"]) {
      it(`rejects invalid persisted slice ${key}: ${String(invalid)}`, () => {
        const backup = createBackup();
        replace(backup, [key], invalid);
        expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
      });
    }
  }

  for (const key of schemaKeys) {
    it(`validates the ${key} table, IDs and records before restoring`, () => {
      for (const path of [[], ["ids"], ["entities"]]) {
        const backup = createBackup();
        replace(backup, ["entities", key, ...path], null);
        expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
      }
      const backup = createBackup();
      backup.entities[key].ids.push("missing-entity");
      expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
    });
  }

  const malformed: [string, string[], unknown][] = [
    ["version", ["_persist", "version"], 2],
    ["persist status", ["_persist", "rehydrated"], "yes"],
    ["entity ID", ["entities", "ships", "entities", "ship", "id"], "another-id"],
    ["null entity", ["entities", "ships", "entities", "ship"], null],
    ["duplicate ID", ["entities", "ships", "ids"], ["ship", "ship"]],
    ["ship reference", ["entities", "fleets", "entities", "fleet", "s1"], {}],
    ["ship data", ["entities", "ships", "entities", "ship", "ship_id"], "277"],
    ["nonfinite number", ["entities", "ships", "entities", "ship", "level"], Infinity],
    ["missing org", ["entities", "files", "entities", "plan", "org"], "missing"],
    ["invalid steps", ["entities", "files", "entities", "plan", "steps"], {}],
    ["missing root", ["entities", "files", "rootIds"], ["missing"]],
    ["invalid root list", ["entities", "files", "rootIds"], {}],
    ["invalid temp list", ["entities", "files", "tempIds"], {}],
    ["invalid config", ["config", "masterData", "ships", "277", "firepower"], {}],
    ["unsafe override", ["config", "masterData", "ships", "277", "name"], {}],
    ["invalid boolean", ["app", "explorerOpen"], {}],
  ];
  for (const [name, path, value] of malformed) {
    it(`rejects ${name}`, () => {
      const backup = createBackup();
      replace(backup, path, value);
      expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
    });
  }

  it("does not pass unexpected root slices into redux-persist", () => {
    expect(
      parseBackupData({ ...createBackup(), shipSelect: null, malicious: {} }),
    ).not.toHaveProperty("shipSelect");
  });

  it("accepts missing ship, gear and step references left by normal delete operations", () => {
    const store = createStore();
    store.dispatch({ type: REHYDRATE, key: persistConfig.key, payload: createBackup() });
    store.dispatch(shipsSlice.actions.remove("ship"));
    store.dispatch(gearsSlice.actions.remove("gear"));
    store.dispatch(stepsSlice.actions.remove("step"));
    const state = store.getState().present;
    expect(parseBackupData({ ...state, _persist: { version: 1, rehydrated: true } })).toBeDefined();
    const backup = JSON.parse(
      JSON.stringify({ ...state, _persist: { version: 1, rehydrated: true } }),
    ) as BackupData;
    backup.entities.files.tempIds.push("swept-temp-file");
    backup.app.fileId = "swept-temp-file";
    expect(parseBackupData(backup)).toBeDefined();
  });

  it("rejects missing children, multiple parents, and cycles even in orphan folders", () => {
    for (const children of [["missing"], ["plan", "plan"]]) {
      const backup = createBackup();
      const id = backup.entities.files.rootIds[0];
      replace(backup, ["entities", "files", "entities", id, "children"], children);
      expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
    }
    const duplicated = createBackup();
    duplicated.entities.files.tempIds.push("plan");
    expect(() => parseBackupData(duplicated)).toThrow(InvalidBackupError);

    const cyclic = createBackup();
    const id = cyclic.entities.files.rootIds[0];
    cyclic.entities.files.rootIds = [];
    replace(cyclic, ["entities", "files", "entities", id, "children"], [id]);
    expect(() => parseBackupData(cyclic)).toThrow(InvalidBackupError);
  });

  it("rejects unsafe and reserved file IDs", () => {
    for (const id of ["__proto__", "constructor", "toString", "root", "temp"]) {
      const backup = createBackup();
      const files = backup.entities.files;
      files.ids.push(id);
      Object.defineProperty(files.entities, id, {
        value: { id, type: "folder", name: "Bad", description: "", children: [] },
        enumerable: true,
      });
      files.rootIds.push(id);
      expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
    }
  });

  it("bounds tree depth even when entities are stored children first", () => {
    const backup = createBackup();
    for (let depth = 0; depth < 120; depth++) {
      const id = `folder-${depth}`;
      backup.entities.files.ids.push(id);
      backup.entities.files.entities[id] = {
        id,
        type: "folder",
        name: "Folder",
        description: "",
        children: depth ? [`folder-${depth - 1}`] : [],
      };
    }
    backup.entities.files.rootIds.push("folder-119");
    expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
  });

  it("rejects deeply nested unknown properties before Immer can freeze them", () => {
    let nested: unknown = {};
    for (let i = 0; i < 200; i++) nested = { nested };
    expect(() => parseBackupData({ ...createBackup(), unknown: nested })).toThrow(
      InvalidBackupError,
    );
  });

  it("validates Wasm integer boundaries and cutin identity", () => {
    for (const value of [-1, 0.5, 65536]) {
      const backup = createBackup();
      backup.entities.gears.entities.gear.gear_id = value;
      expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
    }
    for (const [key, value] of [
      ["level", 65536],
      ["morale", 256],
      ["max_hp_mod", -32769],
    ] as const) {
      const backup = createBackup();
      backup.entities.ships.entities.ship[key] = value;
      expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
    }
    const backup = createBackup();
    replace(backup, ["config", "masterData", "anti_air_cutin", "1", "id"], 2);
    expect(() => parseBackupData(backup)).toThrow(InvalidBackupError);
  });

  it("retains optional nulls and negative stat modifiers supported by Wasm", () => {
    const backup = createBackup();
    replace(backup, ["entities", "ships", "entities", "ship", "level"], null);
    replace(backup, ["entities", "gears", "entities", "gear", "stars"], null);
    backup.entities.ships.entities.ship.max_hp_mod = -10;
    expect(parseBackupData(backup)).toEqual(backup);
  });
});

it("invalid restores leave current and persisted data intact; valid v1 data restores and supports undo", async () => {
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
  let resolveReady!: () => void;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });
  const persistor = persistStore(store, undefined, resolveReady);
  try {
    await ready;
    store.dispatch(entitiesSlice.actions.createPlan({ id: "existing", name: "Keep me" }));
    await persistor.flush();
    const previous = structuredClone(stored);
    for (const invalid of [{ _persist: {} }, { ...createBackup(), entities: {} }]) {
      const current = store.getState();
      expect(() => {
        const payload = parseBackupData(invalid);
        store.dispatch({ type: REHYDRATE, key: persistConfig.key, payload });
      }).toThrow(InvalidBackupError);
      expect(store.getState()).toBe(current);
      await persistor.flush();
      expect(stored).toEqual(previous);
    }
    const valid = createBackup();
    store.dispatch({ type: REHYDRATE, key: persistConfig.key, payload: parseBackupData(valid) });
    await persistor.flush();
    expect(stored).toEqual(valid);
    expect(selectOrgState(store.getState().present, "org")?.f1?.s1).toMatchObject({
      ship_id: 277,
      level: 99,
      g1: { gear_id: 24, stars: 10 },
    });
    store.dispatch(ActionCreators.undo());
    await persistor.flush();
    expect(store.getState().present.entities.files.ids).toEqual(["existing"]);
    expect(stored).toEqual(previous);
  } finally {
    persistor.pause();
    persistConfig.storage = originalStorage;
  }
});
