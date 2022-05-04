import { CacheProvider, EmotionCache } from "@emotion/react";
import { NextComponentType } from "next";
import { appWithTranslation } from "next-i18next";
import { AppContext, AppInitialProps, AppProps } from "next/app";
import React, { useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import { BootstrappedContext } from "../hooks";
import { createStore, entitiesSlice } from "../store";
import { createEmotionCache, ThemeProvider } from "../styles";

import "core-js/features/array/at";

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
  // https://github.com/vercel/next.js/pull/16085
  // query parametersが存在する場合レンダリングが2度発生するため
  // useMemoでpersistが複数回実行されることを防ぐ
  const { store, persistor } = useMemo(() => {
    const store = createStore();
    const persistor = persistStore(store);
    return { store, persistor };
  }, []);

  const handleBeforeLift = () => {
    store.dispatch(entitiesSlice.actions.sweep());
  };

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider>
        <ReduxProvider store={store}>
          <PersistGate persistor={persistor} onBeforeLift={handleBeforeLift}>
            {(bootstrapped) => (
              <BootstrappedContext.Provider value={bootstrapped}>
                <Component {...pageProps} />
              </BootstrappedContext.Provider>
            )}
          </PersistGate>
        </ReduxProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default appWithTranslation(MyApp);
