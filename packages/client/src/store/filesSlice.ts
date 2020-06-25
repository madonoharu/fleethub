import {
  createSlice,
  createEntityAdapter,
  nanoid,
  current,
  PayloadAction,
  AppThunk,
  Dictionary,
} from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"
import { PlanState } from "@fleethub/core"
import { isNonNullable } from "@fleethub/utils"
import { selectEntites } from "."

export type PlanStateWithId = PlanState & { id: string }

type FileBase<T extends string, P = {}> = {
  id: string
  type: T
} & P

export type NormalizedFolder = FileBase<"folder", { name: string; children: string[] }>

export type NormalizedPlanFile = FileBase<"plan">

export type NormalizedFile = NormalizedFolder | NormalizedPlanFile

export type FileType = NormalizedFile["type"]

const adapter = createEntityAdapter<NormalizedFile>()
export const filesSelectors = adapter.getSelectors((state: DefaultRootState) => selectEntites(state).files)

const initialRootFolder: NormalizedFolder = { id: "root", type: "folder", name: "root", children: [] }

const initialState = adapter.getInitialState({
  entities: { root: initialRootFolder },
})

type FilesState = typeof initialState

const replaceAll = <T>(array: T[], searchValue: T, replaceValue: T) => {
  const cloned = array.concat()

  cloned.forEach((item, index) => {
    if (item === searchValue) cloned[index] = replaceValue
  })

  return cloned
}

export const isFolder = (file?: NormalizedFile): file is NormalizedFolder => file?.type === "folder"

const getFolder = ({ entities }: FilesState, id?: string) => {
  const file = id ? entities[id] : undefined
  return isFolder(file) ? file : entities.root
}

const getTopFiles = (files: NormalizedFile[]) => {
  const allChildren = files.filter(isFolder).flatMap((folder) => folder.children)
  return files.filter((file) => !allChildren.includes(file.id))
}

const addChildren = (state: FilesState, parent: string, children: string[]) => {
  const parentFolder = getFolder(state, parent)
  parentFolder.children.push(...children)
}

const addFiles = (state: FilesState, files: NormalizedFile[], parent = "root") => {
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

export const filesSlice = createSlice({
  name: "files",

  initialState,

  reducers: {
    createInitialPlan: {
      reducer: (state, { payload }: PayloadAction<{ plan: PlanStateWithId; parent: string }>) => {
        const file: NormalizedPlanFile = { id: payload.plan.id, type: "plan" }
        addFiles(state, [file], payload.parent)
      },
      prepare: ({ plan, parent = "root" }: { plan?: PlanState; parent?: string }) => ({
        payload: { plan: { ...plan, id: nanoid() }, parent },
      }),
    },

    createPlan: {
      reducer: (state, { payload }: PayloadAction<{ plan: PlanStateWithId; parent?: string }>) => {
        const file: NormalizedPlanFile = { id: payload.plan.id, type: "plan" }

        addFiles(state, [file], payload.parent)
      },
      prepare: ({ plan, parent }: { plan?: PlanState; parent?: string }) => ({
        payload: { plan: { ...plan, id: nanoid() }, parent },
      }),
    },

    createFolder: (state, { payload }: PayloadAction<string | undefined>) => {
      const newFolder: NormalizedFolder = {
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

    clone: (state, action: PayloadAction<{ changes: Array<[string, string]>; to?: string }>) => {
      const { to, changes } = action.payload

      const clonedFiles = changes
        .map(([prevId, nextId]) => {
          const source = state.entities[prevId]
          if (!source) return

          return { ...current(source), id: nextId }
        })
        .filter(isNonNullable)

      const folders = clonedFiles.filter(isFolder)
      changes.forEach(([prevId, nextId]) => {
        folders.forEach((folder) => {
          folder.children = replaceAll(folder.children, prevId, nextId)
        })
      })

      addFiles(state, clonedFiles, to)
    },
  },
})

export const flatFile = (state: Dictionary<NormalizedFile>, id: string): NormalizedFile[] => {
  const file = state[id]
  if (!file) return []
  if (!isFolder(file)) return [file]

  const children = file.children.flatMap((childId) => flatFile(state, childId))
  return [file, ...children]
}

export const cloneFile = (id: string, to?: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const entities = filesSelectors.selectEntities(state)
  const changes: Array<[string, string]> = flatFile(entities, id).map((file) => [file.id, nanoid()])

  if (!to) {
    to = filesSelectors.selectAll(state).find((file) => isFolder(file) && file.children.includes(id))?.id
  }

  dispatch(filesSlice.actions.clone({ changes, to }))
}

export const removeFile = (id: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const entities = filesSelectors.selectEntities(state)
  const ids = flatFile(entities, id).map((file) => file.id)
  dispatch(filesSlice.actions.remove(ids))
}
