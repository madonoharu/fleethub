import { CacheProvider, EmotionCache } from "@emotion/react";
import { NextComponentType } from "next";
import { appWithTranslation } from "next-i18next";
import { AppContext, AppInitialProps, AppProps } from "next/app";
import React from "react";

import { createEmotionCache, ThemeProvider } from "../styles";

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
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default appWithTranslation(MyApp);
