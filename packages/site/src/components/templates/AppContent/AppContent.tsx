import styled from "@emotion/styled";
import React from "react";

import { useRootSelector } from "../../../hooks";
import ConfigPage from "../ConfigPage";
import GearSelectModal from "../GearSelectModal";
import MapSelect from "../MapSelect";
import ShipSelectModal from "../ShipSelectModal";

import AppBar from "./AppBar";
import AppWrapper from "./AppWrapper";
import ExplorerDrawer from "./ExplorerDrawer";
import FileViewer from "./FileViewer";
import UrlLoader from "./UrlLoader";

const Bottom = styled.div`
  height: 400px;
`;

const AppContent: React.FC = () => {
  const configOpen = useRootSelector((root) => root.app.configOpen);
  const explorerOpen = useRootSelector((root) => root.app.explorerOpen);

  return (
    <AppWrapper>
      <AppBar />
      <ExplorerDrawer open={explorerOpen}>
        <UrlLoader>{configOpen ? <ConfigPage /> : <FileViewer />}</UrlLoader>
        <Bottom />
      </ExplorerDrawer>

      <ShipSelectModal />
      <GearSelectModal />
      <MapSelect />
    </AppWrapper>
  );
};

export default AppContent;
