import React from "react"
import styled from "styled-components"
import { Update } from "@reduxjs/toolkit"

import { Container, Button } from "@material-ui/core"
import TreeView from "@material-ui/lab/TreeView"
import TreeItem from "@material-ui/lab/TreeItem"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { isDirectory, filesSlice, flatFile, FileEntity, FilesState } from "../../../store"

import FolderLabel from "./FolderLabel"
import PlanFileLabel from "./PlanFileLabel"

export type FileTreeViewProps = {
  state: FilesState
  onFileOpen?: (id: string) => void
  onFileUpdate?: (update: Update<FileEntity>) => void
  onPlanCreate?: (...args: Parameters<typeof filesSlice.actions.createPlan>) => void
  onFolderCreate?: (...args: Parameters<typeof filesSlice.actions.createFolder>) => void
  onCopy?: (id: string) => void
  onRemove?: (id: string) => void
  onMove?: (...args: Parameters<typeof filesSlice.actions.move>) => void
}
const FileTreeView: React.FCX<FileTreeViewProps> = ({
  className,
  state,
  onFileOpen,
  onFileUpdate,
  onPlanCreate,
  onFolderCreate,
  onCopy,
  onRemove,
  onMove,
}) => {
  const { entities, rootIds } = state
  const [expanded, setExpanded] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<string>("")

  const handleToggle = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
    setExpanded(nodeIds)
  }

  const handleSelect = (event: React.ChangeEvent<{}>, id: string) => {
    setSelected(id)
  }

  const expandFolder = (id?: string) => {
    if (!id) return
    setExpanded((expanded) => (expanded.includes(id) ? expanded : [...expanded, id]))
  }

  const handlePlanCreate = (to?: string) => {
    onPlanCreate?.({ to })
    expandFolder(to)
  }

  const handleFolderCreate = (to?: string) => {
    onFolderCreate?.(to)
    expandFolder(to)
  }

  const handleCopy = (id: string) => onCopy?.(id)

  const handleMove = (id: string, to?: string) => {
    onMove?.({ id, to })
    expandFolder(to)
  }

  const handleRemove = (id: string) => onRemove?.(id)

  const renderFile = (id: string) => {
    const file = entities[id]
    if (!file) return null

    const isParentOf = (dragFile: FileEntity) => flatFile(entities, file.id).includes(dragFile)

    let label: React.ReactNode

    const baseProps = {
      isParentOf,
      onOpen: (id: string) => onFileOpen?.(id),
      onCopy: handleCopy,
      onMove: handleMove,
      onRemove: handleRemove,
    }

    if (file.type === "plan") {
      label = <PlanFileLabel file={file} {...baseProps} />
    } else if (file.type === "folder") {
      label = (
        <FolderLabel
          file={file}
          onFileUpdate={(arg) => onFileUpdate?.(arg)}
          onPlanCreate={handlePlanCreate}
          onFolderCreate={handleFolderCreate}
          {...baseProps}
        />
      )
    }

    const children = isDirectory(file) ? file.children.map(renderFile) : null

    return (
      <TreeItem key={file.id} nodeId={file.id} label={label}>
        {children}
      </TreeItem>
    )
  }

  return (
    <Container className={className}>
      <Button onClick={() => handlePlanCreate()} startIcon={<AddIcon />}>
        編成を作成
      </Button>
      <Button onClick={() => handleFolderCreate()} startIcon={<CreateNewFolderIcon />}>
        フォルダを作成
      </Button>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
      >
        {rootIds.map(renderFile)}
      </TreeView>
    </Container>
  )
}

export default FileTreeView
