import {
  createSlice,
  createEntityAdapter,
  nanoid,
  PayloadAction,
  AppThunk,
  Dictionary,
  EntitySelectors,
} from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"
import { PlanState } from "@fleethub/core"

import { getEntites } from "./getEntites"
import { uniq, isNonNullable } from "@fleethub/utils"

export type PlanStateWithId = PlanState & { id: string }

type FileBase<T extends string, P = {}> = {
  id: string
  type: T
} & P

export type FolderEntity = FileBase<"folder", { name: string; children: string[] }>

export type Directory = FolderEntity

export type PlanFileEntity = FileBase<"plan">

export type FileEntity = Directory | PlanFileEntity

export type FileType = FileEntity["type"]

declare const fileIdNominality: unique symbol
type FileId = string & { [fileIdNominality]?: never }

export type ParentKey = FileId | "root" | "temp"

export type FhEntities = {
  entry: string
  files: FileEntity[]
  plans?: PlanStateWithId[]
  to?: string
}

const adapter = createEntityAdapter<FileEntity>()
export const filesSelectors: EntitySelectors<FileEntity, DefaultRootState> = adapter.getSelectors(
  (state) => getEntites(state).files
)

const initalRoot: FolderEntity = {
  id: "root",
  type: "folder",
  name: "ルート",
  children: [],
}

const initialState = adapter.getInitialState({
  root: initalRoot,
})

export type FilesState = typeof initialState

export const isDirectory = (file?: FileEntity): file is Directory => Boolean(file && "children" in file)

const getParentFolder = (state: FilesState, id: ParentKey): FolderEntity => {
  if (id === "root") return state.root

  const file = state.entities[id]
  if (!file) return state.root

  if (isDirectory(file)) return file

  const parent = Object.values(state.entities)
    .filter(isDirectory)
    .find((dir) => dir.children.includes(file.id))

  return parent || state.root
}

const insert = (state: FilesState, id: string, to: string) => {
  const { children } = getParentFolder(state, to)
  const index = children.indexOf(to)
  children.splice(index + 1, 0, id)
}

const getTopFiles = (files: FileEntity[]) => {
  const allChildren = files.filter(isDirectory).flatMap((folder) => folder.children)
  return files.filter((file) => !allChildren.includes(file.id))
}

const addChildren = (state: FilesState, to: ParentKey, children: string[]) => {
  const parent = getParentFolder(state, to)
  parent.children = uniq([...parent.children, ...children])
}

const getFile = (state: FilesState, id: string) => (id === "root" ? state.root : state.entities[id])

const getAllFiles = (state: FilesState) => [state.root, ...Object.values(state.entities)].filter(isNonNullable)

const removeFromChildren = (state: FilesState, ids: string[]) => {
  const filterFn = (child: string) => !ids.includes(child)

  getAllFiles(state)
    .filter(isDirectory)
    .forEach((dir) => {
      dir.children = dir.children.filter(filterFn)
    })
}

const addFiles = (state: FilesState, files: FileEntity[], to: ParentKey) => {
  adapter.addMany(state, files)

  const topFileIds = getTopFiles(files).map((file) => file.id)
  addChildren(state, to, topFileIds)
}

const set = (state: FilesState, { payload: { files, to = "root" } }: PayloadAction<FhEntities>) =>
  addFiles(state, files, to)

export const filesSlice = createSlice({
  name: "entities/files",

  initialState,

  reducers: {
    set,
    import: set,

    createPlan: {
      reducer: (state, { payload }: PayloadAction<{ plan: PlanStateWithId; to: ParentKey }>) => {
        const file: PlanFileEntity = { id: payload.plan.id, type: "plan" }
        addFiles(state, [file], payload.to)
      },
      prepare: ({ plan, to }: { plan?: PlanState; to: ParentKey }) => ({
        payload: { plan: { ...plan, id: nanoid() }, to },
      }),
    },

    createFolder: (state, { payload }: PayloadAction<string>) => {
      const count = Object.values(state.entities).filter((file) => file?.type === "folder").length + 1

      const newFolder: FolderEntity = {
        id: nanoid(),
        type: "folder",
        name: `フォルダー${count}`,
        children: [],
      }

      addFiles(state, [newFolder], payload)
    },

    update: adapter.updateOne,

    move: (state, { payload: { id, to } }: PayloadAction<{ id: string; to: string }>) => {
      removeFromChildren(state, [id])

      const file = getFile(state, to)
      if (!file) return

      if (isDirectory(file)) {
        file.children.push(id)
        return
      }

      insert(state, id, to)
    },

    remove: (state, { payload }: PayloadAction<string[]>) => {
      adapter.removeMany(state, payload)
      removeFromChildren(state, payload)
    },
  },
})

export const flatFile = (entities: Dictionary<FileEntity>, id: string): FileEntity[] => {
  const file = entities[id]
  if (!file) return []
  if (!isDirectory(file)) return [file]
  return [file, ...file.children.flatMap((childId) => flatFile(entities, childId))]
}

export const getFileTree = (entities: Dictionary<FileEntity>, id: string) => {
  const files = flatFile(entities, id)
  const tree: Dictionary<FileEntity> = {}

  files.forEach((file) => {
    tree[file.id] = file
  })

  return tree
}

export const removeFile = (id: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const entities = filesSelectors.selectEntities(state)
  const ids = flatFile(entities, id).map((file) => file.id)
  dispatch(filesSlice.actions.remove(ids))
}
