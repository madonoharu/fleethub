import { Tooltip, Typography } from "@mui/material";
import { AttackReport } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { toPercent } from "../../../utils";
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
      className={cn("flex justify-end gap-2", isCapped && "text-secondary-light")}
      variant="inherit"
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
  const { damage, attack_power } = stats;

  const isCapped = attack_power?.is_capped;

  if (!damage) {
    return <>?</>;
  }

  return (
    <div className="grid [grid-template-columns:auto_1fr] gap-[0_16px] w-max">
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
  );
};

export default DamageCell;
