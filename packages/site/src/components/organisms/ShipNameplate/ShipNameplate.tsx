import { Typography } from "@mui/material";
import { FleetType } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { useShipName } from "../../../hooks";
import { Flexbox } from "../../atoms";
import ShipBanner from "../ShipBanner";

type Props = {
  className?: string;
  shipId: number;
  fleetType?: FleetType;
  index?: number;
};

const ShipNameplate = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { shipId, fleetType, index, className, ...rest } = props;
  const displayName = useShipName(shipId);
  const { t } = useTranslation("common");

  const visibleId = shipId > 1500;

  return (
    <Flexbox ref={ref} className={cn("w-full gap-2 text-start", className)} {...rest}>
      {fleetType && (
        <Typography variant="caption" className="block">
          {t(`FleetType.${fleetType}`)}
        </Typography>
      )}
      {typeof index === "number" && (
        <Typography variant="caption" className="block">
          {index + 1}
        </Typography>
      )}
      <ShipBanner className="shrink-0" shipId={shipId} />
      <div>
        {visibleId && (
          <Typography variant="caption" className="block">
            ID:{shipId}
          </Typography>
        )}
        <Typography noWrap variant="caption" className="block">
          {displayName}
        </Typography>
      </div>
    </Flexbox>
  );
});

export default ShipNameplate;
