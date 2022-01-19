import { nonNullable } from "@fh/utils";
import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

import { ormAdapters, getSliceName } from "./base";
import { FileEntity } from "./schemata";

const key = "files";
const adapter = ormAdapters[key];
const sliceName = getSliceName(key);

const initialState = adapter.getInitialState<{
  rootIds: string[];
  tempIds: string[];
}>({
  rootIds: [],
  tempIds: [],
});

export type FilesState = typeof initialState;

export function isFolder(
  entity: FileEntity | undefined
): entity is FileEntity & { type: "folder" } {
  return entity?.type === "folder";
}

export function isPlan(
  entity: FileEntity | undefined
): entity is FileEntity & { type: "plan" } {
  return entity?.type === "plan";
}

function getFolderChildren(state: FilesState, id: string): string[] {
  if (id === "temp") {
    return state.tempIds;
  }

  const file = state.entities[id];
  if (!file) return state.rootIds;

  if (isFolder(file)) return file.children;

  if (state.rootIds.includes(id)) {
    return state.rootIds;
  }
  if (state.tempIds.includes(id)) {
    return state.tempIds;
  }

  const parent = Object.values(state.entities)
    .filter(isFolder)
    .find((dir) => dir.children.includes(file.id));

  return parent ? parent.children : state.rootIds;
}

const getTopFiles = (files: FileEntity[]) => {
  const allChildren = files
    .filter(isFolder)
    .flatMap((folder) => folder.children);

  return files.filter((file) => !allChildren.includes(file.id));
};

const addFiles = (state: FilesState, files: FileEntity[], to = "") => {
  adapter.addMany(state, files);

  const topFileIds = getTopFiles(files).map((file) => file.id);

  const children = getFolderChildren(state, to);
  children.push(...topFileIds);
};

const getAllFiles = (state: FilesState) =>
  Object.values(state.entities).filter(nonNullable);

const unlink = (state: FilesState, ids: string[]) => {
  const excludedSet = new Set(ids);
  const allIdSet = new Set(state.ids);

  const filterFn = (child: string) =>
    !excludedSet.has(child) && allIdSet.has(child);

  state.rootIds = state.rootIds.filter(filterFn);
  state.tempIds = state.tempIds.filter(filterFn);

  getAllFiles(state)
    .filter(isFolder)
    .forEach((dir) => {
      dir.children = dir.children.filter(filterFn);
    });
};

export const insert = (state: FilesState, id: string, to = "") => {
  const children = getFolderChildren(state, to);
  const index = children.indexOf(to);

  if (index === -1) {
    children.push(id);
  } else {
    children.splice(index + 1, 0, id);
  }
};

export const filesSlice = createSlice({
  name: sliceName,

  initialState,

  reducers: {
    removeSteps: (state, { payload }: PayloadAction<string>) => {
      adapter.updateOne(state, {
        id: payload,
        changes: { steps: [] },
      });
    },

    createFolder: (state, { payload }: PayloadAction<string | undefined>) => {
      const count =
        Object.values(state.entities).filter((file) => file?.type === "folder")
          .length + 1;

      const newFolder: FileEntity = {
        id: nanoid(),
        type: "folder",
        name: `Folder${count}`,
        description: "",
        children: [],
      };

      addFiles(state, [newFolder], payload);
    },

    update: adapter.updateOne,

    move: {
      reducer: (
        state,
        { payload: { id, to } }: PayloadAction<{ id: string; to?: string }>
      ) => {
        unlink(state, [id]);
        insert(state, id, to);
      },
      prepare: (id: string, to?: string) => ({
        payload: { id, to },
      }),
    },

    remove: (state, { payload }: PayloadAction<string>) => {
      adapter.removeOne(state, payload);
      unlink(state, [payload]);
    },
  },
});
