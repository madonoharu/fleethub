/** @jsxImportSource @emotion/react */
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { NightSituation } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { GearIcon } from "../../molecules";

type NightSituationFormProps = {
  value: NightSituation;
  onChange?: (value: NightSituation) => void;
  color?: "primary" | "secondary";
};

const NightSituationForm: React.FCX<NightSituationFormProps> = ({
  className,
  style,
  value,
  onChange,
  color,
}) => {
  const { t } = useTranslation("common");

  const state = Object.entries(value)
    .filter((e) => Boolean(e[1]))
    .map((e) => e[0]);

  return (
    <Tooltip title="夜戦設定" placement="top-start">
      <ToggleButtonGroup
        className={className}
        style={style}
        size="small"
        color={color}
        value={state}
        onChange={(event, newState: string[]) => {
          onChange?.({
            night_contact_rank: newState.includes("night_contact_rank")
              ? "Rank1"
              : null,
            searchlight: newState.includes("searchlight"),
            starshell: newState.includes("starshell"),
          });
        }}
      >
        <ToggleButton value="night_contact_rank">
          <GearIcon iconId={10} />
        </ToggleButton>

        <ToggleButton title={t("Starshell")} value="starshell">
          <GearIcon iconId={27} />
        </ToggleButton>
        <ToggleButton title={t("Searchlight")} value="searchlight">
          <GearIcon iconId={24} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Tooltip>
  );
};

export default NightSituationForm;
