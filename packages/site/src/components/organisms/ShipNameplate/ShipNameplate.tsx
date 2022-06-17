import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";

import { useShipName } from "../../../hooks";
import { Flexbox } from "../../atoms";
import ShipBanner from "../ShipBanner";

const StyledShipBanner = styled(ShipBanner)`
  margin-right: 8px;
  flex-shrink: 0;
`;

type Props = {
  className?: string;
  shipId: number;
};

const ShipNameplate = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { shipId, ...rest } = props;
  const displayName = useShipName(shipId);

  const visibleId = shipId > 1500;

  return (
    <Flexbox ref={ref} {...rest}>
      <StyledShipBanner shipId={shipId} />
      <div>
        {visibleId && (
          <Typography variant="caption" display="block">
            ID:{shipId}
          </Typography>
        )}
        <Typography noWrap variant="caption" display="block">
          {displayName}
        </Typography>
      </div>
    </Flexbox>
  );
});

export default styled(ShipNameplate)`
  text-align: start;
  width: 100%;
`;
