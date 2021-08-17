import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { GearKey, GEAR_KEYS, SlotSizeKey } from "@fleethub/utils";
import { Paper } from "@material-ui/core";
import React from "react";

import { ShipEntity } from "../../../store";
import { makeGetNextEbonuses } from "../../../utils";
import ShipBanner from "../ShipBanner";
import GearSlot from "./GearSlot";
import ShipHeader from "./ShipHeader";
import ShipStats from "./ShipStats";

const ShipCardContent = styled.div`
  display: flex;
  margin-left: 8px;
  > * {
    min-width: 0;
  }
`;

const ShipCardInfo = styled.div`
  flex-shrink: 0;
`;

const GearList = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  > * {
    height: 24px;
  }
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
  const { slotnum, id } = ship;

  return (
    <Paper className={className}>
      <ShipHeader
        ship={ship}
        onUpdate={onUpdate}
        onDetailClick={onDetailClick}
        onReselect={onReselect}
        onRemove={onRemove}
      />

      <ShipCardContent>
        <ShipCardInfo>
          <ShipBanner shipId={ship.ship_id} size="medium" />
          <ShipStats ship={ship} onUpdate={onUpdate} />
        </ShipCardInfo>
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
`;

export default Styled;
