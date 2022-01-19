import { DefaultRootState } from "react-redux";

import { ormAdapters } from "./base";
import { getEntities } from "./entitiesSlice";
import { createDenormalizeSelector } from "./rtk-ts-norm";
import { schemata } from "./schemata";

const entitiesSelector = (root: DefaultRootState) =>
  getEntities(root.present.entities);

export const selectShipState = createDenormalizeSelector(
  schemata.ship,
  entitiesSelector
);

export const selectOrgState = createDenormalizeSelector(
  schemata.org,
  entitiesSelector
);

export const selectPreset = createDenormalizeSelector(
  schemata.preset,
  entitiesSelector
);

export const orgsSelectors = ormAdapters.orgs.getSelectors(
  (root: DefaultRootState) => root.present.entities.orgs
);

export const filesSelectors = ormAdapters.files.getSelectors(
  (root: DefaultRootState) => root.present.entities.files
);

export const stepsSelectors = ormAdapters.steps.getSelectors(
  (root: DefaultRootState) => root.present.entities.steps
);
