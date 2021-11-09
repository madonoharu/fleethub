import { Dict, GearKey, GEAR_KEYS, nonNullable, ShipKey } from "@fh/utils";
import {
  AppThunk,
  createAction,
  createAsyncThunk,
  isAnyOf,
  nanoid,
} from "@reduxjs/toolkit";
import equal from "fast-deep-equal";
import {
  AttackPowerModifiers,
  MasterData,
  NightSituation,
  OrgState,
  Ship,
  ShipState,
} from "fleethub-core";
import xor from "lodash/xor";
import { createCachedSelector } from "re-reselect";
import { DefaultRootState } from "react-redux";

import { MapEnemySelectEvent } from "../components/templates/MapSelect/MapMenu";
import { SwapEvent } from "../hooks";
import {
  getPublicId,
  readPublicFile,
  importFromJor,
  parsePredeck,
  publishFileData,
  tweet,
  createShallowEqualSelector,
} from "../utils";
import {
  airSquadronsSelectors,
  filesSelectors,
  fleetsSelectors,
  gearsSelectors,
  orgsSelectors,
  shipsSelectors,
  stepsSelectors,
  presetsSelectors,
} from "./adapters";
import {
  cloneNormalizedEntities,
  getReferencedEntities,
  isFolder,
} from "./entityHelpers";
import { GearPosition } from "./gearsSlice";
import {
  GearEntity,
  NormalizedEntities,
  normalizeOrgState,
  normalizeShipState,
  PlanFileEntity,
  StepConfig,
  StepEntity,
  EntityTypeMap,
  PresetEntity,
} from "./schema";

export type AddFilePayload = {
  entities: NormalizedEntities;
  fileId: string;
  to?: string | undefined;
};

const cloneAddFilePayload = (payload: AddFilePayload): AddFilePayload => {
  const cloned = cloneNormalizedEntities(payload.entities);

  return {
    ...payload,
    fileId: cloned.idMap.get(payload.fileId) || "",
    entities: cloned.entities,
  };
};

export type ShipPosition =
  | { tag: "fleet"; id: string; key: ShipKey }
  | { tag: "shipDetails" };

type CreateShipArg = {
  ship: Ship;
  position?: ShipPosition | undefined;
  id?: string;
  reselect?: boolean;
};

export const createShip = createAction(
  "entities/createShip",
  (arg: CreateShipArg) => {
    const { ship, position, id, reselect } = arg;
    const state: ShipState = ship.state();

    const normalized = normalizeShipState(state, id);

    const payload = {
      id: normalized.result,
      entities: normalized.entities,
      position,
      reselect,
    };

    return { payload };
  }
);

export const selectShip =
  (ship: Ship, id?: string): AppThunk =>
  (dispatch, getState) => {
    const root = getState();
    const shipSelectState = root.present.shipSelect;

    dispatch(
      createShip({
        ship,
        position: shipSelectState.position,
        id: id || shipSelectState.id,
        reselect: shipSelectState.reselect,
      })
    );
  };

export const createAddFilePayloadByOrg = (arg: {
  name?: string;
  org?: OrgState;
  to?: string;
}): AddFilePayload => {
  const normalized = normalizeOrgState(arg?.org || {});

  const fileId = nanoid();

  const file: PlanFileEntity = {
    id: fileId,
    org: normalized.result,
    type: "plan",
    name: arg.name || "",
    description: "",
    steps: [],
  };

  const entities = normalized.entities;
  entities.files = {
    [fileId]: file,
  };

  return {
    fileId,
    entities,
    to: arg.to,
  };
};

export const createPlan = createAction(
  "entities/createPlan",
  (arg: Parameters<typeof createAddFilePayloadByOrg>[0]) => ({
    payload: createAddFilePayloadByOrg(arg),
  })
);

export const initalNightSituation: NightSituation = {
  night_contact_rank: null,
  searchlight: false,
  starshell: false,
};

