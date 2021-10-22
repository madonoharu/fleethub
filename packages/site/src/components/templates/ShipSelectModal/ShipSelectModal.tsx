import { Ship } from "fleethub-core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectShip, shipSelectSlice } from "../../../store";
import { Dialog } from "../../organisms";
import ShipList from "../ShipList";

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
