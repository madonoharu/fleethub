/** @jsxImportSource @emotion/react */
import { createEquipmentBonuses } from "equipment-bonus";
import {
  set_panic_hook,
  org_type_is_single,
  org_type_default_formation,
  org_type_is_player,
  air_squadron_can_equip,
  FhCore,
  MasterData,
} from "fleethub-core";
import type { GetStaticProps, NextComponentType, NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { AppContent } from "../components/templates";
import { fetchMasterData } from "../firebase";
import { FhCoreContext } from "../hooks";
import { StoreProvider } from "../store";

type StaticProps = { date: string; masterData: MasterData };

const Index: NextComponentType<NextPageContext, unknown, StaticProps> = ({
  date,
  masterData,
}) => {
  if (process.browser) {
    console.log(date);
  }

  const core = new FhCore(masterData, createEquipmentBonuses);

  if (process.env.NODE_ENV === "development") {
    set_panic_hook();
  }

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
        <StoreProvider masterData={masterData}>
          <FhCoreContext.Provider
            value={{
              masterData,
              core,
              module: {
                org_type_is_single,
                org_type_default_formation,
                org_type_is_player,
                air_squadron_can_equip,
              },
            }}
          >
            <AppContent />
          </FhCoreContext.Provider>
        </StoreProvider>
      </DndProvider>
    </div>
  );
};

export const getStaticProps: GetStaticProps<StaticProps> = async ({
  locale = "",
}) => {
  const masterData = await fetchMasterData();
  const date = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  return {
    revalidate: 60,
    props: {
      date,
      masterData,
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
