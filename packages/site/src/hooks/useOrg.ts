import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { OrgEntity, orgsSelectors, orgsSlice, selectOrgState } from "../store";
import { useFhCore } from "./useFhCore";

export const useOrgEntity = (id: string) =>
  useSelector((root) => orgsSelectors.selectById(root, id));

export const useOrgState = (id: string) =>
  useSelector((root) => selectOrgState(root, id));

export const useOrg = (id: string) => {
  const { core } = useFhCore();
  const dispatch = useDispatch();
  const state = useSelector((root) => selectOrgState(root, id));

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
