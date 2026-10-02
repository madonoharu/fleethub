import dynamic from "next/dynamic";
import React from "react";

import { useAppDispatch, useRootSelector } from "../../../hooks";
import { entitiesSlice, mapSelectSlice, MapSelectState } from "../../../store";
import { AddStepPayload } from "../../../store/entities/entitiesSlice";
import { Dialog } from "../../organisms";

const MapMenu = dynamic(() => import("./MapMenu"));

const MapSelect: React.FCX = ({ className }) => {
  const state = useRootSelector((root) => root.mapSelect);
  const dispatch = useAppDispatch();

  const update = (changes: Partial<MapSelectState>) => {
    dispatch(mapSelectSlice.actions.update(changes));
  };

  const handleClose = () => {
    dispatch(mapSelectSlice.actions.hide());
  };

  const handleSelect = (payload: Omit<AddStepPayload, "file">) => {
    if (!state.createStep || !state.position) {
      return;
    }

    dispatch(
      entitiesSlice.actions.addStep({
        file: state.position,
        ...payload,
      }),
    );
  };

  return (
    <Dialog
      slotProps={{ paper: { className: "min-w-[664px]" } }}
      fullHeight
      open={state.open}
      onClose={handleClose}
    >
      <MapMenu className={className} state={state} update={update} onEnemySelect={handleSelect} />
    </Dialog>
  );
};

export default MapSelect;
