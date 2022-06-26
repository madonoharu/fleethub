import createEmotionServer from "@emotion/server/create-instance";
import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";

import { theme, createEmotionCache } from "../styles";

const ORIGIN = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export default class MyDocument extends Document {
  render() {
    const { page, locales, defaultLocale = "ja" } = this.props.__NEXT_DATA__;
    const lang = this.props.locale || defaultLocale;
    const defaultHref = `${ORIGIN}${page}`;

    return (
      <Html lang={lang}>
        <Head>
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
              href={
                locale === defaultLocale
                  ? defaultHref
                  : `${ORIGIN}/${locale}${page}`
              }
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

MyDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enhanceApp: (App: any) => (props) =>
        <App emotionCache={cache} {...props} />,
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents emotion to render invalid HTML.
  // See https://github.com/mui-org/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [
      ...React.Children.toArray(initialProps.styles),
      ...emotionStyleTags,
    ],
  };
};
