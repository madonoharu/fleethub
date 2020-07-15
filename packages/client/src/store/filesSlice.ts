import {
  createSlice,
  createEntityAdapter,
  nanoid,
  PayloadAction,
  AppThunk,
  Dictionary,
  EntitySelectors,
  EntityId,
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

export type RootDirectory = FileBase<"root", { children: string[] }>

export type TempDirectory = FileBase<"temp", { children: string[] }>

export type FolderEntity = FileBase<"folder", { name: string; children: string[] }>

export type Directory = RootDirectory | TempDirectory | FolderEntity

export type PlanFileEntity = FileBase<"plan">

export type FileEntity = Directory | PlanFileEntity

export type FileType = FileEntity["type"]

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

const initialRootDirectory: RootDirectory = { id: "root", type: "root", children: [] }
const initialTempDirectory: TempDirectory = { id: "temp", type: "temp", children: [] }

const initialState = adapter.getInitialState({
  ids: ["root", "temp"] as EntityId[],
  entities: {
    root: initialRootDirectory,
    temp: initialTempDirectory,
  },
})

type FilesState = typeof initialState

export const isStatic = (arg: string | FileEntity) => {
  const type = typeof arg === "object" ? arg.type : arg
  return ([initialRootDirectory.type, initialTempDirectory.type] as string[]).includes(type)
}

export const isFolder = (file?: FileEntity): file is FolderEntity => file?.type === "folder"

export const isDirectory = (file?: FileEntity): file is Directory => Boolean(file && "children" in file)

const getDirectory = ({ entities }: FilesState, id?: string): Directory => {
  const file = id ? entities[id] : undefined
  return isDirectory(file) ? file : entities.root
}

const getTopFiles = (files: FileEntity[]) => {
  const allChildren = files.filter(isDirectory).flatMap((folder) => folder.children)
  return files.filter((file) => !allChildren.includes(file.id))
}

const addChildren = (state: FilesState, to: string, children: string[]) => {
  const dir = getDirectory(state, to)
  dir.children = uniq([...dir.children, ...children])
}

const addFiles = (state: FilesState, files: FileEntity[], to = "root") => {
  adapter.addMany(state, files)

  const topFileIds = getTopFiles(files).map((file) => file.id)
  addChildren(state, to, topFileIds)
}

const removeFromChildren = (state: FilesState, ids: string[]) => {
  Object.values(state.entities)
    .filter(isDirectory)
    .forEach((folder) => {
      folder.children = folder.children.filter((child) => !ids.includes(child))
    })
}

const set = (state: FilesState, { payload: { files, to } }: PayloadAction<FhEntities>) => addFiles(state, files, to)

export const filesSlice = createSlice({
  name: "entities/files",

  initialState,

  reducers: {
    set,
    import: set,

    createPlan: {
      reducer: (state, { payload }: PayloadAction<{ plan: PlanStateWithId; parent?: string }>) => {
        const file: PlanFileEntity = { id: payload.plan.id, type: "plan" }

        addFiles(state, [file], payload.parent)
      },
      prepare: ({ plan, parent }: { plan?: PlanState; parent?: string }) => ({
        payload: { plan: { ...plan, id: nanoid() }, parent },
      }),
    },

    createFolder: (state, { payload }: PayloadAction<string | undefined>) => {
      const count = Object.values(state.entities).filter(isFolder).length + 1
      const newFolder: FolderEntity = {
        id: nanoid(),
        type: "folder",
        name: `フォルダー${count}`,
        children: [],
      }
      addFiles(state, [newFolder], payload)
    },

    update: adapter.updateOne,

    move: (state, { payload: { id, to } }: PayloadAction<{ id: string; to?: string }>) => {
      if (isStatic(id)) return
      removeFromChildren(state, [id])

      const target = (to && state.entities[to]) || state.entities.root

      if (isDirectory(target)) {
        target.children.splice(0, 0, id)
        return
      }

      Object.values(state.entities)
        .filter(isDirectory)
        .forEach((dir) => {
          const index = dir.children.indexOf(target.id)
          if (index >= 0) dir.children.splice(index + 1, 0, id)
        })
    },

    remove: (state, { payload }: PayloadAction<string[]>) => {
      const ids = payload.filter((id) => !isStatic(id))
      adapter.removeMany(state, ids)
      removeFromChildren(state, ids)
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
