import { OrgParams } from "@fleethub/core";
import { nonNullable, uniq } from "@fleethub/utils";
import {
  AppThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  EntitySelectors,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";

import { cloneFilesData, FilesData } from "./filesData";
import { selectFilesState } from "./selectors";

type FileBase<T extends string, P = Record<string, unknown>> = {
  id: string;
  type: T;
  name: string;
  description: string;
} & P;

export type FolderEntity = FileBase<"folder", { children: string[] }>;

export type Directory = FolderEntity;

export type PlanFileEntity = FileBase<"plan">;

export type FileEntity = Directory | PlanFileEntity;

export type FileType = FileEntity["type"];

declare const fileIdNominality: unique symbol;
type FileId = string & { [fileIdNominality]?: never };

export type ParentKey = FileId | "root" | "temp";

const adapter = createEntityAdapter<FileEntity>();
export const filesSelectors: EntitySelectors<FileEntity, DefaultRootState> =
  adapter.getSelectors(selectFilesState);

const initalRoot: FolderEntity = {
  id: "root",
  type: "folder",
  name: "ルート",
  description: "",
  children: [],
};

const initalTemp: FolderEntity = {
  id: "temp",
  type: "folder",
  name: "一時フォルダー",
  description: "",
  children: [],
};

const initialState = adapter.getInitialState({
  root: initalRoot,
  temp: initalTemp,
});

export type FilesState = typeof initialState;

export const isDirectory = (file?: FileEntity): file is Directory =>
  Boolean(file && "children" in file);

const getFile = (state: FilesState, id: ParentKey) => {
  if (id === "root") return state.root;
  if (id === "temp") return state.temp;

  return state.entities[id];
};

const getParentFolder = (state: FilesState, id: ParentKey): FolderEntity => {
  const file = getFile(state, id);
  if (!file) return state.root;

  if (isDirectory(file)) return file;

  const parent = Object.values(state.entities)
    .filter(isDirectory)
    .find((dir) => dir.children.includes(file.id));

  return parent || state.root;
};

const insert = (state: FilesState, id: string, to: string) => {
  const { children } = getParentFolder(state, to);
  const index = children.indexOf(to);
  children.splice(index + 1, 0, id);
};

const getTopFiles = (files: FileEntity[]) => {
  const allChildren = files
    .filter(isDirectory)
    .flatMap((folder) => folder.children);
  return files.filter((file) => !allChildren.includes(file.id));
};

const addChildren = (state: FilesState, to: ParentKey, children: string[]) => {
  const parent = getParentFolder(state, to);
  parent.children = uniq([...parent.children, ...children]);
};

const getAllFiles = (state: FilesState) =>
  [state.root, state.temp, ...Object.values(state.entities)].filter(
    nonNullable
  );

const removeFromChildren = (state: FilesState, ids: string[]) => {
  const filterFn = (child: string) => !ids.includes(child);

  getAllFiles(state)
    .filter(isDirectory)
    .forEach((dir) => {
      dir.children = dir.children.filter(filterFn);
    });
};

const addFiles = (state: FilesState, files: FileEntity[], to: ParentKey) => {
  adapter.addMany(state, files);

  const topFileIds = getTopFiles(files).map((file) => file.id);
  addChildren(state, to, topFileIds);
};

type SetPayloadAction = PayloadAction<{ data: FilesData; to?: ParentKey }>;

const set = (
  state: FilesState,
  { payload: { data, to = "root" } }: SetPayloadAction
) => addFiles(state, data.files, to);

export const filesSlice = createSlice({
  name: "entities/files",

  initialState,

  reducers: {
    set,
    add: {
      reducer: set,
      prepare: ({ data, to }: SetPayloadAction["payload"]) => {
        const cloned = cloneFilesData(data);
        return { payload: { data: cloned, to } };
      },
    },

    createPlan: {
      reducer: (
        state,
        { payload }: PayloadAction<{ org: OrgParams; to: ParentKey }>
      ) => {
        const count = Object.values(state.entities).filter(
          (file) => file?.type === "plan"
        ).length;
        const name = count ? `編成${count + 1}` : "最初の編成";

        const file: PlanFileEntity = {
          id: payload.org.id || "",
          type: "plan",
          name,
          description: "",
        };

        addFiles(state, [file], payload.to);
      },
      prepare: ({ org, to }: { org?: OrgParams; to: ParentKey }) => ({
        payload: { org: { ...org, id: nanoid() }, to },
        meta: {
          f1: nanoid(),
          f2: nanoid(),
          f3: nanoid(),
          f4: nanoid(),
          a1: nanoid(),
          a2: nanoid(),
          a3: nanoid(),
        },
      }),
    },

    createFolder: (state, { payload }: PayloadAction<string>) => {
      const count =
        Object.values(state.entities).filter((file) => file?.type === "folder")
          .length + 1;

      const newFolder: FolderEntity = {
        id: nanoid(),
        type: "folder",
        name: `フォルダー${count}`,
        description: "",
        children: [],
      };

      addFiles(state, [newFolder], payload);
    },

    update: adapter.updateOne,

    move: (
      state,
      { payload: { id, to } }: PayloadAction<{ id: string; to: string }>
    ) => {
      removeFromChildren(state, [id]);

      const file = getFile(state, to);
      if (!file) return;

      if (isDirectory(file)) {
        file.children.push(id);
        return;
      }

      insert(state, id, to);
    },

    remove: (state, { payload }: PayloadAction<string[]>) => {
      adapter.removeMany(state, payload);
      removeFromChildren(state, payload);
    },
  },
});

export const flatFile = (
  entities: Dictionary<FileEntity>,
  id: string
): FileEntity[] => {
  const file = entities[id];
  if (!file) return [];
  if (!isDirectory(file)) return [file];
  return [
    file,
    ...file.children.flatMap((childId) => flatFile(entities, childId)),
  ];
};

export const removeFile =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const entities = filesSelectors.selectEntities(state);
    const ids = flatFile(entities, id).map((file) => file.id);
    dispatch(filesSlice.actions.remove(ids));
  };

export const getTempIds = (state: FilesState) => {
  const { temp, entities } = state;
  return temp.children
    .flatMap((id) => flatFile(entities, id))
    .map((file) => file.id);
};

export const selectTempIds = createSelector(selectFilesState, getTempIds);
