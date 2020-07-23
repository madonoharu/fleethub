import React from "react"
import styled from "styled-components"

import { Button, Link } from "@material-ui/core"
import LinkIcon from "@material-ui/icons/Link"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { MenuList, MenuItemProps } from "../../../components"
import { useFile, useAsyncOnPublish } from "../../../hooks"

import { FolderIcon } from "../../atoms"

import TextField from "../TextField"

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

  const handleNameChange = (name: string) => {
    actions.update({ name })
  }

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
      <TextField placeholder="name" startLabel={<FolderIcon />} value={file.name} onChange={handleNameChange} />
      <ColumnContainer>
        <StyledButton startIcon={<LinkIcon />} onClick={asyncOnPublish.execute} disabled={asyncOnPublish.loading}>
          共有URLをクリップボードにコピーする
        </StyledButton>
        {url && (
          <Link href={url} noWrap>
            {url}
          </Link>
        )}
        <StyledButton startIcon={<FileCopyIcon />} onClick={handleCopy}>
          フォルダーをコピーする
        </StyledButton>
        <StyledButton startIcon={<DeleteIcon />} onClick={handleRemove}>
          フォルダーを削除する
        </StyledButton>
      </ColumnContainer>

      <Snackbar />
    </div>
  )
}

export default styled(FolderMenu)`
  width: 400px;
`
