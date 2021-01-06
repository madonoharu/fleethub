import React from "react"
import styled from "@emotion/styled"

import { Container, Button } from "@material-ui/core"
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder"
import AddIcon from "@material-ui/icons/Add"

import { useFile } from "../../../hooks"

import { Flexbox, Divider } from "../../atoms"
import { SaveButton } from "../../molecules"
import { FileDropZone, FileForm } from "../../organisms"

import FolderPageItem from "./FolderPageItem"

const ListContainer = styled.div`
  margin-top: 16px;
`

type Props = {
  id: string
}

const FolderPage: React.FCX<Props> = ({ className, id }) => {
  const { file, actions, canDrop, isTemp } = useFile(id)

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
        <FileForm
          file={file}
          onNameChange={actions.setName}
          onDescriptionChange={actions.setDescription}
          onCopy={actions.copy}
          onRemove={actions.remove}
        />

        <ListContainer>
          <Flexbox>
            <Button onClick={handlePlanCreate} startIcon={<AddIcon />}>
              編成を作成
            </Button>
            <Button onClick={handleFolderCreate} startIcon={<CreateNewFolderIcon />}>
              フォルダを作成
            </Button>
            {isTemp && <SaveButton title="保存する" onClick={actions.save} />}
          </Flexbox>

          {children.map((id) => (
            <FolderPageItem key={id} id={id} parent={id} />
          ))}
        </ListContainer>
      </Container>
    </FileDropZone>
  )
}

export default styled(FolderPage)`
  height: 100%;
`
