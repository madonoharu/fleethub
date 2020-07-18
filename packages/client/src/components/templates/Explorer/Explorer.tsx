import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import { filesSlice, removeFile, copyFile, appSlice, selectFilesState } from "../../../store"
import { FileTreeView, FileTreeViewProps } from "../../../components"

type Props = {}

const Explorer: React.FCX<Props> = ({ className }) => {
  const dispatch = useDispatch()
  const filesState = useSelector(selectFilesState)

  const handleFileOpen = (id: string) => {
    dispatch(appSlice.actions.openFile(id))
  }

  const handleFileUpdate: FileTreeViewProps["onFileUpdate"] = (payload) => {
    dispatch(filesSlice.actions.update(payload))
  }

  const handlePlanCreate: FileTreeViewProps["onPlanCreate"] = (payload) => {
    dispatch(filesSlice.actions.createPlan(payload))
  }

  const handleFolderCreate: FileTreeViewProps["onFolderCreate"] = (parent) => {
    dispatch(filesSlice.actions.createFolder(parent))
  }

  const handleCopy: FileTreeViewProps["onCopy"] = (id) => dispatch(copyFile(id))

  const handleMove: FileTreeViewProps["onMove"] = (payload) => {
    dispatch(filesSlice.actions.move(payload))
  }

  const handleRemove = (id: string) => dispatch(removeFile(id))

  return (
    <FileTreeView
      state={filesState}
      onFileOpen={handleFileOpen}
      onFileUpdate={handleFileUpdate}
      onPlanCreate={handlePlanCreate}
      onFolderCreate={handleFolderCreate}
      onCopy={handleCopy}
      onMove={handleMove}
      onRemove={handleRemove}
    />
  )
}

export default Explorer
