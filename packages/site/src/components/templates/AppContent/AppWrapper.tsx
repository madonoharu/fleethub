import { FhCore, MasterData } from "fleethub-core";
import React, { useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  useRootSelector,
  useMasterData,
  FhCoreContext,
  DragLayerProvider,
} from "../../../hooks";
import { mergeMasterData } from "../../../utils/mergeMasterData";
import ErrorAlert from "../../molecules/ErrorAlert";

interface InnerProps {
  data: MasterData;
  children: React.ReactNode;
}

const Inner: React.FC<InnerProps> = ({ data, children }) => {
  const value = useMemo(() => {
    let core: FhCore;

    try {
      core = new FhCore(data);
    } catch (error) {
      return { error };
    }

    const analyzer = core.create_analyzer();
    const allShips = core.create_all_ships();

    return {
      core,
      analyzer,
      allShips,
      masterData: data,
    };
  }, [data]);

  if ("error" in value) {
    return <ErrorAlert sx={{ m: 2 }} error={value.error} />;
  }

  return (
    <FhCoreContext.Provider value={value}>
      <DndProvider backend={HTML5Backend}>
        <DragLayerProvider>{children}</DragLayerProvider>
      </DndProvider>
    </FhCoreContext.Provider>
  );
};

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { data, error } = useMasterData();
  const masterDataConfig = useRootSelector((root) => root.config.masterData);
  const merged = useMemo(
    () =>
      data && !error
        ? mergeMasterData(data, masterDataConfig || {})
        : undefined,
    [data, error, masterDataConfig],
  );

  if (error) {
    return (
      <ErrorAlert
        sx={{ m: 2 }}
        title="データ取得に失敗しました"
        error={error}
      />
    );
  }

  if (!merged) {
    return null;
  }

  return <Inner data={merged}>{children}</Inner>;
};

export default AppWrapper;
