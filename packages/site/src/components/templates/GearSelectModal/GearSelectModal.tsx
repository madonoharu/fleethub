import { Gear } from "@fh/core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFhCore, useShip } from "../../../hooks";
import { createGear, gearSelectSlice } from "../../../store";
import { makeGetNextEbonuses } from "../../../utils";
import { Dialog } from "../../organisms";
import GearList from "../GearList";

const GearSelectModal: React.FCX = () => {
  const { module } = useFhCore();
  const dispatch = useDispatch();
  const open = useSelector((root) => root.present.gearSelect.open);
  const create = useSelector((root) => root.present.gearSelect.create);
  const position = useSelector((root) => root.present.gearSelect.position);

  const ship = useShip(position?.id);
  const key = position?.key;

  let canEquip: ((gear: Gear) => boolean) | undefined;

  if (position?.tag === "airSquadron") {
    canEquip = module.air_squadron_can_equip;
  } else if (ship) {
    canEquip = (gear) => ship.can_equip(gear, position?.key || "g1");
  }
  const getNextEbonuses = ship && key && makeGetNextEbonuses(ship, key);

  const handleClose = () => dispatch(gearSelectSlice.actions.hide());

  const handleSelect = (gear: Gear) => {
    if (!create || !position) return;
    dispatch(createGear(position, { gear_id: gear.gear_id }));
  };

  return (
    <Dialog open={open} full onClose={handleClose}>
      {open && (
        <GearList
          canEquip={canEquip}
          getNextEbonuses={getNextEbonuses}
          onSelect={handleSelect}
        />
      )}
    </Dialog>
  );
};

export default GearSelectModal;
