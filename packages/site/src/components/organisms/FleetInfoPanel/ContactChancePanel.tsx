/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { AirstrikeContactChance, OrgContactChanceInfo } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import Table from "../Table";
import { FleetInfoPanelProps } from "./FleetInfoPanel";

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
            label: t("AirState"),
            getValue: (datum) => t(datum.air_state),
          },
          {
            label: "開始率",
            align: "right",
            getValue: (datum) => toPercent(datum.trigger_rate),
          },
          {
            label: "x1.2触接率",
            align: "right",
            getValue: (datum) => toPercent(datum.rank3),
          },
          {
            label: "x1.17触接率",
            align: "right",
            getValue: (datum) => toPercent(datum.rank2),
          },
          {
            label: "x1.12触接率",
            align: "right",
            getValue: (datum) => toPercent(datum.rank1),
          },
          {
            label: "合計触接率",
            align: "right",
            getValue: (datum) => toPercent(datum.total),
          },
        ]}
      />
    </div>
  );
};

const ContactChancePanel: React.FCX<FleetInfoPanelProps> = ({
  className,
  org,
  fleetKey,
}) => {
  const { core } = useFhCore();
  const info = core.analyze_contact_chance(
    org,
    fleetKey
  ) as OrgContactChanceInfo;

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
