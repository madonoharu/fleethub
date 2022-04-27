import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MasterShip } from "fleethub-core";

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

export interface MasterDataOverrides {
  ships?: Partial<Record<number, MasterShipOverrides>>;
}

export interface ConfigState {
  overrides?: MasterDataOverrides;
}

const initialState: ConfigState = {};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setMasterShipOverrides: (
      state,
      action: PayloadAction<{ shipId: number; overrides: MasterShipOverrides }>
    ) => {
      const { shipId, overrides } = action.payload;

      state.overrides ||= {};
      state.overrides.ships ||= {};
      state.overrides.ships[shipId] = overrides;
    },
  },
});
