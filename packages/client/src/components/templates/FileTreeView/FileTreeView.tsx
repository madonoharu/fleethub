import React from "react"
import styled from "styled-components"
import { isNonNullable } from "@fleethub/utils"
import { Update, Dictionary } from "@reduxjs/toolkit"

import { Container, Button } from "@material-ui/core"
import TreeView from "@material-ui/lab/TreeView"
import TreeItem from "@material-ui/lab/TreeItem"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { isDirectory, filesSlice, flatFile, FileEntity } from "../../../store"

import FolderLabel from "./FolderLabel"
import PlanFileLabel from "./PlanFileLabel"
import DirectoryLabel from "./DirectoryLabel"

export type FileTreeViewProps = {
  entities: Dictionary<FileEntity>
  onFileUpdate?: (update: Update<FileEntity>) => void
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
  const [expanded, setExpanded] = React.useState<string[]>(["root", "temp"])
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

  const renderFile = (file: FileEntity) => {
    const isParentOf = (dragFile: FileEntity) => flatFile(entities, file.id).includes(dragFile)

    let label: React.ReactNode

    const propsBase = { isParentOf, onMove: handleMove, onRemove: handleRemove }

    if (file.type === "plan") {
      label = <PlanFileLabel file={file} onSelect={onPlanSelect} onCopy={handleCopy} {...propsBase} />
    } else if (file.type === "folder") {
      label = (
        <FolderLabel
          file={file}
          onFileUpdate={(arg) => onFileUpdate?.(arg)}
          onPlanCreate={handlePlanCreate}
          onFolderCreate={handleFolderCreate}
          onCopy={handleCopy}
          {...propsBase}
        />
      )
    } else {
      label = (
        <DirectoryLabel
          file={file}
          onPlanCreate={handlePlanCreate}
          onFolderCreate={handleFolderCreate}
          {...propsBase}
        />
      )
    }

    const children = isDirectory(file)
      ? file.children
          .map((id) => entities[id])
          .filter(isNonNullable)
          .map(renderFile)
      : null

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
        {isDirectory(entities.root) && renderFile(entities.root)}
        {isDirectory(entities.temp) && renderFile(entities.temp)}
      </TreeView>
    </Container>
  )
}

export default styled(FileTreeView)`
  height: 80vh;
`
