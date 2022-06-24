import { Ship } from "fleethub-core";
import React from "react";

import { useAppDispatch, useRootSelector, useFhCore } from "../../../hooks";
import { entitiesSlice, shipSelectSlice } from "../../../store";
import type { AppThunk } from "../../../store";
import { Dialog } from "../../organisms";
import ShipList from "../ShipList";

function selectShip(ship: Ship, id?: string): AppThunk {
  return (dispatch, getState) => {
    const root = getState().present;
    const state = root.shipSelect;

    dispatch(
      entitiesSlice.actions.createShip({
        input: ship.state(),
        position: state.position,
        id: id || state.id,
        reselect: state.reselect,
      })
    );
  };
}

const ShipSelectModal: React.FCX = () => {
  const { allShips } = useFhCore();

  const dispatch = useAppDispatch();
  const open = useRootSelector((root) => root.shipSelect.open);
  const create = useRootSelector((root) => root.shipSelect.create);

  const handleSelect = (ship: Ship) => {
    if (!create) return;

    dispatch(selectShip(ship));
  };

  const handleClose = () => {
    dispatch(shipSelectSlice.actions.hide());
  };

  return (
    <>
      <Dialog open={open} full onClose={handleClose}>
        {open && <ShipList ships={allShips} onSelect={handleSelect} />}
      </Dialog>
    </>
  );
};

export default ShipSelectModal;
