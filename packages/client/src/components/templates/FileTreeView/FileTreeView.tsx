import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import { Button } from "@material-ui/core"
import TreeView from "@material-ui/lab/TreeView"
import TreeItem from "@material-ui/lab/TreeItem"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { isDirectory, filesSlice, FileEntity, selectFilesState } from "../../../store"

import { FileDropZone } from "../../organisms"

import FolderLabel from "./FolderLabel"
import PlanFileLabel from "./PlanFileLabel"

const FileTreeView: React.FCX = ({ className }) => {
  const dispatch = useDispatch()
  const { entities, root } = useSelector(selectFilesState)

  const [expanded, setExpanded] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<string>("")

  const handleToggle = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
    setExpanded(nodeIds)
  }

  const handleSelect = (event: React.ChangeEvent<{}>, id: string) => {
    setSelected(id)
  }

  const handlePlanCreate = () => {
    dispatch(filesSlice.actions.createPlan({}))
  }

  const handleFolderCreate = () => {
    dispatch(filesSlice.actions.createFolder())
  }

  const handleRootDrop = ({ id }: FileEntity) => {
    dispatch(filesSlice.actions.move({ id, to: "root" }))
  }

  const renderFile = (id: string) => {
    const file = entities[id]
    if (!file) return null

    let label: React.ReactNode

    if (file.type === "plan") {
      label = <PlanFileLabel file={file} />
    } else if (file.type === "folder") {
      label = <FolderLabel file={file} />
    }

    const children = isDirectory(file) ? file.children.map(renderFile) : null

    return (
      <TreeItem key={file.id} nodeId={file.id} label={label}>
        {children}
      </TreeItem>
    )
  }

  return (
    <div className={className}>
      <div>
        <Button onClick={() => handlePlanCreate()} startIcon={<AddIcon />}>
          編成を作成
        </Button>
        <Button onClick={() => handleFolderCreate()} startIcon={<CreateNewFolderIcon />}>
          フォルダを作成
        </Button>
      </div>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
      >
        {root.children.map(renderFile)}
      </TreeView>
      <FileDropZone className={className} onDrop={handleRootDrop} canDrop={() => true} />
    </div>
  )
}

export default styled(FileTreeView)`
  display: flex;
  flex-direction: column;
  height: 100%;
`
