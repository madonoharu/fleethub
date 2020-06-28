import React from "react"
import styled from "styled-components"
import { isNonNullable } from "@fleethub/utils"
import { Update } from "@reduxjs/toolkit"

import { Container, Button } from "@material-ui/core"
import TreeView from "@material-ui/lab/TreeView"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { isFolder, filesSlice, flatFile, NormalizedFile } from "../../../store"

import FolderLabel from "./FolderLabel"
import PlanFileLabel from "./PlanFileLabel"
import FileTreeItem from "./FileTreeItem"
import { Dictionary } from "@reduxjs/toolkit"

export type FileTreeViewProps = {
  entities: Dictionary<NormalizedFile>
  onFileUpdate?: (update: Update<NormalizedFile>) => void
  onPlanSelect?: (id: string) => void
  onPlanCreate?: (...args: Parameters<typeof filesSlice.actions.createPlan>) => void
  onFolderCreate?: (...args: Parameters<typeof filesSlice.actions.createFolder>) => void
  onCopy?: (id: string) => void
  onRemove?: (id: string) => void
  onMove?: (...args: Parameters<typeof filesSlice.actions.move>) => void
}
const FileTreeView: React.FCX<FileTreeViewProps> = ({
  className,
  entities,
  onFileUpdate,
  onPlanSelect,
  onPlanCreate,
  onFolderCreate,
  onCopy,
  onRemove,
  onMove,
}) => {
  const [expanded, setExpanded] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<string>("")

  const rootFolder = entities.root

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

  const handlePlanCreate = (parent?: string) => {
    onPlanCreate?.({ parent })
    expandFolder(parent)
  }

  const handleFolderCreate = (parent?: string) => {
    onFolderCreate?.(parent)
    expandFolder(parent)
  }

  const handleCopy = (id: string) => onCopy?.(id)

  const handleMove = (id: string, to?: string) => {
    onMove?.({ id, to })
    expandFolder(to)
  }

  const handleRemove = (id: string) => onRemove?.(id)

  const renderFile = (file: NormalizedFile) => {
    const label =
      file.type === "folder" ? (
        <FolderLabel
          file={file}
          onFileUpdate={(arg) => onFileUpdate?.(arg)}
          onPlanCreate={handlePlanCreate}
          onFolderCreate={handleFolderCreate}
          onCopy={handleCopy}
          onRemove={handleRemove}
        />
      ) : (
        <PlanFileLabel file={file} onSelect={onPlanSelect} onCopy={handleCopy} onRemove={handleRemove} />
      )

    const children = isFolder(file)
      ? file.children
          .map((id) => entities[id])
          .filter(isNonNullable)
          .map(renderFile)
      : null

    const isParentOf = (dragFile: NormalizedFile) => flatFile(entities, file.id).includes(dragFile)

    return (
      <FileTreeItem
        file={file}
        key={file.id}
        nodeId={file.id}
        label={label}
        onMove={handleMove}
        isParentOf={isParentOf}
      >
        {children}
      </FileTreeItem>
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
        {isFolder(rootFolder)
          ? rootFolder.children
              .map((id) => entities[id])
              .filter(isNonNullable)
              .map(renderFile)
          : null}
      </TreeView>
    </Container>
  )
}

export default styled(FileTreeView)`
  width: 640px;
  height: 80vh;
`