export const initalAttackPowerModifiers: AttackPowerModifiers = {
  a11: 1,
  a12: 1,
  a13: 1,
  a13_2: 1,
  a14: 1,
  a5: 1,
  a6: 1,
  a7: 1,
  b11: 0,
  b12: 0,
  b13: 0,
  b13_2: 0,
  b14: 0,
  b5: 0,
  b6: 0,
  b7: 0,
};

export const initalStepConfig: StepConfig = {
  air_state: "AirSupremacy",
  engagement: "Parallel",
  player: {
    formation: "LineAhead",
    night_situation: initalNightSituation,
    external_power_mods: initalAttackPowerModifiers,
  },
  enemy: {
    formation: "LineAhead",
    night_situation: initalNightSituation,
    external_power_mods: initalAttackPowerModifiers,
  },
};

export const createStep = createAction(
  "entities/createStep",
  (fileId: string, event: MapEnemySelectEvent) => {
    const { result, entities } = normalizeOrgState(event.org);

    const stepId = nanoid();

    const step: StepEntity = {
      id: stepId,
      name: event.name,
      type: event.type,
      d: event.d,
      org: result,
      config: {
        ...initalStepConfig,
        enemy: {
          ...initalStepConfig.enemy,
          formation: event.formation,
        },
      },
    };

    return {
      payload: {
        fileId,
        stepId,
        entities: {
          ...entities,
          steps: [step],
        },
      },
    };
  }
);

export const addFile = createAction<AddFilePayload>("entities/addFile");

export const importFile = createAction(
  "entities/importFile",
  (payload: AddFilePayload) => ({
    payload: cloneAddFilePayload(payload),
  })
);

export const sweep =
  createAction<Omit<Record<keyof NormalizedEntities, string[]>, "presets">>(
    "entities/sweep"
  );

export const cloneFile =
  (sourceId: string): AppThunk =>
  (dispatch, getState) => {
    const root = getState();
    const referencedEntities = getReferencedEntities(root, sourceId);

    const cloned = cloneNormalizedEntities(referencedEntities);
    const clonedId = cloned.idMap.get(sourceId);

    let to: string | undefined;

    if (isFolder(filesSelectors.selectById(root, sourceId))) {
      const parentId = filesSelectors
        .selectAll(root)
        .find((file) => isFolder(file) && file.children.includes(sourceId))?.id;

      if (parentId) {
        to = parentId;
      }
    } else {
      to = sourceId;
    }

    dispatch(
      addFile({
        entities: cloned.entities,
        fileId: clonedId || "",
        to,
      })
    );
  };

export const sweepEntities =
  (removeTemp = false): AppThunk =>
  (dispatch, getState) => {
    const root = getState();

    const rootFileIds = root.present.files.rootIds.concat();
    if (!removeTemp) {
      rootFileIds.push(...root.present.files.tempIds);
    }

    const entities = getReferencedEntities(root, rootFileIds);
    const { files, steps, orgs, fleets, airSquadrons, ships, gears } = entities;

    const fileIds = files ? Object.keys(files) : [];
    const stepIds = steps ? Object.keys(steps) : [];
    const orgIds = orgs ? Object.keys(orgs) : [];
    const fleetIds = fleets ? Object.keys(fleets) : [];
    const airSquadronIds = airSquadrons ? Object.keys(airSquadrons) : [];
    const shipIds = ships ? Object.keys(ships) : [];
    const gearIds = gears ? Object.keys(gears) : [];

    const presets = presetsSelectors.selectAll(root);
    const presetGearIds = presets
      .flatMap((preset) => GEAR_KEYS.map((key) => preset[key]))
      .filter(nonNullable);
    gearIds.push(...presetGearIds);

    const payload = {
      files: xor(fileIds, filesSelectors.selectIds(root) as string[]),
      steps: xor(stepIds, stepsSelectors.selectIds(root) as string[]),
      orgs: xor(orgIds, orgsSelectors.selectIds(root) as string[]),
      fleets: xor(fleetIds, fleetsSelectors.selectIds(root) as string[]),
      airSquadrons: xor(
        airSquadronIds,
        airSquadronsSelectors.selectIds(root) as string[]
      ),
      ships: xor(shipIds, shipsSelectors.selectIds(root) as string[]),
      gears: xor(gearIds, gearsSelectors.selectIds(root) as string[]),
    };

    dispatch(sweep(payload));
  };

