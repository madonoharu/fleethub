import {
  DocumentHeadTags,
  documentGetInitialProps,
  type DocumentHeadTagsProps,
} from "@mui/material-nextjs/v16-pagesRouter";
import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";

import { theme, createEmotionCache } from "../styles";

const ORIGIN = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export default class MyDocument extends Document<DocumentHeadTagsProps> {
  render() {
    const { page, locales, defaultLocale = "ja" } = this.props.__NEXT_DATA__;
    const lang = this.props.locale || defaultLocale;
    const defaultHref = `${ORIGIN}${page}`;

    return (
      <Html lang={lang}>
        <Head>
          <style>{"@layer theme, base, mui, components, utilities;"}</style>
          <DocumentHeadTags {...this.props} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:creator" content="@MadonoHaru" />
          <link rel="icon" href="/favicon.ico" />
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />

          {locales?.map((locale) => (
            <link
              key={locale}
              rel="alternate"
              hrefLang={locale}
              href={locale === defaultLocale ? defaultHref : `${ORIGIN}/${locale}${page}`}
            />
          ))}
          <link rel="alternate" hrefLang="x-default" href={defaultHref} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = (ctx) =>
  documentGetInitialProps(ctx, { emotionCache: createEmotionCache() });
