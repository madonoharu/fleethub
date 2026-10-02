import { Chip, Tooltip, Typography } from "@mui/material";
import { AntiAirCutinDef } from "fleethub-core";
import React from "react";

import { LabeledValue } from "../../atoms";
import { cn } from "../../../styles";

type Props = {
  antiAirCutin: AntiAirCutinDef;
};

const AntiAirCutinChip: React.FCX<Props> = ({ className, antiAirCutin }) => (
  <Tooltip
    title={
      <>
        <Typography variant="subtitle2">{antiAirCutin.id}</Typography>
        <LabeledValue label="固定" value={antiAirCutin.guaranteed} />
        <LabeledValue label="変動" value={antiAirCutin.multiplier} />
        <LabeledValue label="発動定数(推測)" value={antiAirCutin.type_factor} />
      </>
    }
  >
    <Chip className={className} label={antiAirCutin.id} size="small" variant="outlined" />
  </Tooltip>
);

export default ({ className, ...props }: React.ComponentProps<typeof AntiAirCutinChip>) => (
  <AntiAirCutinChip
    {...props}
    className={cn("w-12 rounded-[4px] text-anti-air border-anti-air", className)}
  />
);
