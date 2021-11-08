import { createEntityAdapter } from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";
import {
  PresetEntity,
  AirSquadronEntity,
  FileEntity,
  FleetEntity,
  GearEntity,
  OrgEntity,
  ShipEntity,
  StepEntity,
} from "./schema";
import { selectGearsState, selectShipsState } from "./selectors";

export const gearsAdapter = createEntityAdapter<GearEntity>();
export const gearsSelectors = gearsAdapter.getSelectors(selectGearsState);

export const shipsAdapter = createEntityAdapter<ShipEntity>();
export const shipsSelectors = shipsAdapter.getSelectors(selectShipsState);

export const fleetsAdapter = createEntityAdapter<FleetEntity>();
export const fleetsSelectors = fleetsAdapter.getSelectors(
  (root: DefaultRootState) => root.present.fleets
);

export const airSquadronsAdapter = createEntityAdapter<AirSquadronEntity>();
export const airSquadronsSelectors = airSquadronsAdapter.getSelectors(
  (root: DefaultRootState) => root.present.airSquadrons
);

export const orgsAdapter = createEntityAdapter<OrgEntity>();
export const orgsSelectors = orgsAdapter.getSelectors(
  (root: DefaultRootState) => root.present.orgs
);

export const filesAdapter = createEntityAdapter<FileEntity>();
export const filesSelectors = filesAdapter.getSelectors(
  (root: DefaultRootState) => root.present.files
);

export const stepsAdapter = createEntityAdapter<StepEntity>();
export const stepsSelectors = stepsAdapter.getSelectors(
  (root: DefaultRootState) => root.present.steps
);

export const presetsAdapter = createEntityAdapter<PresetEntity>();
export const presetsSelectors = presetsAdapter.getSelectors(
  (root: DefaultRootState) => root.present.presets
);
