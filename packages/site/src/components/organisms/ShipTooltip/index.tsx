import { Tooltip } from "@mui/material";
import { Ship } from "fleethub-core";
import React from "react";

import MasterShipDetails from "./MasterShipDetails";

interface Props {
  ship: Ship;
  children: React.ReactElement;
}

const ShipTooltip: React.FC<Props> = ({ ship, children }) => {
  return (
    <Tooltip title={<MasterShipDetails ship={ship} />}>{children}</Tooltip>
  );
};

export default ShipTooltip;