export type AddEntitiesPayload = {
  entities: {
    [K in keyof EntityTypeMap]?:
      | Record<string, EntityTypeMap[K]>
      | Array<EntityTypeMap[K]>
      | undefined;
  };
};

export const addEntities = createAction<AddEntitiesPayload>("entities/add");

export type PublicFile = {
  fileId: string;
  entities: NormalizedEntities;
};

export const publishFile = createAsyncThunk(
  "entities/publishFile",
  async (arg: { fileId: string; tweets?: boolean }, thunkAPI) => {
    const { fileId, tweets } = arg;
    const root = thunkAPI.getState() as DefaultRootState;
    const referencedEntities = getReferencedEntities(root, fileId);

    let count = 0;
    const genId = () => `${(count++).toString(32)}`;

    const cloned = cloneNormalizedEntities(referencedEntities, genId);

    const data: PublicFile = {
      fileId: cloned.idMap.get(fileId) || "",
      entities: cloned.entities,
    };

    const url = await publishFileData(data);

    if (tweets) {
      const name = referencedEntities.files?.[fileId]?.name || "";

      tweet({
        text: name && `【${name}】`,
        url,
      });
    }

    return url;
  }
);

export const parseUrl = async (masterData: MasterData, url: URL) => {
  const publicId = getPublicId(url);
  if (publicId) {
    const res = await readPublicFile(publicId);
    return res;
  }

  if (url.hostname === "jervis.page.link") {
    const res = await importFromJor(url);
    return (
      res &&
      createAddFilePayloadByOrg({
        name: res?.name,
        org: res.org,
      })
    );
  }

  const org = parsePredeck(masterData, url);
  return org && createAddFilePayloadByOrg({ org });
};

export const swapGearPosition = createAction<
  SwapEvent<{ id?: string | undefined; position: GearPosition }>
>("entities/swapGearPosition");

export const swapShipPosition = createAction<
  SwapEvent<{ id?: string | undefined; position: ShipPosition }>
>("entities/swapShipPosition");

export type EquipPayload = {
  tag: GearPosition["tag"];
  id: GearPosition["id"];
  changes: Dict<GearKey, string | undefined>;
  entities: AddEntitiesPayload["entities"];
};

export const equip = createAction<EquipPayload>("entities/equip");

export type PresetState = Omit<PresetEntity, GearKey> &
  Dict<GearKey, GearEntity>;

export const selectPresetState = createCachedSelector(
  (root: DefaultRootState, id: string) => {
    const entity = presetsSelectors.selectById(root, id);

    if (!entity) {
      return;
    }

    const result: PresetState = {
      id,
      name: entity.name,
    };

    GEAR_KEYS.forEach((key) => {
      const gearEntityId = entity[key];
      const gearEntity =
        gearEntityId && gearsSelectors.selectById(root, gearEntityId);
      if (gearEntity) {
        result[key] = gearEntity;
      }
    });

    return result;
  },
  (result) => {
    console.log("selectPresetState");
    return result;
  }
)({
  keySelector: (root, id) => id,
  selectorCreator: createShallowEqualSelector,
});

export const selectPresets = createShallowEqualSelector(
  (root: DefaultRootState) => {
    const ids = presetsSelectors.selectIds(root) as string[];
    return ids.map((id) => selectPresetState(root, id)).filter(nonNullable);
  },
  (presets) => presets
);

export const isEntitiesAction = isAnyOf(
  createShip,
  createPlan,
  createStep,
  addFile,
  importFile,
  addEntities,
  equip
);
