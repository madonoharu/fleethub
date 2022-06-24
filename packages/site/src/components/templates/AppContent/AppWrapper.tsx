import { FhCore, MasterData } from "fleethub-core";
import { produce } from "immer";
import mergeWith from "lodash/mergeWith";
import React, { useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  useRootSelector,
  useMasterData,
  FhCoreContext,
  DragLayerProvider,
} from "../../../hooks";
import { MasterDataOverrides } from "../../../store";
import ErrorAlert from "../../molecules/ErrorAlert";

function customizer(v0: unknown, v1: unknown): unknown {
  return v1 === null ? v0 : undefined;
}

function mergeMasterData(
  source: MasterData,
  overrides: MasterDataOverrides
): MasterData {
  const result = produce(source, (draft) => {
    draft.ships.forEach((ship) => {
      const shipOverrides = overrides.ships?.[ship.ship_id];
      if (shipOverrides) {
        mergeWith(ship, shipOverrides, customizer);
      }
    });

    draft.day_cutin.forEach((ci) => {
      const ciOverrides = overrides.day_cutin?.[ci.tag];
      if (ciOverrides) {
        mergeWith(ci, ciOverrides, customizer);
      }
    });

    draft.night_cutin.forEach((ci) => {
      const ciOverrides = overrides.night_cutin?.[ci.tag];
      if (ciOverrides) {
        mergeWith(ci, ciOverrides, customizer);
      }
    });

    draft.anti_air_cutin.forEach((ci) => {
      const ciOverrides = overrides.anti_air_cutin?.[ci.id];
      if (ciOverrides) {
        mergeWith(ci, ciOverrides, customizer);
      }
    });
  });

  return result;
}

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

  const merged = mergeMasterData(data, masterDataConfig || {});

  return <Inner data={merged}>{children}</Inner>;
};

export default AppWrapper;
