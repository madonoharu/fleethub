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

import { selectEntites } from "./selectEntites"

export type PlanStateWithId = PlanState & { id: string }

type FileBase<T extends string, P = {}> = {
  id: string
  type: T
} & P

export type FolderEntity = FileBase<"folder", { name: string; children: string[] }>

export type PlanFileEntity = FileBase<"plan">

export type FileEntity = FolderEntity | PlanFileEntity

export type FileType = FileEntity["type"]

export type FhEntities = {
  entry: string
  files: FileEntity[]
  plans?: PlanStateWithId[]
  to?: string
}

const adapter = createEntityAdapter<FileEntity>()
export const filesSelectors: EntitySelectors<FileEntity, DefaultRootState> = adapter.getSelectors(
  (state) => selectEntites(state).files
)

const initialRootFolder: FolderEntity = { id: "root", type: "folder", name: "root", children: [] }

const initialState = adapter.getInitialState({
  entities: { root: initialRootFolder },
})

type FilesState = typeof initialState

export const isFolder = (file?: FileEntity): file is FolderEntity => file?.type === "folder"

const getFolder = ({ entities }: FilesState, id?: string) => {
  const file = id ? entities[id] : undefined
  return isFolder(file) ? file : entities.root
}

const getTopFiles = (files: FileEntity[]) => {
  const allChildren = files.filter(isFolder).flatMap((folder) => folder.children)
  return files.filter((file) => !allChildren.includes(file.id))
}

const addChildren = (state: FilesState, parent: string, children: string[]) => {
  const parentFolder = getFolder(state, parent)
  parentFolder.children.push(...children)
}

const addFiles = (state: FilesState, files: FileEntity[], parent = "root") => {
  adapter.addMany(state, files)

  const topFileIds = getTopFiles(files).map((file) => file.id)
  addChildren(state, parent, topFileIds)
}

const removeFromChildren = (state: FilesState, ids: string[]) => {
  Object.values(state.entities)
    .filter(isFolder)
    .forEach((folder) => {
      folder.children = folder.children.filter((child) => !ids.includes(child))
    })
}

const set = (state: FilesState, { payload: { files, to } }: PayloadAction<FhEntities>) => addFiles(state, files, to)

export const filesSlice = createSlice({
  name: "files",

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
      const newFolder: FolderEntity = {
        id: nanoid(),
        type: "folder",
        name: `新しいフォルダー${state.ids.length}`,
        children: [],
      }
      addFiles(state, [newFolder], payload)
    },

    update: adapter.updateOne,

    move: (state, { payload: { id, to } }: PayloadAction<{ id: string; to?: string }>) => {
      removeFromChildren(state, [id])

      const target = (to && state.entities[to]) || state.entities.root

      if (isFolder(target)) {
        target.children.splice(0, 0, id)
        return
      }

      Object.values(state.entities)
        .filter(isFolder)
        .forEach((folder) => {
          const index = folder.children.indexOf(target.id)
          if (index >= 0) folder.children.splice(index + 1, 0, id)
        })
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
  if (!isFolder(file)) return [file]
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
