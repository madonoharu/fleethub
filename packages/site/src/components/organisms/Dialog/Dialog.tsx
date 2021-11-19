/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
} from "@mui/material";
import React from "react";

import { CloseButton } from "../../molecules";

const StyledCloseButton = styled(CloseButton)`
  position: absolute;
  top: 0px;
  right: 0px;
`;

const ScrollContainer = styled.div`
  padding-left: 2px;
  overflow-y: scroll;
`;

export type DialogProps = Partial<MuiDialogProps> & {
  full?: boolean;
  fullHeight?: boolean;
};

const Dialog: React.FC<DialogProps> = ({
  children,
  full,
  fullHeight: _,
  ...rest
}) => (
  <MuiDialog open={false} transitionDuration={100} fullWidth={full} {...rest}>
    <StyledCloseButton
      size="tiny"
      onClick={(event) => rest.onClose?.(event, "backdropClick")}
    />
    <ScrollContainer>{children}</ScrollContainer>
  </MuiDialog>
);

export default styled(Dialog)`
  .MuiDialog-paper {
    padding: 8px;
    ${(props) =>
      (props.full || props.fullHeight) &&
      css`
        height: calc(100vh - 64px);
      `}
  }
`;
