import { isNonNullable } from "@fleethub/utils";
import { AppThunk, combineReducers } from "@reduxjs/toolkit";

import { cloneFilesData, FilesData } from "./filesData";
import {
  filesSelectors,
  filesSlice,
  flatFile,
  isDirectory,
  selectTempIds,
} from "./filesSlice";
import { plansSlice } from "./plansSlice";
import { selectEntitiesState } from "./selectors";
import { ignoreUndoable } from "./undoableOptions";

// eslint-disable-next-line @typescript-eslint/require-await
const fetchUrlData = async (url: URL) => undefined;

export const entitiesReducer = combineReducers({
  files: filesSlice.reducer,
  plans: plansSlice.reducer,
});

export type EntitiesState = ReturnType<typeof entitiesReducer>;

const createFilesData = (state: EntitiesState, id: string): FilesData => {
  const fileEntities = state.files.entities;
  const planEntities = state.plans.entities;

  const files = flatFile(fileEntities, id);
  const plans = files
    .map((file) => planEntities[file.id])
    .filter(isNonNullable);

  return { id, files, plans };
};

export const cloneFilesDataById = (
  state: EntitiesState,
  id: string
): FilesData => {
  const sourceData = createFilesData(state, id);
  return cloneFilesData(sourceData);
};

export const copyFile = (id: string, to?: string): AppThunk => (
  dispatch,
  getState
) => {
  const state = getState();
  const cloned = cloneFilesDataById(selectEntitiesState(state), id);

  const parentFile = cloned.files.find((file) => file.id === cloned.id);
  if (parentFile?.name) {
    parentFile.name = parentFile.name + "-コピー";
  }

  if (!to) {
    to = filesSelectors
      .selectAll(state)
      .find((file) => isDirectory(file) && file.children.includes(id))?.id;
  }

  dispatch(filesSlice.actions.set({ data: cloned, to }));
};

export const cleanEntities = (): AppThunk => (dispatch, getState) => {
  const tempIds = selectTempIds(getState());
  dispatch(filesSlice.actions.remove(tempIds));
};

export const fetchLocationData = (): AppThunk => async (dispatch) => {
  const url = new URL(location.href);
  const data = await fetchUrlData(url);
  history.replaceState("", "", url.href);
  if (!data) return;

  // ignoreUndoable(() => {
  //   dispatch(filesSlice.actions.add({ data, to: "temp" }))
  // })
};
