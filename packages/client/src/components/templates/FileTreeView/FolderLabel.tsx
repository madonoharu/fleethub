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
import { usePopover, useFile } from "../../../hooks"

import FileLabel from "./FileLabel"

type Props = {
  file: FolderEntity
}

const FolderLabel: React.FCX<Props> = ({ className, file }) => {
  const Popover = usePopover()

  const { actions, canDrop } = useFile(file.id)

  const list = [
    { icon: <AddIcon />, text: "編成を作成", onClick: actions.createPlan },
    { icon: <CreateNewFolderIcon />, text: "フォルダを作成", onClick: actions.createFolder },
    { icon: <FileCopyIcon />, text: "コピー", onClick: actions.copy },
    { icon: <DeleteIcon />, text: "削除", onClick: actions.remove },
  ]

  return (
    <FileLabel
      className={className}
      file={file}
      icon={<FolderIcon />}
      text={file.name}
      canDrop={canDrop}
      onDrop={actions.drop}
      action={
        <>
          <EditButton size="small" onClick={actions.open} />
          <RemoveButton size="small" onClick={actions.remove} />
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
