import { storage } from "@fh/admin";
import { FhCore } from "fleethub-core";
import type { GetStaticProps, NextComponentType, NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import ErrorAlert from "../components/molecules/ErrorAlert";
import {
  GCS_PREFIX_URL,
  MASTER_DATA_PATH,
  SHIP_BANNERS_PATH,
} from "../firebase";
import { FhCoreContext, GenerationMapContext, useMasterData } from "../hooks";
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
  const { data, error } = useMasterData();

  if (error) {
    return (
      <ErrorAlert
        sx={{ m: 2 }}
        title="マスターデータの読み込みに失敗しました"
        error={error}
      />
    );
  }

  if (!data) {
    return null;
  }

  let core: FhCore;
  try {
    core = new FhCore(data);
  } catch (error: unknown) {
    return (
      <ErrorAlert
        sx={{ m: 2 }}
        title="マスターデータの読み込みに失敗しました"
        error={error}
      />
    );
  }

  const analyzer = core.create_analyzer();
  const allShips = core.create_all_ships();

  const value = {
    core,
    analyzer,
    allShips,
    masterData: data,
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
  const preloadLinks = [MASTER_DATA_PATH, SHIP_BANNERS_PATH].map((path) => {
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
  });

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
