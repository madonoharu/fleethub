/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useMasterShip } from "../../../hooks";
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
  const { t } = useTranslation("ships");
  const masterShip = useMasterShip(shipId);

  const displayName = t(`${shipId}`, `${masterShip?.name || shipId}`);

  return (
    <Flexbox ref={ref} className={className}>
      <StyledShipBanner shipId={shipId} />
      <div>
        {shipId > 1500 && (
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
