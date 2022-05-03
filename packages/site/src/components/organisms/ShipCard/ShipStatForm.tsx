import { Button, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";
import { ShipEntity } from "../../../store";
import { withSign, getRangeAbbr, getSpeedRank } from "../../../utils";
import { Flexbox, LabeledValue } from "../../atoms";
import { NumberInput, StatIcon } from "../../molecules";
import ResettableInput from "../ResettableInput";

const SHIP_STAT_KEYS = [
  "max_hp",
  "firepower",
  "armor",
  "torpedo",
  "evasion",
  "anti_air",
  "accuracy",
  "asw",
  "speed",
  "los",
  "range",
  "luck",
] as const;

export type ShipStatKey = typeof SHIP_STAT_KEYS[number];

interface ShipStatFormProps {
  statKey: ShipStatKey;
  ship: Ship;
  onUpdate?: (state: Partial<ShipEntity>) => void;
}

const ShipLuckForm: React.FC<ShipStatFormProps> = ({ ship, onUpdate }) => {
  const { t } = useTranslation("common");
  const display = ship.luck;
  const naked = ship.get_naked_stat("luck");
  const mod = ship.get_stat_mod("luck");
  const ebonus = ship.get_ebonus("luck");

  return (
    <Stack m={1} width={160}>
      <Typography>
        {t("luck")} {display}
      </Typography>
      <LabeledValue label={t("ShipStatsCurrent")} value={display} />
      <LabeledValue label={t("Naked")} value={naked} />
      <LabeledValue label={t("EquipmentBonus")} value={ebonus} />
      <ResettableInput
        sx={{ mt: 1 }}
        label={t("Increase")}
        defaultValue={0}
        value={mod ?? null}
        onChange={(v) => onUpdate?.({ luck_mod: v === null ? undefined : v })}
      />
      <ResettableInput
        sx={{ mt: 1 }}
        label={t("Override")}
        defaultValue={null}
        min={0}
        value={ship.state().overrides?.naked_luck ?? null}
        onChange={(v) =>
          onUpdate?.({ overrides: { naked_luck: v ?? undefined } })
        }
      />
    </Stack>
  );
};

const ShipStatForm: React.FC<ShipStatFormProps> = (props) => {
  const { statKey, ship, onUpdate } = props;
  return <ShipLuckForm {...props} />;
};

export default ShipStatForm;
