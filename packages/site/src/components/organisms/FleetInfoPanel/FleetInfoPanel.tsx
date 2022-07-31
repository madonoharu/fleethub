import { Paper } from "@mui/material";
import { styled } from "@mui/system";
import { Comp, Fleet } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { CompProvider, useCompContext } from "../../../hooks";
import { Tabs, TabsProps } from "../../molecules";

import AntiAirAnalysisScreen from "./AntiAirAnalysisScreen";
import ContactAnalysisScreen from "./ContactAnalysisScreen";
import DayAnalysisScreen from "./DayAnalysisScreen";
import MiscScreen from "./MiscScreen";
import NightAnalysisScreen from "./NightAnalysisScreen";

const Inner: React.FCX<{ fleet: Fleet }> = ({ fleet }) => {
  const { t } = useTranslation("common");
  const { comp, analyzer, config } = useCompContext();

  const result = analyzer.analyze_comp(comp, config);

  const list: TabsProps["list"] = [
    {
      label: t("Day"),
      panel: (
        <DayAnalysisScreen
          analysis={result.day}
          isCombined={comp.is_combined()}
        />
      ),
    },
    {
      label: t("Night"),
      panel: <NightAnalysisScreen analysis={result.night} />,
    },
    {
      label: t("Contact"),
      panel: <ContactAnalysisScreen analysis={result.contact} />,
    },
    {
      label: t("anti_air"),
      panel: <AntiAirAnalysisScreen analysis={result.anti_air} />,
    },
    { label: t("Misc"), panel: <MiscScreen comp={comp} fleet={fleet} /> },
  ];

  return <Tabs size="small" list={list} />;
};

interface Props {
  comp: Comp;
  fleet: Fleet;
}

const FleetInfoPanel: React.FCX<Props> = ({ className, comp, fleet }) => {
  return (
    <Paper className={className}>
      <CompProvider comp={comp}>
        <Inner fleet={fleet} />
      </CompProvider>
    </Paper>
  );
};

export default styled(FleetInfoPanel)`
  padding: 8px;
  min-height: 480px;
`;
