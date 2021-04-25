import { Gear } from "@fleethub/core";
import { GearState } from "@fleethub/utils";
import { EntityId } from "@reduxjs/toolkit";
import { EquipmentBonuses } from "equipment-bonus";
import React from "react";

import { useGear, useModal } from "../../../hooks";
import { GearPosition } from "../../../store";
import GearList from "../../templates/GearList";
import GearBox from "../GearBox";

type Props = {
  id?: EntityId;
  position?: GearPosition;
  onSlotSizeChange?: (value: number) => void;
  canEquip?: (gear: Gear) => boolean;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const GearSlot: React.FCX<Props> = ({
  id,
  position,
  onSlotSizeChange,
  canEquip,
  getNextEbonuses,
}) => {
  return (
    <div>
      <GearBox
        id={id}
        position={position}
        canEquip={canEquip}
        getNextEbonuses={getNextEbonuses}
      />
    </div>
  );
};

export default GearSlot;
