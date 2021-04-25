import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { ActionCreators } from "redux-undo";

import { createStore } from "./createStore";
import { cleanEntities, fetchLocationData } from "./entities";

const StoreProvider: React.FC = ({ children }) => {
  const store = createStore();
  const persistor = persistStore(store);

  const handleBeforeLift = () => {
    if (!process.browser) return;

    store.dispatch(cleanEntities());
    store.dispatch(fetchLocationData());
    store.dispatch(ActionCreators.clearHistory());
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
