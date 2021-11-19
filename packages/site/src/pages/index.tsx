/** @jsxImportSource @emotion/react */
import { createEquipmentBonuses } from "equipment-bonus";
import type { GetStaticProps, NextComponentType, NextPageContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { AppContent } from "../components/templates";
import { fetchMasterData } from "../firebase";
import { FhCoreContext } from "../hooks";
import { StoreProvider } from "../store";

const loader = async () => {
  const [module, masterData] = await Promise.all([
    import("fleethub-core"),
    fetchMasterData(),
  ]);

  if (process.env.NODE_ENV === "development") {
    module.set_panic_hook();
  }

  let core: import("fleethub-core").FhCore | null;

  try {
    core = new module.FhCore(masterData, createEquipmentBonuses);
  } catch (error) {
    console.error(error);
  }

  const Provider: React.FC = ({ children }) => {
    return (
      <FhCoreContext.Provider value={core && { masterData, module, core }}>
        <StoreProvider masterData={masterData}>{children}</StoreProvider>
      </FhCoreContext.Provider>
    );
  };

  return Provider;
};

const FhCoreProvider = dynamic(loader);

const Index: NextComponentType<NextPageContext, unknown> = () => {
  return (
    <div>
      <Head>
        <title>作戦室</title>
      </Head>

      <FhCoreProvider>
        <DndProvider backend={HTML5Backend}>
          <AppContent />
        </DndProvider>
      </FhCoreProvider>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "" }) => {
  const ssrConfig = await serverSideTranslations(locale, [
    "common",
    "gears",
    "gear_types",
    "ships",
    "ctype",
  ]);

  return {
    revalidate: 1,
    props: {
      ...ssrConfig,
    },
  };
};

export default Index;
