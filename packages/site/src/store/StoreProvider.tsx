import React from "react";
import { batch, Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { ActionCreators } from "redux-undo";

import { createStore } from "./createStore";
import { sweepEntities, fetchLocationData } from "./entities";

const StoreProvider: React.FC = ({ children }) => {
  const store = createStore();
  const persistor = persistStore(store);

  const handleBeforeLift = () => {
    if (!process.browser) return;

    batch(() => {
      store.dispatch(sweepEntities(true));
      store.dispatch(fetchLocationData());
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
