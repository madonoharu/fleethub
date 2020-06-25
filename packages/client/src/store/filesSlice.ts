import {
  createSlice,
  createEntityAdapter,
  nanoid,
  current,
  PayloadAction,
  EntityState,
  AppThunk,
} from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"
import { PlanState } from "@fleethub/core"
import { isNonNullable } from "@fleethub/utils"
import { selectEntites } from "."

export type PlanStateWithId = PlanState & { id: string }

type FileBase<T extends string, P = {}> = {
  id: string
  type: T
  root?: boolean
} & P

export type NormalizedFolder = FileBase<"folder", { name: string; children: string[] }>

export type NormalizedPlanFile = FileBase<"plan">

export type NormalizedFile = NormalizedFolder | NormalizedPlanFile

export type FileType = NormalizedFile["type"]

const replaceAll = <T>(array: T[], searchValue: T, replaceValue: T) => {
  const cloned = array.concat()

  cloned.forEach((item, index) => {
    if (item === searchValue) cloned[index] = replaceValue
  })

  return cloned
}

export const isFolder = (file?: NormalizedFile): file is NormalizedFolder => file?.type === "folder"

const getFolder = (state: EntityState<NormalizedFile>, id: string) => {
  const file = state.entities[id]
  return isFolder(file) ? file : undefined
}

const getRootFiles = (files: NormalizedFile[]) => {
  const allChildren = files.filter(isFolder).flatMap((folder) => folder.children)
  return files.filter((file) => !allChildren.includes(file.id))
}

const addChildren = (state: EntityState<NormalizedFile>, parent: string, children: string[]) => {
  const parentFolder = getFolder(state, parent)
  if (parentFolder) parentFolder.children.push(...children)
}

const addFiles = (state: EntityState<NormalizedFile>, files: NormalizedFile[], parent?: string) => {
  adapter.addMany(state, files)

  if (!parent) return

  const rootFileIds = getRootFiles(files).map((file) => file.id)
  addChildren(state, parent, rootFileIds)
}

const adapter = createEntityAdapter<NormalizedFile>()
export const filesSelectors = adapter.getSelectors((state: DefaultRootState) => selectEntites(state).files)

export const filesSlice = createSlice({
  name: "files",
  initialState: adapter.getInitialState(),

  reducers: {
    createInitialPlan: {
      reducer: (state, { payload }: PayloadAction<{ plan: PlanStateWithId; parent?: string }>) => {
        const file: NormalizedPlanFile = { id: payload.plan.id, type: "plan" }
        addFiles(state, [file], payload.parent)
      },
      prepare: ({ plan, parent }: { plan?: PlanState; parent?: string }) => ({
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

    remove: (state, { payload }: PayloadAction<string[]>) => {
      adapter.removeMany(state, payload)
      Object.values(state.entities)
        .filter(isFolder)
        .forEach((folder) => {
          folder.children = folder.children.filter((child) => !payload.includes(child))
        })
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

const flatFile = (state: DefaultRootState, id: string): NormalizedFile[] => {
  const file = filesSelectors.selectById(state, id)
  if (!file) return []
  if (!isFolder(file)) return [file]

  const children = file.children.flatMap((childId) => flatFile(state, childId))
  return [file, ...children]
}

export const cloneFile = (id: string, to?: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const changes: Array<[string, string]> = flatFile(state, id).map((file) => [file.id, nanoid()])

  if (!to) {
    to = filesSelectors.selectAll(state).find((file) => isFolder(file) && file.children.includes(id))?.id
  }

  dispatch(filesSlice.actions.clone({ changes, to }))
}

export const removeFile = (id: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const ids = flatFile(state, id).map((file) => file.id)
  dispatch(filesSlice.actions.remove(ids))
}
