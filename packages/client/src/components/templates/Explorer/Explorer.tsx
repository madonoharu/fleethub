import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import { Container } from "@material-ui/core"

import { filesSelectors, filesSlice, removeFile, copyFile } from "../../../store"
import { FileTreeView, FileTreeViewProps } from "../../../components"

type Props = {
  onPlanSelect?: (id: string) => void
  onPlanCreate?: () => void
}

const Explorer: React.FCX<Props> = ({ className, onPlanSelect, onPlanCreate }) => {
  const dispatch = useDispatch()
  const fileEntities = useSelector(filesSelectors.selectEntities)

  const handleFileUpdate: FileTreeViewProps["onFileUpdate"] = (payload) => {
    dispatch(filesSlice.actions.update(payload))
  }

  const handlePlanCreate: FileTreeViewProps["onPlanCreate"] = (payload) => {
    dispatch(filesSlice.actions.createPlan(payload))
    onPlanCreate?.()
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
    <Container className={className}>
      <FileTreeView
        entities={fileEntities}
        onFileUpdate={handleFileUpdate}
        onPlanSelect={onPlanSelect}
        onPlanCreate={handlePlanCreate}
        onFolderCreate={handleFolderCreate}
        onCopy={handleCopy}
        onMove={handleMove}
        onRemove={handleRemove}
      />
    </Container>
  )
}

export default styled(Explorer)`
  width: 640px;
  height: 80vh;
`
