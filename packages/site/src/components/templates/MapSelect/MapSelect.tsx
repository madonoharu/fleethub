/** @jsxImportSource @emotion/react */
import { styled } from "@mui/system";
import dynamic from "next/dynamic";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStep, mapSelectSlice, MapSelectState } from "../../../store";
import { Dialog } from "../../organisms";
import { MapEnemySelectEvent } from "./MapMenu";

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    min-width: 664px;
  }
`;

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

  const handleSelect = (event: MapEnemySelectEvent) => {
    if (!state.createStep || !state.position) {
      return;
    }

    dispatch(createStep(state.position, event));
  };

  return (
    <StyledDialog fullHeight open={state.open} onClose={handleClose}>
      <MapMenu
        className={className}
        state={state}
        update={update}
        onEnemySelect={handleSelect}
      />
    </StyledDialog>
  );
};

export default MapSelect;
