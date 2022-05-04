import { storage } from "@fh/admin";
import type { GetStaticProps, NextComponentType, NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";

import {
  GCS_PREFIX_URL,
  MASTER_DATA_PATH,
  SHIP_BANNERS_PATH,
} from "../firebase";
import { GenerationMapContext } from "../hooks";

const AppContent = dynamic(() => import("../components/templates/AppContent"), {
  // trueの場合、ISRのrevalidate時に10sを超えてしまう
  ssr: false,
});

interface PageProps {
  createdAt: string;
  generationMap: Record<string, string>;
}

const Index: NextComponentType<NextPageContext, unknown, PageProps> = (
  props
) => {
  const { generationMap } = props;

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
        <AppContent />
      </GenerationMapContext.Provider>
    </div>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async ({
  locale = "",
}) => {
  const [generationMap, ssrConfig] = await Promise.all([
    storage.fetchGenerationMap(),
    serverSideTranslations(locale, [
      "common",
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
