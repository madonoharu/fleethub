import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { FleetType } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useShipName } from "../../../hooks";
import { Flexbox } from "../../atoms";
import ShipBanner from "../ShipBanner";

const StyledShipBanner = styled(ShipBanner)`
  flex-shrink: 0;
`;

type Props = {
  className?: string;
  shipId: number;
  fleetType?: FleetType;
  index?: number;
};

const ShipNameplate = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { shipId, fleetType, index, ...rest } = props;
  const displayName = useShipName(shipId);
  const { t } = useTranslation("common");

  const visibleId = shipId > 1500;

  return (
    <Flexbox ref={ref} gap={1} {...rest}>
      {fleetType && (
        <Typography variant="caption" display="block">
          {t(`FleetType.${fleetType}`)}
        </Typography>
      )}
      {typeof index === "number" && (
        <Typography variant="caption" display="block">
          {index + 1}
        </Typography>
      )}
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
