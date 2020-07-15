import React from "react"
import styled from "styled-components"
import { useDispatch } from "react-redux"

import { Container, Button } from "@material-ui/core"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { Directory, filesSlice } from "../../../store"

import FileListItem from "./FileListItem"

type Props = {
  directory: Directory
}

const DirectoryPage: React.FC<Props> = ({ directory }) => {
  const dispatch = useDispatch()

  const handlePlanCreate = () => {
    dispatch(filesSlice.actions.createPlan({ parent: directory.id }))
  }

  const handleFolderCreate = () => {
    dispatch(filesSlice.actions.createFolder(directory.id))
  }

  return (
    <Container>
      <Button onClick={handlePlanCreate} startIcon={<AddIcon />}>
        編成を作成
      </Button>
      <Button onClick={handleFolderCreate} startIcon={<CreateNewFolderIcon />}>
        フォルダを作成
      </Button>
      {directory.children.map((id) => (
        <FileListItem key={id} id={id} parent={directory.id} />
      ))}
    </Container>
  )
}

export default DirectoryPage
