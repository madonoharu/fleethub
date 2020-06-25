import React from "react"
import { isNonNullable } from "@fleethub/utils"
import { useDispatch, useSelector } from "react-redux"
import { PlanState } from "@fleethub/core"

import { Container, Paper, TextField, Button, Typography } from "@material-ui/core"
import TreeView from "@material-ui/lab/TreeView"
import TreeItem, { TreeItemProps } from "@material-ui/lab/TreeItem"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import AssessmentIcon from "@material-ui/icons/Assessment"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { CopyButton, MoreVertButton, ShareButton, AddButton, RemoveButton, Flexbox } from "../../../components"
import {
  isFolder,
  filesSelectors,
  filesSlice,
  NormalizedFile,
  NormalizedFolder,
  NormalizedPlanFile,
  FileType,
} from "../../../store"

import FolderLabel from "./FolderLabel"
import PlanFileLabel from "./PlanFileLabel"

const FileTreeView: React.FC = () => {
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

  const openFolder = (id: string) => {
    setExpanded((expanded) => (expanded.includes(id) ? expanded : [...expanded, id]))
  }

  const handlePlanCreate = (plan: PlanState = {}, parent?: string) => {
    dispatch(filesSlice.actions.createPlan({ plan, parent }))
    if (parent) openFolder(parent)
  }

  const handleFolderCreate = (parent?: string) => {
    dispatch(filesSlice.actions.createFolder(parent))
    if (parent) openFolder(parent)
  }

  const handleCreate = (type: FileType, parent?: string) => {
    if (type === "plan") dispatch(filesSlice.actions.createPlan({ plan: {}, parent }))
    else dispatch(filesSlice.actions.createFolder(parent))

    if (parent) openFolder(parent)
  }

  const renderFile = (file: NormalizedFile) => {
    const label =
      file.type === "folder" ? <FolderLabel file={file} onCreate={handleCreate} /> : <PlanFileLabel file={file} />

    return (
      <TreeItem key={file.id} nodeId={file.id} label={label}>
        {isFolder(file) ? file.children.map((id) => entities[id]).map((file) => file && renderFile(file)) : null}
      </TreeItem>
    )
  }

  return (
    <div>
      <Button onClick={() => handlePlanCreate({}, selected)} startIcon={<AddIcon />}>
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
    </div>
  )
}

export default FileTreeView
