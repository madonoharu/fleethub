import { FhCore } from "fleethub-core";
import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  useMasterData,
  FhCoreContext,
  DragLayerProvider,
  useFhCore,
  useAppDispatch,
} from "../../../hooks";
import { entitiesSlice, parseUrl } from "../../../store";
import ErrorAlert from "../../molecules/ErrorAlert";

const UrlLoader: React.FC = () => {
  const { masterData } = useFhCore();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(entitiesSlice.actions.sweep());
    const url = new URL(location.href);
    window.history.replaceState(null, "", location.pathname);

    parseUrl(masterData, url)
      .then((payload) => {
        if (payload) {
          dispatch(entitiesSlice.actions.import(payload));
        }
      })
      .catch((error) => {
        console.error(error);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

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
      <UrlLoader />
      <DndProvider backend={HTML5Backend}>
        <DragLayerProvider>{children}</DragLayerProvider>
      </DndProvider>
    </FhCoreContext.Provider>
  );
};

export default AppWrapper;
