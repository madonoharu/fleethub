import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import React from "react";

import { useMasterShip } from "../../../hooks";
import { Flexbox, Text } from "../../atoms";
import ShipBanner from "../ShipBanner";

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
      <ShipBanner shipId={shipId} />
      <div>
        {shipId > 1500 && <Text>ID:{shipId}</Text>}
        <Text noWrap>{displayName}</Text>
      </div>
    </Flexbox>
  );
});

export default styled(ShipNameplate)`
  text-align: start;
  width: 100%;

  ${ShipBanner} {
    margin-right: 8px;
    flex-shrink: 0;
  }
`;
