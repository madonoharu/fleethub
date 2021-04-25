import { AppStore } from "@reduxjs/toolkit";
import { createCachedSelector } from "re-reselect";
import { useCallback } from "react";
import { useStore } from "react-redux";

import { cloneFilesDataById, selectEntitiesState } from "../store";
import { createShallowEqualSelector, publishFilesData } from "../utils";

const cachedSelector = createCachedSelector(
  (store: AppStore, id: string) => selectEntitiesState(store.getState()),
  (store, id) => id,
  (state, id) => {
    const cloned = cloneFilesDataById(state, id);
    return publishFilesData(cloned);
  }
)({
  keySelector: (state, id) => id,
  selectorCreator: createShallowEqualSelector,
});

export const usePublishFile = (id: string) => {
  const store = useStore();
  return useCallback((): Promise<string> => cachedSelector(store, id), [
    store,
    id,
  ]);
};
