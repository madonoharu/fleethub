import { storage } from "@fh/admin";
import { createEquipmentBonuses } from "equipment-bonus";
import {
  air_squadron_can_equip,
  org_type_is_single,
  org_type_default_formation,
  org_type_is_player,
  FhCore,
  MasterData,
} from "fleethub-core";
import type { GetStaticProps, NextComponentType, NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import AppContent from "../components/templates/AppContent";
import { GCS_PREFIX_URL, MASTER_DATA_PATH } from "../firebase";
import { FhCoreContext, GenerationMapContext, useGcs } from "../hooks";
import { StoreProvider } from "../store";

type Props = {
  generationMap: Record<string, string>;
};

const Loader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: masterData } = useGcs<MasterData>(MASTER_DATA_PATH);

  if (!masterData) {
    return null;
  }

  const core = new FhCore(masterData, createEquipmentBonuses);
  const analyzer = core.create_analyzer();

  const value = {
    module: {
      air_squadron_can_equip,
      org_type_is_single,
      org_type_default_formation,
      org_type_is_player,
    },
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

  const time = new Date().toISOString();

  return {
    revalidate: 60,
    props: {
      ...ssrConfig,
      generationMap,
      time,
    },
  };
};

export default Index;
