import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Button } from "@material-ui/core";
import React from "react";

import { ShipNameplate, ShipTooltip } from "../../organisms";

type Props = {
  ship: Ship;
  onClick?: () => void;
};

const ShipButton: React.FCX<Props> = ({ className, ship, onClick }) => {
  return (
    <ShipTooltip ship={ship}>
      <Button className={className} onClick={onClick}>
        <ShipNameplate shipId={ship.ship_id} />
      </Button>
    </ShipTooltip>
  );
};

export default styled(ShipButton)`
  justify-content: flex-start;
  width: 232px;
`;
