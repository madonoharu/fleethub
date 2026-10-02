import { Stack, Tooltip, Typography } from "@mui/material";
import { AttackReport } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { toPercent } from "../../../utils";
import { InfoButton } from "../../molecules";

import AttackPowerDetails from "./AttackPowerDetails";
import { cn } from "../../../styles";

const DamageValue = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span {...props} className={cn("[display:inline-block] min-w-6", className)} />
);

type DamageRangeProps = {
  min: number;
  max: number;
  scratchRate: number;
  isCapped?: boolean | null;
};

const DamageRange: React.FCX<DamageRangeProps> = ({ min, max, scratchRate, isCapped }) => {
  const { t } = useTranslation("common");

  const left = scratchRate > 0 ? `${t("ScratchDamage")} ${toPercent(scratchRate, 0)}` : min;

  let inner: React.ReactNode;

  if (scratchRate === 1) {
    inner = left;
  } else {
    inner = (
      <>
        <DamageValue>{left}</DamageValue>
        <span>~</span>
        <DamageValue>{max}</DamageValue>
      </>
    );
  }

  return (
    <Typography
      className="flex justify-end gap-2"
      variant="inherit"
      color={isCapped ? "secondary" : undefined}
    >
      {inner}
    </Typography>
  );
};

interface DamageCellProps {
  stats: AttackReport<unknown>;
}

const DamageCell: React.FC<DamageCellProps> = ({ stats }) => {
  const { t } = useTranslation("common");
  const { damage, attack_power, attack_power_params } = stats;

  const isCapped = attack_power?.is_capped;

  if (!damage) {
    return <>?</>;
  }

  return (
    <Stack className="items-center justify-end gap-2" direction="row">
      <div className="grid [grid-template-columns:auto_1fr] gap-[0_16px]">
        <Tooltip title={t("Normal")}>
          <span>N</span>
        </Tooltip>
        <DamageRange
          min={damage.normal_damage_min}
          max={damage.normal_damage_max}
          scratchRate={damage.normal_scratch_rate}
          isCapped={isCapped}
        />
        <Tooltip title={t("Critical")}>
          <span>C</span>
        </Tooltip>
        <DamageRange
          min={damage.critical_damage_min}
          max={damage.critical_damage_max}
          scratchRate={damage.critical_scratch_rate}
          isCapped={isCapped}
        />
      </div>
      <InfoButton
        size="tiny"
        title={
          attack_power && attack_power_params ? (
            <AttackPowerDetails power={attack_power} params={attack_power_params} />
          ) : (
            "?"
          )
        }
      />
    </Stack>
  );
};

export default DamageCell;
