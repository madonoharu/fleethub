import { OrgState } from "fleethub-core";
import { useMemo } from "react";

import { OrgEntity, orgsSelectors, orgsSlice, selectOrgState } from "../store";

import { useAppDispatch, useRootSelector } from "./rtk-hooks";
import { useFhCore } from "./useFhCore";

export function useOrgEntity(id: string): OrgEntity | undefined {
  return useRootSelector((root) => orgsSelectors.selectById(root, id));
}

export function useOrgState(id: string): OrgState | undefined {
  return useRootSelector((root) => selectOrgState(root, id));
}

export const useOrg = (id: string) => {
  const { core } = useFhCore();
  const dispatch = useAppDispatch();
  const state = useOrgState(id);

  const org = useMemo(() => {
    try {
      return state && core.create_org(state);
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [core, state]);

  const actions = useMemo(() => {
    const update = (changes: Partial<OrgEntity>) => {
      dispatch(orgsSlice.actions.update({ id, changes }));
    };

    const setHqLevel = (hq_level: number) => {
      dispatch(orgsSlice.actions.update({ id, changes: { hq_level } }));
    };

    return { setHqLevel, update };
  }, [dispatch, id]);

  return { org, actions };
};
