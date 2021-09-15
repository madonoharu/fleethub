import { nonNullable } from "@fh/utils";
import { createSlice, isAnyOf, nanoid, PayloadAction } from "@reduxjs/toolkit";

import { filesAdapter } from "./adapters";
import {
  isFolder,
  sweep,
  setEntities,
  createPlan,
  isPlanFile,
  importEntities,
  createPlanNode,
} from "./entities";
import { FileEntity, FolderEntity, PlanNode } from "./schema";

const initialState = filesAdapter.getInitialState<{
  rootIds: string[];
  tempIds: string[];
}>({
  rootIds: [],
  tempIds: [],
});

export type FilesState = typeof initialState;

const findFolderChildren = (state: FilesState, id: string): string[] => {
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
};

const getTopFiles = (files: FileEntity[]) => {
  const allChildren = files
    .filter(isFolder)
    .flatMap((folder) => folder.children);

  return files.filter((file) => !allChildren.includes(file.id));
};

const addFiles = (state: FilesState, files: FileEntity[], to = "") => {
  filesAdapter.addMany(state, files);

  const topFileIds = getTopFiles(files).map((file) => file.id);

  const children = findFolderChildren(state, to);
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

const insert = (state: FilesState, id: string, to = "") => {
  const children = findFolderChildren(state, to);
  const index = children.indexOf(to);

  if (index === -1) {
    children.push(id);
  } else {
    children.splice(index + 1, 0, id);
  }
};

export const filesSlice = createSlice({
  name: "entities/files",

  initialState,

  reducers: {
    updatePlanNode: (
      state,
      {
        payload,
      }: PayloadAction<{
        id: string;
        index: number;
        changes: Partial<PlanNode>;
      }>
    ) => {
      const file = state.entities[payload.id];
      const node = isPlanFile(file) && file.nodes[payload.index];
      if (!node) return;

      Object.assign(node, payload.changes);
    },
    removePlanNode: (
      state,
      { payload }: PayloadAction<{ id: string; index: number }>
    ) => {
      const file = state.entities[payload.id];

      if (!isPlanFile(file) || payload.index < 0) return;

      file.nodes.splice(payload.index, 1);
    },

    removePlanNodeAll: (state, { payload }: PayloadAction<string>) => {
      filesAdapter.updateOne(state, {
        id: payload,
        changes: { nodes: [] },
      });
    },

    createFolder: (state, { payload }: PayloadAction<string | undefined>) => {
      const count =
        Object.values(state.entities).filter((file) => file?.type === "folder")
          .length + 1;

      const newFolder: FolderEntity = {
        id: nanoid(),
        type: "folder",
        name: `Folder${count}`,
        description: "",
        children: [],
      };

      addFiles(state, [newFolder], payload);
    },

    update: filesAdapter.updateOne,

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
      filesAdapter.removeOne(state, payload);
      unlink(state, [payload]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sweep, (state, { payload }) => {
        filesAdapter.removeMany(state, payload.files);
        unlink(state, payload.files);
      })
      .addCase(createPlanNode, (state, { payload }) => {
        const file = state.entities[payload.fileId];

        if (file?.type !== "plan") return;

        if (file.nodes) {
          file.nodes.push(payload.node);
        } else {
          file.nodes = [payload.node];
        }
      })
      .addMatcher(
        isAnyOf(createPlan, setEntities, importEntities),
        (state, action) => {
          const { entities, fileId, to } = action.payload;

          if (!entities.files) return;

          insert(state, fileId, to);
          filesAdapter.addMany(state, entities.files);

          if (action.type === createPlan.type) {
            const mainFile = state.entities[fileId];
            if (mainFile && mainFile.name === "") {
              const count = Object.values(state.entities).filter(
                isPlanFile
              ).length;
              mainFile.name = `${count}`;
            }
          }
        }
      );
  },
});
