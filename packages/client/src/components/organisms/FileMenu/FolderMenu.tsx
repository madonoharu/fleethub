import React from "react"
import styled from "styled-components"

import { Button, Link } from "@material-ui/core"
import LinkIcon from "@material-ui/icons/Link"

import { useAsyncOnPublish } from "../../../hooks"

import { Divider } from "../../atoms"

import ColumnContainer from "./ColumnContainer"

const StyledDivider = styled(Divider)`
  margin-top: 8px;
`

const StyledButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
`

type Props = {
  id: string
  onClose?: () => void
}

const FolderMenu: React.FCX<Props> = ({ className, id }) => {
  const { asyncOnPublish, Snackbar } = useAsyncOnPublish(id)

  const url = asyncOnPublish.result

  return (
    <div className={className}>
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

export default FolderMenu
