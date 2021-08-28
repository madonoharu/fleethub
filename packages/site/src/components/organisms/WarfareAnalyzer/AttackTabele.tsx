import { ShellingAttackAnalysis } from "@fleethub/core";
import { Typography } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";
import { toPercent } from "../../../utils";
import { InfoButton } from "../../molecules";
import AttackChip from "../AttackChip";
import Table from "../Table";
import AttackPowerDetails from "./AttackPowerDetails";
import DamageStateMapBarChart from "./DamageStateMapBarChart";

type AttackTabeleProps = {
  data: ShellingAttackAnalysis;
};

const AttackTabele: React.FCX<AttackTabeleProps> = ({ className, data }) => {
  const { t } = useTranslation("common");
  return (
    <div className={className}>
      <Typography variant="subtitle2">{t("Shelling")}</Typography>
      <Table
        data={data.items}
        padding="none"
        columns={[
          {
            label: t("SpecialAttack"),
            getValue: (item) => <AttackChip attack={item.cutin} />,
          },
          {
            label: t("Normal"),
            getValue: (item) => (
              <Typography variant="inherit">
                <span>{item.damage?.normal_damage_min || "?"}</span>
                <span>~</span>
                <span>{item.damage?.normal_damage_max || "?"}</span>
                <span>({toPercent(item.hit_rate?.normal)})</span>
              </Typography>
            ),
          },
          {
            label: t("Critical"),
            getValue: (item) => (
              <Typography variant="inherit">
                <span>{item.damage?.critical_damage_min || "?"}</span>
                <span>~</span>
                <span>{item.damage?.critical_damage_max || "?"}</span>
                <span>({toPercent(item.hit_rate?.critical)})</span>
              </Typography>
            ),
          },
          {
            label: t("Details"),
            getValue: ({ attack_power, attack_power_params }) => {
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
        ]}
      />

      {!data.damage_state_map_is_empty && (
        <>
          <Typography variant="subtitle2">命中ダメージ分布</Typography>
          <DamageStateMapBarChart data={data.damage_state_map} />
        </>
      )}
    </div>
  );
};

export default AttackTabele;
