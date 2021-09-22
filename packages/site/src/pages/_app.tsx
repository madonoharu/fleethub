import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { NextComponentType } from "next";
import { appWithTranslation } from "next-i18next";
import { AppContext, AppInitialProps, AppProps } from "next/app";
import React from "react";

import { ThemeProvider } from "../styles";

export const cache = createCache({ key: "css" });

const MyApp: NextComponentType<AppContext, AppInitialProps, AppProps> = ({
  Component,
  pageProps,
}) => {
  try {
    return (
      <CacheProvider value={cache}>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    );
  } catch (err) {
    return null;
  }
};

export default appWithTranslation(MyApp);
