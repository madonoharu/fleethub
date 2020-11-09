import React from "react"
import { getDeck4 } from "@fleethub/core"
import styled from "@emotion/styled"

import { Link, Button } from "@material-ui/core"
import OpenInNewIcon from "@material-ui/icons/OpenInNew"
import LinkIcon from "@material-ui/icons/Link"

import { openKctools, openDeckbuilder } from "../../../utils"
import { useAsyncOnPublish, useFhPlan } from "../../../hooks"

import { CopyTextButton, TextField } from "../../molecules"
import { KctoolsIcon, Divider } from "../../atoms"

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
}

const PlanMenu: React.FCX<Props> = ({ className, id }) => {
  const plan = useFhPlan(id)

  const { asyncOnPublish, Snackbar } = useAsyncOnPublish(id)
  const url = asyncOnPublish.result

  if (!plan) return null

  const predeck = JSON.stringify(getDeck4(plan))

  return (
    <div className={className}>
      <StyledDivider label="Share" />
      <ColumnContainer>
        <StyledButton startIcon={<LinkIcon />} onClick={asyncOnPublish.execute} disabled={asyncOnPublish.loading}>
          共有URLをクリップボードにコピー
        </StyledButton>

        {url && (
          <Link href={url} noWrap>
            {url}
          </Link>
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
      </ColumnContainer>

      <Snackbar />
    </div>
  )
}

export default PlanMenu
