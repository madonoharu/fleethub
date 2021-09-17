import styled from "@emotion/styled";
import { Gear } from "@fh/core";
import React from "react";

import { GearPosition } from "../../../store";
import GearBox from "../GearBox";
import SlotSizeButton from "./SlotSizeButton";

type Props = {
  gear?: Gear;
  position?: GearPosition;
  slotSize?: number;
  maxSlotSize?: number;
  equippable?: boolean;
  onSlotSizeChange?: (value?: number) => void;
};

const GearSlot: React.FCX<Props> = ({
  className,
  gear,
  position,
  slotSize,
  maxSlotSize,
  equippable,
  onSlotSizeChange,
}) => {
  const has_proficiency = gear?.has_proficiency();

  return (
    <div className={className}>
      <SlotSizeButton
        exslot={position?.key === "gx"}
        current={slotSize}
        max={maxSlotSize}
        disabled={!has_proficiency}
        onChange={onSlotSizeChange}
      />
      <GearBox
        gear={gear}
        position={position}
        size="small"
        equippable={equippable}
      />
    </div>
  );
};

export default styled(GearSlot)`
  display: flex;

  ${SlotSizeButton} {
    flex-shrink: 0;
  }

  ${GearBox} {
    min-width: 0;
  }
`;
