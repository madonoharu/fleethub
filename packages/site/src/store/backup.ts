import { AIR_SQUADRON_KEYS, FLEET_KEYS, GEAR_KEYS, SHIP_KEYS, SLOT_SIZE_KEYS } from "@fh/utils";

import type { RootState } from "./createStore";
import { appSlice } from "./appSlice";
import { STAT_INTERVAL_KEYS } from "./configSlice";
import { schemaKeys } from "./entities/schemata";

type RecordValue = Record<string, unknown>;
type Check = (value: unknown) => boolean;
export type BackupData = Pick<RootState, "app" | "config" | "entities"> & {
  _persist: { version: number; rehydrated: boolean };
};

export class InvalidBackupError extends Error {
  constructor() {
    super("データが適合しません");
    this.name = "InvalidBackupError";
  }
}

function requireValid(condition: unknown): asserts condition {
  if (!condition) throw new InvalidBackupError();
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isNumber: Check = (value) => typeof value === "number" && Number.isFinite(value);
const integer =
  (min: number, max: number): Check =>
  (value) =>
    typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
const u8 = integer(0, 255);
const u16 = integer(0, 65535);
const i16 = integer(-32768, 32767);
const isString: Check = (value) => typeof value === "string";
const isBoolean: Check = (value) => typeof value === "boolean";
const isId = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && !(value in Object.prototype);
const isIdList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isId);
const optional =
  (check: Check): Check =>
  (value) =>
    value == null || check(value);
const oneOf =
  (values: readonly string[]): Check =>
  (value) =>
    typeof value === "string" && values.includes(value);

function fields(record: RecordValue, names: readonly string[], check: Check) {
  requireValid(names.every((key) => check(record[key])));
}

function checkJson(value: unknown) {
  const stack: [unknown, number][] = [[value, 0]];
  while (stack.length) {
    const [item, depth] = stack.pop()!;
    requireValid(depth <= 100);
    if (typeof item === "number") requireValid(Number.isFinite(item));
    else if (item != null && typeof item === "object") {
      for (const [key, child] of Object.entries(item)) {
        requireValid(!(key in Object.prototype));
        stack.push([child, depth + 1]);
      }
    } else requireValid(item == null || typeof item === "string" || typeof item === "boolean");
  }
}

function checkConfig(config: RecordValue) {
  const master = config.masterData;
  if (master == null) return;
  requireValid(isRecord(master));
  const groups = ["ships", "day_cutin", "night_cutin", "anti_air_cutin"];
  requireValid(Object.keys(master).every((key) => groups.includes(key)));
  for (const group of groups) {
    const overrides = master[group];
    if (overrides == null) continue;
    requireValid(isRecord(overrides));
    for (const [id, changes] of Object.entries(overrides)) {
      requireValid(isId(id));
      if (changes == null) continue;
      requireValid(isRecord(changes));
      const arrayKeys: readonly string[] =
        group === "ships" ? [...STAT_INTERVAL_KEYS, "slots"] : [];
      const numberKeys =
        group === "ships"
          ? ["range", "torpedo_accuracy", "basic_evasion_term"]
          : group === "anti_air_cutin"
            ? ["type_factor", "multiplier", "guaranteed", "id"]
            : ["hits", "type_factor", "power_mod", "accuracy_mod"];
      for (const [key, value] of Object.entries(changes)) {
        if (arrayKeys.includes(key)) {
          requireValid(
            value == null ||
              (Array.isArray(value) &&
                value.length <= (key === "slots" ? 5 : 2) &&
                value.every(optional(isNumber))),
          );
        } else if (numberKeys.includes(key)) {
          requireValid(optional(isNumber)(value));
          if (key === "id") requireValid(value == null || value === Number(id));
        } else if (key === "sequential" && group === "anti_air_cutin") {
          requireValid(optional(isBoolean)(value));
        } else if (key === "tag" && (group === "day_cutin" || group === "night_cutin")) {
          requireValid(value == null || value === id);
        } else {
          // Overrides are merged into the Wasm master data. Extra properties
          // must not replace names, IDs, or other uneditable master fields.
          throw new InvalidBackupError();
        }
      }
    }
  }
}

