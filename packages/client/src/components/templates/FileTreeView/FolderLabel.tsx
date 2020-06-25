import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import { Paper, TextField, Button, Typography } from "@material-ui/core"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import FolderIcon from "@material-ui/icons/Folder"
import AddIcon from "@material-ui/icons/Add"
import DeleteIcon from "@material-ui/icons/Delete"

import {
  MoreVertButton,
  ShareButton,
  AddButton,
  RemoveButton,
  CopyButton,
  Flexbox,
  MenuList,
} from "../../../components"
import { NormalizedFolder, FileType, cloneFile, removeFile } from "../../../store"
import { withIconButton } from "../../molecules"
import { usePopover } from "../../../hooks"

const CreateNewFolderButton = withIconButton(CreateNewFolderIcon)

type Props = {
  file: NormalizedFolder
  onCreate: (type: FileType, parent: string) => void
}

const FolderLabel: React.FCX<Props> = ({ className, file, onCreate }) => {
  const Popover = usePopover()

  const dispatch = useDispatch()

  const handleFolderCreate = (event: React.MouseEvent) => {
    event.preventDefault()
    onCreate("folder", file.id)
  }

  const handleCopy = (event: React.MouseEvent) => {
    event.preventDefault()
    dispatch(cloneFile(file.id))
  }

  const handleRemove = (event: React.MouseEvent) => {
    event.preventDefault()
    dispatch(removeFile(file.id))
  }

  const list = [
    { icon: <AddIcon />, text: "編成を作成" },
    { icon: <CreateNewFolderIcon />, text: "フォルダーを作成" },
    { icon: <DeleteIcon />, text: "削除" },
  ]

  return (
    <Flexbox className={className}>
      <FolderIcon />
      <Typography>{file.name}</Typography>
      <div style={{ marginLeft: "auto" }}>
        <AddButton size="small" />
        <CreateNewFolderButton size="small" onClick={handleFolderCreate} />
        <CopyButton size="small" onClick={handleCopy} />
        <RemoveButton size="small" onClick={handleRemove} />
        <MoreVertButton size="small" onClick={Popover.show} />
      </div>
      <Popover>
        <MenuList list={list} />
      </Popover>
    </Flexbox>
  )
}

export default styled(FolderLabel)``
