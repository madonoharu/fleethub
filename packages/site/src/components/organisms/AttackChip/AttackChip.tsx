import { Chip, Tooltip, Typography } from "@mui/material";
import { styled, css } from "@mui/system";
import {
  DayBattleAttackType,
  DayCutin,
  DayCutinDef,
  NightBattleAttackType,
  NightCutin,
  NightCutinDef,
} from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";

interface CutinDetailsProps {
  label: string;
  def: DayCutinDef | NightCutinDef;
}

const CutinDetails: React.FC<CutinDetailsProps> = ({ label, def }) => {
  const { t } = useTranslation("common");

  const { hits } = def;

  let hitsText: string;

  if (Number.isInteger(hits)) {
    hitsText = hits.toString();
  } else {
    const n = Math.floor(hits);
    const r = hits - n;
    hitsText = `${n} (${toPercent(1 - r, 0)}) ~ ${n + 1} (${toPercent(r, 0)})`;
  }

  return (
    <>
      <Typography variant="subtitle2" mb={1}>
        {label}
      </Typography>
      <Typography
        component="div"
        variant="body2"
        css={css`
          display: grid;
          grid-template-columns: auto auto;
          gap: 0 8px;
        `}
      >
        <span>{t("power_mod")}</span>
        <span>{def.power_mod}</span>
        <span>{t("accuracy_mod")}</span>
        <span>{def.accuracy_mod}</span>
        <span>{t("type_factor")}</span>
        <span>{def.type_factor}</span>
        <span>{t("hits")}</span>
        <span>{hitsText}</span>
      </Typography>
    </>
  );
};

type WarfareType =
  | DayBattleAttackType["t"]
  | NightBattleAttackType["t"]
  | "Torpedo";

type Props = {
  type: WarfareType;
  cutin?: string | null | undefined;
};

const AttackChip: React.FCX<Props> = ({ className, type, cutin }) => {
  const { t } = useTranslation("common");
  const { masterData } = useFhCore();

  let label: string;
  let title: React.ReactNode;

  if (type === "Shelling") {
    if (cutin) {
      label = t(`DayCutin.${cutin as DayCutin}`);
      const def = masterData.day_cutin.find((def) => def.tag == cutin);
      title = def && <CutinDetails label={label} def={def} />;
    } else {
      label = t("WarfareType.Shelling");
    }
  } else if (type === "NightAttack") {
    if (cutin) {
      label = t(`NightCutin.${cutin as NightCutin}`);
      const def = masterData.night_cutin.find((def) => def.tag == cutin);
      title = def && <CutinDetails label={label} def={def} />;
    } else {
      label = t("Night");
    }
  } else if (type === "Torpedo") {
    label = t("WarfareType.Torpedo");
  } else if (type === "Asw") {
    label = t("WarfareType.AntiSub");
  } else {
    label = t("Unknown");
  }

  return (
    <Tooltip title={title || label}>
      <Chip
        className={className}
        variant="outlined"
        size="small"
        label={label}
      />
    </Tooltip>
  );
};

export default styled(AttackChip)(({ theme, type }) => {
  const color = theme.colors[type];
  const minWidth = type === "NightAttack" ? 72 : 48;

  return css`
    border-radius: 4px;
    min-width: ${minWidth}px;
    border-color: ${color};
    color: ${color};
  `;
});
