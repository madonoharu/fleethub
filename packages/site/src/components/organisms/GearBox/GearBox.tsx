import styled from "@emotion/styled";
import { Gear } from "@fleethub/core";
import { GearState } from "@fleethub/utils";
import { EntityId } from "@reduxjs/toolkit";
import { EquipmentBonuses } from "equipment-bonus";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore, useModal } from "../../../hooks";
import { GearPosition, gearsSelectors, gearsSlice } from "../../../store";
import GearList from "../../templates/GearList";
import GearLabel from "../GearLabel";
import Swappable from "../Swappable";
import AddGearButton from "./AddGearButton";

type Props = {
  id?: EntityId;
  position?: GearPosition;
  canEquip?: (gear: Gear) => boolean;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const GearBox: React.FCX<Props> = ({
  className,
  id,
  position,
  canEquip,
  getNextEbonuses,
}) => {
  const { createGear } = useFhCore();
  const GearListModal = useModal();

  const entity = useSelector((root) => {
    if (id !== undefined) return gearsSelectors.selectById(root, id);
    return undefined;
  });

  const dispatch = useDispatch();

  const gear = entity && createGear(entity);

  const handleGearChange = (gear: Gear) => {
    if (position) {
      dispatch(gearsSlice.actions.add(position, { gear_id: gear.gear_id }));
    }
  };

  const handleUpdate = (changes: Partial<GearState>) => {
    id && dispatch(gearsSlice.actions.update({ id, changes }));
  };

  const handleRemove = () => {
    entity && dispatch(gearsSlice.actions.remove(entity.id));
  };

  let inner: React.ReactElement;

  if (!gear) {
    inner = <AddGearButton onClick={GearListModal.show} />;
  } else {
    inner = (
      <GearLabel gear={gear} onUpdate={handleUpdate} onRemove={handleRemove} />
    );
  }

  return (
    <>
      <Swappable
        className={className}
        type="gear"
        item={{ position }}
        canDrag={Boolean(position && id)}
        onSwap={(dragItem, dropItem) => console.log(dragItem, dropItem)}
      >
        {inner}
      </Swappable>

      <GearListModal full>
        <GearList
          onSelect={(g) => {
            handleGearChange(g);
            GearListModal.hide();
          }}
          canEquip={canEquip}
          getNextEbonuses={getNextEbonuses}
        />
      </GearListModal>
    </>
  );
};

export default styled(GearBox)`
  height: 100%;
  width: 100%;
`;
