import React from "react"
import styled from "styled-components"
import { isNonNullable } from "@fleethub/utils"
import { useDispatch, useSelector } from "react-redux"
import { PlanState } from "@fleethub/core"

import { Container, Paper, TextField, Button, Typography } from "@material-ui/core"
import TreeView from "@material-ui/lab/TreeView"
import TreeItem from "@material-ui/lab/TreeItem"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { Flexbox } from "../../../components"
import { isFolder, filesSelectors, filesSlice, NormalizedFile, cloneFile, removeFile } from "../../../store"

import FolderLabel from "./FolderLabel"
import PlanFileLabel from "./PlanFileLabel"

type Props = {
  onPlanSelect?: (id: string) => void
  onPlanCreate?: () => void
}

const FileTreeView: React.FCX<Props> = ({ className, onPlanSelect, onPlanCreate }) => {
  const dispatch = useDispatch()

  const entities = useSelector(filesSelectors.selectEntities)
  const allFiles = Object.values(entities).filter(isNonNullable)

  const allChildren = allFiles.filter(isFolder).flatMap((folder) => folder.children)
  const root = allFiles.filter((file) => !allChildren.includes(file.id))

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

    return (
      <TreeItem key={file.id} nodeId={file.id} label={label}>
        {isFolder(file) ? file.children.map((id) => entities[id]).map((file) => file && renderFile(file)) : null}
      </TreeItem>
    )
  }

  return (
    <Container className={className}>
      <Button onClick={() => handlePlanCreate(selected)} startIcon={<AddIcon />}>
        編成を作成
      </Button>
      <Button onClick={() => handleFolderCreate(selected)} startIcon={<CreateNewFolderIcon />}>
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
        {root.map(renderFile)}
      </TreeView>
    </Container>
  )
}

export default styled(FileTreeView)`
  width: 640px;
  height: 80vh;
`
