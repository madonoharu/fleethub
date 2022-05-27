import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useTranslation } from "next-i18next";
import React from "react";

import { useMasterData } from "../../../hooks";
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
  const { className, shipId } = props;
  const { t, i18n } = useTranslation("ships");
  const { data } = useMasterData();

  const ship = data?.ships.find((ship) => ship.ship_id === shipId);

  const defaultName = ship?.name || shipId.toString();
  let displayName: string;
  if (i18n.resolvedLanguage === "ja") {
    displayName = defaultName;
  } else {
    displayName = t(`${shipId}`, defaultName);
  }

  const visibleId = shipId > 1500;

  return (
    <Flexbox ref={ref} className={className}>
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
