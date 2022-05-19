import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AntiAirCutinDef,
  DayCutin,
  DayCutinDef,
  MasterShip,
  NightCutin,
  NightCutinDef,
} from "fleethub-core";

export const STAT_INTERVAL_KEYS = [
  "max_hp",
  "firepower",
  "armor",
  "torpedo",
  "evasion",
  "anti_air",
  "asw",
  "los",
  "luck",
] as const;

export type StatIntervalKey = typeof STAT_INTERVAL_KEYS[number];

export type MasterShipOverrides = Partial<
  Pick<MasterShip, StatIntervalKey | "range" | "torpedo_accuracy" | "slots">
>;

export interface MasterDataOverrides {
  ships?: Partial<Record<number, MasterShipOverrides>>;
  day_cutin?: Partial<Record<DayCutin, Partial<DayCutinDef>>>;
  night_cutin?: Partial<Record<NightCutin, Partial<NightCutinDef>>>;
  anti_air_cutin?: Partial<Record<number, Partial<AntiAirCutinDef>>>;
}

export interface ConfigState {
  masterData?: MasterDataOverrides;
}

type UpdateAction<Id extends number | string, T> = PayloadAction<{
  id: Id;
  changes: Partial<T>;
}>;

const initialState: ConfigState = {};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    updateMasterShip: (
      state,
      action: UpdateAction<number, MasterShipOverrides>
    ) => {
      const { id, changes } = action.payload;

      state.masterData ||= {};
      state.masterData.ships ||= {};
      state.masterData.ships[id] ||= {};
      Object.assign(state.masterData.ships[id], changes);
    },

    removeMasterShip: (state, { payload }: PayloadAction<number>) => {
      delete state.masterData?.ships?.[payload];
    },

    updateDayCutin: (state, action: UpdateAction<DayCutin, DayCutinDef>) => {
      const { id, changes } = action.payload;

      state.masterData ||= {};
      state.masterData.day_cutin ||= {};
      state.masterData.day_cutin[id] ||= {};
      Object.assign(state.masterData.day_cutin[id], changes);
    },

    removeDayCutin: (state, { payload }: PayloadAction<DayCutin>) => {
      delete state?.masterData?.day_cutin?.[payload];
    },

    updateNightCutin: (
      state,
      action: UpdateAction<NightCutin, NightCutinDef>
    ) => {
      const { id, changes } = action.payload;

      state.masterData ||= {};
      state.masterData.night_cutin ||= {};
      state.masterData.night_cutin[id] ||= {};
      Object.assign(state.masterData.night_cutin[id], changes);
    },

    removeNightCutin: (state, { payload }: PayloadAction<NightCutin>) => {
      delete state?.masterData?.night_cutin?.[payload];
    },

    updateAntiAirCutin: (state, action: UpdateAction<number, DayCutinDef>) => {
      const { id, changes } = action.payload;

      state.masterData ||= {};
      state.masterData.anti_air_cutin ||= {};
      state.masterData.anti_air_cutin[id] ||= {};
      Object.assign(state.masterData.anti_air_cutin[id], changes);
    },

    removeAntiAirCutin: (state, { payload }: PayloadAction<number>) => {
      delete state?.masterData?.anti_air_cutin?.[payload];
    },
  },
});
