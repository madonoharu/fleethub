import { OrgState } from "fleethub-core";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { OrgEntity, orgsSelectors, orgsSlice, selectOrgState } from "../store";

import { useFhCore } from "./useFhCore";

export function useOrgEntity(id: string): OrgEntity | undefined {
  return useSelector((root) => orgsSelectors.selectById(root, id));
}

export function useOrgState(id: string): OrgState | undefined {
  return useSelector((root) => selectOrgState(root, id));
}

export const useOrg = (id: string) => {
  const { core } = useFhCore();
  const dispatch = useDispatch();
  const state = useOrgState(id);
  const org = useMemo(() => state && core.create_org(state), [core, state]);

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
