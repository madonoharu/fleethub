import styled from "@emotion/styled";
import React from "react";

import { useAppSelector } from "../../../hooks";
import ConfigPage from "../ConfigPage";
import GearSelectModal from "../GearSelectModal";
import MapSelect from "../MapSelect";
import ShipSelectModal from "../ShipSelectModal";

import AppBar from "./AppBar";
import AppWrapper from "./AppWrapper";
import ExplorerDrawer from "./ExplorerDrawer";
import FileViewer from "./FileViewer";

const Bottom = styled.div`
  height: 400px;
`;

const AppContent: React.FC = () => {
  const configOpen = useAppSelector((root) => root.present.app.configOpen);
  const explorerOpen = useAppSelector((root) => root.present.app.explorerOpen);

  return (
    <AppWrapper>
      <AppBar />
      <ExplorerDrawer open={explorerOpen}>
        {configOpen ? <ConfigPage /> : <FileViewer />}
        <Bottom />
      </ExplorerDrawer>

      <ShipSelectModal />
      <GearSelectModal />
      <MapSelect />
    </AppWrapper>
  );
};

export default AppContent;
