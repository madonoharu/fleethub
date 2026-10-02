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

const AppContent: React.FC = () => {
  const configOpen = useRootSelector((root) => root.app.configOpen);
  const explorerOpen = useRootSelector((root) => root.app.explorerOpen);

  return (
    <AppWrapper>
      <AppBar />
      <ExplorerDrawer open={explorerOpen}>
        <UrlLoader>{configOpen ? <ConfigPage /> : <FileViewer />}</UrlLoader>
        <div className="h-[400px]" />
      </ExplorerDrawer>

      <ShipSelectModal />
      <GearSelectModal />
      <MapSelect />
    </AppWrapper>
  );
};

export default AppContent;
