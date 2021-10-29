/** @jsxImportSource @emotion/react */
import dynamic from "next/dynamic";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { mapSelectSlice, MapSelectState } from "../../../store";
import { Dialog } from "../../organisms";

const MapMenu = dynamic(() => import("./MapMenu"));

const MapSelect: React.FCX = ({ className }) => {
  const state = useSelector((root) => root.present.mapSelect);
  const dispatch = useDispatch();

  const update = (changes: Partial<MapSelectState>) => {
    dispatch(mapSelectSlice.actions.update(changes));
  };

  const handleClose = () => {
    dispatch(mapSelectSlice.actions.hide());
  };

  return (
    <Dialog fullHeight open={state.open} onClose={handleClose}>
      <MapMenu
        className={className}
        state={state}
        update={update}
        onEnemySelect={console.log}
      />
    </Dialog>
  );
};

export default MapSelect;
