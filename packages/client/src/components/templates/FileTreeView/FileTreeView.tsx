import React from "react"
import styled from "styled-components"
import { isNonNullable } from "@fleethub/utils"
import { useDispatch, useSelector } from "react-redux"

import { Container, Button } from "@material-ui/core"
import TreeView from "@material-ui/lab/TreeView"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { isFolder, filesSelectors, filesSlice, NormalizedFile, cloneFile, removeFile } from "../../../store"

import FolderLabel from "./FolderLabel"
import PlanFileLabel from "./PlanFileLabel"
import FileTreeItem from "./FileTreeItem"

type Props = {
  onPlanSelect?: (id: string) => void
  onPlanCreate?: () => void
}

const FileTreeView: React.FCX<Props> = ({ className, onPlanSelect, onPlanCreate }) => {
  const dispatch = useDispatch()
  const entities = useSelector(filesSelectors.selectEntities)

  const rootFolder = entities.root

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

  const handlePlanCreate = (parent?: string) => {
    dispatch(filesSlice.actions.createPlan({ parent }))
    expandFolder(parent)
    onPlanCreate?.()
  }

  const handleFolderCreate = (parent?: string) => {
    dispatch(filesSlice.actions.createFolder(parent))
    expandFolder(parent)
  }

  const handleCopy = (id: string) => dispatch(cloneFile(id))

  const handleMove = (id: string, to?: string) => {
    dispatch(filesSlice.actions.move({ id, to }))
    expandFolder(to)
  }

  const handleRemove = (id: string) => dispatch(removeFile(id))

  const renderFile = (file: NormalizedFile) => {
    const label =
      file.type === "folder" ? (
        <FolderLabel
          file={file}
          onPlanCreate={handlePlanCreate}
          onFolderCreate={handleFolderCreate}
          onCopy={handleCopy}
          onRemove={handleRemove}
        />
      ) : (
        <PlanFileLabel file={file} onSelect={onPlanSelect} />
      )

    const children = isFolder(file)
      ? file.children
          .map((id) => entities[id])
          .filter(isNonNullable)
          .map(renderFile)
      : null

    return (
      <FileTreeItem file={file} key={file.id} nodeId={file.id} label={label} onMove={handleMove}>
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
