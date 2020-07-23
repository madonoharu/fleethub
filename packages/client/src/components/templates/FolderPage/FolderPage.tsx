import React from "react"
import styled from "styled-components"

import { Container, Button } from "@material-ui/core"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { useFile } from "../../../hooks"

import { FolderIcon } from "../../atoms"
import { FileDropZone, TextField } from "../../organisms"

import FolderPageItem from "./FolderPageItem"

type Props = {
  id: string
}

const FolderPage: React.FCX<Props> = ({ className, id }) => {
  const { file, actions, canDrop } = useFile(id)

  if (file?.type !== "folder") return null

  const { name, children } = file

  const handlePlanCreate = () => {
    actions.createPlan()
  }

  const handleFolderCreate = () => {
    actions.createFolder()
  }

  const handleNameChange = (name: string) => {
    actions.update({ name })
  }

  return (
    <FileDropZone className={className} onDrop={actions.drop} canDrop={canDrop}>
      <Container>
        <TextField placeholder="name" startLabel={<FolderIcon />} value={name} onChange={handleNameChange} />
        <Button onClick={handlePlanCreate} startIcon={<AddIcon />}>
          編成を作成
        </Button>
        <Button onClick={handleFolderCreate} startIcon={<CreateNewFolderIcon />}>
          フォルダを作成
        </Button>
        {children.map((id) => (
          <FolderPageItem key={id} id={id} parent={id} />
        ))}
      </Container>
    </FileDropZone>
  )
}

export default styled(FolderPage)`
  height: 100%;
`