function checkEntity(key: string, entity: RecordValue) {
  const numbers = optional(isNumber);
  const references = optional(isId);
  if (key === "ships" || key === "airSquadrons" || key === "presets")
    fields(entity, GEAR_KEYS, references);
  if (key === "ships" || key === "airSquadrons") fields(entity, SLOT_SIZE_KEYS, optional(u8));
  if (key === "ships") {
    requireValid(u16(entity.ship_id));
    fields(entity, ["level", "current_hp", "ammo", "fuel"], optional(u16));
    fields(entity, ["morale"], optional(u8));
    fields(
      entity,
      STAT_INTERVAL_KEYS.map((stat) => `${stat}_mod`),
      optional(i16),
    );
    fields(entity, ["day_gunfit_accuracy", "night_gunfit_accuracy"], numbers);
    if (entity.custom_power_mods != null) {
      requireValid(isRecord(entity.custom_power_mods));
      for (const modifier of Object.values(entity.custom_power_mods)) {
        requireValid(isRecord(modifier));
        fields(modifier, ["a", "b"], numbers);
      }
    }
  } else if (key === "gears") {
    requireValid(u16(entity.gear_id));
    fields(entity, ["exp", "stars"], optional(u8));
  } else if (key === "fleets") {
    fields(entity, SHIP_KEYS, references);
    fields(entity, ["len"], optional(integer(0, 4294967295)));
  } else if (key === "orgs") {
    fields(entity, [...FLEET_KEYS, ...AIR_SQUADRON_KEYS], references);
    fields(entity, ["hq_level"], optional(u8));
    fields(entity, ["sortie", "route_sup", "boss_sup"], optional(oneOf(FLEET_KEYS)));
    fields(
      entity,
      ["org_type"],
      optional(
        oneOf([
          "Single",
          "CarrierTaskForce",
          "SurfaceTaskForce",
          "TransportEscort",
          "EnemySingle",
          "EnemyCombined",
        ]),
      ),
    );
  } else if (key === "airSquadrons") {
    fields(entity, ["mode"], optional(oneOf(["Sortie", "AirDefense"])));
  } else if (key === "presets") {
    requireValid(isString(entity.name));
  } else if (key === "files") {
    fields(entity, ["name", "description"], isString);
    fields(entity, ["color"], optional(isString));
    if (entity.type === "folder") requireValid(isIdList(entity.children));
    else {
      requireValid(entity.type === "plan" && isId(entity.org) && isIdList(entity.steps));
      fields(entity, ["activeStep"], references);
    }
  } else if (key === "steps") {
    requireValid(isId(entity.org) && isString(entity.name) && isNumber(entity.type));
    fields(entity, ["map"], numbers);
    fields(entity, ["node"], optional(isString));
    requireValid(entity.d == null || (Array.isArray(entity.d) && entity.d.every(isNumber)));
    requireValid(entity.config == null || isRecord(entity.config));
  }
}

function checkFileTree(files: Record<string, RecordValue>, rootIds: string[], tempIds: string[]) {
  const parented = new Set<string>();
  function children(ids: string[], allowMissing = false) {
    for (const id of ids) {
      // sweep removes temporary files but retains tempIds until the next unlink.
      if (allowMissing && !Object.hasOwn(files, id)) continue;
      requireValid(Object.hasOwn(files, id) && !parented.has(id));
      parented.add(id);
    }
  }
  children(rootIds);
  children(tempIds, true);
  for (const file of Object.values(files)) {
    requireValid(file.id !== "root" && file.id !== "temp");
    if (file.type === "folder") children(file.children as string[]);
  }

  // Include orphan folders: they can become visible after moving/restoring files.
  // Use an iterative walk so even a malicious cycle cannot overflow this check.
  const heights = new Map<string, number>();
  for (const id of Object.keys(files)) {
    const path = new Set<string>();
    const stack: [string, boolean][] = [[id, false]];
    while (stack.length) {
      const [current, leaving] = stack.pop()!;
      const file = files[current];
      if (leaving) {
        path.delete(current);
        const height =
          file.type === "folder"
            ? (file.children as string[]).reduce(
                (max, child) => Math.max(max, heights.get(child)!),
                0,
              ) + 1
            : 1;
        requireValid(height <= 100);
        heights.set(current, height);
        continue;
      }
      requireValid(!path.has(current));
      if (heights.has(current)) continue;
      path.add(current);
      // Existing tree rendering, cloning and sweep are recursive.
      requireValid(path.size <= 100);
      stack.push([current, true]);
      if (file.type === "folder") {
        for (const child of file.children as string[]) stack.push([child, false]);
      }
    }
  }
}

/** Validate a complete v1 backup before it can replace any current state. */
export function parseBackupData(value: unknown): BackupData {
  checkJson(value);
  requireValid(isRecord(value));
  const { app, config, entities, _persist } = value;
  requireValid(isRecord(_persist) && _persist.version === 1 && isBoolean(_persist.rehydrated));
  requireValid(isRecord(app) && isRecord(config) && isRecord(entities));
  fields(app, ["fileId", "gkcoiTheme"], optional(isString));
  fields(
    app,
    [
      "configOpen",
      "explorerOpen",
      "damageDensityOpen",
      "damageDensityIncludeNoPenetration",
      "outputToTemp",
    ],
    optional(isBoolean),
  );
  checkConfig(config);

  for (const key of schemaKeys) {
    const table = entities[key];
    requireValid(isRecord(table) && isIdList(table.ids) && isRecord(table.entities));
    const ids = new Set(table.ids);
    requireValid(ids.size === table.ids.length && ids.size === Object.keys(table.entities).length);
    for (const [id, entity] of Object.entries(table.entities)) {
      requireValid(isId(id) && ids.has(id) && isRecord(entity) && entity.id === id);
      checkEntity(key, entity);
    }
  }

  const defaults = appSlice.getInitialState();
  const restoredApp = {
    ...defaults,
    ...app,
    explorerOpen: app.explorerOpen ?? defaults.explorerOpen,
    outputToTemp: app.outputToTemp ?? defaults.outputToTemp,
    gkcoiTheme: app.gkcoiTheme ?? defaults.gkcoiTheme,
  };
  const backup = { app: restoredApp, config, entities, _persist } as unknown as BackupData;
  const { files, orgs, steps } = backup.entities;
  requireValid(isIdList(files.rootIds) && isIdList(files.tempIds));
  for (const file of Object.values(files.entities)) {
    if (file.type === "plan") requireValid(Object.hasOwn(orgs.entities, file.org));
  }
  for (const step of Object.values(steps.entities))
    requireValid(Object.hasOwn(orgs.entities, step.org));
  checkFileTree(files.entities, files.rootIds, files.tempIds);
  // Equipment, ship and step deletion intentionally leave missing references.
  // Keep these valid snapshots intact; their selectors already handle absence.
  // Do not pass extra top-level keys to redux-persist's state reconciler.
  return backup;
}
