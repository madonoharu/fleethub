import React from "react"
import styled from "styled-components"
import { Update } from "@reduxjs/toolkit"

import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import FolderIcon from "@material-ui/icons/Folder"
import AddIcon from "@material-ui/icons/Add"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { MoreVertButton, AddButton, RemoveButton, EditButton, MenuList } from "../../../components"
import { FolderEntity, Directory } from "../../../store"
import { usePopover } from "../../../hooks"

import FileLabel, { FileLabelProps } from "./FileLabel"

type Props = {
  file: Directory

  onPlanCreate: (id: string) => void
  onFolderCreate: (id: string) => void
  onRemove: (id: string) => void
} & Pick<FileLabelProps, "onMove" | "isParentOf">

const FolderLabel: React.FCX<Props> = ({
  className,
  file,
  onPlanCreate,
  onFolderCreate,
  onRemove,
  onMove,
  isParentOf,
}) => {
  const handlePlanCreate = () => {
    onPlanCreate(file.id)
  }

  const handleFolderCreate = () => {
    onFolderCreate(file.id)
  }

  const handleRemove = () => {
    onRemove(file.id)
  }

  const text = file.type === "root" ? "一覧" : "一時フォルダ"

  return (
    <FileLabel
      className={className}
      file={file}
      onMove={onMove}
      isParentOf={isParentOf}
      icon={<FolderIcon />}
      text={file.type}
      action={
        <>
          <AddButton size="small" onClick={handlePlanCreate} />
          <RemoveButton size="small" onClick={handleRemove} />
        </>
      }
    />
  )
}

export default styled(FolderLabel)``
