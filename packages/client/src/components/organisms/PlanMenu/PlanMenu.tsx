import React from "react"
import { getDeck4 } from "@fleethub/core"
import styled from "styled-components"

import { Link, Button } from "@material-ui/core"
import OpenInNewIcon from "@material-ui/icons/OpenInNew"
import LinkIcon from "@material-ui/icons/Link"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { openKctools, openDeckbuilder } from "../../../utils"

import { CopyTextButton } from "../../molecules"
import { PlanIcon, KctoolsIcon, Divider } from "../../atoms"
import { useAsyncOnPublish, usePlanFile } from "../../../hooks"

import TextField from "../TextField"

const StyledLink = styled(Link)``

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const StyledButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
`

type Props = {
  id: string
  onClose?: () => void
}

const PlanMenu: React.FCX<Props> = ({ className, id, onClose }) => {
  const { plan, file, actions } = usePlanFile(id)

  const { asyncOnPublish, Snackbar } = useAsyncOnPublish(id)
  const url = asyncOnPublish.result

  if (!plan || !file) return null

  const handleNameChange = (name: string) => actions.update({ name })

  const handleCopy = () => {
    actions.copy()
    onClose?.()
  }

  const handleRemove = () => {
    actions.remove()
    onClose?.()
  }

  const predeck = JSON.stringify(getDeck4(plan))

  return (
    <div className={className}>
      <TextField fullWidth startLabel={<PlanIcon />} value={file.name} onChange={handleNameChange} />

      <Divider label="Share" />
      <Column>
        <StyledButton startIcon={<FileCopyIcon />} onClick={handleCopy}>
          コピー
        </StyledButton>
        <StyledButton startIcon={<DeleteIcon />} onClick={handleRemove}>
          削除
        </StyledButton>
      </Column>

      <Divider label="Share" />
      <Column>
        <StyledButton startIcon={<LinkIcon />} onClick={asyncOnPublish.execute} disabled={asyncOnPublish.loading}>
          共有URLをクリップボードにコピー
        </StyledButton>

        {url && (
          <StyledLink href={url} noWrap>
            {url}
          </StyledLink>
        )}

        <StyledButton startIcon={<KctoolsIcon />} onClick={() => openKctools(plan)}>
          制空権シミュレーターで開く
        </StyledButton>

        <StyledButton startIcon={<OpenInNewIcon />} onClick={() => openDeckbuilder(plan)}>
          デッキビルダーで開く
        </StyledButton>

        <TextField
          label="デッキビルダー形式"
          value={predeck}
          margin="normal"
          variant="outlined"
          InputProps={{ endAdornment: <CopyTextButton value={predeck} /> }}
        />
      </Column>

      <Snackbar />
    </div>
  )
}

export default styled(PlanMenu)`
  width: 400px;
  padding: 8px;
`
