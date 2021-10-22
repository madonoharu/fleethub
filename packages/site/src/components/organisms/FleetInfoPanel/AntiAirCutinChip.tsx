import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Chip, Tooltip, Typography } from "@mui/material";
import { AntiAirCutinDef } from "fleethub-core";
import React from "react";

import { LabeledValue } from "../../atoms";

type Props = {
  antiAirCutin: AntiAirCutinDef;
};

const AntiAirCutinChip: React.FCX<Props> = ({ className, antiAirCutin }) => (
  <Tooltip
    title={
      <>
        <Typography variant="subtitle2">{antiAirCutin.id}</Typography>
        <LabeledValue label="固定" value={antiAirCutin.minimum_bonus} />
        <LabeledValue label="変動" value={antiAirCutin.multiplier} />
        <LabeledValue
          label="発動定数(推測)"
          value={antiAirCutin.chance_numer}
        />
      </>
    }
  >
    <Chip
      className={className}
      label={antiAirCutin.id}
      size="small"
      variant="outlined"
    />
  </Tooltip>
);

export default styled(AntiAirCutinChip)(
  ({ theme }) => css`
    width: 48px;
    border-radius: 4px;
    color: ${theme.colors.anti_air};
    border-color: ${theme.colors.anti_air};
  `
);
