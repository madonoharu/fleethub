import { nonNullable } from "@fh/utils";
import { AppThunk } from "@reduxjs/toolkit";
import { Ship } from "fleethub-core";
import React from "react";

import { useAppDispatch, useAppSelector, useFhCore } from "../../../hooks";
import { entitiesSlice, shipSelectSlice } from "../../../store";
import { Dialog } from "../../organisms";
import ShipList from "../ShipList";

function selectShip(ship: Ship, id?: string): AppThunk {
  return (dispatch, getState) => {
    const root = getState();
    const state = root.present.shipSelect;

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
  const { masterData, core } = useFhCore();
  const ships = React.useMemo(() => {
    return masterData.ships
      .map((ship) => core.create_ship_by_id(ship.ship_id))
      .filter(nonNullable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterData]);

  const dispatch = useAppDispatch();
  const open = useAppSelector((root) => root.present.shipSelect.open);
  const create = useAppSelector((root) => root.present.shipSelect.create);

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
        {open && <ShipList ships={ships} onSelect={handleSelect} />}
      </Dialog>
    </>
  );
};

export default ShipSelectModal;
