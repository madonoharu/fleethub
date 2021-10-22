import { Org } from "fleethub-core";
import { createContext, useContext } from "react";
import { PlanFileEntity } from "../store";

export const OrgContext = createContext<Org | undefined>(undefined);
export const useOrgContext = () => useContext(OrgContext);

export const PlanContext = createContext<PlanFileEntity | undefined>(undefined);
export const usePlanContext = () => useContext(PlanContext);
