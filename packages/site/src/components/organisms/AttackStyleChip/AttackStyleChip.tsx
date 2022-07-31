import { isUnknownRecord } from "@fh/utils";
import { css, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { numstr, toPercent } from "../../../utils";
import { AttackTypeChip, AttackTypeTag } from "../../molecules";

interface CutinDetailsProps {
  type: AttackTypeTag | null;
  cutin: string;
  attackStyle: Record<string, unknown>;
}

const CutinDetails: React.FC<CutinDetailsProps> = ({
  type,
  cutin,
  attackStyle,
}) => {
  const { t } = useTranslation("common");

  const hits = typeof attackStyle.hits === "number" ? attackStyle.hits : 1;
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
      <AttackTypeChip type={type} cutin={cutin} />
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
        <span>{numstr(attackStyle.power_mod) || "?"}</span>
        <span>{t("accuracy_mod")}</span>
        <span>{numstr(attackStyle.accuracy_mod) || "?"}</span>
        <span>{t("hits")}</span>
        <span>{hitsText}</span>
      </Typography>
    </>
  );
};

interface Props {
  attackStyle: unknown;
}

const AttackStyleChip: React.FCX<Props> = ({ className, attackStyle }) => {
  if (!isUnknownRecord(attackStyle)) {
    return <AttackTypeChip type={null} cutin={null} />;
  }

  const type = getAttackTypeTag(attackStyle.tag);
  const cutin = attackStyle.cutin;

  if (typeof cutin === "string") {
    return (
      <Tooltip
        title={
          <CutinDetails type={type} cutin={cutin} attackStyle={attackStyle} />
        }
      >
        <AttackTypeChip className={className} type={type} cutin={cutin} />
      </Tooltip>
    );
  }

  return <AttackTypeChip className={className} type={type} cutin={cutin} />;
};

function getAttackTypeTag(value: unknown): AttackTypeTag | null {
  if (isUnknownRecord(value) && typeof value.tag === "string") {
    switch (value.tag) {
      case "ShellingStyle":
        return "Shelling";
      case "NightAttackStyle":
        return "Night";
      case "AswAttackStyle":
        return "Asw";
      case "TorpedoAttackStyle":
        return "Torpedo";
      default:
        return null;
    }
  } else {
    return null;
  }
}

export default AttackStyleChip;
