import { Typography } from "@mui/material";
import type { ActionReport, AttackReport } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { TFunction } from "react-i18next";

import { numstr, toPercent } from "../../../utils";
import { Flexbox } from "../../atoms";
import { InfoButton } from "../../molecules";
import AttackStyleChip from "../AttackStyleChip";
import Table, { ColumnProps } from "../Table";

import AttackPowerDetails from "./AttackPowerDetails";
import DamageCell from "./DamageCell";
import DamageStateDensityBarChart from "./DamageStateDensityBarChart";
import HitRateDetails from "./HitRateDetails";
import ProcRateCell from "./ProcRateCell";

type TFn = TFunction<"common", undefined>;

type ItemType = AttackReport<unknown>;

const createDamageColumns = (t: TFn): ColumnProps<AttackReport<unknown>>[] => [
  {
    label: `${t("hit_rate")} (${t("Critical")})`,
    align: "right",
    getValue: (item) => (
      <Flexbox gap={1} justifyContent="flex-end">
        <span>{toPercent(item.hit_rate?.total)}</span>
        <span>({toPercent(item.hit_rate?.critical)})</span>
        <InfoButton
          size="tiny"
          title={
            <HitRateDetails
              hitRate={item.hit_rate}
              params={item.hit_rate_params}
            />
          }
        />
      </Flexbox>
    ),
  },
  {
    label: t("Damage"),
    align: "right",
    getValue: (item) => {
      return <DamageCell stats={item} />;
    },
  },
];

const createAttackPowerColumns = (
  t: TFn
): ColumnProps<AttackReport<unknown>>[] => [
  {
    label: t("Normal"),
    align: "right",
    getValue: (item) => (
      <Typography
        variant="inherit"
        color={item.attack_power?.is_capped ? "secondary" : undefined}
      >
        {numstr(item.attack_power?.normal) || "?"}
      </Typography>
    ),
  },
  {
    label: t("CriticalAbbr"),
    align: "right",
    getValue: (item) => (
      <Typography
        variant="inherit"
        color={item.attack_power?.is_capped ? "secondary" : undefined}
      >
        {numstr(item.attack_power?.critical) || "?"}
      </Typography>
    ),
  },
  {
    label: null,
    align: "right",
    getValue: (item) => {
      const { attack_power, attack_power_params } = item;
      if (!attack_power || !attack_power_params) return null;

      return (
        <InfoButton
          size="tiny"
          title={
            <AttackPowerDetails
              power={attack_power}
              params={attack_power_params}
            />
          }
        />
      );
    },
  },
];

export function createAttackTableColumns(
  t: TFn,
  disableDamage: boolean
): ColumnProps<AttackReport<unknown>>[] {
  const columns = disableDamage
    ? createAttackPowerColumns(t)
    : createDamageColumns(t);
  return columns;
}

type AttackTableVariant = "power" | "damage";

type AttackReportType = Partial<ActionReport<unknown>> &
  Pick<ActionReport<unknown>, "data">;

type AttackTableProps = {
  report: AttackReportType;
  variant?: AttackTableVariant;
};

const AttackTable: React.FCX<AttackTableProps> = ({
  className,
  report,
  variant,
}) => {
  const { t } = useTranslation("common");
  const { damage_state_density } = report;
  const data = Object.values(report.data);
  data.sort((a, b) => (b.proc_rate || 0) - (a.proc_rate || 0));

  const disableDamage = variant === "power";

  const columns: ColumnProps<ItemType>[] = [
    {
      label: t("Type"),
      getValue: (item) => (
        <AttackStyleChip attack={item.style} css={{ width: "100%" }} />
      ),
    },

    {
      label: t("ProcRate"),
      getValue: (item) => <ProcRateCell sx={{ ml: 1 }} item={item} />,
    },

    ...createAttackTableColumns(t, disableDamage),
  ];

  return (
    <div className={className}>
      <Table data={data} padding="none" columns={columns} />

      {damage_state_density && !disableDamage && (
        <>
          <Typography marginTop={1} variant="subtitle2">
            命中ダメージ分布
          </Typography>
          <DamageStateDensityBarChart data={damage_state_density} />
        </>
      )}
    </div>
  );
};

export default AttackTable;
