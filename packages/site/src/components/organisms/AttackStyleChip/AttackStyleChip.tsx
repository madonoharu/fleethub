import { isUnknownRecord } from "@fh/utils";
import { Tooltip, Typography } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { numstr, toPercent } from "../../../utils";
import { AttackTypeChip } from "../../molecules";

interface CutinDetailsProps {
  attack: Record<string, unknown> & { cutin: string };
}

const CutinDetails: React.FC<CutinDetailsProps> = ({ attack }) => {
  const { t } = useTranslation("common");

  const hits = typeof attack.hits === "number" ? attack.hits : 1;
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
      <AttackTypeChip className="mb-2" attack={attack} />
      <Typography
        className="grid [grid-template-columns:auto_auto] gap-[0_8px]"
        component="div"
        variant="body2"
      >
        <span>{t("power_mod")}</span>
        <span>{numstr(attack.power_mod) || "?"}</span>
        <span>{t("accuracy_mod")}</span>
        <span>{numstr(attack.accuracy_mod) || "?"}</span>
        <span>{t("hits")}</span>
        <span>{hitsText}</span>
      </Typography>
    </>
  );
};

interface Props {
  attack: unknown;
}

function hasCutin(attack: unknown): attack is Record<string, unknown> & { cutin: string } {
  return isUnknownRecord(attack) && typeof attack.cutin === "string";
}

const AttackStyleChip: React.FCX<Props> = ({ className, attack }) => {
  if (hasCutin(attack)) {
    return (
      <Tooltip title={<CutinDetails attack={attack} />}>
        <AttackTypeChip className={className} attack={attack} />
      </Tooltip>
    );
  }

  return <AttackTypeChip className={className} attack={attack} />;
};

export default AttackStyleChip;
