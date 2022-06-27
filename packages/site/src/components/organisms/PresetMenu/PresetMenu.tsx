import { GEAR_KEYS, nonNullable } from "@fh/utils";
import { Button, Divider } from "@mui/material";
import React, { useState } from "react";
import { shallowEqual } from "react-redux";

import {
  useAppDispatch,
  useRootSelector,
  useFhCore,
  useShip,
} from "../../../hooks";
import {
  entitiesSlice,
  GearPosition,
  Preset,
  selectPreset,
} from "../../../store";
import { Checkbox, Flexbox } from "../../atoms";

import PresetList from "./PresetList";

type PresetMenuProps = {
  position?: Omit<GearPosition, "key">;
  onEquip?: () => void;
};

const PresetMenu: React.FCX<PresetMenuProps> = ({ position, onEquip }) => {
  const { core } = useFhCore();
  const [allVisible, setAllVisible] = useState(false);

  const presets = useRootSelector((root) => {
    const ids = root.entities.presets.ids;
    return ids
      .map((id) => selectPreset(root, id as string))
      .filter(nonNullable);
  }, shallowEqual);

  const dispatch = useAppDispatch();

  const tag = position?.tag;
  const shipEntityId = position?.tag === "ships" ? position?.id : "";
  const ship = useShip(shipEntityId);

  let canEquip: ((preset: Preset) => boolean) | undefined;

  if (tag === "ships") {
    canEquip = (preset) => {
      return GEAR_KEYS.every((key) => {
        const gearState = preset[key];
        const gear = gearState && core.create_gear(gearState);

        return !gear || ship?.can_equip(gear, key);
      });
    };
  } else if (tag === "airSquadrons") {
    canEquip = (preset) => {
      if (preset.g5 || preset.gx) {
        return false;
      }

      return GEAR_KEYS.every((key) => {
        const gearState = preset[key];
        const gear = gearState && core.create_gear(gearState);
        return !gear || gear.can_be_deployed_to_land_base();
      });
    };
  }

  const handleRegister = () => {
    let name = ship?.name || "";

    if (position?.tag === "airSquadrons") {
      name = "基地";
    }

    if (position) {
      dispatch(
        entitiesSlice.actions.createPreset({
          name,
          position,
        })
      );
    }
  };

  const handleEquip = (preset: Preset) => {
    if (!position) {
      return;
    }

    dispatch(
      entitiesSlice.actions.createGearsByPreset({
        preset: preset.id,
        position,
      })
    );
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
