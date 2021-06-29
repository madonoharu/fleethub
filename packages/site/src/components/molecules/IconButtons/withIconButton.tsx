import { css } from "@emotion/react";
import styled from "@emotion/styled";
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton";
import Tooltip, { TooltipProps } from "@material-ui/core/Tooltip";
import React from "react";

const tinyStyle = css`
  padding: 3px;
  line-height: 0;
`;

export interface WithIconButtonProps extends Omit<IconButtonProps, "size"> {
  label?: string;
  title?: string;
  size?: "tiny" | "small" | "medium";
  tooltipProps?: Omit<TooltipProps, "title">;
}

const withIconButton = (WrappedIcon: React.FC) => {
  const WithIconButton: React.FC<WithIconButtonProps> = ({
    title,
    label,
    tooltipProps,
    size,
    ...iconButonProps
  }) => {
    const WrappedButton = (
      <IconButton
        size={size === "tiny" || size === "small" ? "small" : undefined}
        css={size === "tiny" && tinyStyle}
        {...iconButonProps}
      >
        <WrappedIcon css={{ fontSize: "inherit" }} />
        {label}
      </IconButton>
    );

    if (title && !iconButonProps.disabled) {
      return (
        <Tooltip title={title} {...tooltipProps}>
          {WrappedButton}
        </Tooltip>
      );
    }

    return WrappedButton;
  };

  WithIconButton.displayName = `WithIconButton(${
    WrappedIcon.displayName || WrappedIcon.name
  })`;

  return styled(WithIconButton)``;
};

export default withIconButton;
