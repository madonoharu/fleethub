import React from "react"
import { Plan } from "@fleethub/core"
import styled from "styled-components"

import { Link, TextField, List, ListItem, ListItemText, ListItemIcon } from "@material-ui/core"

import { uiSlice, plansSelectors, filesSlice, openFirstPlan } from "../../../store"
import { CopyTextButton } from "../../../components"
import { getDeck4 } from "../../../utils"

type ListItemLinkProps = {
  href?: string
  secondary?: React.ReactNode
}

const ListItemLink: React.FC<ListItemLinkProps> = ({ href, secondary, children }) => (
  <ListItem component={Link} href={href}>
    <ListItemText secondary={secondary}>{children}</ListItemText>
  </ListItem>
)

const DeckContainer = styled.div`
  display: flex;
  align-items: flex-end;
`

const PlanShareContent: React.FCX<{ plan: Plan }> = ({ className, plan }) => {
  const predeck = JSON.stringify(getDeck4(plan))
  return (
    <div className={className}>
      <List>
        <ListItemLink href={`https://noro6.github.io/kcTools/?predeck=${predeck}`}>
          制空権シミュレータで開く
        </ListItemLink>
        <ListItemLink href={`http://kancolle-calc.net/deckbuilder.html?predeck=${predeck}`}>
          デッキビルダーで開く
        </ListItemLink>
      </List>
      <DeckContainer>
        <TextField label="デッキビルダー形式" multiline rows="8" value={predeck} margin="normal" variant="outlined" />
        <CopyTextButton value={predeck} />
      </DeckContainer>
    </div>
  )
}

export default styled(PlanShareContent)`
  padding: 8px;
`
