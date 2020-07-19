import React from "react"
import styled from "styled-components"
import { useDispatch } from "react-redux"

import { Container, Button } from "@material-ui/core"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { filesSlice, FolderEntity } from "../../../store"

import FileListItem from "./FileListItem"
import { TextField } from "../../atoms"

type Props = {
  folder: FolderEntity
}

const FolderPage: React.FC<Props> = ({ folder }) => {
  const dispatch = useDispatch()

  const handlePlanCreate = () => {
    dispatch(filesSlice.actions.createPlan({ to: folder.id }))
  }

  const handleFolderCreate = () => {
    dispatch(filesSlice.actions.createFolder(folder.id))
  }

  const handleNameChange = (name: string) => {
    dispatch(filesSlice.actions.update({ id: folder.id, changes: { name } }))
  }

  return (
    <Container>
      <TextField value={folder.name} onChange={(event) => handleNameChange(event.currentTarget.value)} />
      <Button onClick={handlePlanCreate} startIcon={<AddIcon />}>
        編成を作成
      </Button>
      <Button onClick={handleFolderCreate} startIcon={<CreateNewFolderIcon />}>
        フォルダを作成
      </Button>
      {folder.children.map((id) => (
        <FileListItem key={id} id={id} parent={folder.id} />
      ))}
    </Container>
  )
}

export default FolderPage
