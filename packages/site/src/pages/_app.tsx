import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { NextComponentType } from "next";
import { AppContext, AppInitialProps, AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import React from "react";

import { ThemeProvider } from "../styles";

export const cache = createCache({ key: "css" });

const MyApp: NextComponentType<AppContext, AppInitialProps, AppProps> = ({
  Component,
  pageProps,
}) => {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default appWithTranslation(MyApp);
