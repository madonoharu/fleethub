import { Typography } from "@mui/material";
import {
  AttackInfoItem,
  DayCutin,
  NightCutin,
  WarfareInfo,
  AttackStats,
} from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { TFunction } from "react-i18next";

import { numstr, toPercent } from "../../../utils";
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

type TFn = TFunction<"common", undefined>;

const createDamageColumns = (t: TFn): ColumnProps<{ stats: AttackStats }>[] => [
  {
    label: `${t("hit_rate")} (${t("Critical")})`,
    align: "right",
    getValue: (item) => (
      <Flexbox gap={1} justifyContent="flex-end">
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
    align: "right",
    getValue: (item) => {
      const { damage, attack_power } = item.stats;
      if (!damage) return "?";
      const {
        normal_damage_min: min,
        normal_damage_max: max,
        normal_scratch_rate: sr,
      } = damage;

      return (
        <DamageRange
          min={min}
          max={max}
          scratchRate={sr}
          isCapped={attack_power?.is_capped}
        />
      );
    },
  },
  {
    label: t("Critical"),
    align: "right",
    getValue: (item) => {
      const { damage, attack_power } = item.stats;
      if (!damage) return "?";
      const {
        critical_damage_min: min,
        critical_damage_max: max,
        critical_scratch_rate: sr,
      } = damage;

      return (
        <DamageRange
          min={min}
          max={max}
          scratchRate={sr}
          isCapped={attack_power?.is_capped}
        />
      );
    },
  },
];

const createAttackPowerColumns = (
  t: TFn
): ColumnProps<{ stats: AttackStats }>[] => [
  {
    label: t("Normal"),
    align: "right",
    getValue: (item) => (
      <Typography
        variant="inherit"
        color={item.stats.attack_power?.is_capped ? "secondary" : undefined}
      >
        {numstr(item.stats.attack_power?.normal) || "?"}
      </Typography>
    ),
  },
  {
    label: t("Critical"),
    align: "right",
    getValue: (item) => (
      <Typography
        variant="inherit"
        color={item.stats.attack_power?.is_capped ? "secondary" : undefined}
      >
        {numstr(item.stats.attack_power?.critical) || "?"}
      </Typography>
    ),
  },
];

export const createAttackTableColumns = (
  t: TFn,
  disableDamage: boolean
): ColumnProps<{ stats: AttackStats }>[] => {
  const inner = disableDamage
    ? createAttackPowerColumns(t)
    : createDamageColumns(t);

  return [
    ...inner,
    {
      label: null,
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
  disableDamage = false,
}) => {
  const { t } = useTranslation("common");

  const data: AttackInfoItem<DayCutin | NightCutin | null>[] = info.items;
  const columns: ColumnProps<InfoItem>[] = [
    {
      label: t("Type"),
      getValue: (item) => (
        <AttackChip type={type} cutin={item.cutin} css={{ width: "100%" }} />
      ),
    },

    {
      label: t("ProcRate"),
      align: "right",
      getValue: (item) => toPercent(item.rate),
    },

    ...createAttackTableColumns(t, disableDamage),
  ];

  return (
    <div className={className}>
      <Table data={data} padding="none" columns={columns} />

      {info.damage_state_map && !disableDamage && (
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
