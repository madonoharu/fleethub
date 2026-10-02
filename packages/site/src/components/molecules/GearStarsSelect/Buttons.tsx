import { cn } from "../../../styles/cn";
import { range } from "@fh/utils";
import Button from "@mui/material/Button";
import React from "react";

import { StarsLabel } from "../../atoms";

type GearStarsSelectProps = {
  onChange?: (stars: number) => void;
};

const GearStarsSelect: React.FCX<GearStarsSelectProps> = ({ className, onChange }) => {
  const handleChange: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
    (event) => {
      onChange?.(Number(event.currentTarget.value));
    },
    [onChange],
  );

  return (
    <div className={cn("flex w-20 flex-col-reverse", className)}>
      {range(11).map((stars) => (
        <Button key={stars} value={stars} onClick={handleChange}>
          <StarsLabel stars={stars} />
        </Button>
      ))}
    </div>
  );
};

export default GearStarsSelect;
