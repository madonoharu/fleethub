/** @jsxImportSource @emotion/react */
import { AppThunk } from "@reduxjs/toolkit";
import { Ship } from "fleethub-core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { entitiesSlice, shipSelectSlice } from "../../../store";
import { Dialog } from "../../organisms";
import ShipList from "../ShipList";

const selectShip =
  (ship: Ship, id?: string): AppThunk =>
  (dispatch, getState) => {
    const root = getState();
    const shipSelectState = root.present.shipSelect;

    dispatch(
      entitiesSlice.actions.createShip({
        input: ship.state(),
        position: shipSelectState.position,
        id: id || shipSelectState.id,
        reselect: shipSelectState.reselect,
      })
    );
  };

const ShipSelectModal: React.FCX = () => {
  const dispatch = useDispatch();
  const open = useSelector((root) => root.present.shipSelect.open);
  const create = useSelector((root) => root.present.shipSelect.create);

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
        {open && <ShipList onSelect={handleSelect} />}
      </Dialog>
    </>
  );
};

export default ShipSelectModal;
