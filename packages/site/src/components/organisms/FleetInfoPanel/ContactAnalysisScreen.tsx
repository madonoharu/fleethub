import { Typography } from "@mui/material";
import { ContactAnalysis, DayContactChance } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { toPercent } from "../../../utils";
import Table from "../Table";
import { cn } from "../../../styles";

type ContactChanceTableProps = {
  data: DayContactChance[];
  label: string;
};

const ContactChanceTable: React.FCX<ContactChanceTableProps> = ({ className, data, label }) => {
  const { t } = useTranslation("common");

  return (
    <div>
      <Typography color="textSecondary">{label}</Typography>
      <Table
        className={className}
        data={data}
        columns={[
          {
            label: t("AirState.name"),
            getValue: (datum) => t(`AirState.${datum.air_state}`),
          },
          {
            label: t("trigger_rate"),
            align: "right",
            getValue: (datum) => toPercent(datum.trigger_rate),
          },
          {
            label: `x1.2 ${t("ContactChance")}`,
            align: "right",
            getValue: (datum) => toPercent(datum.rank3),
          },
          {
            label: `x1.17 ${t("ContactChance")}`,
            align: "right",
            getValue: (datum) => toPercent(datum.rank2),
          },
          {
            label: `x1.12 ${t("ContactChance")}`,
            align: "right",
            getValue: (datum) => toPercent(datum.rank1),
          },
          {
            label: `${t("Total")} ${t("ContactChance")}`,
            align: "right",
            getValue: (datum) => toPercent(datum.total),
          },
        ]}
      />
    </div>
  );
};

interface Props {
  analysis: ContactAnalysis;
}

const ContactAnalysisScreen: React.FCX<Props> = ({ className, analysis }) => {
  return (
    <div className={className}>
      {analysis.single && <ContactChanceTable label="対通常戦" data={analysis.single} />}
      {analysis.combined && <ContactChanceTable label="対連合戦" data={analysis.combined} />}
    </div>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof ContactAnalysisScreen>) => (
  <ContactAnalysisScreen
    {...props}
    className={cn("w-fit mr-auto ml-auto [&_>_*]:mb-4", className)}
  />
);
