import { Comp, Org } from "fleethub-core";
import { createContext, useContext } from "react";

import { PlanEntity } from "../store";

export const OrgContext = createContext<Org | undefined>(undefined);
export const useOrgContext = () => useContext(OrgContext);
export const CompContext = createContext<Comp | undefined>(undefined);

export const PlanContext = createContext<PlanEntity | undefined>(undefined);
export const usePlanContext = () => useContext(PlanContext);
