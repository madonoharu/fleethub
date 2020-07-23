import React, { useMemo } from "react"
import { Plan, getDeck4 } from "@fleethub/core"
import styled from "styled-components"

import { Link, List, ListItem, ListItemText, Button } from "@material-ui/core"
import LinkIcon from "@material-ui/icons/Link"

import { openKctools, openDeckbuilder } from "../../../utils"

import { CopyTextButton } from "../../molecules"
import { Flexbox, PlanIcon } from "../../atoms"
import { useFhSystem, usePublishFile, useAsyncOnPublish } from "../../../hooks"

import TextField from "../TextField"
import { useSelector } from "react-redux"
import { plansSelectors } from "../../../store"

const StyledLink = styled(Link)`
  max-width: 320px;
`

const usePlan = (id: string) => {
  const { createPlan } = useFhSystem()
  const state = useSelector((state) => plansSelectors.selectById(state, id))
  const plan = useMemo(() => state && createPlan(state), [createPlan, state])

  return { plan }
}

type Props = {
  id: string
}

const PlanMenu: React.FCX<Props> = ({ className, id }) => {
  const { plan } = usePlan(id)

  const { asyncOnPublish, Snackbar } = useAsyncOnPublish(id)
  const url = asyncOnPublish.result

  if (!plan) return null

  const predeck = JSON.stringify(getDeck4(plan))

  return (
    <div className={className}>
      <TextField startLabel={<PlanIcon />} value={plan.name} />

      <Flexbox>
        <Button startIcon={<LinkIcon />} onClick={asyncOnPublish.execute} disabled={asyncOnPublish.loading}>
          共有URLをコピー
        </Button>
        {url && (
          <StyledLink href={url} noWrap>
            {url}
          </StyledLink>
        )}
      </Flexbox>

      <Flexbox>
        <TextField
          label="デッキビルダー形式"
          value={predeck}
          margin="normal"
          variant="outlined"
          InputProps={{ endAdornment: <CopyTextButton value={predeck} /> }}
        />
      </Flexbox>

      <Snackbar />
    </div>
  )
}

export default styled(PlanMenu)`
  padding: 8px;
`
