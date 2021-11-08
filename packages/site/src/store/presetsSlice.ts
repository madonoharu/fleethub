import { createSlice, EntityState } from "@reduxjs/toolkit";
import { presetsAdapter } from "./adapters";
import { equip, swapGearPosition, isEntitiesAction } from "./entities";
import { GearPosition } from "./gearsSlice";
import { PresetEntity } from "./schema";

const setGearId = (
  state: EntityState<PresetEntity>,
  position: GearPosition,
  id: string | undefined
) => {
  if (position.tag !== "preset") return;

  const entity = state.entities[position.id];

  if (entity) {
    entity[position.key] = id;
  }
};

export const presetsSlice = createSlice({
  name: "entities/presets",
  initialState: presetsAdapter.getInitialState(),

  reducers: {
    add: presetsAdapter.addOne,
    update: presetsAdapter.updateOne,
    remove: presetsAdapter.removeOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(equip, (state, { payload }) => {
        if (payload.tag === "preset") {
          presetsAdapter.updateOne(state, payload);
        }
      })
      .addCase(swapGearPosition, (state, { payload }) => {
        const { drag, drop } = payload;

        setGearId(state, drag.position, drop.id);
        setGearId(state, drop.position, drag.id);
      })
      .addMatcher(isEntitiesAction, (state, action) => {
        const { presets } = action.payload.entities;
        if (presets) {
          presetsAdapter.addMany(state, presets);
        }
      });
  },
});
