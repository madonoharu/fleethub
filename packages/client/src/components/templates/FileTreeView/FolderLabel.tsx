import React from "react"
import styled from "styled-components"
import { Update } from "@reduxjs/toolkit"

import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import FolderIcon from "@material-ui/icons/Folder"
import AddIcon from "@material-ui/icons/Add"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { MoreVertButton, AddButton, RemoveButton, EditButton, MenuList } from "../../../components"
import { FolderEntity, filesSlice } from "../../../store"
import { usePopover } from "../../../hooks"

import FileLabel from "./FileLabel"
import FileTextField from "./FileTextField"
import { FileTreeViewProps } from "./FileTreeView"

type Props = {
  file: FolderEntity

  onFileUpdate: (update: Update<FolderEntity>) => void
  onPlanCreate: (id: string) => void
  onFolderCreate: (id: string) => void
  onCopy: (id: string) => void
  onRemove: (id: string) => void
}

const FolderLabel: React.FCX<Props> = ({
  className,
  file,
  onFileUpdate,
  onPlanCreate,
  onFolderCreate,
  onCopy,
  onRemove,
}) => {
  const Popover = usePopover()
  const [editable, setEditable] = React.useState(false)

  const handleNameChange = (name: string) => onFileUpdate({ id: file.id, changes: { name } })

  const handlePlanCreate = () => {
    onPlanCreate(file.id)
    Popover.hide()
  }

  const handleFolderCreate = () => {
    onFolderCreate(file.id)
    Popover.hide()
  }

  const handleCopy = () => {
    onCopy(file.id)
    Popover.hide()
  }

  const handleRemove = () => {
    onRemove(file.id)
  }

  const list = [
    { icon: <AddIcon />, text: "編成を作成", onClick: handlePlanCreate },
    { icon: <CreateNewFolderIcon />, text: "フォルダーを作成", onClick: handleFolderCreate },
    { icon: <FileCopyIcon />, text: "コピー", onClick: handleCopy },
    { icon: <DeleteIcon />, text: "削除", onClick: handleRemove },
  ]

  const text = editable ? (
    <FileTextField onClickAway={() => setEditable(false)} onChange={handleNameChange} fullWidth value={file.name} />
  ) : (
    file.name
  )

  return (
    <FileLabel
      className={className}
      icon={<FolderIcon />}
      text={text}
      action={
        <>
          <EditButton size="small" onClick={() => setEditable(true)} />
          <AddButton size="small" onClick={handlePlanCreate} />
          <RemoveButton size="small" onClick={handleRemove} />
          <MoreVertButton size="small" onClick={Popover.show} />
          <Popover>
            <MenuList list={list} />
          </Popover>
        </>
      }
    />
  )
}

const Memoized = React.memo(FolderLabel)

export default styled(FolderLabel)``
