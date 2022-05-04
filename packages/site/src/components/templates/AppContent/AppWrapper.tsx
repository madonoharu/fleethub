import { FhCore } from "fleethub-core";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  useMasterData,
  FhCoreContext,
  DragLayerProvider,
} from "../../../hooks";
import ErrorAlert from "../../molecules/ErrorAlert";

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { data, error } = useMasterData();

  if (error) {
    return (
      <ErrorAlert
        sx={{ m: 2 }}
        title="データ取得に失敗しました"
        error={error}
      />
    );
  }

  if (!data) {
    return null;
  }

  let core: FhCore;

  try {
    core = new FhCore(data);
  } catch (error) {
    return <ErrorAlert sx={{ m: 2 }} error={error} />;
  }

  const analyzer = core.create_analyzer();
  const allShips = core.create_all_ships();

  const value = {
    core,
    analyzer,
    allShips,
    masterData: data,
  };

  return (
    <FhCoreContext.Provider value={value}>
      <DndProvider backend={HTML5Backend}>
        <DragLayerProvider>{children}</DragLayerProvider>
      </DndProvider>
    </FhCoreContext.Provider>
  );
};

export default AppWrapper;
