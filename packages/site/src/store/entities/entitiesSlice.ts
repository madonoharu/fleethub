import { GearKey, GEAR_KEYS, MapNode, pick, ShipKey } from "@fh/utils";
import {
  createSlice,
  PayloadAction,
  combineReducers,
  EntityStateAdapter,
  nanoid,
} from "@reduxjs/toolkit";
import { Formation, GearState, OrgState, ShipState } from "fleethub-core";
import xor from "lodash/xor";
import { Entities, nonNullable, normalize } from "ts-norm";

import { airSquadronsSlice } from "./airSquadronsSlice";
import { ENTITIES_SLICE_NAME, ormAdapters } from "./base";
import { filesSlice, insert, isFolder, isPlan } from "./filesSlice";
import { fleetsSlice } from "./fleetsSlice";
import { gearsSlice } from "./gearsSlice";
import { orgsSlice } from "./orgsSlice";
import { presetsSlice } from "./presetsSlice";
import { cloneAffectedEntities, getAffectedEntities } from "./rtk-ts-norm";
import {
  Plan,
  PresetEntity,
  schemaKeys,
  schemata,
  Step,
  FileEntity,
} from "./schemata";
import { shipsSlice } from "./shipsSlice";
import { stepsSlice } from "./stepsSlice";

const initialState = {
  ships: shipsSlice.getInitialState(),
  gears: gearsSlice.getInitialState(),
  fleets: fleetsSlice.getInitialState(),
  airSquadrons: airSquadronsSlice.getInitialState(),
  orgs: orgsSlice.getInitialState(),
  steps: stepsSlice.getInitialState(),
  presets: presetsSlice.getInitialState(),
  files: filesSlice.getInitialState(),
};

const combinedReducer = combineReducers({
  ships: shipsSlice.reducer,
  gears: gearsSlice.reducer,
  fleets: fleetsSlice.reducer,
  airSquadrons: airSquadronsSlice.reducer,
  orgs: orgsSlice.reducer,
  steps: stepsSlice.reducer,
  presets: presetsSlice.reducer,
  files: filesSlice.reducer,
});

type State = typeof initialState;

type CreateGearPayload = {
  input: GearState;
  position: GearPosition;
};

export type GearPosition =
  | { tag: "ships"; id: string; key: GearKey }
  | { tag: "airSquadrons"; id: string; key: GearKey }
  | { tag: "presets"; id: string; key: GearKey };

export type ShipPosition =
  | { tag: "fleets"; id: string; key: ShipKey }
  | { tag: "shipDetails" };

export type SwapPayload<T> = {
  drag: T;
  drop: T;
};

export type SwapGearPayload = SwapPayload<{
  id?: string;
  position: GearPosition;
}>;

export type SwapShipPayload = SwapPayload<{
  id?: string;
  position: ShipPosition;
}>;

type CreateShipPayload = {
  input: ShipState;
  position?: ShipPosition;
  id?: string;
  reselect?: boolean;
};

type AddPlanEnemyPayload = {
  file: string;
  name: string;
  point: string;
  d: MapNode["d"];
  type: MapNode["type"];
  org: OrgState;
  formation: Formation;
};

export type ImportPayload = {
  result: string;
  entities: Entities;
  to?: string;
};

const setGearPosition = (
  state: State,
  position: GearPosition,
  id: string | undefined
): void => {
  const { tag, key, id: pid } = position;
  const entity = state[tag].entities[pid];
  if (entity) {
    entity[key] = id;
  }
};

const setShipPosition = (
  state: State,
  position: ShipPosition,
  id: string | undefined
): void => {
  if (position.tag === "shipDetails") {
    return;
  }

  const { tag, key, id: pid } = position;
  const entity = state[tag].entities[pid];
  if (entity) {
    entity[key] = id;
  }
};

export function getEntities(state: State): Entities {
  const result: Entities = {};
  schemaKeys.forEach((key) => {
    result[key] = state[key].entities;
  });
  return result;
}

function addEntities(state: State, entities: Entities): void {
  schemaKeys.forEach((key) => {
    const adapter: EntityStateAdapter<unknown> = ormAdapters[key];
    const dict = entities[key];
    if (dict) {
      adapter.addMany(state[key], dict);
    }
  });
}

function createGear(state: State, payload: CreateGearPayload): void {
  const { input, position } = payload;
  const { result, entities } = normalize(input, schemata.gear);
  addEntities(state, entities);
  setGearPosition(state, position, result);
}

function getPlanDefaultName(state: State): string {
  const count = Object.values(state.files.entities).filter(isPlan).length;
  return `File ${count + 1}`;
}

