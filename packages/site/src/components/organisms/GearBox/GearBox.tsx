import styled from "@emotion/styled";
import { Gear } from "@fleethub/core";
import { GearState } from "@fleethub/utils";
import { EntityId } from "@reduxjs/toolkit";
import { EquipmentBonuses } from "equipment-bonus";
import React, { useMemo } from "react";
import { useDispatch } from "react-redux";

import { useModal } from "../../../hooks";
import { GearPosition, gearsSlice } from "../../../store";
import GearList from "../../templates/GearList";
import GearLabel from "../GearLabel";
import Swappable from "../Swappable";
import AddGearButton from "./AddGearButton";

type Props = {
  gear?: Gear;
  position?: GearPosition;
  canEquip?: (gear: Gear) => boolean;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const useGearActions = (id?: EntityId) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const update = (changes: Partial<GearState>) => {
      id && dispatch(gearsSlice.actions.update({ id, changes }));
    };

    const remove = () => {
      id && dispatch(gearsSlice.actions.remove(id));
    };

    return { update, remove };
  }, [id, dispatch]);
};

const GearBox: React.FCX<Props> = ({
  className,
  gear,
  position,
  canEquip,
  getNextEbonuses,
}) => {
  const GearListModal = useModal();
  const dispatch = useDispatch();

  const handleGearChange = (gear: Gear) => {
    if (position) {
      dispatch(gearsSlice.actions.add(position, { gear_id: gear.gear_id }));
    }
  };

  const id = gear?.id;

  const actions = useGearActions(id);

  let inner: React.ReactElement;

  if (!gear) {
    inner = <AddGearButton onClick={GearListModal.show} />;
  } else {
    inner = (
      <GearLabel
        gear={gear}
        onUpdate={actions.update}
        onRemove={actions.remove}
      />
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
