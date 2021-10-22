import { MasterData } from "fleethub-core";
import React, { useMemo } from "react";
import { batch, Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { ActionCreators } from "redux-undo";

import { createStore } from "./createStore";
import { sweepEntities, parseUrl } from "./entities";

type StoreProviderProps = {
  masterData: MasterData;
};

const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  masterData,
}) => {
  const store = createStore();
  const persistor = persistStore(store);

  const url = useMemo(() => {
    if (!process.browser) return undefined;

    const url = new URL(location.href);
    window.history.replaceState(null, "", location.origin);
    return url;
  }, []);

  const handleBeforeLift = () => {
    if (!process.browser) return;

    batch(() => {
      store.dispatch(sweepEntities(true));
      if (url) {
        store.dispatch(parseUrl(masterData, url));
      }
      store.dispatch(ActionCreators.clearHistory());
    });
  };

  return (
    <ReduxProvider store={store}>
      <PersistGate onBeforeLift={handleBeforeLift} persistor={persistor}>
        {children}
      </PersistGate>
    </ReduxProvider>
  );
};

export default StoreProvider;
