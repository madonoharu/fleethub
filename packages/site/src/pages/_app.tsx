import { CacheProvider, EmotionCache } from "@emotion/react";
import { NextComponentType } from "next";
import { appWithTranslation } from "next-i18next";
import { AppContext, AppInitialProps, AppProps } from "next/app";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { ActionCreators } from "redux-undo";

import { createStore, entitiesSlice } from "../store";
import { createEmotionCache, ThemeProvider } from "../styles";

import "core-js/features/array/at";

const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = createStore();

  // https://github.com/vercel/next.js/pull/16085
  const persistor = persistStore(store, null, () => {
    persistor.persist();
  });

  // https://github.com/vercel/next.js/issues/8240#issuecomment-647699316
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>{() => children}</PersistGate>
    </ReduxProvider>
  );
};

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const MyApp: NextComponentType<AppContext, AppInitialProps, MyAppProps> = ({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}) => {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider>
        <StoreProvider>
          <Component {...pageProps} />
        </StoreProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default appWithTranslation(MyApp);
