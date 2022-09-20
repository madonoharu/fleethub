import { styled, css, Tooltip, Typography } from "@mui/material";
import { AttackReport } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { toPercent } from "../../../utils";

const DamageValue = styled("span")`
  display: inline-block;
  min-width: 24px;
`;

type DamageRangeProps = {
  min: number;
  max: number;
  scratchRate: number;
  isCapped?: boolean | null;
};

const DamageRange: React.FCX<DamageRangeProps> = ({
  min,
  max,
  scratchRate,
  isCapped,
}) => {
  const { t } = useTranslation("common");

  const left =
    scratchRate > 0
      ? `${t("ScratchDamage")} ${toPercent(scratchRate, 0)}`
      : min;

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
      variant="inherit"
      display="flex"
      justifyContent="flex-end"
      gap={1}
      color={isCapped ? "secondary.light" : undefined}
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
    <div
      css={css`
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0 16px;
        width: max-content;
      `}
    >
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
