import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, Tooltip } from "@material-ui/core";
import React from "react";

import { usePopover } from "../../../hooks";
import Buttons from "./Buttons";

const starsToString = (stars: number) => {
  if (stars === 10) {
    return "★M";
  }
  return `★${stars}`;
};

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
        <Button className={className} size="small" onClick={Popover.show}>
          {starsToString(stars)}
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
    width: 24px;
    height: 100%;
    padding: 0;
    color: ${stars === 0 ? theme.palette.action.disabled : theme.colors.stars};
  `
);

export default StyledComponent;
