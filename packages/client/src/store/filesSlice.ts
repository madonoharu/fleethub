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
import { uniq } from "@fleethub/utils"

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

const initialRootIds: string[] = []
const initialTempIds: string[] = []

const initialState = adapter.getInitialState({
  rootIds: initialRootIds,
  tempIds: initialTempIds,
})

export type FilesState = typeof initialState

export const isDirectory = (file?: FileEntity): file is Directory => Boolean(file && "children" in file)

const getDirectoryChildren = (state: FilesState, id: ParentKey): string[] => {
  if (id === "root") return state.rootIds
  if (id === "temp") return state.tempIds

  const file = state.entities[id]
  if (!file) return state.rootIds

  if (isDirectory(file)) return file.children

  const parent = Object.values(state.entities)
    .filter(isDirectory)
    .find((dir) => dir.children.includes(file.id))

  return parent?.children || state.rootIds
}

const getTopFiles = (files: FileEntity[]) => {
  const allChildren = files.filter(isDirectory).flatMap((folder) => folder.children)
  return files.filter((file) => !allChildren.includes(file.id))
}

const addChildren = (state: FilesState, to: ParentKey, children: string[]) => {
  const dirChildren = getDirectoryChildren(state, to)
  const next = uniq([...dirChildren, ...children])
  dirChildren.splice(0, dirChildren.length, ...next)
}

const removeFromChildren = (state: FilesState, ids: string[]) => {
  const filterFn = (child: string) => !ids.includes(child)

  Object.values(state.entities)
    .filter(isDirectory)
    .forEach((folder) => {
      folder.children = folder.children.filter(filterFn)
    })

  state.rootIds = state.rootIds.filter(filterFn)
  state.tempIds = state.tempIds.filter(filterFn)
}

const addFiles = (state: FilesState, files: FileEntity[], to: ParentKey = "root") => {
  adapter.addMany(state, files)

  const topFileIds = getTopFiles(files).map((file) => file.id)
  addChildren(state, to, topFileIds)
}

const set = (state: FilesState, { payload: { files, to } }: PayloadAction<FhEntities>) => addFiles(state, files, to)

export const filesSlice = createSlice({
  name: "entities/files",

  initialState,

  reducers: {
    set,
    import: set,

    createPlan: {
      reducer: (state, { payload }: PayloadAction<{ plan: PlanStateWithId; to?: ParentKey }>) => {
        const file: PlanFileEntity = { id: payload.plan.id, type: "plan" }

        addFiles(state, [file], payload.to)
      },
      prepare: ({ plan, to }: { plan?: PlanState; to?: ParentKey }) => ({
        payload: { plan: { ...plan, id: nanoid() }, to },
      }),
    },

    createFolder: (state, { payload }: PayloadAction<string | undefined>) => {
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

    move: (state, { payload: { id, to = "root" } }: PayloadAction<{ id: string; to?: string }>) => {
      removeFromChildren(state, [id])

      const targetChildren = getDirectoryChildren(state, to)

      const index = targetChildren.indexOf(to)
      targetChildren.splice(index + 1, 0, id)
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
