/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { DragLayerProvider } from "../../../hooks";
import { appSlice, selectAppState } from "../../../store";
import GearSelectModal from "../GearSelectModal";
import MapSelect from "../MapSelect";
import ShipSelectModal from "../ShipSelectModal";

import AppBar from "./AppBar";
import ExplorerDrawer from "./ExplorerDrawer";
import FileViewer from "./FileViewer";

const Bottom = styled.div`
  height: 400px;
`;

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const explorerOpen = useSelector(
    (state) => selectAppState(state).explorerOpen
  );
  const toggleExplorerOpen = () =>
    dispatch(appSlice.actions.toggleExplorerOpen());

  return (
    <DragLayerProvider>
      <AppBar explorerOpen={explorerOpen} onExplorerOpen={toggleExplorerOpen} />
      <ExplorerDrawer open={explorerOpen}>
        <FileViewer />
        <Bottom />
      </ExplorerDrawer>

      <ShipSelectModal />
      <GearSelectModal />
      <MapSelect />
    </DragLayerProvider>
  );
};

export default AppContent;
