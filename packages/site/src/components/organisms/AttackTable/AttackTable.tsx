import { AttackInfoItem, DayCutin, NightCutin, WarfareInfo } from "@fh/core";
import { Typography } from "@mui/material";
import { TFunction, useTranslation } from "next-i18next";
import React from "react";

import { toPercent } from "../../../utils";
import { Flexbox } from "../../atoms";
import { InfoButton } from "../../molecules";
import AttackChip from "../AttackChip";
import Table, { ColumnProps } from "../Table";
import AttackPowerDetails from "./AttackPowerDetails";
import DamageRange from "./DamageRange";
import DamageStateMapBarChart from "./DamageStateMapBarChart";
import HitRateDetails from "./HitRateDetails";

type AttackTableType = "Shelling" | "Asw" | "NightAttack" | "Torpedo";

type Info = NonNullable<
  WarfareInfo["day"] | WarfareInfo["closing_torpedo"] | WarfareInfo["night"]
>;
type InfoItem = Info["items"][number];

const createDamageColumns = (
  type: AttackTableType,
  t: TFunction
): ColumnProps<InfoItem>[] => [
  {
    label: `${t("HitRate")} (${t("Critical")})`,
    getValue: (item) => (
      <Flexbox gap={1}>
        <span>{toPercent(item.stats.hit_rate?.total)}</span>
        <span>({toPercent(item.stats.hit_rate?.critical)})</span>
        <InfoButton
          size="tiny"
          title={
            <HitRateDetails
              hitRate={item.stats.hit_rate}
              params={item.stats.hit_rate_params}
            />
          }
        />
      </Flexbox>
    ),
  },
  {
    label: t("Normal"),
    getValue: (item) => {
      const { damage } = item.stats;
      if (!damage) return "?";
      const {
        normal_damage_min: min,
        normal_damage_max: max,
        normal_scratch_rate: sr,
      } = damage;

      return <DamageRange min={min} max={max} scratchRate={sr} />;
    },
  },
  {
    label: t("Critical"),
    getValue: (item) => {
      const { damage } = item.stats;
      if (!damage) return "?";
      const {
        critical_damage_min: min,
        critical_damage_max: max,
        critical_scratch_rate: sr,
      } = damage;

      return <DamageRange min={min} max={max} scratchRate={sr} />;
    },
  },
];

const createAttackPowerColumns = (
  type: AttackTableType,
  t: TFunction
): ColumnProps<InfoItem>[] => [
  {
    label: t("Normal"),
    getValue: (item) => (
      <Typography variant="inherit">
        {item.stats.attack_power?.normal || "?"}
      </Typography>
    ),
  },
  {
    label: t("Critical"),
    getValue: (item) => (
      <Typography variant="inherit">
        {item.stats.attack_power?.critical || "?"}
      </Typography>
    ),
  },
];

const createColumns = (
  type: AttackTableType,
  t: TFunction,
  disableDamage = false
) => {
  const inner = disableDamage
    ? createAttackPowerColumns(type, t)
    : createDamageColumns(type, t);

  const columns: ColumnProps<InfoItem>[] = [
    {
      label: t("Type"),
      getValue: (item) => (
        <Flexbox gap={1}>
          <AttackChip type={type} cutin={item.cutin} />
          <span>{toPercent(item.rate)}</span>
        </Flexbox>
      ),
    },

    ...inner,
    {
      label: t("Details"),
      getValue: ({ stats }) => {
        const { attack_power, attack_power_params } = stats;
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

  return columns;
};

type AttackTableProps = {
  type: AttackTableType;
  info: Info;
  disableDamage?: boolean;
};

const AttackTable: React.FCX<AttackTableProps> = ({
  className,
  type,
  info,
  disableDamage,
}) => {
  const { t } = useTranslation("common");

  const data: AttackInfoItem<DayCutin | NightCutin | null>[] = info.items;
  const columns = createColumns(type, t, disableDamage);

  return (
    <div className={className}>
      <Table data={data} padding="none" columns={columns} />

      {!info.damage_state_map_is_empty && !disableDamage && (
        <>
          <Typography marginTop={1} variant="subtitle2">
            命中ダメージ分布
          </Typography>
          <DamageStateMapBarChart data={info.damage_state_map} />
        </>
      )}
    </div>
  );
};

export default AttackTable;
