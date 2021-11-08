/** @jsxImportSource @emotion/react */
import { GEAR_KEYS, nonNullable } from "@fh/utils";
import { Button, DialogActions, Divider } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useShip } from "../../../hooks";
import {
  addPresetByShip,
  equip,
  EquipPayload,
  GearPosition,
  PresetState,
  selectPresets,
} from "../../../store";
import PresetList from "./PresetList";

type PresetMenuProps = {
  position?: Omit<GearPosition, "key">;
  onEquip?: () => void;
};

const PresetMenu: React.FCX<PresetMenuProps> = ({ position, onEquip }) => {
  const presets = useSelector(selectPresets);
  const dispatch = useDispatch();

  const shipEntityId = position?.tag === "ship" ? position?.id : "";
  const ship = useShip(shipEntityId);

  const handleRegister = () => {
    if (shipEntityId) {
      dispatch(addPresetByShip(shipEntityId, ship?.name || ""));
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
      <PresetList presets={presets} onEquip={handleEquip} />
      <Divider sx={{ mt: 1 }} />
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleRegister}>
          現在の装備をプリセットに登録
        </Button>
      </DialogActions>
    </>
  );
};

export default PresetMenu;
