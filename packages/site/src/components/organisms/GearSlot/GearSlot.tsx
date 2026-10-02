import { Gear } from "fleethub-core";
import React from "react";

import { GearPosition } from "../../../store";
import GearBox from "../GearBox";

import SlotSizeButton from "./SlotSizeButton";
import { cn } from "../../../styles";

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
        className="SlotSizeButton"
        exslot={position?.key === "gx"}
        current={slotSize}
        max={maxSlotSize}
        disabled={!has_proficiency}
        onChange={onSlotSizeChange}
      />
      <GearBox
        className="GearBox"
        gear={gear}
        position={position}
        size="small"
        equippable={equippable}
      />
    </div>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof GearSlot>) => (
  <GearSlot
    {...props}
    className={cn("flex [&_>_.SlotSizeButton]:shrink-0 [&_>_.GearBox]:min-w-0", className)}
  />
);