export const entitiesSlice = createSlice({
  name: ENTITIES_SLICE_NAME,
  initialState,
  reducers: {
    createGear: (state, { payload }: PayloadAction<CreateGearPayload>) => {
      createGear(state, payload);
    },

    createGearsByPreset: (
      state,
      {
        payload,
      }: PayloadAction<{
        preset: string;
        position: Omit<GearPosition, "key">;
      }>
    ) => {
      const presetEntity = state.presets.entities[payload.preset];

      if (!presetEntity) {
        return;
      }

      GEAR_KEYS.forEach((key) => {
        const id = presetEntity[key];
        const gear = id && state.gears.entities[id];

        if (!gear) {
          return;
        }

        const input = { ...gear, id: nanoid() };
        const position = { ...payload.position, key };
        createGear(state, { input, position });
      });
    },

    createShip: {
      reducer: (state, { payload }: PayloadAction<CreateShipPayload>) => {
        const { input, position } = payload;
        const { result, entities } = normalize(input, schemata.ship);

        if (payload.reselect) {
          const current = state.ships.entities[result];
          const next = entities.ships[result];

          if (current && next) {
            state.ships.entities[result] = {
              id: next.id,
              ship_id: next.ship_id,
              ...pick(current, GEAR_KEYS),
            };
          }
        } else {
          addEntities(state, entities);
        }

        if (position) {
          setShipPosition(state, position, result);
        }
      },
      prepare: (payload: CreateShipPayload) => {
        payload.id ||= nanoid();
        payload.input.id = payload.id;

        return {
          payload,
        };
      },
    },

    addPlanEnemy: (state, { payload }: PayloadAction<AddPlanEnemyPayload>) => {
      const stepId = nanoid();

      const step: Step = {
        id: stepId,
        name: payload.name,
        type: payload.type,
        d: payload.d,
        org: payload.org,
        config: {
          left: {
            formation: payload.formation,
          },
        },
      };

      const normalized = normalize(step, schemata.step);
      addEntities(state, normalized.entities);

      const fileEntity = state.files.entities[payload.file];
      if (isPlan(fileEntity)) {
        fileEntity.steps.push(stepId);
      }
    },

    swapGear: (
      state,
      { payload: { drag, drop } }: PayloadAction<SwapGearPayload>
    ) => {
      setGearPosition(state, drag.position, drop.id);
      setGearPosition(state, drop.position, drag.id);
    },

    swapShip: (
      state,
      { payload: { drag, drop } }: PayloadAction<SwapShipPayload>
    ) => {
      setShipPosition(state, drag.position, drop.id);
      setShipPosition(state, drop.position, drag.id);
    },

    createPlan: {
      reducer: (state, { payload }: PayloadAction<{ input: Plan }>) => {
        const { input } = payload;

        if (!input.name) {
          input.name = getPlanDefaultName(state);
        }

        const { result, entities } = normalize(input, schemata.file);
        addEntities(state, entities);
        insert(state.files, result);
      },
      prepare: (input: Partial<Plan> = {}, to?: string) => {
        function getInitialPlan(): Plan {
          return {
            id: nanoid(),
            type: "plan",
            name: "",
            description: "",
            org: {
              f1: {},
              f2: {},
              f3: {},
              f4: {},
              a1: {},
              a2: {},
              a3: {},
            },
            steps: [],
          };
        }

        return {
          payload: {
            input: {
              ...getInitialPlan(),
              ...input,
            },
            to,
          },
        };
      },
    },

    createPreset: (
      state,
      action: PayloadAction<{
        position: Omit<GearPosition, "key">;
        name: string;
      }>
    ) => {
      const { position, name } = action.payload;

      const sourceEntity = state[position.tag].entities[position.id];

      if (!sourceEntity) {
        return;
      }

      const presetId = nanoid();

      const preset: PresetEntity = {
        id: presetId,
        name,
      };

      ormAdapters.presets.addOne(state.presets, preset);

      GEAR_KEYS.forEach((key) => {
        const id = sourceEntity[key];
        const gear = id && state.gears.entities[id];

        if (gear) {
          createGear(state, {
            input: { ...gear, id: nanoid() },
            position: { tag: "presets", id: presetId, key },
          });
        }
      });
    },

    cloneFile: (state, action: PayloadAction<string>) => {
      const sourceId = action.payload;
      const entities = getEntities(state);

      const cloned = cloneAffectedEntities(
        sourceId,
        schemata.file,
        entities,
        nanoid
      );

      let to: string | undefined;
      if (isFolder(state.files.entities[sourceId])) {
        const parentId = Object.values(state.files.entities).find(
          (file) => isFolder(file) && file.children.includes(sourceId)
        )?.id;
        if (parentId) {
          to = parentId;
        }
      } else {
        to = sourceId;
      }

      addEntities(state, cloned.entities);
      insert(state.files, cloned.result, to);
    },

    import: (state, { payload }: PayloadAction<ImportPayload>) => {
      const entity = payload.entities["files"]?.[payload.result] as
        | FileEntity
        | undefined;

      if (isPlan(entity) && !entity.name) {
        entity.name = getPlanDefaultName(state);
      }

      addEntities(state, payload.entities);
      insert(state.files, payload.result, payload.to || "temp");
    },

    sweep: (state) => {
      const entities = getEntities(state);

      const affectedEntities = getAffectedEntities(
        state.files.rootIds,
        [schemata.file],
        entities
      );

      const presetGearIds = Object.values(state.presets.entities)
        .flatMap((preset) => GEAR_KEYS.map((key) => preset?.[key]))
        .filter(nonNullable);

      schemaKeys.forEach((key) => {
        const dict = affectedEntities[key] || {};
        const allowlist = Object.keys(dict);
        const adapter: EntityStateAdapter<unknown> = ormAdapters[key];

        if (key === "gears") {
          allowlist.push(...presetGearIds);
        }
        if (key === "presets") {
          return;
        }

        adapter.removeMany(state[key], xor(allowlist, state[key].ids));
      });
    },
  },
  extraReducers: (builder) => {
    builder.addDefaultCase(combinedReducer);
  },
});
