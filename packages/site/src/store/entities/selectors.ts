import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "../createStore";

import { ormAdapters } from "./base";
import { getEntities } from "./entitiesSlice";
import { createDenormalizeSelector } from "./rtk-ts-norm";
import { PlanEntity, schemata } from "./schemata";

const entitiesSelector = createSelector((root: RootState) => root.entities, getEntities);

export const selectShipState = createDenormalizeSelector(schemata.ship, entitiesSelector);

export const selectOrgState = createDenormalizeSelector(schemata.org, entitiesSelector);

export const selectPreset = createDenormalizeSelector(schemata.preset, entitiesSelector);

export const orgsSelectors = ormAdapters.orgs.getSelectors((root: RootState) => root.entities.orgs);

export const filesSelectors = ormAdapters.files.getSelectors(
  (root: RootState) => root.entities.files,
);

export const stepsSelectors = ormAdapters.steps.getSelectors(
  (root: RootState) => root.entities.steps,
);

export function selectActiveStep(root: RootState, file: PlanEntity) {
  const active = file.activeStep;
  if (active && file.steps.includes(active)) {
    const step = stepsSelectors.selectById(root, active);
    if (step) return step;
  }
  for (const id of file.steps) {
    const step = stepsSelectors.selectById(root, id);
    if (step) return step;
  }
  return undefined;
}
