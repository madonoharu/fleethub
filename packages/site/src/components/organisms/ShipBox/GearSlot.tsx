import styled from "@emotion/styled";
import { Gear } from "@fleethub/core";
import { EquipmentBonuses } from "equipment-bonus";
import React from "react";

import { GearPosition } from "../../../store";
import GearBox from "../GearBox";
import SlotSizeButton from "./SlotSizeButton";

type Props = {
  gear?: Gear;
  position?: GearPosition;
  slotSize?: number;
  maxSlotSize?: number;
  onSlotSizeChange?: (value?: number) => void;
  canEquip?: (gear: Gear) => boolean;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const GearSlot: React.FCX<Props> = ({
  className,
  gear,
  position,
  slotSize,
  maxSlotSize,
  onSlotSizeChange,
  canEquip,
  getNextEbonuses,
}) => {
  return (
    <div className={className}>
      <SlotSizeButton
        exslot={position?.key === "gx"}
        current={slotSize}
        max={maxSlotSize}
        onChange={onSlotSizeChange}
      />
      <GearBox
        gear={gear}
        position={position}
        canEquip={canEquip}
        getNextEbonuses={getNextEbonuses}
      />
    </div>
  );
};

export default styled(GearSlot)`
  display: flex;
`;
