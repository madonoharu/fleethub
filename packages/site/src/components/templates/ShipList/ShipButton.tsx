import { Button } from "@mui/material";
import { Ship } from "fleethub-core";
import React from "react";

import { cn } from "../../../styles/cn";
import { ShipNameplate, ShipTooltip } from "../../organisms";

type Props = {
  ship: Ship;
  onClick?: () => void;
};

const ShipButton: React.FCX<Props> = ({ className, ship, onClick }) => {
  return (
    <ShipTooltip ship={ship}>
      <Button className={cn("w-[232px] justify-start", className)} onClick={onClick}>
        <ShipNameplate shipId={ship.ship_id} />
      </Button>
    </ShipTooltip>
  );
};

export default ShipButton;
