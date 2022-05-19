import { Container } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useMasterData } from "../../../hooks";
import { Tabs } from "../../molecules";

import AntiAirCutinMenu from "./AntiAirCutinMenu";
import DayCutinMenu from "./DayCutinMenu";
import NightCutinMenu from "./NightCutinMenu";
import ShipsMenu from "./ShipsMenu";

const ConfigPage: React.FC = () => {
  const { data } = useMasterData();
  const { t } = useTranslation("common");

  if (!data) {
    return null;
  }

  return (
    <Container>
      <Tabs
        list={[
          {
            label: t("DayCutin.name"),
            panel: <DayCutinMenu data={data} />,
          },
          {
            label: t("NightCutin.name"),
            panel: <NightCutinMenu data={data} />,
          },
          {
            label: t("AntiAirCutin"),
            panel: <AntiAirCutinMenu data={data} />,
          },
          {
            label: t("Ship"),
            panel: <ShipsMenu />,
          },
        ]}
      />
    </Container>
  );
};

export default ConfigPage;
