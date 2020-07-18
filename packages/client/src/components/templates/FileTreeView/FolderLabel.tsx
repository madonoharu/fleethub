import React from "react"
import styled from "styled-components"
import { Update } from "@reduxjs/toolkit"

import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import FolderIcon from "@material-ui/icons/Folder"
import AddIcon from "@material-ui/icons/Add"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { MoreVertButton, AddButton, RemoveButton, EditButton, MenuList } from "../../../components"
import { FolderEntity } from "../../../store"
import { usePopover } from "../../../hooks"

import FileLabel, { FileLabelProps } from "./FileLabel"

type Props = {
  file: FolderEntity

  onOpen: (id: string) => void
  onFileUpdate: (update: Update<FolderEntity>) => void
  onPlanCreate: (id: string) => void
  onFolderCreate: (id: string) => void
  onCopy: (id: string) => void
  onRemove: (id: string) => void
} & Pick<FileLabelProps, "onMove" | "isParentOf">

const FolderLabel: React.FCX<Props> = ({
  className,
  file,
  onOpen,
  onPlanCreate,
  onFolderCreate,
  onCopy,
  onRemove,
  onMove,
  isParentOf,
}) => {
  const Popover = usePopover()

  const handleOpen = () => {
    onOpen(file.id)
  }

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
    { icon: <CreateNewFolderIcon />, text: "フォルダを作成", onClick: handleFolderCreate },
    { icon: <FileCopyIcon />, text: "コピー", onClick: handleCopy },
    { icon: <DeleteIcon />, text: "削除", onClick: handleRemove },
  ]

  return (
    <FileLabel
      className={className}
      file={file}
      isParentOf={isParentOf}
      onMove={onMove}
      icon={<FolderIcon />}
      text={file.name}
      action={
        <>
          <EditButton size="small" onClick={handleOpen} />
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

export default styled(FolderLabel)``
