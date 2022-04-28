import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { MasterShip, NightCutin, NightCutinDef } from "fleethub-core";

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
  Pick<Partial<MasterShip>, StatIntervalKey | "range" | "slots">
>;

export type NightCutinOverrides = Partial<NightCutinDef>;

export interface MasterDataOverrides {
  ships?: Partial<Record<number, MasterShipOverrides>>;
  night_cutin?: Partial<Record<NightCutin, NightCutinOverrides>>;
}

export interface ConfigState {
  overrides?: MasterDataOverrides;
}

const nightCutinAdapter = createEntityAdapter<NightCutinOverrides>();

type SetOverridesPayloadAction<K, T> = PayloadAction<{ id: K; overrides: T }>;

const initialState: ConfigState = {};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setMasterShipOverrides: (
      state,
      action: SetOverridesPayloadAction<number, MasterShipOverrides>
    ) => {
      const { id, overrides } = action.payload;

      state.overrides ||= {};
      state.overrides.ships ||= {};
      state.overrides.ships[id] = overrides;
    },

    setNightCutinOverrides: (
      state,
      action: SetOverridesPayloadAction<NightCutin, NightCutinOverrides>
    ) => {
      const { id, overrides } = action.payload;

      state.overrides ||= {};
      state.overrides.night_cutin ||= {};
      state.overrides.night_cutin[id] = overrides;
    },
  },
});
