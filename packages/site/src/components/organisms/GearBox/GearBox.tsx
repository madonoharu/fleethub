import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Gear } from "@fleethub/core";
import { EquipmentBonuses } from "equipment-bonus";
import React, { useMemo } from "react";
import { useDispatch } from "react-redux";

import { useModal } from "../../../hooks";
import {
  GearEntity,
  GearPosition,
  gearsSlice,
  swapGearPosition,
} from "../../../store";
import GearList from "../../templates/GearList";
import GearLabel from "../GearLabel";
import Swappable from "../Swappable";
import AddGearButton from "./AddGearButton";

type Props = {
  gear?: Gear;
  position?: GearPosition;
  size?: "small" | "medium" | undefined;
  canEquip?: (gear: Gear) => boolean;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const useGearActions = (id?: string) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const update = (changes: Partial<GearEntity>) => {
      id && dispatch(gearsSlice.actions.update({ id, changes }));
    };

    const remove = () => {
      id && dispatch(gearsSlice.actions.remove(id));
    };

    const swap = (event: Parameters<typeof swapGearPosition>[0]) => {
      dispatch(swapGearPosition(event));
    };

    return { update, remove, swap };
  }, [id, dispatch]);
};

const GearBox: React.FCX<Props> = ({
  className,
  gear,
  position,
  size,
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
        equippable={canEquip?.(gear)}
        size={size}
        onUpdate={actions.update}
        onRemove={actions.remove}
      />
    );
  }

  if (!position) {
    return (
      <>
        <div className={className}>{inner}</div>

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
  }

  return (
    <>
      <Swappable
        className={className}
        type="gear"
        item={{ position, id }}
        canDrag={Boolean(position && id)}
        onSwap={actions.swap}
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

export default styled(GearBox)(
  ({ size }) => css`
    height: ${size === "small" ? 24 : 28}px;
    width: 100%;
    line-height: initial;
  `
);
