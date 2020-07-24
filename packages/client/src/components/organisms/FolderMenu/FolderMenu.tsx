import React from "react"
import styled from "styled-components"

import { Button, Link } from "@material-ui/core"
import LinkIcon from "@material-ui/icons/Link"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { useFile, useAsyncOnPublish } from "../../../hooks"

import { FolderIcon, Divider } from "../../atoms"

import TextField from "../TextField"
import FileForm from "../FileForm"

const StyledDivider = styled(Divider)`
  margin-top: 8px;
`

const StyledButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
`

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  > * {
    width: 100%;
  }
`

type Props = {
  id: string
  onClose?: () => void
}

const FolderMenu: React.FCX<Props> = ({ className, id, onClose }) => {
  const { file, actions } = useFile(id)

  const { asyncOnPublish, Snackbar } = useAsyncOnPublish(id)

  if (file?.type !== "folder") return null

  const handleCopy = () => {
    actions.copy()
    onClose?.()
  }

  const handleRemove = () => {
    actions.remove()
    onClose?.()
  }

  const url = asyncOnPublish.result

  return (
    <div className={className}>
      <FileForm
        file={file}
        onCopy={handleCopy}
        onRemove={handleRemove}
        onNameChange={actions.setName}
        onDescriptionChange={actions.setDescription}
      />

      <StyledDivider label="Share" />
      <ColumnContainer>
        <StyledButton startIcon={<LinkIcon />} onClick={asyncOnPublish.execute} disabled={asyncOnPublish.loading}>
          共有URLをクリップボードにコピーする
        </StyledButton>
        {url && (
          <Link href={url} noWrap>
            {url}
          </Link>
        )}
      </ColumnContainer>

      <Snackbar />
    </div>
  )
}

export default styled(FolderMenu)`
  min-height: 400px;
  width: 400px;
  padding: 8px;
`
