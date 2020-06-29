import React from "react"
import { Plan, getDeck4 } from "@fleethub/core"
import styled from "styled-components"

import { Link, TextField, List, ListItem, ListItemText, ListItemIcon } from "@material-ui/core"
import OpenInNew from "@material-ui/icons/OpenInNew"

import { CopyTextButton, Flexbox } from "../../../components"
import { openKctools, openDeckbuilder } from "../../../utils"

type ListItemLinkProps = {
  onClick?: () => void
  href?: string
  secondary?: React.ReactNode
}

const ListItemLink: React.FCX<ListItemLinkProps> = ({ className, href, secondary, onClick, children }) => (
  <ListItem className={className} button onClick={onClick} component={Link} href={href}>
    <ListItemIcon>
      <OpenInNew />
    </ListItemIcon>
    <ListItemText secondary={secondary}>{children}</ListItemText>
  </ListItem>
)

const StyledListItemLink = styled(ListItemLink)`
  cursor: pointer;
`

const PlanShareContent: React.FCX<{ plan: Plan }> = ({ className, plan }) => {
  const predeck = JSON.stringify(getDeck4(plan))
  return (
    <div className={className}>
      <List>
        <StyledListItemLink onClick={() => openKctools(plan)}>制空権シミュレータで開く</StyledListItemLink>
        <StyledListItemLink onClick={() => openDeckbuilder(plan)}>デッキビルダーで開く</StyledListItemLink>
      </List>
      <Flexbox>
        <TextField
          label="デッキビルダー形式"
          value={predeck}
          margin="normal"
          variant="outlined"
          InputProps={{ endAdornment: <CopyTextButton value={predeck} /> }}
        />
      </Flexbox>
    </div>
  )
}

export default styled(PlanShareContent)`
  padding: 8px;
`
