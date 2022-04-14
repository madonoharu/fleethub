import { storage } from "@fh/admin";
import { Alert } from "@mui/material";
import { createEquipmentBonuses } from "equipment-bonus";
import { FhCore, MasterData } from "fleethub-core";
import type { GetStaticProps, NextComponentType, NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { GCS_PREFIX_URL, MASTER_DATA_PATH } from "../firebase";
import { FhCoreContext, GenerationMapContext, useGcs } from "../hooks";
import { StoreProvider } from "../store";

const AppContent = dynamic(() => import("../components/templates/AppContent"), {
  // trueの場合、ISRのrevalidate時に10sを超えてしまう
  ssr: false,
});

type Props = {
  createdAt: string;
  generationMap: Record<string, string>;
};

const Loader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: masterData, error } = useGcs<MasterData>(MASTER_DATA_PATH);

  if (error) {
    console.error(error);
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!masterData) {
    return null;
  }

  let core: FhCore;
  try {
    core = new FhCore(masterData, createEquipmentBonuses);
  } catch (error: unknown) {
    console.error(error);
    return <Alert severity="error">{String(error)}</Alert>;
  }

  const analyzer = core.create_analyzer();

  const value = {
    core,
    analyzer,
    masterData,
  };

  return (
    <FhCoreContext.Provider value={value}>
      <StoreProvider masterData={value.masterData}>{children}</StoreProvider>
    </FhCoreContext.Provider>
  );
};

const Index: NextComponentType<NextPageContext, unknown, Props> = ({
  generationMap,
}) => {
  const preloadLinks = [MASTER_DATA_PATH, "data/ship_banners.json"].map(
    (path) => {
      const gen = generationMap[path];

      return (
        gen && (
          <link
            key={path}
            rel="preload"
            href={`${GCS_PREFIX_URL}/${path}?generation=${gen}`}
            as="fetch"
            crossOrigin="anonymous"
          />
        )
      );
    }
  );

  return (
    <div>
      <Head>
        <title>作戦室</title>
        {preloadLinks}
      </Head>

      <GenerationMapContext.Provider value={generationMap}>
        <Loader>
          <DndProvider backend={HTML5Backend}>
            <AppContent />
          </DndProvider>
        </Loader>
      </GenerationMapContext.Provider>
    </div>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({
  locale = "",
}) => {
  const [generationMap, ssrConfig] = await Promise.all([
    storage.fetchGenerationMap(),
    serverSideTranslations(locale, [
      "common",
      "terms",
      "gears",
      "gear_types",
      "ships",
      "ctype",
    ]),
  ]);

  const createdAt = new Date().toISOString();

  return {
    revalidate: 60,
    props: {
      createdAt,
      generationMap,
      ...ssrConfig,
    },
  };
};

export default Index;
