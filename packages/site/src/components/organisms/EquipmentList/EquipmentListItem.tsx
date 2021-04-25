import styled from "@emotion/styled";
import {
  EquipmentBonuses,
  EquipmentState,
  Gear,
  GearBase,
  GearKey,
  GearState,
  getSlotKey,
} from "@fleethub/core";
import React from "react";

import { GearLabel, GearList } from "../../../components";
import { useModal } from "../../../hooks";
import { Update } from "../../../utils";
import AddGearButton from "../GearBox/AddGearButton";
import Swappable from "../Swappable";
import SlotSizeButton from "./SlotSizeButton";

const isLargeFlyingBoat = (id: number) => [138, 178].includes(id);

export type Props = {
  gear?: Gear;
  currentSlotSize?: number;
  maxSlotSize?: number;
  type?: "airbase" | "nisshin";

  gearKey: GearKey;
  updateEquipment: Update<EquipmentState>;

  canEquip?: (gear: GearBase, key?: GearKey) => boolean;
  makeGetNextBonuses?: (key: GearKey) => (gear: GearBase) => EquipmentBonuses;
};

const useEquipmentGearActions = ({ type, gearKey, updateEquipment }: Props) => {
  return React.useMemo(() => {
    const slotKey = getSlotKey(gearKey);

    const setGear = (gear?: Gear) => {
      updateEquipment((draft) => {
        const prev = draft[gearKey];
        draft[gearKey] = gear?.state;

        if (type === "airbase") {
          draft[slotKey] = gear?.is("Recon") ? 4 : undefined;
          return;
        }

        if (gear?.categoryIn("LargeFlyingBoat") && draft[slotKey] !== 1) {
          draft[slotKey] = 1;
          return;
        }

        if (prev && isLargeFlyingBoat(prev.gearId)) {
          draft[slotKey] = undefined;
        }
      });
    };

    const setSlotSize = (next: number | undefined) => {
      updateEquipment((draft) => {
        draft[slotKey] = next;
      });
    };

    const update: Update<GearState> = (recipe) =>
      updateEquipment((draft) => {
        const state = draft[gearKey];
        state && recipe(state);
      });

    const remove = () => setGear(undefined);

    return { setGear, setSlotSize, update, remove };
  }, [type, gearKey, updateEquipment]);
};

const EquipmentListItem: React.FCX<Props> = (props) => {
  const {
    className,
    gearKey,
    gear,
    currentSlotSize,
    maxSlotSize,
    canEquip,
    makeGetNextBonuses,
  } = props;

  const actions = useEquipmentGearActions(props);
  const Modal = useModal();

  const handleGearSelect = (gear: Gear) => {
    actions.setGear(gear);
    Modal.hide();
  };

  const handleSlotSizeChange = (value: number) => {
    if (value === maxSlotSize) {
      actions.setSlotSize(undefined);
    } else {
      actions.setSlotSize(value);
    }
  };

  const handleSwap = (other: Props) => {
    actions.setGear(other.gear);

    if (props.type === "airbase" && other.type === "airbase") {
      actions.setSlotSize(other.currentSlotSize);
    }
  };

  return (
    <Swappable
      className={className}
      type="gear"
      state={props}
      setState={handleSwap}
      canDrag={Boolean(gear)}
    >
      <SlotSizeButton
        current={currentSlotSize}
        max={maxSlotSize}
        onChange={handleSlotSizeChange}
      />
      {gear ? (
        <GearLabel
          gear={gear}
          equippable={canEquip?.(gear, gearKey)}
          update={actions.update}
          onReselect={Modal.show}
          onRemove={actions.remove}
        />
      ) : (
        <AddGearButton onClick={Modal.show} />
      )}

      <Modal full>
        <GearList
          onSelect={handleGearSelect}
          canEquip={canEquip && ((gear) => canEquip(gear, gearKey))}
          getBonuses={makeGetNextBonuses && makeGetNextBonuses(gearKey)}
        />
      </Modal>
    </Swappable>
  );
};

const Styled = styled(EquipmentListItem)`
  display: flex;
`;

export default React.memo(Styled);
