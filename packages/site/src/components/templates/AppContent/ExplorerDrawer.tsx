import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Drawer } from "@mui/material";
import React from "react";

import Explorer from "../Explorer";

const appBarHeight = 40;
const drawerWidth = 8 * 40;

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    margin-top: ${appBarHeight}px;
    width: ${drawerWidth}px;
    height: calc(100% - ${appBarHeight}px);
  }
`;

const Container = styled.div<{ $open?: boolean }>(
  ({ theme, $open }) => css`
    transition: ${theme.transitions.create("margin")};

    height: calc(100vh - ${appBarHeight}px) !important;
    overflow: scroll;

    ${$open &&
    css`
      margin-left: ${drawerWidth}px;
    `};
  `
);

type Props = {
  open?: boolean;
  children: React.ReactNode;
};

const ExplorerDrawer: React.FC<Props> = ({ open, children }) => {
  return (
    <>
      <StyledDrawer variant="persistent" open={open}>
        <Explorer />
      </StyledDrawer>
      <Container $open={open}>{children}</Container>
    </>
  );
};

export default ExplorerDrawer;
