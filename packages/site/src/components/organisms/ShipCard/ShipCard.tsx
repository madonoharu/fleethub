import styled from "@emotion/styled";
import { Ship, ShipState } from "@fleethub/core";
import { Paper } from "@material-ui/core";
import React from "react";

import { EquipmentList, ShipBanner } from "../../../components";
import { Update } from "../../../utils";
import ShipHeader from "./ShipHeader";
import ShipStats from "./ShipStats";

const ShipCardInfo = styled.div`
  flex-shrink: 0;
`;

const ShipCardContent = styled.div`
  display: flex;
  margin-left: 8px;
`;

type Props = {
  ship: Ship;
  update: Update<ShipState>;
  onDetailClick?: () => void;
  onRemove?: () => void;
};

const ShipCard: React.FCX<Props> = ({
  className,
  ship,
  update,
  onDetailClick,
  onRemove,
}) => {
  const gears = ship.equipment.items.map(({ gear }) => gear);
  gears.length = 6;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const makeGetNextBonuses = React.useCallback(ship.makeGetNextBonuses, [
    ship.shipId,
    ...gears,
  ]);

  return (
    <Paper className={className}>
      <ShipHeader
        ship={ship}
        update={update}
        onDetailClick={onDetailClick}
        onRemove={onRemove}
      />

      <ShipCardContent>
        <ShipCardInfo>
          <ShipBanner publicId={ship.banner} size="medium" />
          <ShipStats ship={ship} />
        </ShipCardInfo>

        <EquipmentList
          equipment={ship.equipment}
          update={update}
          canEquip={ship.canEquip}
          makeGetNextBonuses={makeGetNextBonuses}
        />
      </ShipCardContent>
    </Paper>
  );
};

const Styled = styled(ShipCard)`
  ${ShipHeader} svg {
    visibility: hidden;
  }
  :hover ${ShipHeader} svg {
    visibility: visible;
  }

  ${EquipmentList} {
    min-width: 0;
  }
`;

export default Styled;
