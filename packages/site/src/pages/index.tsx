import master_data from "@fleethub/utils/master_data";
import { createEquipmentBonuses } from "equipment-bonus";
import type { GetStaticProps, NextComponentType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import AppContent from "../components/templates/AppContent";
import { FhCoreContext } from "../hooks";
import { StoreProvider } from "../store";

const loader = import("@fleethub/core/pkg").then((mod) => {
  const core = new mod.FhCore(master_data, createEquipmentBonuses);

  if (process.env.NODE_ENV === "development") {
    core.init_console_panic();
  }

  const value = { master_data, core };

  const App: React.FC = () => (
    <FhCoreContext.Provider value={value}>
      <AppContent />
    </FhCoreContext.Provider>
  );

  return App;
});

const App = dynamic(loader, { ssr: false });

const Inner = React.memo(() => (
  <DndProvider backend={HTML5Backend}>
    <StoreProvider>
      <App />
    </StoreProvider>
  </DndProvider>
));

const Index: NextComponentType = () => {
  return (
    <div>
      <Head>
        <title>作戦室</title>
        <meta
          name="description"
          content="作戦室 Jervis改は艦これの編成を支援するサイトです。弾着率、対地火力などの計算が行えます。"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@MadonoHaru" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Inner />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "" }) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      "common",
      "gears",
      "gear_types",
      "ships",
      "ctype",
    ])),
  },
});

export default Index;
