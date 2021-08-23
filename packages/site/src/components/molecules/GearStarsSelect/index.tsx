import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, Tooltip, Typography } from "@material-ui/core";
import React from "react";

import { usePopover } from "../../../hooks";
import Buttons from "./Buttons";

type Props = {
  className?: string;
  stars: number;
  onChange?: (stars: number) => void;
};

const anchorOrigin = { vertical: "bottom", horizontal: "center" } as const;

const Component: React.FC<Props> = ({ className, stars, onChange }) => {
  const Popover = usePopover();

  const handleChange = (value: number) => {
    onChange && onChange(value);
    Popover.hide();
  };

  return (
    <>
      <Tooltip title="改修値選択">
        <Button className={className} onClick={Popover.show}>
          <span>★</span>
          <span>{stars === 10 ? "M" : stars}</span>
        </Button>
      </Tooltip>

      <Popover anchorOrigin={anchorOrigin}>
        <Buttons onChange={handleChange} />
      </Popover>
    </>
  );
};

const StyledComponent = styled(Component)(
  ({ theme, stars }) => css`
    justify-content: flex-start;
    width: 32px;
    padding: 0 2px;
    color: ${stars === 0 ? theme.palette.action.disabled : theme.colors.stars};
    > * {
      flex-basis: 100%;
    }
  `
);

export default StyledComponent;
