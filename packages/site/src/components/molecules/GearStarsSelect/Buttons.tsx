import styled from "@emotion/styled";
import { range } from "@fh/utils";
import Button from "@mui/material/Button";
import React from "react";

import { StarsLabel } from "../../atoms";

type GearStarsSelectProps = {
  onChange?: (stars: number) => void;
};

const GearStarsSelect: React.FCX<GearStarsSelectProps> = ({
  className,
  onChange,
}) => {
  const handleChange: React.MouseEventHandler<HTMLButtonElement> =
    React.useCallback(
      (event) => {
        onChange?.(Number(event.currentTarget.value));
      },
      [onChange],
    );

  return (
    <div className={className}>
      {range(11).map((stars) => (
        <Button key={stars} value={stars} onClick={handleChange}>
          <StarsLabel stars={stars} />
        </Button>
      ))}
    </div>
  );
};

export default styled(GearStarsSelect)`
  display: flex;
  flex-direction: column-reverse;
  width: 80px;
`;
