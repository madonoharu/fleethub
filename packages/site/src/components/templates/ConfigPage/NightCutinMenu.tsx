import { Stack, Paper } from "@mui/material";
import { MasterData, NightCutinDef } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAppDispatch, useAppSelector } from "../../../hooks";
import { configSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import AttackChip from "../../organisms/AttackChip";
import ResettableInput from "../../organisms/ResettableInput";

interface NightCutinFormProps {
  def: NightCutinDef;
}

const KEYS = ["power_mod", "accuracy_mod", "type_factor"] as const;

const NightCutinForm: React.FC<NightCutinFormProps> = ({ def }) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const cutin = def.tag;
  const current = useAppSelector(
    (root) => root.present.config.masterData?.night_cutin?.[cutin]
  );

  return (
    <div>
      <AttackChip type="NightAttack" cutin={cutin} sx={{ mb: 2 }} />

      <Flexbox gap={1} alignItems="flex-end">
        {KEYS.map((key) => (
          <ResettableInput
            key={key}
            label={t(key)}
            defaultValue={def[key]}
            value={current?.[key]}
            min={0}
            step={key === "type_factor" ? 1 : 0.1}
            onChange={(v) => {
              dispatch(
                configSlice.actions.updateNightCutin({
                  id: cutin,
                  changes: { [key]: v },
                })
              );
            }}
          />
        ))}
      </Flexbox>
    </div>
  );
};

const NightCutinMenu: React.FC<{ data: MasterData }> = ({ data }) => {
  return (
    <Stack gap={1}>
      {data.night_cutin.map((def) => (
        <Paper key={def.tag} sx={{ p: 1 }}>
          <NightCutinForm def={def} />
        </Paper>
      ))}
    </Stack>
  );
};

export default NightCutinMenu;
