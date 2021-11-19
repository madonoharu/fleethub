/** @jsxImportSource @emotion/react */
import { CacheProvider, EmotionCache } from "@emotion/react";
import { createEquipmentBonuses } from "equipment-bonus";
import { NextComponentType } from "next";
import { appWithTranslation } from "next-i18next";
import { AppContext, AppInitialProps, AppProps } from "next/app";
import dynamic from "next/dynamic";
import React from "react";

import { fetchMasterData } from "../firebase";
import { FhCoreContext } from "../hooks";
import { StoreProvider } from "../store";

import { createEmotionCache, ThemeProvider } from "../styles";

const loader = async () => {
  const [module, masterData] = await Promise.all([
    import("fleethub-core"),
    fetchMasterData(),
  ]);

  if (process.env.NODE_ENV === "development") {
    module.set_panic_hook();
  }

  let core: import("fleethub-core").FhCore | null;

  try {
    core = new module.FhCore(masterData, createEquipmentBonuses);
  } catch (error) {
    console.error(error);
  }

  const App: React.FC = ({ children }) => {
    return (
      <FhCoreContext.Provider value={core && { masterData, module, core }}>
        <StoreProvider masterData={masterData}>{children}</StoreProvider>
      </FhCoreContext.Provider>
    );
  };

  return App;
};

const FhCoreProvider = dynamic(loader);

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
        <FhCoreProvider>
          <Component {...pageProps} />
        </FhCoreProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default appWithTranslation(MyApp);
