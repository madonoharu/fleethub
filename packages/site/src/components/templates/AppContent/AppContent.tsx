import styled from "@emotion/styled";
import React from "react";

import {
  DragLayerProvider,
  useAppDispatch,
  useAppSelector,
} from "../../../hooks";
import { appSlice } from "../../../store";
import ConfigPage from "../ConfigPage";
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
  const dispatch = useAppDispatch();
  const configOpen = useAppSelector((root) => root.present.app.configOpen);
  const explorerOpen = useAppSelector((root) => root.present.app.explorerOpen);

  const toggleExplorerOpen = () => {
    dispatch(appSlice.actions.toggleExplorerOpen());
  };

  return (
    <DragLayerProvider>
      <AppBar explorerOpen={explorerOpen} onExplorerOpen={toggleExplorerOpen} />
      <ExplorerDrawer open={explorerOpen}>
        {configOpen ? <ConfigPage /> : <FileViewer />}
        <Bottom />
      </ExplorerDrawer>

      <ShipSelectModal />
      <GearSelectModal />
      <MapSelect />
    </DragLayerProvider>
  );
};

export default AppContent;
