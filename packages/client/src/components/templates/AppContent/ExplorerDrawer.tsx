import React from "react"
import styled, { css } from "styled-components"

import { Drawer } from "@material-ui/core"

import { Explorer } from "../../../components"

const appBarHeight = 32
const drawerWidth = 8 * 50

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    margin-top: ${appBarHeight}px;
    width: ${drawerWidth}px;
  }
`

const Container = styled.div<{ $open?: boolean }>`
  transition: ${({ theme }) => theme.transitions.create("margin")};

  height: calc(100vh - ${appBarHeight}px);
  overflow: scroll;

  ${(props) =>
    props.$open &&
    css`
      margin-left: ${drawerWidth}px;
    `};
`

type Props = {
  open?: boolean
}

const ExplorerDrawer: React.FC<Props> = ({ open, children }) => {
  return (
    <>
      <StyledDrawer variant="persistent" open={open}>
        <Explorer />
      </StyledDrawer>
      <Container $open={open}>{children}</Container>
    </>
  )
}

export default ExplorerDrawer
