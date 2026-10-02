import { cn } from "../../../styles/cn";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Button, SvgIconProps, ButtonProps } from "@mui/material";
import React from "react";

const DIRECTIONS = ["Up", "Left", "Down", "Right"] as const;
export type Direction = (typeof DIRECTIONS)[number];

const ArrowIcon: React.FC<{ direction: Direction } & SvgIconProps> = ({ direction, ...rest }) => {
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

const ArrowButtons: React.FCX<Props> = ({ className, color = "primary", disabled, onClick }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event.currentTarget["ariaLabel"] as Direction);
  };

  return (
    <div className={cn("grid gap-1 auto-cols-[36px] auto-rows-[36px]", className)}>
      {DIRECTIONS.map((direction) => (
        <Button
          key={direction}
          color={color}
          disabled={disabled}
          variant="contained"
          aria-label={direction}
          onClick={handleClick}
          className={cn(direction, {
            "row-start-1 col-start-2": direction === "Up",
            "row-start-2 col-start-2": direction === "Down",
            "row-start-2 col-start-3": direction === "Right",
            "row-start-2": direction === "Left",
          })}
        >
          <ArrowIcon direction={direction} />
        </Button>
      ))}
    </div>
  );
};

export default ArrowButtons;
