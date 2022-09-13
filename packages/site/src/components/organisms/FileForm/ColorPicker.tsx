import { styled, ButtonBase, colors } from "@mui/material";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Color {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  A100: string;
  A200: string;
  A400: string;
  A700: string;
}

const hues = [
  "red",
  "pink",
  "purple",
  "deepPurple",
  "indigo",
  "blue",
  "lightBlue",
  "cyan",
  "teal",
  "green",
  "lightGreen",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deepOrange",
] as const;

const StyledButton = styled(ButtonBase)`
  height: 24px;
  width: 24px;
  border-radius: 4px;

  &:hover {
    outline: solid 1px white;
  }
`;

// eslint-disable-next-line import/namespace
const COLORS = hues.map((hue) => colors[hue][400]);

interface Props {
  color?: string | undefined;
  onChange?: (color: string) => void;
}

const ColorPicker: React.FCX<Props> = ({ className, color, onChange }) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const value = event.currentTarget.value;
    if (value !== color) {
      onChange?.(event.currentTarget.value);
    }
  };

  return (
    <div className={className}>
      {COLORS.map((color) => (
        <StyledButton
          key={color}
          css={{
            backgroundColor: color,
          }}
          value={color}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};

export default styled(ColorPicker)`
  display: grid;
  grid-template-columns: repeat(4, 24px);
  gap: 8px;
  padding: 8px;
`;
