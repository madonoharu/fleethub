/** @jsxImportSource @emotion/react */
import type { GetStaticProps, NextComponentType, NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { AppContent } from "../components/templates";

const Index: NextComponentType<NextPageContext, unknown> = () => {
  return (
    <div>
      <Head>
        <title>作戦室</title>
        <meta
          name="description"
          content="作戦室は艦これの編成を支援するサイトです。弾着率、対地火力などの計算が行えます。"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@MadonoHaru" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DndProvider backend={HTML5Backend}>
        <AppContent />
      </DndProvider>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "gears",
        "gear_types",
        "ships",
        "ctype",
      ])),
    },
  };
};

export default Index;
