/** @jsxImportSource @emotion/react */
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { gearSelectSlice } from "../../../store";
import { Dialog } from "../../organisms";

import GearSelectMenu from "./GearSelectMenu";

const GearSelectModal: React.FCX = () => {
  const dispatch = useDispatch();
  const open = useSelector((root) => root.present.gearSelect.open);

  const handleClose = () => dispatch(gearSelectSlice.actions.hide());

  return (
    <Dialog open={open} full onClose={handleClose}>
      {open && <GearSelectMenu />}
    </Dialog>
  );
};

export default GearSelectModal;
