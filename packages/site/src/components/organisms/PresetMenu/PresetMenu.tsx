/** @jsxImportSource @emotion/react */
import { GEAR_KEYS, nonNullable } from "@fh/utils";
import { Button, Divider } from "@mui/material";
import { AppThunk, nanoid } from "@reduxjs/toolkit";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore, useShip } from "../../../hooks";
import {
  addEntities,
  AirSquadronEntity,
  airSquadronsSelectors,
  equip,
  EquipPayload,
  GearPosition,
  gearsSelectors,
  PresetEntity,
  PresetState,
  selectPresets,
  ShipEntity,
  shipsSelectors,
} from "../../../store";
import { Checkbox, Flexbox } from "../../atoms";
import PresetList from "./PresetList";

const addPresetByPosition =
  (position: Omit<GearPosition, "key">, name: string): AppThunk =>
  (dispatch, getState) => {
    const root = getState();

    let source: ShipEntity | AirSquadronEntity | undefined;

    if (position.tag === "ship") {
      source = shipsSelectors.selectById(root, position.id);
    } else if (position.tag === "airSquadron") {
      source = airSquadronsSelectors.selectById(root, position.id);
    }

    if (!source) {
      return;
    }

    const preset: PresetEntity = {
      id: nanoid(),
      name,
    };

    const gears = GEAR_KEYS.map((key) => {
      const gearEntityId = source?.[key];
      const gear =
        gearEntityId && gearsSelectors.selectById(root, gearEntityId);

      if (gear) {
        const id = nanoid();
        preset[key] = id;
        return { ...gear, id };
      } else {
        return;
      }
    }).filter(nonNullable);

    const entities = {
      presets: [preset],
      gears,
    };

    dispatch(addEntities({ entities }));
  };

type PresetMenuProps = {
  position?: Omit<GearPosition, "key">;
  onEquip?: () => void;
};

const PresetMenu: React.FCX<PresetMenuProps> = ({ position, onEquip }) => {
  const { core, module } = useFhCore();
  const [allVisible, setAllVisible] = useState(false);
  const presets = useSelector(selectPresets);
  const dispatch = useDispatch();

  const tag = position?.tag;
  const shipEntityId = position?.tag === "ship" ? position?.id : "";
  const ship = useShip(shipEntityId);

  let canEquip: ((preset: PresetState) => boolean) | undefined;

  if (tag === "ship") {
    canEquip = (preset) => {
      return GEAR_KEYS.every((key) => {
        const gearState = preset[key];
        const gear = gearState && core.create_gear(gearState);

        return !gear || ship?.can_equip(gear, key);
      });
    };
  } else if (tag === "airSquadron") {
    canEquip = (preset) => {
      if (preset.g5 || preset.gx) {
        return false;
      }

      return GEAR_KEYS.every((key) => {
        const gearState = preset[key];
        const gear = gearState && core.create_gear(gearState);
        return !gear || module.air_squadron_can_equip(gear);
      });
    };
  }

  const handleRegister = () => {
    let name = ship?.name || "";

    if (position?.tag === "airSquadron") {
      name = "基地";
    }

    if (position) {
      dispatch(addPresetByPosition(position, name));
    }
  };

  const handleEquip = (preset: PresetState) => {
    if (!position) {
      return;
    }

    const changes: EquipPayload["changes"] = {};

    const gears = GEAR_KEYS.map((key) => {
      const gear = preset[key];
      const newGear = gear && { ...gear, id: nanoid() };
      changes[key] = newGear?.id;
      return newGear;
    }).filter(nonNullable);

    const payload: EquipPayload = {
      ...position,
      changes,
      entities: { gears },
    };

    dispatch(equip(payload));
    onEquip?.();
  };

  return (
    <>
      <Flexbox>
        <Button
          sx={{ mr: "auto" }}
          variant="contained"
          color="primary"
          onClick={handleRegister}
        >
          現在の装備をプリセットに登録
        </Button>
        <Checkbox
          label="装備不可プリセットも表示する"
          checked={allVisible}
          onChange={setAllVisible}
        />
      </Flexbox>
      <Divider sx={{ my: 1 }} />
      <PresetList
        presets={presets}
        onEquip={handleEquip}
        canEquip={canEquip}
        allVisible={allVisible}
      />
    </>
  );
};

export default PresetMenu;
