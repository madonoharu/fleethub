import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { AirstrikeContactChance } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useCompContext } from "../../../hooks";
import { toPercent } from "../../../utils";
import Table from "../Table";

type ContactChanceTableProps = {
  data: AirstrikeContactChance[];
  label: string;
};

const ContactChanceTable: React.FCX<ContactChanceTableProps> = ({
  className,
  data,
  label,
}) => {
  const { t } = useTranslation("common");
  return (
    <div>
      <Typography color="textSecondary">{label}</Typography>
      <Table
        className={className}
        padding="none"
        data={data}
        columns={[
          {
            label: t("AirState.name"),
            getValue: (datum) => t(`AirState.${datum.air_state}`) as string,
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

const ContactChancePanel: React.FCX = ({ className }) => {
  const { comp, analyzer } = useCompContext();
  const info = analyzer.analyze_contact_chance(comp);

  return (
    <div className={className}>
      {info.single && (
        <ContactChanceTable label="対通常戦" data={info.single} />
      )}
      {info.combined && (
        <ContactChanceTable label="対連合戦" data={info.combined} />
      )}
    </div>
  );
};

export default styled(ContactChancePanel)`
  width: 620px;
  margin-right: auto;
  margin-left: auto;
  > * {
    margin-bottom: 16px;
  }
`;
