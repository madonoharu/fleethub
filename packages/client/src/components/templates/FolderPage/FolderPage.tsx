import React from "react"
import styled from "styled-components"
import { useDispatch } from "react-redux"

import { Container, Button } from "@material-ui/core"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { filesSlice, FolderEntity } from "../../../store"
import { useFile } from "../../../hooks"

import { TextField } from "../../atoms"
import { FileDropZone } from "../../organisms"

import FolderPageItem from "./FolderPageItem"

type Props = {
  folder: FolderEntity
}

const FolderPage: React.FCX<Props> = ({ className, folder }) => {
  const dispatch = useDispatch()

  const { actions, canDrop } = useFile(folder.id)

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
    <FileDropZone className={className} onDrop={actions.drop} canDrop={canDrop}>
      <Container>
        <TextField value={folder.name} onChange={(event) => handleNameChange(event.currentTarget.value)} />
        <Button onClick={handlePlanCreate} startIcon={<AddIcon />}>
          編成を作成
        </Button>
        <Button onClick={handleFolderCreate} startIcon={<CreateNewFolderIcon />}>
          フォルダを作成
        </Button>
        {folder.children.map((id) => (
          <FolderPageItem key={id} id={id} parent={folder.id} />
        ))}
      </Container>
    </FileDropZone>
  )
}

export default styled(FolderPage)`
  height: 100%;
`
