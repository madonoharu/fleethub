import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { GearKey, SlotSizeKey } from "@fleethub/utils";
import { Paper } from "@material-ui/core";
import React from "react";

import { ShipEntity } from "../../../store";
import { makeGetNextEbonuses } from "../../../utils";
import GearSlot from "../GearSlot";
import ShipBanner from "../ShipBanner";
import ShipHeader from "./ShipHeader";
import ShipStats from "./ShipStats";

const StyledShipBanner = styled(ShipBanner)`
  margin-left: 4px;
`;

const GearList = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
`;

type Props = {
  ship: Ship;
  onUpdate?: (state: Partial<ShipEntity>) => void;
  onDetailClick?: () => void;
  onReselect?: () => void;
  onRemove?: () => void;
};

const ShipCard: React.FCX<Props> = ({
  className,
  ship,
  onUpdate,
  onDetailClick,
  onReselect,
  onRemove,
}) => {
  const { id } = ship;

  return (
    <Paper className={className}>
      <ShipHeader
        ship={ship}
        onUpdate={onUpdate}
        onDetailClick={onDetailClick}
        onReselect={onReselect}
        onRemove={onRemove}
      />
      <StyledShipBanner shipId={ship.ship_id} size="medium" />
      <ShipStats ship={ship} onUpdate={onUpdate} />
      <GearList>
        {(ship.gear_keys() as GearKey[]).map((key, i) => (
          <GearSlot
            key={key}
            gear={ship.get_gear(key)}
            position={{ ship: id, key }}
            slotSize={ship.get_slot_size(i)}
            maxSlotSize={ship.get_max_slot_size(i)}
            onSlotSizeChange={(value) => {
              onUpdate?.({ [`ss${i + 1}` as SlotSizeKey]: value });
            }}
            canEquip={(g) => ship.can_equip(g, key)}
            getNextEbonuses={makeGetNextEbonuses(ship, key)}
          />
        ))}
      </GearList>
    </Paper>
  );
};

const Styled = styled(ShipCard)`
  display: grid;
  grid-template-columns: 160px calc(100% - 160px);
  grid-template-rows: 24px min-content auto;
  grid-template-areas:
    "a a"
    "b d"
    "c d";

  ${ShipHeader} {
    grid-area: a;
  }
  ${StyledShipBanner} {
    grid-area: b;
  }
  ${GearList} {
    grid-area: c;
  }
  ${GearList} {
    grid-area: d;
  }

  ${ShipHeader} svg {
    visibility: hidden;
  }
  :hover ${ShipHeader} svg {
    visibility: visible;
  }
`;

export default Styled;
