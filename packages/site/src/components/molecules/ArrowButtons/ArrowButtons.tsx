import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { styled, Button, SvgIconProps, ButtonProps } from "@mui/material";
import React from "react";

const DIRECTIONS = ["Up", "Left", "Down", "Right"] as const;
export type Direction = typeof DIRECTIONS[number];

const ArrowIcon: React.FC<{ direction: Direction } & SvgIconProps> = ({
  direction,
  ...rest
}) => {
  switch (direction) {
    case "Down":
      return <KeyboardArrowDownIcon {...rest} />;
    case "Left":
      return <KeyboardArrowLeftIcon {...rest} />;
    case "Right":
      return <KeyboardArrowRightIcon {...rest} />;
    case "Up":
      return <KeyboardArrowUpIcon {...rest} />;
  }
};

interface Props {
  color?: ButtonProps["color"];
  disabled?: boolean;
  onClick?: (direction: Direction) => void;
}

const ArrowButtons: React.FCX<Props> = ({
  className,
  color = "primary",
  disabled,
  onClick,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event.currentTarget["ariaLabel"] as Direction);
  };

  return (
    <div className={className}>
      {DIRECTIONS.map((direction) => (
        <Button
          key={direction}
          color={color}
          disabled={disabled}
          variant="contained"
          aria-label={direction}
          onClick={handleClick}
          className={direction}
        >
          <ArrowIcon direction={direction} />
        </Button>
      ))}
    </div>
  );
};

export default styled(ArrowButtons)`
  display: grid;
  gap: 4px;
  grid-auto-columns: 36px;
  grid-auto-rows: 36px;

  .Up {
    grid-row: 1;
    grid-column: 2;
  }
  .Down {
    grid-row: 2;
    grid-column: 2;
  }
  .Right {
    grid-row: 2;
    grid-column: 3;
  }
  .Left {
    grid-row: 2;
  }
`;
